import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { AtIcon, AtFloatLayout } from 'taro-ui';

import XPage from '@src/components/XPage/XPage';
import XAuthorize from '@src/components/XAuthorize/XAuthorize';
import SkuModel from '@src/components/SkuModel/SkuModel';
import XSwiper from '@src/components/XSwiper/XSwiper';
import PriceView from '@src/components/PriceView/price';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import CouponItem from '@src/components/CouponItem/CouponItem';
import ShareDialog from '@src/components/ShareDialog/ShareDialog';
import ContentDescription from '@src/components/ContentDescriptionPopup/ContentDescriptionPopup';
import LoadingView from '@src/components/LoadingView/LoadingView';

// import BalanceNotEnoughDialog from '@src/components/BalanceNotEnough/BalanceNotEnough'

import LoginUtil from '@utils/LoginUtil';
import TextUtil from '@utils/TextUtil';
import PriceUtil from '@utils/PriceUtil';
import request from '@src/servers/http';
import { set as setGlobalData, get as getGlobalData } from '@utils/globalData';

import meibaoPrice from '../../assets/images/product/icon_meibao_price.png';
import imageclosePopup from '@images/product/close_popup.png';

import { getAddressList } from '@src/servers/servers';

import './goodsDetail.less';

class GoodsDetail extends XPage {
  config = {
    navigationBarTitleText: '商品详请',
    navigationStyle: 'custom',
  };

  constructor(props) {
    super(props);
    this.state = {
      productDetail: null,
      isOpen: false, // 是否显示弹层
      productType: null, //0正常商品 1橙宝商品 2橙卡商品 5限购商品
      currentAddressData: '请选择收货地址', // 选择的地址信息
      checkAddressData: null, // 选中的地址

      allSpecText: '请选择商品规格',
      currentSpecData: null,
      currentSpecCount: 1,
      cartAction: 'cart', // cart(加入购物车) buy(立即购买)
      showShareDialog: false,
      templateId: null, //橙宝活动id
      spuId: null,
      shopId: null,
      deliveryType: null, //deliveryType  发货类型：1自提，2快递 3两种方式都有
      qrCodeImage: '',
      getQrcodeErrorCount: 0, // 获取海报图片失败次数
      shareUserId: null,
      productDown: true,
      showNotEnoughDialog: false,
      couponPrice: 0,
      mxCouponBalance: 0,
      fromQiBei: false,

      couponPopupOpened: false, // 控制优惠券弹出层是否出现在页面上
      couponList: [],
      couponListText: '',
      isOpenWarrantyDescPopup: false, //质保期说明
      isOpenCashPayPopup: false, //货到付款说明
    };
  }

  componentWillMount() {
    this.getSystemInfo();
  }

