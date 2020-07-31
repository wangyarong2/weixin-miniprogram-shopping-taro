import XPage from '@src/components/XPage/XPage';
import { View, ScrollView, Text } from '@tarojs/components';
import './shopcart.less';
import XCheckBox from '@src/components/XCheckBox/XCheckBox';
import PriceView from '@src/components/PriceView/price';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import { AtIcon } from 'taro-ui';
import XInputNumber from '@src/components/XInputNumber/XInputNumber';
import SpecTranslateUtil from '../../utils/SpecTranslateUtil';
import request from '../../servers/http';
import { set as setGlobalData } from '../../utils/globalData';
import BalanceNotEnoughDialog from '@src/components/BalanceNotEnough/BalanceNotEnough';
import LoginUtil from '../../utils/LoginUtil';
import XAuthorize from '@src/components/XAuthorize/XAuthorize';
import GuidePage from '@src/components/GuidePage/GuidePage';
import SkuModel from '@src/components/SkuModel/SkuModel';
import Taro from '@tarojs/taro';

class shopcart extends XPage {
  config = {
    navigationBarTitleText: '购物车',
  };

  state = {
    shopList: [],
    isAllCheck: false, // 是否全部选中
    allPrice: 0,
    checkNum: 0, // 已选择的件数
    currentShopIndex: 0, // 当前选中的父Index
    currentProductIndex: 0, // 当前选中的子Index
    invalidShopList: [],
    couponPrice: 0, //券额抵扣
    showNotEnoughDialog: false,
    mxCouponBalance: 0, //现金券

    goodsDetailInfo: null, //切换规格用
    changeSpecSkuInfo: null, //切换规格的sku

    deliveryTypeText: {
      1: '自提',
      2: '邮寄',
      4: '配送',
      5: '配送',
    },
  };

  componentDidShow() {
    const isLogin = LoginUtil.checkLogin();
    if (isLogin) {
      this.getShopCartDetail();
    }
    this.setState({
      showNotEnoughDialog: false,
    });
  }

  getShopCartDetail() {
    request.post('/community-client/cartDetail', {}).then((res) => {
      const invalidShopList = [];
      if (res.invalidShopList != null && res.invalidShopList.length > 0) {
        res.invalidShopList.forEach((element) => {
          element.skuList.forEach((sku) => {
            sku.shopId = element.shopId;
            sku.supplyId = element.supplyId;
            invalidShopList.push(sku);
          });
        });
      }
      this.setState(
        {
          invalidShopList: invalidShopList,
          shopList: res.shopList == null ? [] : res.shopList,
          isAllCheck: false,
        },
        () => {
          this.calcPrice();
        }
      );
    });
  }

  // 选中单个店铺下的所有商品
  onCheckSHopGoods(shopIndex) {
    const checkShopData = this.state.shopList[shopIndex];
    const isChecked = !checkShopData.isCheck;
    checkShopData.isCheck = isChecked;
    checkShopData.skuList.forEach((item) => {
      item.isCheck = isChecked;
    });
    const isAllCheck = this.state.shopList.every((item) => item.isCheck);

    this.setState({
      shopList: this.state.shopList,
      isAllCheck,
    });
    this.calcPrice();
  }
  // 对商品的选中或取消
  onCheckGoods(shopIndex, index, item) {
    const checkData = this.state.shopList[shopIndex].skuList[index];
    const isChecked = !checkData.isCheck;
    checkData.isCheck = isChecked;

    const isCurrentShopAllCheck = this.state.shopList[shopIndex].skuList.every((item) => item.isCheck);
    this.state.shopList[shopIndex].isCheck = isCurrentShopAllCheck;

    const isAllCheck = this.state.shopList.every((item) => item.isCheck);

    this.setState({
      shopList: this.state.shopList,
      isAllCheck,
    });
    this.calcPrice();
  }
  // 对商品加减
  onCartChange(shopIndex, index, value) {
    this.showLoading();
    console.log(value);
    const { shopList } = this.state;
    const checkData = shopList[shopIndex].skuList[index];
    console.log('checkData', checkData);
    request
      .post('/community-client/updateCartSkuAmount', {
        skuId: checkData.skuId,
        skuNumber: value,
        shopId: shopList[shopIndex].shopId,
        supplyId: shopList[shopIndex].supplyId,
      })
      .then((res) => {
        this.hideLoading();
        console.log(res.data);
        shopList[shopIndex].skuList[index].skuNumber = value;
        this.setState(
          {
            shopList: shopList,
          },
          () => {
            this.calcPrice();
          }
        );
      })
      .catch((res) => {
        // 请求成功后进行加减 否则根据操作 回归到之前的数量
        if (checkData.skuNumber < value) {
          // 加的操作
          shopList[shopIndex].skuList[index].skuNumber = value - 1;
        } else {
          // 减的操作
          shopList[shopIndex].skuList[index].skuNumber = value + 1;
        }
        this.setState({ shopList: shopList }, () => {
          this.calcPrice();
        });
      });
  }

