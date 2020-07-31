import { View, Image, Text } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import Taro from '@tarojs/taro';
import './folderDetail.less';
import SpecTranslateUtil from '../../../utils/SpecTranslateUtil';
import { AtIcon } from 'taro-ui';
import LoginUtil from '../../../utils/LoginUtil';

import XCheckBox from '@src/components/XCheckBox/XCheckBox';
import PriceView from '@src/components/PriceView/price';
import request from '../../../servers/http';
import GuidePage from '@src/components/GuidePage/GuidePage';
import XAuthorize from '@src/components/XAuthorize/XAuthorize';
import { set as setGlobalData } from '../../../utils/globalData';

/**

 * Author: jianglong
 * -----------------------------
 *推荐商品清单详情
 */

class folderDetail extends XPage {
  config = {
    navigationBarTitleText: '商品清单',
  };

  state = {
    detailInfo: { list: [] },
    isShowMultiSelect: false, //多选开关
    isAllCheck: false, //全部选中
    selectedResult: {}, //多选结果
    isLogin: false,
  };

  componentDidShow() {
    //测试要求
    const isLogin = LoginUtil.checkLogin();
    this.setState(
      {
        isLogin,
      },
      () => {
        if (this.state.isLogin) {
          this.getShopCartDetail();
        }
        this.addBind();
      }
    );
  }

