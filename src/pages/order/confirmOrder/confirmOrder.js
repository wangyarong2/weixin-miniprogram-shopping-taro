import { Input, View, Text, Picker, Image } from '@tarojs/components';
import { AtIcon, AtFloatLayout } from 'taro-ui';

import XPage from '@src/components/XPage/XPage';
import AddressInfo from '@src/components/AddressInfo/AddressInfo';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import XCheckBox from '@src/components/XCheckBox/XCheckBox';
import CouponItem from '@src/components/CouponItem/CouponItem';
import { DELIVERY_TYPE_TEXT } from '@src/constants/common';

import { get as getGlobalData, set as setGlobalData } from '@utils/globalData';
import LoginUtil from '@utils/LoginUtil';
import WxPayUtil from '@utils/WxPayUtil';
import TextUtil from '@utils/TextUtil';
import PriceUtil from '@utils/PriceUtil';

import PriceView from '@src/components/PriceView/price';
import OperationItem from '../../../components/OperationItem/OperationItem';
import ChoosePayType from './subComponents/ChoosePayType/ChoosePayType';
import ChooseDeliveryDate from './subComponents/ChooseDeliveryDate/ChooseDeliveryDate';

import SpecTranslateUtil from '@utils/SpecTranslateUtil';
import request from '../../../servers/http';

import shopIcon from '@images/order/icon_shop.png';
import imageclosePopup from '@images/product/close_popup.png';
import notice from '@images/order/icon_order_notice.png';
import meiBaoPrice from '@images/product/icon_meibao_price.png';
import './confirmOrder.less';

class confirmOrder extends XPage {
  config = {
    navigationBarTitleText: '确认订单',
  };

  constructor(props) {
    super(props);
    this.state = {
      addressInfo: null,
      confirmInfo: {
        shopList: [],
        hasSelf: true,
      },
      spuRateAmount: 0,
      payLoading: false,
      remarkText: '',
      orderNoList: [],
      productType: null, //0正常商品 1橙宝商品 2橙卡商品 5限购商品 4团购
      useBalance: true, //注意这值需要返着来理解

      totalCount: 0,

      couponPopupOpened: false, // 控制优惠券弹出层是否出现在页面上
      couponList: [],
      selectCoupon: null, // 当前选择的优惠券
      showNotice: false,
      expectReceiveDateInfo: null, //用户选择收货时间
      isShowChangePayType: false, //切换支付方式
      isShowChangeDeliveryData: false, //切换收货方式
      isAgreedAgreement: false, //协议
    };
  }

  componentDidMount() {
    this.getConfirmData();
  }

  getConfirmData() {
    const cartConfirmData = getGlobalData('cartConfirmData');
    let productType = parseInt(this.$router.params.productType, 10);
    if (isNaN(productType)) {
      productType = 0;
    }
    if (!cartConfirmData) return;
    const totalCount = cartConfirmData.shopList.reduce((prev, cur) => prev + cur.totalCount, 0);
    const couponList = cartConfirmData.couponList || [];
    const showNotice = !TextUtil.isEmpty(cartConfirmData.selfSupport + '') && !cartConfirmData.selfSupport;
    this.setState({
      productType,
      confirmInfo: cartConfirmData,
      addressInfo: this.getAddressInfo(cartConfirmData.address),
      totalCount,
      couponList,
      showNotice,
    });
  }
  getAddressInfo(serverReturnAddress) {
    return this.state.addressInfo ? this.state.addressInfo : serverReturnAddress;
  }

  componentDidShow() {
    LoginUtil.getLoginCode();
    const checkAddressData = getGlobalData('currentAddressData');
    if (checkAddressData) {
      this.setState(
        {
          addressInfo: checkAddressData,
        },
        () => {
          setGlobalData('currentAddressData', '');
        }
      );
    }
  }