  clearInvalidProduct(product, index) {
    console.log('xxxx', product, index);
    Taro.showModal({
      title: '提示',
      content: '确认删除该商品吗?',
    }).then((res) => {
      if (res.confirm) {
        const deleteList = [];
        deleteList.push({ skuId: product.skuId, supplyId: product.supplyId, shopId: product.shopId });
        request.post('/community-client/deleteCartSku', { deleteList }).then((res) => {
          this.state.invalidShopList.splice(index, 1);
          this.setState({ invalidShopList: this.state.invalidShopList });
          Taro.showToast({
            title: '已删除',
            mask: true,
          });
        });
      }
    });
  }

  // 清空失效商品
  clearAllInvalidProduct() {
    console.log('清空失效商品');
    Taro.showModal({
      title: '提示',
      content: '确认清空失效商品吗?',
    }).then((res) => {
      if (res.confirm) {
        let { invalidShopList } = this.state;
        const deleteList = [];
        invalidShopList.forEach((element) => {
          deleteList.push({
            skuId: element.skuId,
            supplyId: element.supplyId,
            shopId: element.shopId,
            deliveryType: element.deliveryType,
          });
        });
        request.post('/community-client/deleteCartSku', { deleteList }).then((res) => {
          invalidShopList = [];
          this.setState({ invalidShopList: invalidShopList });
          Taro.showToast({
            title: '已删除',
            mask: true,
          });
        });
      }
    });
  }

  // 单个商品删除
  onHandleDel(shopIndex, index) {
    Taro.showModal({
      title: '提示',
      content: '确认删除吗？',
    }).then((res) => {
      if (res.confirm) {
        const { shopList } = this.state;
        const deleteList = [];
        deleteList.push({
          skuId: shopList[shopIndex].skuList[index].skuId,
          supplyId: shopList[shopIndex].supplyId,
          shopId: shopList[shopIndex].shopId,
          deliveryType: shopList[shopIndex].deliveryType,
        });
        request.post('/community-client/deleteCartSku', { deleteList }).then((res) => {
          shopList[shopIndex].skuList.splice(index, 1);
          if (shopList[shopIndex].skuList.length === 0) {
            shopList.splice(shopIndex, 1);
          }
          this.setState({ shopList: shopList });
          this.calcPrice();
          Taro.showToast({
            title: '已删除',
            mask: true,
          });
        });
      }
    });
  }
  // 全选 OR 清空选择
  onAllCheck() {
    const { shopList } = this.state;
    shopList.forEach((shop) => {
      shop.isCheck = !this.state.isAllCheck;
      shop.skuList.forEach((item) => (item.isCheck = !this.state.isAllCheck));
    });
    this.setState({
      shopList,
      isAllCheck: !this.state.isAllCheck,
    });
    this.calcPrice();
  }

  onLinkToProduct(shopIndex, index) {
    const { shopList } = this.state;
    const shop = shopList[shopIndex];
    const product = shopList[shopIndex].skuList[index];
    const data = { shopId: shop.shopId, spuId: product.spuId };
    this.goPage({ url: 'productDetail', params: { ...data } });
  }