  componentDidMount() {
    const fromMiniProgram = getGlobalData('fromMiniProgram');
    if (fromMiniProgram == 'qibei') {
      this.setState({
        fromQiBei: true,
      });
    }
    const user = Taro.getStorageSync('userData');
    const that = this;
    if (user != null && LoginUtil.isTokenExpired()) {
      //token过期
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.login({
              success: function (res) {
                wx.getUserInfo({
                  withCredentials: true,
                  success: function (eee) {
                    const data = { detail: eee };
                    that.onGetUserInfo(data).then((res) => {
                      Taro.hideLoading();
                      const userData = Taro.getStorageSync('userData');
                      Taro.setStorageSync('userData', userData);
                      that.afterDidMount();
                    });
                  },
                });
              },
            });
          }
        },
      });
    } else {
      this.afterDidMount();
    }
  }

  afterDidMount() {
    Taro.showLoading({ title: '加载中...' });
    const { scene } = this.$router.params;
    if (scene) {
      //扫码进入首页
      const sceneData = decodeURIComponent(this.$router.params.scene).split('&');
      //userid + 加密字符串
      request
        .post('/wx-agent/exchangeId/get', {
          id: sceneData[1] == null ? sceneData[0] : sceneData[1],
        })
        .then((res) => {
          let sceneResult = res.scene.split('&');

          if (sceneResult != null && (sceneResult.length === 3 || sceneResult.length == 4)) {
            let shareUserId = null;
            let spuId = null;
            let shopId = null;
            let productType = null;
            let templateId = null;
            //从h5分享过来
            if (sceneData[1] == null) {
              productType = parseInt(sceneResult[3], 10);
              //正常商品
              if (productType === 0) {
                shareUserId = sceneResult[0];
                spuId = sceneResult[1];
                shopId = sceneResult[2];
              }
              //橙宝商品
              if (productType === 1) {
                shareUserId = sceneResult[0];
                templateId = sceneResult[1];
                shopId = sceneResult[2];
                if (LoginUtil.checkLogin()) {
                  shopId = Taro.getStorageSync('currentShopId');
                } else {
                  shopId = null;
                }
              }
            }
            //从小程序过来
            if (sceneData[1] != null) {
              productType = parseInt(sceneResult[2], 10);
              //橙宝商品
              if (productType == 1) {
                shareUserId = sceneData[0];
                templateId = sceneResult[0];
                shopId = sceneResult[1];
              } else {
                //正常 橙卡商品
                shareUserId = sceneData[0];
                spuId = sceneResult[0];
                shopId = sceneResult[1];
              }
            }
            this.setState(
              {
                shareUserId,
                spuId,
                templateId,
                shopId,
                productType,
              },
              () => {
                if (LoginUtil.checkLogin() && !TextUtil.isEmpty(shareUserId)) {
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
                  setGlobalData('shareUserId', this.state.shareUserId);
                }
                this.doAfterLogin();
              }
            );
          }
        });
    } else {
      //获取商品类型
      let productType = parseInt(this.$router.params.productType, 10);
      let fromProductItem = this.$router.params.fromProductItem;
      if (isNaN(productType)) {
        productType = 0;
      }
      let { shareUserId, spuId, shopId, templateId } = this.$router.params;
      if (shareUserId == null && templateId != null) {
        //正常橙宝进入
        if (shopId == null) {
          if (LoginUtil.checkLogin()) {
            shopId = Taro.getStorageSync('currentShopId');
          }
        }
      }
      if (LoginUtil.checkLogin()) {
        const mUserId = Taro.getStorageSync('member_info').userId;
        if (shareUserId != mUserId && !(fromProductItem + '' == 'true')) {
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
        }
      } else {
        setGlobalData('shareUserId', shareUserId);
      }
      this.setState(
        {
          productType,
          shareUserId,
          spuId,
          shopId,
          templateId,
        },
        () => {
          this.doAfterLogin();
        }
      );
    }
  }

  doAfterLogin() {
    const isLogin = LoginUtil.checkLogin();
    const { templateId, spuId, shopId, productType } = this.state;
    request
      .post(
        productType == 1 ? '/community-client/promotion/groupTemplateDetail' : '/community-client/buyer/goods/detail',
        productType == 1 ? { templateId, shopId } : { spuId, shopId }
      )
      .then((data) => {
        Taro.hideLoading();
        const resultData = data;
        Taro.setNavigationBarTitle({
          title: resultData.name,
        });
        this.setState(
          {
            isLogin,
            productType,
            productDown: resultData.vendibility,
            productDetail: resultData,
            skuList: resultData.skuList,
            specList: resultData.specList,
            isFavorites: resultData.favorites,
            // deliveryType: resultData.deliveryType == 3 ? 2 : resultData.deliveryType,
          },
          () => {
            if (isLogin) {
              this.getAddressList();
              if (this.state.productType != 1) {
                this.getCouponList();
              }
            }
            if (resultData.skuList.length == 1) {
              // 当Sku只有一件时 默认选中
              let specValueArr = [];
              resultData.skuList[0].specList.forEach((item) => {
                specValueArr.push(item.specValue);
              });
              const { skuList, specList } = this.state;
              setTimeout(() => {
                this.SkuModel.initWithNewData(skuList, specList, specValueArr);
                this.SkuModel.setDefaultDeliveryType(resultData.deliveryType);
                this.setDefaultSpec();
              }, 300);
            } else {
              //有多个sku时，不作默认处理，让用户处理
              const { skuList, specList } = this.state;
              setTimeout(() => {
                this.SkuModel.initWithDefaultData(skuList, specList);
                this.SkuModel.setDefaultDeliveryType(resultData.deliveryType);
              }, 300);
            }
          }
        );
      });
  }

  // 规格默认显示的内容
  setDefaultSpec() {
    const { skuList } = this.state;
    let strBuff = '';
    skuList[0].specList.forEach((element) => {
      strBuff += element.specName + ':' + element.specValue + '; ';
    });
    strBuff = strBuff.substring(0, strBuff.length - 2) + '';
    this.setState({
      currentSpecData: skuList[0],
      allSpecText: '已选' + 1 + '件; ' + strBuff,
      currentSpecCount: 1,
    });
  }

  // 获取地址列表
  getAddressList() {
    getAddressList().then((res) => {
      res.list.forEach((element) => {
        if (element.defFlag == true) {
          this.setState(
            {
              checkAddressData: element,
            },
            () => {
              this.setState({
                currentAddressData:
                  this.state.checkAddressData.province +
                  this.state.checkAddressData.city +
                  this.state.checkAddressData.district +
                  this.state.checkAddressData.detailAddress,
              });
            }
          );
        }
      });
    });
  }

  // 获取商品优惠券列表
  getCouponList() {
    request
      .post('/community-client/couponList/forSpu', {
        spuId: this.state.productDetail.spuId,
      })
      .then((res) => {
        if (res && res.length) {
          const resultList = res;
          let couponId = [],
            rightList = [];
          resultList.forEach((item) => {
            if (!couponId.includes(item.couponId)) {
              couponId.push(item.couponId);
              rightList.push(item);
            }
            if (item.status == 2) {
              item.userStatus = 0;
            } else {
              item.userStatus = status;
            }
          });
          let couponListTextArr = [];
          rightList.forEach((item) => {
            couponListTextArr.push(`满${item.fullAmount / 100}元减${item.cutAmount / 100}元`);
          });
          this.setState({
            couponList: resultList,
            couponListText: couponListTextArr.join('；'),
          });
        }
      });
  }

  onGetCoupon(index, userCouponId) {
    const { couponList } = this.state;
    // const getCouponIndex = couponList.findIndex(item => item.couponId == id)
    couponList[index].userStatus = 1;
    couponList[index].userCouponId = userCouponId;

    this.setState({ couponList });
  }

  // 收藏商品
  postGoodsStar() {
    request
      .post('/community-client/good/follow', {
        spuId: this.params.spuId,
        shopId: this.params.shopId,
      })
      .then((res) => {
        Taro.setStorageSync('collectListRefresh', true);

        this.state.productDetail.favorites = res.data;
        this.setState({ productDetail: this.state.productDetail });
        Taro.showToast({
          title: res.data ? '收藏成功' : '取消收藏',
          icon: 'none',
        });
      });
  }

  // 点击立即购买
  handleBuyClick() {
    // if (this.state.currentSpecData) {
    //   // 跳转到订单确认
    //   this.postPay()
    // } else {
    this.showSku(true, 'buy');
    // }
  }

  skuModelRef = (node) => (this.SkuModel = node);
  shareDialogRef = (node) => (this.ShareDialog = node);

  // 显示 Sku
  showSku(isOpen, cartAction = 'cart') {
    this.setState({
      isOpen,
      cartAction,
    });
  }

  // sku 选择确定后的回调
  onSkuConfirm(data) {
    const { currentSpecData, allSpecText, currentSpecCount, deliveryType } = data;
    this.setState(
      {
        allSpecText: '已选' + currentSpecCount + '件 ' + allSpecText,
        currentSpecData: currentSpecData,
        currentSpecCount,
        deliveryType,
      },
      () => {
        this.setState({ isOpen: false });
        if (this.state.cartAction === 'cart') {
          this.postAddCart();
        }
        if (this.state.cartAction === 'buy') {
          this.postPay();
        }
      }
    );
  }

  // 加入购物车
  postAddCart() {
    const { shopId, currentSpecData, currentSpecCount, productDetail, deliveryType } = this.state;
    const postData = {
      skuId: currentSpecData.skuId,
      skuNumber: currentSpecCount,
      shopId: this.params.shopId || shopId,
      supplyId: productDetail.supplyId,
      deliveryType,
    };
    request.post('/community-client/addCart', postData).then((res) => {
      Taro.showToast({
        title: '已加入购物车',
        icon: 'none',
      });
    });
  }

  postPay() {
    const { productType } = this.state;
    //正常商品 弹框逻辑
    if (productType == 0) {
      request.post('/community-client/mxCoupon/queryCouponBalance', {}).then((res) => {
        this.setState(
          {
            mxCouponBalance: res.mxCouponBalance,
          },
          () => {
            const { currentSpecData, currentSpecCount } = this.state;
            let couponPrice = currentSpecCount * (currentSpecData.sellingPrice - currentSpecData.unitPrice);
            this.setState(
              {
                couponPrice: couponPrice / 100,
              },
              () => {
                // if (this.state.mxCouponBalance == 0 || this.state.mxCouponBalance < this.state.couponPrice * 100) {
                //   this.setState({
                //     showNotEnoughDialog: true
                //   })
                // } else {
                this.requestConformProduct();
                // }
              }
            );
          }
        );
      });
    } else {
      this.requestConformProduct();
    }
  }

  requestConformProduct() {
    this.onCancelClick();
    const { productType } = this.state;
    //正常商品 做弹框
    Taro.showLoading({ title: '请求中...', mask: true });
    const { currentSpecData, checkAddressData, currentSpecCount, productDetail, deliveryType } = this.state;
    const skuIdAndCountList = [
      {
        skuId: currentSpecData.skuId,
        spuId: productDetail.spuId,
        number: currentSpecCount,
        payType: 1, //默认在线支付
        supplyId: productDetail.supplyId,
      },
    ];
    let shopList = {};
    //橙宝商品
    if (productType == 1) {
      shopList = [
        {
          deliveryType,
          shopId: productDetail.shopId,
          supplyId: productDetail.supplyId,
          skuIdAndCountList: skuIdAndCountList,
        },
      ];
    } else {
      //正常商品
      shopList = [
        {
          deliveryType,
          shopId: this.state.shopId,
          supplyId: productDetail.supplyId,
          skuIdAndCountList: skuIdAndCountList,
        },
      ];
    }
    let requestData = { actionFlag: 0, shopList };
    if (checkAddressData != null) {
      requestData.addressId = checkAddressData.addressId;
    }
    //橙宝商品
    if (productType == 1) {
      requestData.warehouseType = 3;
      requestData.templateId = this.state.templateId;
    }
    requestData.hasBalance = true;
    request
      .post('/community-client/cartConfirm', requestData)
      .then((res) => {
        Taro.hideLoading();
        if (productType == 1) {
          res.templateId = this.state.templateId;
        }
        res.selfSupport = this.state.productDetail.selfSupport;
        setGlobalData('cartConfirmData', res);
        this.goPage({ url: 'order/confirmOrder', params: { productType } });
      })
      .catch((res) => {
        Taro.hideLoading();
        Taro.showToast({
          title: res.resultDesc,
          icon: 'none',
        });
      });
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

  onLinkHome() {
    if (TextUtil.isEmpty(this.state.shareUserId)) {
      this.goBack();
    } else {
      this.goPage({
        url: 'home',
        type: 'switchTab',
      });
    }
  }

  onLinkShopcart() {
    Taro.switchTab({
      url: '/pages/shopcart/shopcart',
    });
  }

  onShareClick = () => {
    this.getQrCodeImage();
  };

  //获取二维码
  getQrCodeImage() {
    Taro.showLoading({
      title: '生成中...',
    });
    let shareOriginId = {};
    //非橙宝商品 分享出去为商品id 店铺id
    if (TextUtil.isEmpty(this.state.templateId)) {
      shareOriginId = this.state.spuId + '&' + this.state.shopId + '&' + this.state.productType;
    } else {
      //橙宝商品 分享出去为橙宝活动id
      shareOriginId = this.state.templateId + '&' + this.state.shopId + '&' + this.state.productType;
    }
    request.post('/wx-agent/exchangeId/save', { scene: shareOriginId }).then((res) => {
      const id = res.id;
      request
        .post('/wx-agent/wxdrcode/get', {
          userId: Taro.getStorageSync('member_info').userId,
          originId: id,
          sharePage: 'pages/goodsDetail/goodsDetail',
          type: 1,
        })
        .then((res) => {
          this.setState(
            {
              qrCodeImage: res,
            },
            () => {
              this.setState(
                {
                  showShareDialog: true,
                },
                () => {
                  this.ShareDialog.init();
                }
              );
            }
          );
        })
        .catch((res) => {
          this.state.getQrcodeErrorCount += 1;
          if (this.state.getQrcodeErrorCount > 2) {
            this.state.getQrcodeErrorCount = 0;
            Taro.hideLoading();
            this.onCloseDialogClick();
            Taro.showToast({
              title: '分享海报生成失败',
              icon: 'none',
              duration: 2000,
            });
          } else {
            Taro.hideLoading();
            this.getQrCodeImage();
          }
        });
    });
  }

  onProductDown() {
    Taro.showToast({
      title: '该商品已售罄',
      icon: 'none',
      duration: 2000,
    });
  }

  onCloseDialogClick() {
    this.setState({
      showShareDialog: false,
    });
  }

  // 显示优惠券弹层
  onShowCoupon(bool) {
    this.setState({ couponPopupOpened: bool });
  }

  //分享给好友
  onShareAppMessage() {
    let path = null;
    if (TextUtil.isEmpty(this.state.templateId)) {
      path = `/pages/goodsDetail/goodsDetail?spuId=${this.state.spuId}&shopId=${this.state.shopId}&productType=${
        this.state.productType
      }&shareUserId=${Taro.getStorageSync('member_info').userId}`;
    } else {
      path = `/pages/goodsDetail/goodsDetail?templateId=${this.state.templateId}&productType=${
        this.state.productType
      }&shareUserId=${Taro.getStorageSync('member_info').userId}&shopId=${this.state.shopId}`;
    }
    return {
      title: this.state.productDetail.name,
      path: path,
      imageUrl: this.state.productDetail.imageUrl,
    };
  }

  onLoginSuccess() {
    request.post('/community-client/mx/member/home', {}).then((res) => {
      Taro.setStorageSync('currentShopId', res.shop.shopId);
      Taro.setStorageSync('userHasLogin', true);
      if (TextUtil.isEmpty(this.state.shopId)) {
        this.setState(
          {
            shopId: res.shop.shopId,
          },
          () => {
            this.doAfterLogin();
          }
        );
      }
      this.getAddressList();
      if (this.state.productType != 1) {
        this.getCouponList();
      }
    });
  }

  onShopClick() {
    this.goPage({
      url: 'coupon/contactDetail',
      params: { shopId: this.state.productDetail.supplyId },
    });
  }

  getPriceView(productType, productDetail) {
    if (productType == 0) {
      //0正常商品
      return (
        <View className="flex-center">
          {productDetail.lowShowPrice === productDetail.highShowPrice ? (
            <PriceView price={productDetail.lowShowPrice / 100} size={48} hasSymbol="￥" />
          ) : (
            <View className="flex-center" style={{ whiteSpace: 'nowrap' }}>
              <PriceView price={productDetail.lowShowPrice / 100} size={48} hasSymbol="￥" />
              <Text className="unitprice-line">~</Text>
              <PriceView price={productDetail.highShowPrice / 100} size={48} hasSymbol="" />
            </View>
          )}
          <AfterCouponPriceIcon />
        </View>
      );
    } else if (productType == 1) {
      //1橙宝商品
      return (
        <View className="meibao-price-layout">
          <View className="price">
            ￥{TextUtil.formateMoney2(productDetail.lowShowPrice, productDetail.highShowPrice)}
          </View>
          <Image className="meibao-price" src={meibaoPrice} />
        </View>
      );
    } else if (productType == 2) {
      // 2橙卡商品
      return (
        <View className="price-layout">
          <View className="little-price">￥</View>
          <View className="meicard-price">
            {TextUtil.formateMoney(productDetail.lowShowPrice, productDetail.highShowPrice)}
          </View>
        </View>
      );
    }
  }
  getMarkerPriceView(productType, productDetail) {
    if (productType != 1) {
      return (
        <View className="flex-space-between" style={{ marginRight: '34rpx' }}>
          <Text className="label">市场价</Text>
          <Text className="value" style={{ textDecoration: 'line-through' }}>
            ￥{TextUtil.formatMoneyNew(productDetail.lowOriginPrice, productDetail.highOriginPrice)}
          </Text>
        </View>
      );
    }
  }
  getFreightView(productType, productDetail) {
    if (productType == 0) {
      return (
        <View className="flex-space-between">
          <Text className="label">快递:</Text>
          <View className="sale-num" style={{ paddingRight: '25rpx' }}>
            {productDetail.freight ? `${productDetail.freight / 100}元` : '免费'}
          </View>
          <View className="value" style={{ paddingRight: '25rpx' }}>
            |
          </View>
          <Text className="value">发货地：</Text>
          <Text className="sale-num">{this.getShipmentAddressName(productDetail.shipmentAddressName)}</Text>
        </View>
      );
    }
  }
  getShipmentAddressName(address) {
    if (null == address) return '';
    if (address.indexOf('/') == -1) return '';
    let splitList = address.split('/');
    return splitList.length >= 2 ? splitList[1] : splitList[0];
  }

  isSupportCashPay(productDetail) {
    if (productDetail == null) return;
    if (productDetail.payType == null) return false;
    //2：货到付款
    return productDetail.payType.some((item) => item === 2);
  }
  getSendTimeStr(productDetail) {
    return TextUtil.convertSendTimeToStr(productDetail.sendTime);
  }

  onBrandClick(brandInfo) {
    this.goPage({
      url: 'product/category/brandCategoryDetail',
      params: { categoryId: brandInfo.brandId, categoryName: brandInfo.brandName },
    });
  }

  getPayTypeView(productDetail) {
    return (
      <View className="pay-type-container">
        <View className="item">
          <Text className="label">支付方式</Text>
          <View className="right-content" onClick={this.onCashPayDescClick.bind(this, productDetail)}>
            <Text className="text">{this.isSupportCashPay(productDetail) ? '支持货到付款' : '仅支持在线支付'}</Text>
            {this.isSupportCashPay(productDetail) && (
              <AtIcon prefixClass="icon" value="xinxi" size="14" color="#ff6400" />
            )}
          </View>
        </View>
        <View className="item">
          <Text className="label">发货时间</Text>
          <Text className="time">{this.getSendTimeStr(productDetail)}</Text>
        </View>
        <View className="item">
          <Text className="label">质保期</Text>
          <View className="right-content" style={{ background: 'none' }} onClick={this.onWarrantyClick.bind(this)}>
            <Text className="text">{productDetail.warrantyTime ? `${productDetail.warrantyTime}年` : ''}</Text>
            <AtIcon prefixClass="icon" value="xinxi" size="14" color="#ff6400" />
          </View>
        </View>
      </View>
    );
  }

  getBrandView(productDetail) {
    const { brand } = productDetail;
    if (brand == null || brand.brandId == null) return null;
    return (
      <View className="brand-layout" onClick={this.onBrandClick.bind(this, brand)}>
        <Image src={brand.brandImage} className="image" />
        <Text className="name">{brand.brandName}</Text>
        <AtIcon prefixClass="icon" value="youjiantou" size="13" color="#87878C" />
      </View>
    );
  }
  onWarrantyDescCloseClick() {
    this.setState({
      isOpenWarrantyDescPopup: false,
    });
  }
  onCashPayDescCloseClick() {
    this.setState({
      isOpenCashPayPopup: false,
    });
  }
  onCashPayDescClick(productDetail) {
    if (this.isSupportCashPay(productDetail)) {
      this.setState({
        isOpenCashPayPopup: true,
      });
    }
  }
  onWarrantyClick() {
    this.setState({
      isOpenWarrantyDescPopup: true,
    });
  }
  getWarrantyStr(productDetail) {
    let warrantyTime = productDetail.warrantyTime ? productDetail.warrantyTime : '';
    return (
      '交易成功后' +
      warrantyTime +
      '年内出现质量问题，商家在规定时间内通过免费维修或免费更换商品或免费补寄零配件或补偿质保基金等方式保障消费者权益，详情请咨询平台客服'
    );
  }
  getGoodsBaseInfo(productDetail) {
    const baseInfoList = [];
    if (productDetail.brand) {
      baseInfoList.push(this.createBaseInfoItem('品牌', [productDetail.brand.brandName]));
    }
    baseInfoList.push(this.createBaseInfoItem('商品名称', [productDetail.name]));
    baseInfoList.push(this.createBaseInfoItem('商品编码', [productDetail.spuNo]));
    if (productDetail.styleNameList && productDetail.styleNameList.length > 0) {
      baseInfoList.push(this.createBaseInfoItem('风格', productDetail.styleNameList));
    }
    if (productDetail.color) {
      baseInfoList.push(this.createBaseInfoItem('颜色', productDetail.color.specValueList));
    }
    if (productDetail.factoryAddressName) {
      baseInfoList.push(this.createBaseInfoItem('产地', [productDetail.factoryAddressName]));
    }
    baseInfoList.push(
      this.createBaseInfoItem('发货地', [this.getShipmentAddressName(productDetail.shipmentAddressName)])
    );
    baseInfoList.push(this.createBaseInfoItem('发货时间', [this.getSendTimeStr(productDetail)]));
    return baseInfoList;
  }
  createBaseInfoItem(key, value) {
    return { attributeName: key, attributeValue: value };
  }
  getSpecItem(baseInfoItem) {
    return (
      <View className="item">
        <View className="key">{baseInfoItem.attributeName}</View>
        {baseInfoItem.attributeName === '风格' ? (
          <View>
            {baseInfoItem.attributeValue &&
              baseInfoItem.attributeValue.map((item) => {
                return <View className="style-value">{item}</View>;
              })}
          </View>
        ) : (
          <View className={`value`}>{baseInfoItem.attributeValue && baseInfoItem.attributeValue.join(' ')}</View>
        )}
      </View>
    );
  }

  getContentView() {
    const {
      productDetail,
      skuList,
      specList,
      allSpecText,
      isOpen,
      showShareDialog,
      productType,
      currentAddressData,
      productDown,
      qrCodeImage,
      showNotEnoughDialog,
      couponPrice,
      couponPopupOpened,
      couponList,
      isOpenCashPayPopup,
      isOpenWarrantyDescPopup,
      fromQiBei,
    } = this.state;

    const goodsBaseInfo = this.getGoodsBaseInfo(productDetail);

    return (
      <View
        style={{
          paddingBottom: this.detectionType(136, 100),
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        {showShareDialog && (
          <ShareDialog
            qrCodeImage={qrCodeImage}
            productType={productType}
            onCloseClick={this.onCloseDialogClick.bind(this)}
            productImage={productDetail.imageUrl}
            productName={productDetail.name}
            oldPrice={'原价￥' + productDetail.highOriginPrice / 100 + '元'}
            shopName={productType == 1 ? productDetail.shopName : productDetail.shop.shopName}
            price={
              productType == 1
                ? productDetail.lowRedeemPrice / 100
                : TextUtil.formateMoney(productDetail.lowShowPrice, productDetail.highShowPrice)
            }
            return={'返利' + productDetail.highBuyProfit / 100 + '元'}
            ref={this.shareDialogRef}
          />
        )}

        <View
          className="custombar-container"
          onClick={this.onLinkHome}
          style={{ top: this.systemInfo.statusBarHeight + 8 + 'px' }}
        >
          <View className="back-box">
            <AtIcon prefixClass="icon" value="fanhui" size="14" color="#000" />
          </View>
        </View>
        <XSwiper autoplay={false} height={750} swiperList={productDetail.headImageList} />
        <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
          <View className="info-container">
            <View>
              <View className="flex-space-between">
                {/*价格view*/}
                {this.getPriceView(productType, productDetail)}
                {/*<View className="sale-num">月销：{productDetail.totalSales}件</View>*/}
              </View>
              <View className="price-box">
                {/*市场价*/}
                {this.getMarkerPriceView(productType, productDetail)}
                {/*邮费 +发货地*/}
                {this.getFreightView(productType, productDetail)}
              </View>
            </View>
            <View className="flex-space-between" style={{ marginTop: '32rpx' }}>
              <View className="product-title text-mult-clip-2">{productDetail.name}</View>
              <View className="flex-center" style={{ whiteSpace: 'nowrap' }}>
                {!fromQiBei && (
                  <View className="icon-box" onClick={this.onShareClick}>
                    <AtIcon prefixClass="icon" value="fenxiang" size="18" color="#242424" />
                    <View className="text">分享</View>
                  </View>
                )}
                {productType == 0 && (
                  <View className="icon-box" onClick={this.postGoodsStar.bind(this)} style={{ marginLeft: '32rpx' }}>
                    <AtIcon
                      prefixClass="icon"
                      value={productDetail.favorites ? 'yishoucang' : 'shoucang'}
                      size="19"
                      color={productDetail.favorites ? '#ff9900' : '#666666'}
                    />
                    <View className="text">{productDetail.favorites ? '已收藏' : '收 藏'}</View>
                  </View>
                )}
              </View>
            </View>
            {
              // productType == 0 &&
              // <View className="profit-container">
              //   <View className="profit-right flex-row-aligncenter">
              //     <AtIcon prefixClass='icon' value='bangzhu' size='14'></AtIcon>
              //     <View className="text">到手仅需¥{productDetail.realPayAmount / 100}</View>
              //   </View>
              // </View>
            }
          </View>
          {/*支付方式、发货时间、质保期*/}
          {this.getPayTypeView(productDetail)}
          <View className="spec-check">
            <View className="check-item flex-space-between" onClick={this.showSku.bind(this, true, 'cart')}>
              <View className="check-label">规格</View>
              <View className="flex-space-between flex-1">
                <View className="check-value">{allSpecText}</View>
                <AtIcon prefixClass="icon" value="gengduo1" size="8" color="#333" />
              </View>
            </View>
          </View>
          {/*推荐品牌*/}
          {this.getBrandView(productDetail)}

          {/* 满减 */}
          {couponList.length && productType != 1 && (
            <View className="mj-container" onClick={this.onShowCoupon.bind(this, true)}>
              <View className="check-label">满减</View>
              <View className="mj-box">
                <View className="mj-text">满减</View>
                <View className="mj-des text-clip">{couponListText}</View>
              </View>
              <AtIcon prefixClass="icon" value="gengduo1" size="8" color="#333" />
            </View>
          )}

          {productDetail.details && (
            <View className="detail_des">
              <View className="label">商品描述</View>
              <View className="detail_content">{productDetail.details}</View>
            </View>
          )}
          <View className="detail-list">
            <View className="label">图文详情</View>
            {productDetail.detailImageList.map((item, index) => {
              return <Image mode="widthFix" key={index} className="details-image" src={item} />;
            })}
          </View>
          {/*规格参数 */}
          <View className="spec-title">规格参数</View>
          <View className="spec">
            <View className="sub-title">基本信息</View>
            {goodsBaseInfo.map((baseInfoItem) => {
              return this.getSpecItem(baseInfoItem);
            })}

            {productDetail.productInfoAttribute && productDetail.productInfoAttribute.length > 0 && (
              <View className="sub-title">产品信息</View>
            )}
            {productDetail.productInfoAttribute &&
              productDetail.productInfoAttribute.map((baseInfoItem) => {
                return this.getSpecItem(baseInfoItem);
              })}

            {/*功能结构*/}
            {productDetail.productFunctionStructureAttribute &&
              productDetail.productFunctionStructureAttribute.length > 0 && (
                <View className="sub-title">产品功能结构</View>
              )}
            {productDetail.productFunctionStructureAttribute &&
              productDetail.productFunctionStructureAttribute.map((baseInfoItem) => {
                return this.getSpecItem(baseInfoItem);
              })}
          </View>

          {/* 底部 */}
          <View className="product-bottom fixed-bottom" style={{ paddingBottom: this.detectionType(36, 0) }}>
            <View className="product-bottom-container flex-space-between">
              <View className="icon-group-container">
                <View className="icon-group">
                  {/* <Button openType="contact" sessionFrom={'7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl} className='btn-transparent'></Button> */}
                  {productDetail.selfSupport && (
                    <Button className="btn-transparent" onClick={this.onShopClick.bind(this)} />
                  )}
                  {!productDetail.selfSupport && (
                    <Button
                      openType="contact"
                      className="btn-transparent"
                      sendMessageTitle={productDetail.name}
                      sendMessageImg={productDetail.imageUrl}
                      sendMessagePath={`/pages/goodsDetail/goodsDetail?shopId=${productDetail.shop.id}&spuId=${productDetail.spuId}`}
                      showMessageCard={true}
                    />
                  )}
                  <AtIcon prefixClass="icon" value="kefu" size="20" color="#242424" />
                  <View className="text">客服</View>
                </View>
                {productType == 0 && (
                  <View className="icon-group" onClick={this.onLinkShopcart}>
                    <AtIcon prefixClass="icon" value="gouwuche" size="20" color="#242424" />
                    <View className="text">购物车</View>
                  </View>
                )}
              </View>
              <View className="product-button-group flex-center">
                {productType == 0 && productDown && productDetail.skuList != null && productDetail.skuList.length > 0 && (
                  <View className="btn btn-cart flex-center" onClick={this.showSku.bind(this, true, 'cart')}>
                    加入购物车
                  </View>
                )}
                {productDown && productDetail.skuList != null && productDetail.skuList.length > 0 && (
                  <View
                    style={'border-radius:' + (productType == 0 ? '0px 100px 100px 0px' : '100px')}
                    className="btn btn-buy flex-center"
                    onClick={this.handleBuyClick.bind(this)}
                  >
                    {productType == 1 ? '立即兑换' : '立即购买'}
                  </View>
                )}
                {(!productDown || productDetail.skuList == null || productDetail.skuList.length == 0) && (
                  <View
                    style={{
                      borderRadius: '100px',
                      background: '#d8d8d8',
                      color: '#fff',
                    }}
                    className="btn btn-buy flex-center"
                    onClick={this.onProductDown.bind(this)}
                  >
                    商品已售罄
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* {
            !this.state.fromQiBei &&
            <View className="share-fixed flex-center" onClick={this.onShareClick} style={{ bottom: this.detectionType(176, 140) }}>
              <AtIcon prefixClass='icon' value='fenxiang' size='16'></AtIcon>
              <Text className="text">分享</Text>
            </View>
          } */}
        </XAuthorize>

        {/* 优惠券弹层 */}
        <AtFloatLayout isOpened={couponPopupOpened} onClose={this.onShowCoupon.bind(this, false)}>
          <View className="coupon_popup_container">
            <View className="popup_top">
              优惠券
              <View className="pupup_close" onClick={this.onShowCoupon.bind(this, false)}>
                <Image className="pupup_close_image" src={imageclosePopup} />
              </View>
            </View>
            <View className="popup_content">
              {couponList.map((item, index) => {
                return (
                  <CouponItem
                    key={index}
                    data={item}
                    index={index}
                    belong="goodsDetail"
                    goDetail={true}
                    onGetCoupon={this.onGetCoupon.bind(this)}
                  />
                );
              })}
            </View>
          </View>
        </AtFloatLayout>

        <SkuModel
          productType={productType}
          ref={this.skuModelRef}
          isOpened={isOpen}
          onClose={this.showSku.bind(this, false, 'nothing')}
          skuList={skuList}
          deliveryType={productDetail.deliveryType}
          specList={specList}
          productImageUrl={
            productDetail.headImageList != null && productDetail.headImageList.length > 0
              ? productDetail.headImageList[0]
              : ''
          }
          sellingPrice={productDetail.lowShowPrice}
          redeemPrice={productDetail.lowRedeemPrice}
          onAddCart={this.onSkuConfirm.bind(this)}
          groupBuyMode={false}
        />
        {/* 质保说明 */}
        <ContentDescription
          title="质保期说明"
          warrantyPeriod={productDetail.warrantyPeriod}
          content={this.getWarrantyStr(productDetail)}
          isOpened={isOpenWarrantyDescPopup}
          onCloseClick={this.onWarrantyDescCloseClick.bind(this)}
        />
        {/*货到付款说明*/}
        <ContentDescription
          title="货到付款说明"
          content="好橙家货到付款服务是指用户在好橙家平台购买商品时，只需支付货到付款订金，经配送、验货、安装、体验满意后再付余款的一项服务，是好橙家面向用户推出的网购升级新体验。货到付款订金支付标准为：按订单实际支付金额10%支付订金，最高不超过500元。发生退款退货时，订金可退。目前全部家具商品支持货到付款，具体请以好橙家平台相关页面说明为准。"
          isOpened={isOpenCashPayPopup}
          onCloseClick={this.onCashPayDescCloseClick.bind(this)}
        />
      </View>
    );
  }

  render() {
    const { productDetail } = this.state;
    return productDetail ? (
      this.getContentView()
    ) : (
      <View
        style={{
          paddingBottom: this.detectionType(136, 100),
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        <View
          className="custombar-container"
          onClick={this.onLinkHome}
          style={{ top: this.systemInfo.statusBarHeight + 8 + 'px' }}
        >
          <View className="back-box">
            <AtIcon prefixClass="icon" value="fanhui" size="14" color="#000" />
          </View>
        </View>
      </View>
    );
  }
}

export default XPage.connectFields()(GoodsDetail);