  onPayClick() {
    const address = this.state.addressInfo;
    const { shopList } = this.state.confirmInfo;
    const { useBalance, expectReceiveDateInfo, isAgreedAgreement } = this.state;
    const that = this;
    if (address == null && !(this.state.confirmInfo.hasSelf == true)) {
      this.showToast({ title: '请选择收货地址' });
      return;
    }
    if (expectReceiveDateInfo == null) {
      this.showToast({ title: '请选择收货时间 ' });
      return;
    }
    if (!isAgreedAgreement) {
      this.showToast({ title: '请勾选《好橙家服务协议》' });
      return;
    }

    if (this.state.payLoading) return;
    this.state.payLoading = true;
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });

    try {
      const requestData = [];
      shopList.forEach((shopInfo) => {
        const checkSkuList = [];
        shopInfo.skuList.forEach((skuInfo) => {
          checkSkuList.push({
            skuId: skuInfo.skuId,
            spuId: skuInfo.spuId,
            number: skuInfo.skuNumber,
            supplyId: shopInfo.supplyId,
            payType: skuInfo.payType,
            userRemark: skuInfo.userRemark,
          });
        });
        requestData.push({
          shopId: shopInfo.shopId,
          deliveryType: shopInfo.deliveryType,
          supplyId: shopInfo.supplyId,
          skuIdAndCountList: checkSkuList,
        });
      });

      let mRequest = {};
      if (!(this.state.confirmInfo.hasSelf == true)) {
        mRequest = {
          payMethod: 1,
          orderType: 0,
          province: address.province,
          district: address.district,
          addressId: address.addressId,
          city: address.city,
          detail: address.detailAddress,
          concatName: address.name,
          phone: address.phone,
          balanceAmount: 0,
          shopList: requestData,
        };
      } else {
        mRequest = {
          payMethod: 1,
          orderType: 0,
          balanceAmount: 0,
          shopList: requestData,
        };
      }
      if (this.state.productType == 0) {
        //正常商品
        if (shopList != null && shopList.length > 0) {
          //邮寄
          if (shopList[0].deliveryType == 2) {
            // mRequest.warehouseType = 0
          }
          //自提
          if (shopList[0].deliveryType == 1) {
            // mRequest.warehouseType = 1
          }
        }
      }
      if (this.state.productType == 1) {
        //橙宝商品
        mRequest.warehouseType = 3;
        mRequest.templateId = this.state.confirmInfo.templateId;
      }
      if (this.state.productType == 2) {
        //橙卡商品
        mRequest.warehouseType = 4;
      }
      if (this.state.productType == 4) {
        //拼团活动
        mRequest.warehouseType = 8;
        mRequest.templateId = this.state.confirmInfo.templateId;
        if (!TextUtil.isEmpty(this.state.confirmInfo.activityId)) {
          mRequest.activityId = this.state.confirmInfo.activityId;
        }
      }
      if (this.state.productType == 5) {
        //限购商品
        mRequest.warehouseType = 11;
        mRequest.templateId = this.state.confirmInfo.templateId;
      }

      // 使用优惠券
      if (this.state.selectCoupon) {
        mRequest.couponId = this.state.selectCoupon.userCouponId;
      }

      //收货时间
      if (expectReceiveDateInfo.value) {
        //转换成时间戳格式
        mRequest.expectReceiveTime = new Date(expectReceiveDateInfo.value).getTime();
      }

      Taro.showLoading({
        title: '请稍后...',
        mask: true,
      });
      that.doPostOrder(mRequest);
    } catch (e) {
      Taro.hideLoading();
    }
  }

  doPostOrder(mRequest) {
    if (this.state.productType != 1) {
      mRequest.hasBalance = this.state.useBalance;
    }
    const wxCode = Taro.getStorageSync('USER_AUTH_CODE');
    console.log('wxcode', wxCode);
    request
      .post('/community-client/postOrder', mRequest)
      .then((res) => {
        const data = res;
        this.state.spuRateAmount = res.spuRateAmount;
        this.state.orderNoList = res.orderNoList;
        const { confirmInfo } = this.state;
        const payAmount = this.state.useBalance
          ? confirmInfo.actuallyPayAmount / 100
          : (confirmInfo.actuallyPayAmount + confirmInfo.balancePrice) / 100;
        if (data.hasNoPay || payAmount === 0) {
          this.onNoPay();
        } else {
          request
            .post('/community-client/requestPayNo', {
              orderNoList: this.state.orderNoList,
              wxCode,
            })
            .then((res) => {
              console.log('获取订单号', res);
              this.state.payLoading = false;
              WxPayUtil.getPay(
                {
                  payNo: res.payNo,
                },
                this.onBuyShoppingSuccess.bind(this),
                this.onBuyShoppingFail.bind(this)
              );
            })
            .catch((res) => {
              this.state.payLoading = false;
            });
        }
      })
      .catch((res) => {
        LoginUtil.getLoginCode();
        this.state.payLoading = false;
        // 支付失败弹出提示
        Taro.hideLoading();
        Taro.showModal({
          title: res.resultDesc,
          showCancel: false,
          success: (res) => {},
        });
      });
  }

  // 支付为0元时
  onNoPay() {
    request
      .post('/community-client/noPay', {
        orderNos: this.state.orderNoList,
      })
      .then((res) => {
        Taro.hideLoading();
        this.onBuyShoppingSuccess();
      })
      .catch((res) => {
        Taro.hideLoading();
        this.showToast({ title: res.resultDesc });
        this.onBuyShoppingFail();
      });
  }

  onBuyShoppingSuccess() {
    Taro.hideLoading();
    if (this.state.productType == 5) {
      setGlobalData('payTemplateId', this.state.confirmInfo.templateId);
    }
    if (this.state.productType == 2) {
      setGlobalData('refreshCardDetail', 'true');
    }
    // const { payPrice, currentAddressData } = this.state
    this.goPage({
      type: 'replace',
      url: 'order/payResult',
      params: {
        spuRateAmount: this.state.spuRateAmount,
        // addressName: currentAddressData.name,
        // addressText: `${currentAddressData.province}${currentAddressData.city}${currentAddressData.district}${currentAddressData.detailAddress}`,
        // phone: currentAddressData.phone,
      },
    });
  }

  onBuyShoppingFail() {
    Taro.hideLoading();
    if (this.state.productType == 5) {
      console.log('存限购活动id', this.state.confirmInfo.templateId);
      setGlobalData('payTemplateId', this.state.confirmInfo.templateId);
    }
    // const { cartConfirmData } = this.state
    // if (typeof cartConfirmData.isFromOrderList != "undefined" && cartConfirmData.isFromOrderList != null && cartConfirmData.isFromOrderList == true) {
    //     return
    // }
    // 跳转到订单
    setTimeout(() => {
      this.goPage({
        type: 'replace',
        url: 'order/orderList',
      });
    }, 500);
  }

  onAddressInfoClick() {
    const { shopList } = this.state.confirmInfo;
    if (shopList[0].deliveryType == 1) {
      return;
    }
    this.goPage({ url: 'order/addressList', params: { formChoose: true } });
  }

  onMarkChange(shopIndex, skuIndex, e) {
    const { confirmInfo } = this.state;
    confirmInfo.shopList[shopIndex].skuList[skuIndex].userRemark = e.detail.value;
    this.setState({
      confirmInfo,
    });
  }
  onProductClick(product) {
    if (this.state.productType == 2) return;
    this.goPage({
      url: 'goodsDetail',
      params: {
        spuId: product.spuId,
        shopId: Taro.getStorageSync('currentShopId'),
      },
    });
  }

  onUseBalanceChange(e) {
    e.stopPropagation();
    this.setState({
      useBalance: !this.state.useBalance,
    });
  }

  // 显示优惠券弹层
  onShowCoupon(bool) {
    this.setState({ couponPopupOpened: bool });
  }

  // 选择优惠券后
  onSlecteCoupon(index) {
    const couponList = [...this.state.couponList];
    couponList.forEach((item, i) => {
      if (i == index) {
        item.selected = item.selected ? false : true;
      } else {
        item.selected = i == index;
      }
    });
    const selectCoupon = couponList.find((item) => item.selected);
    this.setState(
      {
        couponPopupOpened: false,
        couponList,
        selectCoupon: selectCoupon || null,
      },
      () => {
        //选择优惠券后，重新请求
        this.requestCartConfirm(this.state.confirmInfo);
      }
    );
  }

  //获取余额支付显示金额
  getBalancePayPrice(payPrice, couponPrice, balance) {
    //不使用优惠券 优惠券金额为0
    //商品10元 优惠券1元 余额0.49 支付  余额抵扣 0.49
    //商品10元 优惠券10元 余额 0.49 支付 余额抵扣0元
    //商品 10元 优惠券 1元 余额 12 支付 余额抵扣 9元
    if (payPrice - couponPrice >= balance) {
      return balance;
    }
    if (couponPrice >= payPrice) {
      return 0;
    }
    if (payPrice - couponPrice < balance) {
      return payPrice - couponPrice;
    }
  }

  confirmCoupon() {
    // if (!selectCoupon) {
    //   this.showToast({
    //     title: '请选择优惠券',
    //     icon: 'none',
    //   })
    //   return
    // }
    this.setState({
      couponPopupOpened: false,
    });
  }

  getOrderInfoView(confirmInfo) {
    return (
      <View className="order-info-layout">
        <View className="info-layout">
          <View className="info-title">订单总计</View>
          <View className="info-content">{confirmInfo.actuallyPayAmount / 100}元</View>
        </View>
        {confirmInfo.totalOnlineAmount && (
          <View className="info-layout">
            <View className="info-title">在线支付商品总额</View>
            <View className="info-content">{confirmInfo.totalOnlineAmount / 100}元</View>
          </View>
        )}
        {confirmInfo.totalCodDeposit && (
          <View className="info-layout">
            <View className="info-title">货到付款订金</View>
            <View className="info-content">{confirmInfo.totalCodDeposit / 100}元</View>
          </View>
        )}
      </View>
    );
  }
  //选择收货时间
  onSelectExpectReceiverDate() {
    this.setState({
      isShowChangeDeliveryData: true,
    });
  }
  //选择支付类型
  onSelectPayTypeClick() {
    this.setState({
      isShowChangePayType: true,
    });
  }

  getNeedOpertionView(confirmInfo, couponList, selectCoupon) {
    const { expectReceiveDateInfo } = this.state;
    return (
      <View className="operation-container">
        {/*//发货时间*/}
        <OperationItem
          labelStr="收货时间"
          content={expectReceiveDateInfo ? expectReceiveDateInfo.title : '请选择收货时间'}
          onClick={this.onSelectExpectReceiverDate.bind(this)}
        />
        {/*//优惠券*/}
        {couponList.length && (
          <OperationItem
            labelStr="优惠券"
            content={
              selectCoupon ? `满${selectCoupon.fullAmount / 100}元减${selectCoupon.cutAmount / 100}元` : '请选择优惠券'
            }
            onClick={this.onShowCoupon.bind(this)}
          />
        )}
        {/*//支付方式*/}
        <OperationItem
          labelStr="支付方式"
          content={this.getPayTypeStr()}
          onClick={this.onSelectPayTypeClick.bind(this)}
        />
      </View>
    );
  }
  //根据当前商品选择的支付方式，
  getPayTypeStr() {
    const onLinePayStr = '在线支付';
    const onCashPayStr = '货到付款';
    const { confirmInfo } = this.state;
    if (null == confirmInfo) return onLinePayStr;
    let result = {};

    if (confirmInfo.shopList) {
      confirmInfo.shopList.forEach((shopInfo) => {
        if (shopInfo.skuList) {
          shopInfo.skuList.forEach((skuInfo) => {
            result['payType_' + skuInfo.payType] = skuInfo.payType === 1 ? onLinePayStr : onCashPayStr;
          });
        }
      });
    }
    return Object.values(result).join('+');
  }

  changePayTypeCallback(confirmInfo) {
    this.setState({ isShowChangePayType: false });
    this.requestCartConfirm(confirmInfo);
  }
  //切换支付方式后，重新请求 cartConfirm
  requestCartConfirm(confirmInfo) {
    const { selectCoupon } = this.state;
    this.showLoading();
    let requestParams = {
      hasBalance: true,
      actionFlag: 0,
      shopList: this.getRequestShopList(confirmInfo),
      couponId: selectCoupon ? selectCoupon.couponId : '',
    };
    request.post('/community-client/cartConfirm', requestParams).then((res) => {
      this.hideLoading();
      console.log(res);
      setGlobalData('cartConfirmData', res);
      //重新加载确认订单页面数据
      this.getConfirmData();
    });
  }

  getRequestShopList(confirmInfo) {
    const shopList = [];
    confirmInfo.shopList.forEach((shopInfo) => {
      const skuList = shopInfo.skuList.reduce((item, next) => {
        item.push({
          number: next.skuNumber,
          spuId: next.spuId,
          skuId: next.skuId,
          payType: next.payType,
          supplyId: shopInfo.supplyId,
        });
        return item;
      }, []);
      shopList.push({
        deliveryType: shopInfo.deliveryType,
        shopId: shopInfo.shopId,
        skuIdAndCountList: skuList,
      });
    });
    return shopList;
  }

  changeDate(expectReceiveDateInfo) {
    this.setState({
      expectReceiveDateInfo: expectReceiveDateInfo,
      isShowChangeDeliveryData: false,
    });
  }
  jumpToAgreementPage() {
    this.goPage({
      url: 'webPage',
      params: { url: 'https://agreement.hcjia.com/service.html' },
    });
  }
  jumpToDeliveryPage() {
    this.goPage({
      url: 'webPage',
      params: { url: 'https://agreement.hcjia.com/delivery.html' },
    });
  }
  onChoosePayClick() {
    this.setState({
      isShowChangePayType: false,
    });
  }
  onChooseDeliveryDateClick() {
    this.setState({
      isShowChangeDeliveryData: false,
    });
  }
  selctAgreement() {
    this.setState({
      isAgreedAgreement: !this.state.isAgreedAgreement,
    });
  }
  isSupportCashPay(skuInfo) {
    if (skuInfo.payTypes) {
      //2：货到付款
      return skuInfo.payTypes.some((item) => {
        console.log(item === 2);
        return item === 2;
      });
    }
    return false;
  }

  render() {
    const {
      confirmInfo,
      useBalance,
      addressInfo,
      productType,
      totalCount,
      couponPopupOpened,
      couponList,
      selectCoupon,
      showNotice,
      isShowChangePayType,
      isShowChangeDeliveryData,
      isAgreedAgreement,
    } = this.state;
    let currentPayPrice = Math.max(0, confirmInfo.actuallyPayAmount / 100);

    return (
      <View className="confirm-order-page">
        {!confirmInfo.hasSelf + '' == 'true' && (
          <AddressInfo onAddressInfoClick={this.onAddressInfoClick.bind(this)} addressInfo={addressInfo} />
        )}

        {confirmInfo.shopList.map((item, shopIndex) => {
          return (
            <View className="shop-layout">
              {item.skuList &&
                item.skuList.map((skuInfo, skuIndex) => {
                  const priceText = PriceUtil.convertToFormatYuan(skuInfo.unitPrice);

                  const groupPrice = PriceUtil.convertToFormatYuan(skuInfo.activityPrice);
                  const groupPriceText = PriceUtil.convertToFormatYuan(groupPrice);

                  return (
                    <View className="item">
                      <View className="product-info">
                        <View className="product-image-layout">
                          <Image className="product-image" src={skuInfo.spuImage} />
                          {item.deliveryType == 1 && (
                            <Text className="send-type">{DELIVERY_TYPE_TEXT[item.deliveryType]}</Text>
                          )}
                        </View>
                        <View className="product-right-content">
                          <View className="line-1">
                            <View className="product-name">{skuInfo.spuName}</View>
                            <View style={{ paddingTop: '25rpx' }}>
                              <PriceView price={skuInfo.unitPrice / 100} size={32} hasSymbol="￥" />
                            </View>
                          </View>
                          <View className="line-2">
                            <Text className="spec">{SpecTranslateUtil.translateSpecToText(skuInfo.skuSpecDesc)}</Text>
                            <Text className="product-count">X{skuInfo.skuNumber}</Text>
                          </View>
                          <View className="line-3">
                            {`发货时间：付款后${Math.round((skuInfo.deliveryIn || 0) / (24 * 60 * 60 * 1000))}天内`}
                          </View>
                        </View>
                      </View>
                      {/*货到付款标识*/}
                      {this.isSupportCashPay(skuInfo) && (
                        <View className="support-pay">
                          <AtIcon prefixClass="icon" value="daifukuan" color="#FF6400" size="12" />
                          <Text className="text">支持货到付款</Text>
                        </View>
                      )}
                      {/*订单备注*/}
                      <View className="market-layout">
                        <View className="remark-text">订单备注</View>
                        <Input
                          className="remark-input"
                          value={skuInfo.userRemark}
                          onInput={this.onMarkChange.bind(this, shopIndex, skuIndex)}
                          placeholderClass="input-placeholder"
                          placeholder="请填写备注信息（选填）"
                        />
                      </View>
                    </View>
                  );
                })}

              {/*<View className="total-layout">*/}
              {/*  <View className="total-text">*/}
              {/*    共{item.totalCount}件商品 小计:￥{item.totalPrice / 100}*/}
              {/*  </View>*/}
              {/*</View>*/}
            </View>
          );
        })}

        {productType != 1 && this.getNeedOpertionView(confirmInfo, couponList, selectCoupon)}
        {productType != 1 && this.getOrderInfoView(confirmInfo)}
        <View className="agreement">
          <XCheckBox text="" checked={isAgreedAgreement} onClick={this.selctAgreement.bind(this)} />

          <Text className="before">我已阅读并同意</Text>
          <Text className="after" onClick={this.jumpToAgreementPage.bind(this)}>
            《好橙家服务协议》
          </Text>
          <Text className="after" onClick={this.jumpToDeliveryPage.bind(this)}>
            《好橙家货到付款服务协议》
          </Text>
        </View>

        <View className="bottom-layout" style={{ paddingBottom: this.detectionType(36) }}>
          <View>
            <View className="really-pay-layout">
              <View className="really-pay-text">
                支付金额：
                {confirmInfo.logisticsFee == 0 || confirmInfo.logisticsFee == null
                  ? ''
                  : ' (含运费' + confirmInfo.logisticsFee / 100 + '元)'}
              </View>
              {productType == 1 && <View className="pay-price">{confirmInfo.mabelPrice / 100}橙宝</View>}
              {productType != 1 && (
                <PriceView
                  className="pay-price"
                  size={32}
                  price={(confirmInfo.totalCodDeposit + confirmInfo.totalOnlineAmount) / 100}
                  hasSymbol="￥"
                />
              )}
            </View>
            <View className="total_text">共计{totalCount}件商品</View>
          </View>
          <View className="pay-now" onClick={this.onPayClick}>
            立即支付
          </View>
        </View>

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
              {couponList.map((item, i) => {
                return (
                  <CouponItem
                    key={item.id}
                    data={item}
                    index={i}
                    selectOpen={true}
                    selected={item.selected}
                    onSlecteCoupon={this.changePayTypeCallback.bind(this)}
                  />
                );
              })}
            </View>
            {/* <View className="bottom-container fixed-bottom" style={{ paddingBottom: this.detectionType(36, 24) }}>
                <View className="bottom-btn" onClick={this.confirmCoupon.bind(this)}>确定</View>
              </View> */}
          </View>
        </AtFloatLayout>
        <ChooseDeliveryDate
          isOpened={isShowChangeDeliveryData}
          confirmInfo={confirmInfo}
          changeCallback={this.changeDate.bind(this)}
          onCloseClick={this.onChooseDeliveryDateClick.bind(this)}
        />
        <ChoosePayType
          isOpened={isShowChangePayType}
          confirmInfo={confirmInfo}
          changePayType={this.changePayTypeCallback.bind(this)}
          onCloseClick={this.onChoosePayClick.bind(this)}
        />
      </View>
    );
  }
}
export default XPage.connectFields()(confirmOrder);