  // 去结算
  onConfirm() {
    const { checkNum } = this.state;
    if (checkNum == 0) {
      Taro.showToast({
        title: '请选择结算商品',
        mask: true,
        icon: 'none',
      });
      return;
    }
    request.post('/community-client/mxCoupon/queryCouponBalance', {}).then((res) => {
      this.setState(
        {
          mxCouponBalance: res.mxCouponBalance,
        },
        () => {
          // if (this.state.mxCouponBalance == 0 || this.state.mxCouponBalance < this.state.couponPrice * 100) {
          //     this.setState({
          //         showNotEnoughDialog: true
          //     })
          // } else {
          this.requestConfirmShopCart();
          // }
        }
      );
    });
  }

  requestConfirmShopCart() {
    this.setState({
      showNotEnoughDialog: false,
    });
    const { shopList } = this.state;
    Taro.showLoading({ title: '请求中...', mask: true });
    const requestData = this.getRequestShopList(shopList);
    const params = {
      hasBalance: true,
      actionFlag: 0,
      shopList: requestData,
    };

    request.post('/community-client/cartConfirm', params).then((res) => {
      this.hideLoading();
      setGlobalData('cartConfirmData', res);
      this.goPage({ url: 'order/confirmOrder', params: {} });
    });
  }

  getRequestShopList(shopList) {
    const checkedShopList = [];
    shopList.forEach((shopInfo) => {
      //选中的sku
      const checkedSkuList = shopInfo.skuList.filter((item) => item.isCheck);
      const skuIdAndCountList = [];
      checkedSkuList.forEach((item) => {
        skuIdAndCountList.push({
          skuId: item.skuId,
          spuId: item.spuId,
          number: item.skuNumber,
          supplyId: shopInfo.supplyId,
          payType: 1, //默认在线支付
        });
      });
      checkedShopList.push({
        deliveryType: shopInfo.deliveryType,
        shopId: shopInfo.shopId,
        skuIdAndCountList,
      });
    });

    //购物车中去掉未选中的商品
    return checkedShopList.filter((shpInfo) => shpInfo.skuIdAndCountList.length);
  }

  onAskClick() {
    this.onCancelClick();
    this.goPage({ url: 'coupon/chooseShop', params: { type: 'fromAsk' } });
  }

  onCancelClick() {
    this.setState({
      showNotEnoughDialog: false,
    });
  }

  // 统计价格
  calcPrice() {
    let price = 0;
    let couponPrice = 0;
    let checkNum = 0;
    this.state.shopList.forEach((shop) =>
      shop.skuList.forEach((item) => {
        if (item.isCheck) {
          checkNum += parseInt(item.skuNumber);
          price += item.skuNumber * item.unitPrice;
          couponPrice += item.skuNumber * (item.sellingPrice - item.unitPrice);
        }
      })
    );
    this.setState({
      allPrice: price / 100,
      checkNum,
      couponPrice: couponPrice / 100,
    });
  }

  // 跳转到店铺页
  onLinkToShop(shopData) {
    this.goPage({
      url: 'sort/shopClass',
      params: { id: shopData.shopId },
    });
  }

  onProductClick(product) {
    this.goPage({
      url: 'goodsDetail',
      params: {
        spuId: product.spuId,
        shopId: Taro.getStorageSync('currentShopId'),
      },
    });
  }

  skuModelRef = (node) => (this.SkuModel = node);

  // 显示 Sku
  showSku(isOpen, cartAction = 'cart') {
    this.setState({
      isOpen,
      cartAction,
    });
  }