  /***
   * 建立绑定关系
   * 已登陆：调用bind接口绑定
   * 未登陆：保存在GlobalData中，在调用登陆接口时user/login/simple，会保存
   */
  addBind() {
    const shareUserId = this.$router.params.shareUserId;
    if (!shareUserId) return;
    if (this.state.isLogin) {
      //进来的shopid 与 当前用户的shopId不一样 绑定关系
      request.post('/community-client/member/bind', { shareUserId }).then((res) => {
        if (res.suc) {
          Taro.setStorageSync('HomePageRefreshShopList', true);
          Taro.setStorageSync('currentShopId', shopId);
        } else {
          Taro.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000,
          });
        }
      });
    } else {
      setGlobalData('shareUserId', shareUserId);
    }
  }

  onShareAppMessage() {
    const { detailInfo } = this.state;
    if (null == detailInfo) return;
    let path = `/pages/collect/folderDetail/folderDetail?folderId=${detailInfo.id}&shareUserId=${detailInfo.userId}`;
    return {
      title: detailInfo.name + '分享的清单',
      path: path,
      imageUrl: detailInfo.image,
    };
  }

  getShopCartDetail() {
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request
      .post('/community-client/folder/detail', { folderId: this.getFolderIdFromParams() })
      .then((res) => {
        Taro.hideLoading();

        this.setState({
          detailInfo: this.getWrapperDetailInfo(res),
        });
      })
      .catch((err) => {
        Taro.hideLoading();
      });
  }

  /**
   * scene !=null :说明由扫码进入
   *this.$router.params  = scene: "folderId%3D473148948182216704"
   */
  getFolderIdFromParams() {
    const { scene } = this.$router.params;
    if (scene) {
      const sceneData = decodeURIComponent(this.$router.params.scene).split('&');
      if (sceneData.length > 0 && sceneData[0]) {
        return sceneData[0].split('=')[1];
      }
      return '';
    } else {
      return this.$router.params.folderId;
    }
  }

  getWrapperDetailInfo(detailInfo) {
    if (null == detailInfo) return null;
    detailInfo.image = this.getImageUrlFromSkuList(detailInfo.skuList);
    return detailInfo;
  }

  //从sku列表中获取一张图片
  getImageUrlFromSkuList(skuList) {
    if (skuList == null || skuList.length === 0) return '';
    for (let i = 0; i < skuList.length; i++) {
      if (skuList[i].imgUrl) {
        return skuList[i].imgUrl;
      }
    }
    return '';
  }

  onCheckGoods(index) {
    const { detailInfo } = this.state;
    const destProductInfo = detailInfo.skuList[index];
    //修改选中状态
    destProductInfo.isCheck = !destProductInfo.isCheck;

    const isAllCheck = detailInfo.skuList.every((item) => item.isCheck);

    this.setState({
      detailInfo,
      isAllCheck,
    });
  }

  //重置选中状态
  resetSelectedStatus() {
    const { detailInfo } = this.state;
    detailInfo.skuList.forEach((item) => {
      item.isCheck = false;
    });
    this.setState({
      detailInfo,
    });
  }

  //批量操作
  onMultiSelectClick() {
    this.setState(
      {
        isShowMultiSelect: !this.state.isShowMultiSelect,
        isAllCheck: false,
      },
      () => {
        this.resetSelectedStatus();
      }
    );
  }

  onCheckAllGoods() {
    const { detailInfo, isAllCheck } = this.state;

    detailInfo.skuList.forEach((productInfo) => {
      productInfo.isCheck = !isAllCheck;
    });
    this.setState({
      isAllCheck: !isAllCheck,
      detailInfo,
    });
  }

  onFavoritClick() {
    const { detailInfo } = this.state;
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request
      .post(detailInfo.flowStatus ? '/community-client/folder/flow/del' : '/community-client/folder/flow/add', {
        folderId: detailInfo.id,
      })
      .then((res) => {
        Taro.hideLoading();
        detailInfo.flowStatus = !detailInfo.flowStatus;
        this.setState({
          detailInfo,
        });
      })
      .catch((err) => {
        Taro.hideLoading();
      });
  }

  //添加到购物车
  onAddCartClick(skuInfo, event) {
    if (event) {
      event.stopPropagation();
    }
    this.requestAddCart([skuInfo]);
  }

  requestAddCart(skuList) {
    request.post('/community-client/addCartAll', { skuList }).then((res) => {
      Taro.showToast({
        title: '已加入购物车',
        icon: 'none',
      });
    });
  }

  //立即购买

  onNowBuyClick(skuInfo, event) {
    event.stopPropagation();
    this.goBuyAction([skuInfo]);
  }

  isShowEmptyView(detailInfo) {
    return detailInfo == null || detailInfo.skuList == null || detailInfo.skuList.length === 0;
  }

  /**
   * 多选加购
   */
  onMultiAddCartClick() {
    let selectedSkuList = this.getSelectedSkuList();
    if (selectedSkuList.length === 0) {
      this.showToast({ title: '请选择商品' });
      return;
    }
    this.requestAddCart(selectedSkuList);
  }

  /**
   * 获取选中的sku
   */
  getSelectedSkuList() {
    const { detailInfo } = this.state;
    if (null == detailInfo || detailInfo.skuList == null) return [];
    return detailInfo.skuList.filter((item) => {
      return item.isCheck;
    });
  }

  /**
   * 多选 购买
   */
  onMultiBuyClick() {
    this.goBuyAction(this.getSelectedSkuList());
  }

  goBuyAction(selectedSkuList) {
    if (selectedSkuList.length === 0) {
      this.showToast({ title: '请选择商品' });
      return;
    }

    Taro.showLoading({ title: '请求中...', mask: true });
    const requestData = this.getRequestShopList(selectedSkuList);
    const params = {
      hasBalance: true, //这个字段的值跟字段名意义相反
      actionFlag: 0,
      shopList: requestData,
    };

    request.post('/community-client/cartConfirm', params).then((res) => {
      this.hideLoading();
      setGlobalData('cartConfirmData', res);
      this.goPage({ url: 'order/confirmOrder', params: {} });
    });
  }

  /**
   * 生成过滤key
   */
  generateKeyBySkuInfo(skuInfo) {
    return skuInfo.shopId + ',' + skuInfo.deliveryType;
  }

  getRequestShopList(selectedSkuList) {
    //选中的sku按店铺分类
    const tempShopObject = selectedSkuList.reduce((result, nextSkuInfo) => {
      let key = this.generateKeyBySkuInfo(nextSkuInfo);
      let valueList = result[key];
      if (valueList == null) {
        valueList = [];
        //第一次创建key
        result[key] = valueList;
      }
      valueList.push({
        skuId: nextSkuInfo.skuId,
        spuId: nextSkuInfo.spuId,
        number: nextSkuInfo.skuNumber,
        supplyId: nextSkuInfo.supplyId,
        payType: 1, //默认在线支付
      });
      return result;
    }, {});

    //拼装成cartConfirm 接口需要的数格式
    const resultShopList = [];
    Object.keys(tempShopObject).forEach((itemKey) => {
      let tempList = itemKey.split(',');
      resultShopList.push({
        shopId: tempList[0],
        deliveryType: tempList[1],
        skuIdAndCountList: tempShopObject[itemKey],
      });
    });
    return resultShopList;
  }

  onLoginSuccess() {
    const isLogin = LoginUtil.checkLogin();
    this.setState(
      {
        isLogin,
      },
      () => {
        this.getShopCartDetail();
      }
    );
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request
      .post('/community-client/mx/member/home', {})
      .then((res) => {
        Taro.setStorageSync('currentShopId', res.shop.shopId);
        Taro.setStorageSync('userHasLogin', true);
        Taro.hideLoading();
      })
      .catch((err) => {
        Taro.hideLoading();
      });
  }

  getTotalPrice() {
    const selectedSkuList = this.getSelectedSkuList();

    return selectedSkuList.reduce((totalPrice, nextSkuInfo) => {
      return (totalPrice += nextSkuInfo.showPrice * nextSkuInfo.skuNumber);
    }, 0);
  }

  geListView(detailInfo) {
    return (
      <View className="list">
        {detailInfo.skuList.map((skuInfo, index) => {
          return (
            <View className="item" onClick={this.onItemClick.bind(this, skuInfo)}>
              <View className="product-info-layout">
                <Image className="product-image" mode="scaleToFill" src={skuInfo.imgUrl} />
                <View className="product-right-content">
                  <View className="product-name">{skuInfo.name}</View>
                  <View className="right-bottom-layout">
                    <PriceView
                      style={{ marginTop: '10rpx' }}
                      price={skuInfo.showPrice / 100}
                      size={32}
                      hasSymbol="￥"
                    />
                    <Text className="market-price">￥{skuInfo.originPrice / 100}</Text>
                    <Text className="count">x{skuInfo.skuNumber}</Text>
                  </View>
                  <View className="button-layout">
                    <View className="cart" onClick={this.onAddCartClick.bind(this, skuInfo)}>
                      加入购物车
                    </View>
                    <View className="buy" onClick={this.onNowBuyClick.bind(this, skuInfo)}>
                      立即购买
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }
  onItemClick(product) {
    this.goPage({
      url: 'goodsDetail',
      params: {
        spuId: product.spuId,
        shopId: Taro.getStorageSync('currentShopId'),
      },
    });
  }

  geMultiListView(detailInfo) {
    const { isAllCheck } = this.state;
    return (
      <View className="list" style={{ marginBottom: '110rpx' }}>
        {detailInfo.skuList.map((product, index) => {
          return (
            <View className="multi-item">
              <XCheckBox
                class-wrapper="checkbox-container"
                checked={product.isCheck}
                onClick={this.onCheckGoods.bind(this, index)}
              />
              <View className="product-info-layout" onClick={this.onItemClick.bind(this, product)}>
                <Image className="product-image" mode="scaleToFill" src={product.imgUrl} />
                <View className="product-right-content">
                  <View className="product-name">{product.name}</View>
                  <View className="right-bottom-layout">
                    <PriceView
                      style={{ marginTop: '10rpx' }}
                      price={product.showPrice / 100}
                      size={32}
                      hasSymbol="￥"
                    />
                    {product.originPrice && <Text className="market-price">￥{product.originPrice / 100}</Text>}
                    <Text className="count">x{product.skuNumber}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        <View className="bottom-layout">
          <View className="left-layout">
            <XCheckBox
              class-wrapper="checkbox"
              checked={isAllCheck}
              text={'全选'}
              onClick={this.onCheckAllGoods.bind(this)}
            />
            <View>
              <Text style={{ marginTop: '10rpx' }}>合计：</Text>
              <PriceView style={{ marginTop: '10rpx' }} price={this.getTotalPrice() / 100} size={32} hasSymbol="￥" />
            </View>
          </View>
          <View className="right-layout">
            <View className="cart" onClick={this.onMultiAddCartClick.bind(this)}>
              加入购物车
            </View>
            <View className="buy" onClick={this.onMultiBuyClick.bind(this)}>
              立即购买
            </View>
          </View>
        </View>
      </View>
    );
  }

  /**
   * 头部固定view
   * */
  getTopFixedView(detailInfo, isShowMultiSelect) {
    return (
      <View className="top-bg">
        <View className="top-view">
          <Image className="icon" mode="scaleToFill" src={detailInfo.image} />
          <View className="right-content">
            <Text className="name">{detailInfo.userName}分享的清单</Text>
            <View className="right-bottom">
              <AtIcon
                prefixClass="icon"
                onClick={this.onFavoritClick.bind(this)}
                value={detailInfo.flowStatus ? 'yishoucang' : 'shoucang'}
                size="18"
                color={detailInfo.flowStatus ? '#ff9900' : '#666666'}
              />
              <Text
                className={`favorites ${detailInfo.flowStatus ? 'selected' : ''}`}
                onClick={this.onFavoritClick.bind(this)}
              >
                {detailInfo.favorites ? '已收藏' : '收藏 '}
              </Text>
              <View className="action" onClick={this.onMultiSelectClick.bind(this)}>
                {isShowMultiSelect ? '完成' : '批量操作'}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  getLoginView() {
    return (
      <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
        <GuidePage type={0}></GuidePage>
      </XAuthorize>
    );
  }

  render() {
    const { detailInfo, isShowMultiSelect, isLogin } = this.state;
    let contentView = (
      <View className="content">
        {this.isShowEmptyView(detailInfo) && <GuidePage style={{ marginTop: '200rpx' }} type={7} />}
        {!this.isShowEmptyView(detailInfo) && this.getTopFixedView(detailInfo, isShowMultiSelect)}

        {!this.isShowEmptyView(detailInfo) && isShowMultiSelect && this.geMultiListView(detailInfo)}
        {!this.isShowEmptyView(detailInfo) && !isShowMultiSelect && this.geListView(detailInfo)}
      </View>
    );
    return isLogin ? contentView : this.getLoginView();
  }
}

export default XPage.connectFields()(folderDetail);