  /**
   * 规格修改
   * */
  onChangeSpecClick(skuInfo, shopInfo) {
    this.showLoading();
    const params = {
      spuId: skuInfo.spuId,
      shopId: shopInfo.shopid,
    };
    request
      .post('/community-client/buyer/goods/detail', params)
      .then((res) => {
        this.hideLoading();
        this.setState(
          {
            goodsDetailInfo: res,
            changeSpecSkuInfo: skuInfo,
          },
          () => {
            // 设置默认选中
            let specValueArr = [];
            skuInfo.skuSpecDesc.forEach((item) => {
              specValueArr.push(item.specValue);
            });
            const { skuList, specList } = this.state.goodsDetailInfo;
            this.SkuModel.initWithNewData(skuList, specList, specValueArr);
            this.SkuModel.setDefaultDeliveryType(res.deliveryType);
            this.SkuModel.setSkuNumber(skuInfo.skuNumber);
            // this.setDefaultSpec();
            this.setState({
              isOpen: true,
            });
          }
        );
      })
      .catch((err) => {
        this.hideLoading();
      });
  }
  getCurrentSelectedSpec() {}
  onSkuChangeConfirm(data) {
    this.setState({
      isOpen: false,
    });
    this.showLoading();
    const { currentSpecData, allSpecText, currentSpecCount, deliveryType } = data;
    const { goodsDetailInfo, changeSpecSkuInfo } = this.state;
    request
      .post('/community-client/updateCartSkuAmount', {
        oldSkuId: changeSpecSkuInfo.skuId,
        skuId: currentSpecData.skuId,
        skuNumber: currentSpecCount,
        shopId: Taro.getStorageSync('currentShopId'),
        supplyId: goodsDetailInfo.supplyId,
        deliveryType,
      })
      .then((res) => {
        this.hideLoading();
        this.getShopCartDetail();
      })
      .catch((err) => {
        this.hideLoading();
      });
  }

  render() {
    const {
      shopList,
      invalidShopList,
      allPrice,
      checkNum,
      couponPrice,
      showNotEnoughDialog,
      deliveryTypeText,
      goodsDetailInfo,
      changeSpecSkuInfo,
    } = this.state;
    return (
      <View className="shop-cart-page">
        {(shopList == null || shopList.length == 0) && (invalidShopList == null || invalidShopList.length == 0) && (
          <GuidePage type={2} />
        )}
        {showNotEnoughDialog && (
          <BalanceNotEnoughDialog
            couponPrice={couponPrice}
            onConfirmClick={this.requestConfirmShopCart.bind(this)}
            onAskClick={this.onAskClick.bind(this)}
            onCancelClick={this.onCancelClick.bind(this)}
          />
        )}
        <ScrollView className="scroll-view" scrollY scrollWithAnimation>
          {shopList.map((shop, shopIndex) => {
            return (
              <View className="item-layout">
                {/* <View className="shop-name-layout">
                                        <XCheckBox
                                            checked={shop.isCheck}
                                            onClick={this.onCheckSHopGoods.bind(this, shopIndex)}
                                        />
                                        <Text className="shopname">{shop.shopName}</Text>
                                    </View> */}
                {shop.skuList.map((product, index) => {
                  return (
                    <View className="item-layout">
                      <XCheckBox
                        class-wrapper="checkbox-container"
                        checked={product.isCheck}
                        onClick={this.onCheckGoods.bind(this, shopIndex, index, product)}
                      />
                      <View className="product-info-layout">
                        <View className="product-image-layout">
                          <Image
                            className="product-image"
                            onClick={this.onProductClick.bind(this, product)}
                            src={product.spuImage}
                          />
                          {shop.deliveryType !== 2 ||
                            (shop.deliveryType !== 5 && (
                              <Text className="send-type">{deliveryTypeText[shop.deliveryType]}</Text>
                            ))}
                        </View>
                        <View className="product-right-content">
                          <View className="product-name" onClick={this.onProductClick.bind(this, product)}>
                            {product.spuName}
                          </View>
                          <View className="spec-layout" onClick={this.onChangeSpecClick.bind(this, product, shop)}>
                            <Text className="spec">{SpecTranslateUtil.translateSpecToText(product.skuSpecDesc)}</Text>
                            <AtIcon prefixClass="icon" value="xiajiantou" size={8} color="#9A9A9E" />
                          </View>

                          <View className="price-layout">
                            <View className="left-price">
                              <PriceView price={product.showPrice / 100} size={28} hasSymbol="￥" />
                              <AfterCouponPriceIcon />
                            </View>
                            {product.originPrice && <Text className="market-price">￥{product.originPrice / 100}</Text>}
                          </View>

                          <View className="operation-layout">
                            <View className="left-layout">
                              {/* <Text className="fan">返</Text>
                                                                <Text className="price">￥{product.spuRateAmount / 100}</Text> */}
                            </View>
                            <View className="right-layout">
                              <AtIcon
                                prefixClass="icon"
                                onClick={this.onHandleDel.bind(this, shopIndex, index)}
                                value="shanchu"
                                size={16}
                                color="#999999"
                              />
                              <View style={'width:10px'}></View>
                              <XInputNumber
                                min={1}
                                max={product.usableNum}
                                value={product.skuNumber}
                                onChange={this.onCartChange.bind(this, shopIndex, index)}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
          {invalidShopList != null && invalidShopList.length > 0 && (
            <View className="invalid-list">
              <View className="invalid-title">
                <View className="title">失效商品({invalidShopList.length})</View>
                <View className="delete-layout">
                  <AtIcon prefixClass="icon" value="shanchu" size={10} color="#999999"></AtIcon>
                  <Text className="delete-text" onClick={this.clearAllInvalidProduct.bind(this)}>
                    全部删除
                  </Text>
                </View>
              </View>
              {invalidShopList.map((product, index) => {
                return (
                  <View className="invalid-product">
                    <View className="product-info-layout">
                      <Image className="product-image" src={product.spuImage} />
                      <View className="product-right-content">
                        <Text className="product-name">{product.spuName}</Text>
                        <View className="spec-layout">
                          <Text className="spec">{SpecTranslateUtil.translateSpecToText(product.skuSpecDesc)}</Text>
                        </View>

                        {/* <View className="price-layout">
                                                        <PriceView price={product.sellingPrice / 100} size={28} hasSymbol='￥' />
                                                        <AfterCouponPriceIcon />
                                                        <View className="empty-view" />
                                                        <Text className="market-price">￥{product.markerPrice / 100}</Text>
                                                    </View> */}

                        <View className="delete-layout">
                          <AtIcon
                            prefixClass="icon"
                            value="shanchu"
                            onClick={this.clearInvalidProduct.bind(this, product, index)}
                            size={16}
                            color="#999999"
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
        <View className="bottom-layout">
          <XCheckBox text="全选" checked={this.state.isAllCheck} onClick={this.onAllCheck.bind(this)} />
          <View className="confirm-layout">
            <View className="price-layout">
              <View className="money-layout">
                <View className="black-text">合计</View>
                <View className="red-text">{allPrice}</View>
                <View className="black-text">元</View>
              </View>
              {/*<View className="coupon-price">(券额已抵{couponPrice}元)</View>*/}
            </View>
            <XAuthorize isRelative>
              <View className="confirm-button" onClick={this.onConfirm}>
                立即结算({checkNum})
              </View>
            </XAuthorize>
          </View>
        </View>

        {goodsDetailInfo && (
          <SkuModel
            productType={0}
            ref={this.skuModelRef}
            isOpened={this.state.isOpen}
            onClose={this.showSku.bind(this, false, 'nothing')}
            skuList={goodsDetailInfo.skuList}
            deliveryType={goodsDetailInfo.deliveryType}
            specList={goodsDetailInfo.specList}
            productImageUrl={
              goodsDetailInfo.headImageList != null && goodsDetailInfo.headImageList.length > 0
                ? goodsDetailInfo.headImageList[0]
                : ''
            }
            sellingPrice={goodsDetailInfo.lowShowPrice}
            redeemPrice={goodsDetailInfo.lowRedeemPrice}
            onAddCart={this.onSkuChangeConfirm.bind(this)}
            groupBuyMode={false}
          />
        )}
      </View>
    );
  }
}

export default XPage.connectFields()(shopcart);
