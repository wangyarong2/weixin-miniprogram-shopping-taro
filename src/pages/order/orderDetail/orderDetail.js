import XPage from '@src/components/XPage/XPage';
import { View, Button, Image } from '@tarojs/components';
import './orderDetail.less';
import AddressInfo from '../../../components/AddressInfo/AddressInfo';
import ShopInfo from '../../../components/ShopInfo/ShopInfo';
import TextUtil from '../../../utils/TextUtil';
import LoginUtil from '../../../utils/LoginUtil';
import WxPayUtil from '../../../utils/WxPayUtil';
import SpecTranslateUtil from '../../../utils/SpecTranslateUtil';
import AfterCouponPriceIcon from '../../../components/AfterCouponPrice/AfterCouponPrice';

import LoadingView from '@src/components/LoadingView/LoadingView';

import meiBaoPrice from '../../../assets/images/product/icon_meibao_price.png';
import topCommonBg from '../../../assets/images/order/order_top_bg.png';
import topFailedBg from '../../../assets/images/order/order_top_failed_bg.png';

import GroupProductShareDialog from '../../../components/GroupProductShareDialog/GroupProductShareDialog';
import { AtIcon } from 'taro-ui';

import OrderProductItem from '@src/components/OrderProductItem/OrderProductItem';

import request from '../../../servers/http';
import Taro from '@tarojs/taro';

/**
 * 支付状态：payStatus
 * 1 未支付
 * 2 已支付定金
 * 3 已完全支付
 *
 *
 * 订单状态：
 *
 * 150:待审核==待发货
 * 2, "待发货"
 * 3,"待签收"
 * 4, "已完成"
 * 5, "已关闭"
 */
class orderDetail extends XPage {
  config = {
    navigationBarTitleText: '订单详情',
    navigationStyle: 'custom',
    navigationBarTextStyle: 'black',
  };

  state = {
    orderTabMap: {
      0: { name: '', icon: '' },
      1: { name: '待付款', icon: 'daifukuan-xiangqing' },
      2: { name: '待发货', icon: 'daifahuoxiangqing' },
      150: { name: '待发货', icon: 'daifahuoxiangqing' },
      3: { name: '待收货', icon: 'daishouhuoxiangqing' },
      5: { name: '已关闭', icon: 'yiguanbi' },
      4: { name: '已完成', icon: 'yiwancheng' },
      10: { name: '待提货', icon: 'daitihuoxiangqing' },
      11: { name: '退款中', icon: 'tuikuanzhong' },
      12: { name: '退款成功', icon: 'tuikuanchenggong' },
      13: { name: '退款失败', icon: 'tuikuanshibai' },
      14: { name: '团购中', icon: 'pintuanbeifen' },
    },

    orderInfo: null,
    approvalStatusMap: {
      1: '同意退款',
      2: '拒绝退款',
    },
    orderNo: null,
    intervalId: null,
    minutes: 30,
    expressInfo: {},
    expressSingle: true, // 是否是单个物流
    orderTabIndex: 0,
    hasClickContactService: false,
    //拼团相关
    qrCodeImage: null, //分享二维码
    getQrcodeErrorCount: 0, // 获取海报图片失败次数
    showShareDialog: false,
    productDetail: {
      highUnitPrice: 0,
      lowShowPrice: 0,
      showPrice: 0,
      lowOriginPrice: 0,
      lowActivePrice: 0,
      highActivePrice: 0,
      highOriginPrice: 0,
    }, //商品详情
    isShowWhiteNavigationBar: false,
  };

  componentDidShow() {
    const { orderNo, orderTabIndex } = this.$router.params;
    this.setState(
      {
        orderNo,
        orderTabIndex,
      },
      () => {
        this.getOrderDetail();
      }
    );
  }
  componentWillMount() {
    this.getSystemInfo();
  }

  getSystemInfo() {
    const res = Taro.getSystemInfoSync();
    this.systemInfo = res;
  }

  getOrderDetail() {
    const hasSubmitRefound = Taro.getStorageSync('hasSubmitRefound');
    const { orderNo } = this.state;
    this.showLoading();
    request
      .post('/community-client/orderDetail', { orderNo })
      .then((res) => {
        this.hideLoading();
        if (res.orderStatus == 1) {
          res.countDownTime = this.state.minutes * 60 * 1000 - (Date.parse(new Date()) - res.createTime) + '';
        }
        if (res.afterSaleStatus == 1) {
          if (
            this.state.orderTabIndex == 5 ||
            (hasSubmitRefound != null && hasSubmitRefound == true) ||
            this.state.hasClickContactService == true
          ) {
            res.orderStatus = 12;
            Taro.setStorageSync('hasSubmitRefound', null);
          } else {
            res.afterSaleStatus = null;
          }
        }
        if (res.afterSaleStatus == 2) {
          if (
            this.state.orderTabIndex == 5 ||
            (hasSubmitRefound != null && hasSubmitRefound == true) ||
            this.state.hasClickContactService == true
          ) {
            res.orderStatus = 13;
            Taro.setStorageSync('hasSubmitRefound', null);
          } else {
            res.afterSaleStatus = null;
          }
        }
        if (res.afterSaleStatus == 3 || res.afterSaleStatus == 0) {
          if (
            this.state.orderTabIndex == 5 ||
            (hasSubmitRefound != null && hasSubmitRefound == true) ||
            this.state.hasClickContactService == true
          ) {
            res.orderStatus = 11;
            Taro.setStorageSync('hasSubmitRefound', null);
          } else {
            res.afterSaleStatus = null;
          }
        }
        if (res.afterSaleStatus == 5) {
          res.afterSaleStatus = null;
        }
        // if (res.afterSaleStatus == 6) {
        //     res.afterSaleStatus = null
        // }
        if (res.deliveryType == 1 && res.orderStatus == 3) {
          res.orderStatus = 10;
        }
        if (res.groupStatus != null && res.groupStatus == 1) {
          res.orderStatus = 14;
        }
        if (res.respRefund == null) {
          res.respRefund = {};
        }
        const expressSingle = res.orderExpressList && res.orderExpressList.length === 1;
        this.setState(
          {
            orderInfo: res,
            hasClickContactService: false,
            expressSingle,
          },
          () => {
            if (this.state.intervalId != null) {
              clearInterval(this.state.intervalId);
            }
            // 如果有倒计时 开始倒计时
            if (res.countDownTime != null && res.countDownTime > 0) {
              this.setCountDown();
            }
          }
        );
        if (expressSingle) {
          this.getExpressDetail(res.orderExpressList[0].expressCompanyCode, res.orderExpressList[0].expressNo);
        }
      })
      .catch((res) => {
        this.hideLoading();
      });
  }

  getExpressDetail(expressCompCode, expressNo) {
    request
      .post('/community-client/routeDetail', {
        cpCode: expressCompCode,
        mailNo: expressNo,
        platformId: 6,
      })
      .then((res) => {
        this.hideLoading();
        const resultData = res;
        if (resultData != null) {
          this.setState({
            expressInfo: res,
            fullTraceDetail: resultData.fullTraceDetail,
            lastExpress:
              resultData == null || resultData.fullTraceDetail.length == 0
                ? { time: '', desc: '暂无物流信息' }
                : resultData.fullTraceDetail[resultData.fullTraceDetail.length - 1],
          });
        }
      });
  }

  // 倒计时
  setCountDown() {
    const intervalId = setInterval(() => {
      const { orderInfo } = this.state;
      // 正常订单
      if (orderInfo.orderStatus === 1) {
        if (orderInfo.countDownTime <= 0) {
          orderInfo.countDownTime = 0;
          orderInfo.countDown = '';
          if (orderInfo.orderStatus === 1) {
            //待付款变成已关闭
            orderInfo.orderStatus = 5;
            Taro.setStorageSync('orderListNeedRefresh', true);
          }
        } else {
          orderInfo.countDownTime -= 1000;
          if (orderInfo.orderStatus === 1) {
            orderInfo.countDown = `${TextUtil.getMinutes(orderInfo.countDownTime)}分${TextUtil.getSeconds(
              orderInfo.countDownTime
            )}秒`;
          }
        }
      } else {
        orderInfo.countDownTime = 0;
        orderInfo.countDown = '';
      }
      this.setState({
        orderInfo: orderInfo,
      });
    }, 1000);
    this.setState({
      intervalId: intervalId,
    });
  }

  onAddressInfoClick() {}

  // 取消订单
  onCanecelOrder() {
    const { orderInfo } = this.state;
    Taro.showModal({
      title: '提示',
      content: '确认取消该订单吗?',
    }).then((res) => {
      if (res.confirm) {
        this.showLoading();
        request
          .post('/community-client/cancelOrder', {
            orderNo: orderInfo.orderNo,
          })
          .then((res) => {
            this.hideLoading();
            Taro.showToast({
              title: '订单取消成功',
              icon: 'success',
            });
            orderInfo.orderStatus = 5;
            Taro.setStorageSync('orderListNeedRefresh', true);
            this.setState({
              orderInfo: orderInfo,
            });
          })
          .catch((res) => {
            this.showToast({
              title: res.resultDesc,
            });
          });
      }
    });
  }

  // 立即付款
  async onPayNow() {
    const { orderInfo } = this.state;
    Taro.showLoading({
      title: '请等待...',
      mask: true,
    });
    const wxCode = await LoginUtil.getWXCode();
    request
      .post('/community-client/requestPayNo', {
        orderNoList: Array.of(orderInfo.orderNo),
        wxCode,
      })
      .then((res) => {
        Taro.hideLoading();
        WxPayUtil.getPay(
          {
            payNo: res.payNo,
          },
          this.onOrderPaySuccess.bind(this, Array.of(orderInfo.orderNo)),
          this.onOrderPayFail.bind(this)
        );
      })
      .catch((res) => {
        this.showToast({
          title: res.resultDesc,
        });
      });
  }

  // 订单支付成功
  onOrderPaySuccess(orderNo) {
    const { orderInfo } = this.state;
    orderInfo.orderStatus = 2;
    Taro.setStorageSync('orderListNeedRefresh', true);
    this.setState({
      orderInfo,
    });
    if (orderInfo.warehouseType == 4) {
      setGlobalData('refreshCardDetail', 'true');
    }
  }

  //查看物流
  onSeeExpress() {
    const { orderInfo } = this.state;
    this.goPage({
      url: 'order/expressDetail',
      params: {
        expressNo: orderInfo.expressNo,
        expressCompanyCode: orderInfo.expressCompCode,
        orderNo: orderInfo.orderNo,
      },
    });
  }

  //退款
  onApplyRefoundClick() {
    this.goPage({
      url: 'order/applyRefound',
      params: {
        orderNo: this.state.orderInfo.orderNo,
      },
    });
  }

  //确认收货
  confirmTakeGoods() {
    const { orderInfo } = this.state;
    Taro.showModal({
      title: '提示',
      content: '确定收货吗?',
    }).then((res) => {
      if (res.confirm) {
        this.showLoading();
        request
          .post('/community-client/order/finish', {
            orderNo: orderInfo.orderNo,
          })
          .then((res) => {
            Taro.showToast({
              title: '收货成功',
              icon: 'success',
            });
            setTimeout(() => {
              Taro.setStorageSync('orderListNeedRefresh', true);
              this.getOrderDetail();
            }, 300);
          });
      }
    });
  }

  //确认提货
  confirmTakeGoods2() {
    const { orderInfo } = this.state;
    Taro.showModal({
      title: '提示',
      content: '确定提货吗?',
    }).then((res) => {
      if (res.confirm) {
        this.showLoading();
        request
          .post('/community-client/order/finish', {
            orderNo: orderInfo.orderNo,
          })
          .then((res) => {
            Taro.showToast({
              title: '提货成功',
              icon: 'success',
            });
            setTimeout(() => {
              Taro.setStorageSync('orderListNeedRefresh', true);
              this.getOrderDetail();
            }, 300);
          });
      }
    });
  }

  //取消退款
  cancelRefound() {
    const { orderInfo } = this.state;
    Taro.showModal({
      title: '提示',
      content: '确定取消退款吗?',
    }).then((res) => {
      if (res.confirm) {
        this.showLoading();
        request
          .post('/community-client/customer/refund/cancel', {
            orderNo: orderInfo.orderNo,
            refundId: orderInfo.respRefund.refundNo,
          })
          .then((res) => {
            setTimeout(() => {
              Taro.setStorageSync('orderListNeedRefresh', true);
              this.getOrderDetail();
            }, 300);
          });
      }
    });
  }

  onProductClick(product) {
    const { orderInfo } = this.state;
    if (!TextUtil.isEmpty(orderInfo.templateId)) {
      if (orderInfo.warehouseType + '' == '11') {
        this.goPage({
          url: 'limitBuyGoodsDetail',
          params: {
            templateId: orderInfo.templateId,
            shopId: Taro.getStorageSync('currentShopId'),
          },
        });
      } else {
        this.goPage({
          url: 'groupBuy/groupBuyProductDetail',
          params: {
            templateId: orderInfo.templateId,
            shopId: orderInfo.shopId,
          },
        });
      }
    } else {
      if (orderInfo.warehouseType == 4) {
        return;
      }
      this.goPage({
        url: 'goodsDetail',
        params: {
          spuId: product.spuId,
          shopId: orderInfo.shopId,
        },
      });
    }
  }

  oncontactService() {
    this.setState({
      hasClickContactService: true,
    });
  }
  //邀请拼团相关代码

  shareDialogRef = (node) => (this.GroupProductShareDialog = node);

  onShareClick = () => {
    const { orderInfo } = this.state;
    request
      .post('/community-client/miniapp/group/detail', {
        templateId: orderInfo.templateId,
        shopId: orderInfo.shopId,
        groupId: orderInfo.activityId,
      })
      .then((data) => {
        const resultData = data;
        this.setState(
          {
            productDetail: resultData,
          },
          () => {
            this.getQrCodeImage();
          }
        );
      });
  };

  //获取二维码
  getQrCodeImage() {
    const { orderInfo } = this.state;
    Taro.showLoading({
      title: '生成中...',
    });
    let shareOriginId = {};
    //拼团分享
    shareOriginId = orderInfo.templateId + '&' + orderInfo.shopId + '&' + orderInfo.activityId;
    request.post('/wx-agent/exchangeId/save', { scene: shareOriginId }).then((res) => {
      const id = res.id;
      request
        .post('/wx-agent/wxdrcode/get', {
          userId: Taro.getStorageSync('member_info').userId,
          originId: id,
          sharePage: 'pages/groupBuy/groupBuyProductDetail/groupBuyProductDetail',
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
                  this.GroupProductShareDialog.init();
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

  onCloseDialogClick() {
    this.setState({
      showShareDialog: false,
    });
  }

  //分享给好友
  onShareAppMessage() {
    let path = null;
    path = `/pages/groupBuy/groupBuyProductDetail/groupBuyProductDetail?shareUserId=${
      Taro.getStorageSync('member_info').userId
    }&shopId=${this.state.orderInfo.shopId}&templateId=${this.state.orderInfo.templateId}&groupId=${
      this.state.orderInfo.activityId
    }`;
    return {
      title: this.state.productDetail.name,
      path: path,
      imageUrl: this.state.productDetail.imageUrl,
    };
  }

  // 支付失败不做任何操作
  onOrderPayFail() {}

  getDeliveryTimeStr(orderInfo, skuInfo) {
    if (orderInfo.orderStatus == 1) {
      //待付款
      return '预计发货时间：付款后' + Math.ceil((skuInfo.deliveryIn || 0) / (24 * 60 * 60 * 100)) + '天内';
    }
    if (orderInfo.orderStatus == 2) {
      //待发货
      if (orderInfo.expectDeliveryTime != null) {
        return '预计发货时间：' + TextUtil.formatDateWithYMD(orderInfo.expectDeliveryTime);
      }
    }
    return '';
  }

  /***
   * true：配送入户 false:货到付款
   * */
  isOnlineOrder(orderInfo) {
    return orderInfo.payType != 2;
  }
  getPayAmountDetail(orderInfo) {
    if (this.isOnlineOrder(orderInfo)) {
      //在线支付
      return (
        orderInfo.actuallyPayAmount != null &&
        orderInfo.orderStatus != 1 && (
          <View className="item">
            <View className="black-title">{orderInfo.orderStatus == 1 ? '应付' : '实付'}总额</View>
            <View className="red-content">
              {(orderInfo.orderStatus == 1 ? orderInfo.orderAmountTotal : orderInfo.actuallyPayAmount) / 100}元
            </View>
          </View>
        )
      );
    } else {
      //货到付款
      if (orderInfo.orderStatus == 1) {
        //待支付订金
        return (
          <View className="item">
            <View className="black-title">待付订金</View>
            <View className="red-content">{orderInfo.codDeposit / 100}</View>
          </View>
        );
      }
      if (orderInfo.orderStatus === 2 || orderInfo.orderStatus === 150 || orderInfo.orderStatus === 3) {
        //已支付订金
        return (
          <View>
            <View className="item">
              <View className="black-title">实付订金</View>
              <View className="red-content">{orderInfo.codDeposit / 100}</View>
            </View>
            <View className="item">
              <View className="black-title">应付尾款</View>
              <View className="red-content">{orderInfo.remainingAmount / 100}</View>
            </View>
          </View>
        );
      }
      //已完成 待收货
      if (orderInfo.orderStatus == 4) {
        return (
          <View>
            <View className="item">
              <View className="black-title">实付订金</View>
              <View className="red-content">{(orderInfo.codDeposit || 0) / 100}</View>
            </View>
            <View className="item">
              <View className="black-title">实付尾款</View>
              <View className="red-content">{(orderInfo.remainingAmount || 0) / 100}</View>
            </View>
          </View>
        );
      }
    }
  }
  createBottomAction(className, clickFunc, text, openType, sessionFrom) {
    return { className: className, click: clickFunc, text: text, openType: openType, sessionFrom: sessionFrom };
  }
  getBottomActionStatus(orderInfo) {
    const buttonStatus = [];
    if (!this.isOnlineOrder(orderInfo)) {
      if (orderInfo.orderStatus == 1) {
        buttonStatus.push(this.createBottomAction('cancel', this.onCanecelOrder, '取消订单'));
        buttonStatus.push(this.createBottomAction('pay-now', this.onPayNow, '支付订金'));
      }
      if (orderInfo.orderStatus == 3 && orderInfo.deliveryType == 2) {
        buttonStatus.push(this.createBottomAction('cancel', this.onSeeExpress, '查看物流'));
      }
      if (orderInfo.orderStatus == 3) {
        buttonStatus.push(this.createBottomAction('pay-now', this.confirmTakeGoods, '确认收货'));
      }
      if (orderInfo.orderStatus == 10) {
        buttonStatus.push(this.createBottomAction('pay-now', this.confirmTakeGoods2, '确认提货'));
      }

      if (orderInfo.orderStatus == 11) {
        buttonStatus.push(
          this.createBottomAction(
            'cancel',
            this.oncontactService,
            '联系客服',
            contact,
            '7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl
          )
        );
      }
      if (orderInfo.orderStatus == 11 && orderInfo.afterSaleStatus == 3) {
        buttonStatus.push(this.createBottomAction('pay-now', this.cancelRefound, '取消退款'));
      }

      if (orderInfo.orderStatus == 13) {
        buttonStatus.push(
          this.createBottomAction(
            'cancel',
            this.oncontactService,
            '联系客服',
            contact,
            '7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl
          )
        );
      }
      if (orderInfo.orderStatus == 14) {
        buttonStatus.push(this.createBottomAction('pay-now', this.onShareClick, '邀请好友参团'));
      }
    }
    return buttonStatus;
  }
  onBack() {
    Taro.navigateBack({
      delta: 1,
    });
  }
  onPageScroll(e) {
    let isShowWhiteNavigationBar = e.scrollTop > 10;
    this.setState({
      isShowWhiteNavigationBar,
    });
  }
  getStateBarAndNavigationBarHeight() {
    if (this.systemInfo.platform === 'android') {
      return 48 + this.systemInfo.statusBarHeight + 'px';
    } else {
      return 44 + this.systemInfo.statusBarHeight + 'px';
    }
  }

  isShowExpressView(orderInfo) {
    if (orderInfo.afterSaleStatus != null) return false;
    return (
      (orderInfo.orderStatus === 3 || orderInfo.orderStatus === 4) &&
      (orderInfo.deliveryType === 2 || orderInfo.deliveryType === 5)
    );
  }
  getRefundText(orderInfo) {
    if (this.isOnlineOrder(orderInfo)) return '退款';
    if (orderInfo.payStatus === 2) return '退订金';
    if (orderInfo.payStatus === 3) return '退款';
    return '';
  }

  getContentView(orderInfo) {
    const {
      orderTabMap,
      expressInfo,
      productDetail,
      showShareDialog,
      qrCodeImage,
      expressSingle,
      lastExpress,
      approvalStatusMap,
      isShowWhiteNavigationBar,
    } = this.state;
    return (
      <View className="order-detail-page">
        {showShareDialog && (
          <GroupProductShareDialog
            qrCodeImage={qrCodeImage}
            onCloseClick={this.onCloseDialogClick.bind(this)}
            productImage={productDetail.imageUrl}
            productName={productDetail.name}
            oldPrice={'￥' + TextUtil.formateMoney(productDetail.showPrice, productDetail.highOriginPrice)}
            shopName={productDetail.shopName}
            endTime={TextUtil.formatDateWithYMDHMS(productDetail.endTime)}
            price={TextUtil.formateMoney(productDetail.lowActivePrice, productDetail.highActivePrice)}
            ref={this.shareDialogRef}
          />
        )}

        <View
          className="custombar-container"
          onClick={this.onBack}
          style={{
            height: this.getStateBarAndNavigationBarHeight(),
            paddingTop: this.systemInfo.statusBarHeight + 'px',
            backgroundColor: isShowWhiteNavigationBar ? 'white' : 'transparent',
          }}
        >
          <View className="back-box">
            <AtIcon prefixClass="icon" value="fanhui" size="14" color="#000" />
          </View>
          <View className="title" style={{ color: isShowWhiteNavigationBar ? 'black' : 'white' }}>
            订单详情{' '}
          </View>
        </View>
        <Image className="top-layout" src={orderInfo.orderStatus === 5 ? topFailedBg : topCommonBg} />
        <View className="bottom-layout">
          <View className="status-layout">
            <Text className="status-text">
              {orderTabMap[orderInfo.orderStatus].name}
              {orderInfo.deliveryType == 4 ? '——商家配送' : ''}
            </Text>
            <Text className="count-down-time">
              {orderInfo.orderStatus == 1 ? `订单还剩${orderInfo.countDown}关闭` : ''}
            </Text>
            {orderInfo.orderStatus == 14 && <Text className="count-down-time">还差{orderInfo.remainNum}人成团</Text>}
          </View>

          {
            <View className="address-layout">
              {/*物流信息*/}
              {this.isShowExpressView(orderInfo) && (
                <View className="express-layout" onClick={this.onSeeExpress}>
                  <View className="express-title">
                    <View className="express-info">物流信息</View>
                    {expressSingle && (
                      <View className="express-num">
                        {TextUtil.isEmpty(expressInfo.experssCompanyName)
                          ? '暂无物流信息'
                          : expressInfo.experssCompanyName + '快递' + ' ' + expressInfo.mailNo}
                      </View>
                    )}
                  </View>
                  <View className="express-detail-layout flex-center">
                    {expressSingle ? (
                      <View className="express-record-layout">
                        <View className="express-record">{lastExpress.context}</View>
                        <View className="express-time">{lastExpress.time}</View>
                      </View>
                    ) : (
                      <View className="express-group">
                        该订单包含 {orderInfo.orderExpressList.length} 个包裹，请点击查看详情
                      </View>
                    )}
                    <AtIcon prefixClass="icon" value="youjiantou" size="13" color="#909090" />
                  </View>
                  <View className="view-line" />
                </View>
              )}
              {/*提货码*/}
              {this.isShowExpressView(orderInfo) && orderInfo.orderStatus == 10 && (
                <View className="code-layout">
                  <View className="code-text">提货码</View>
                  <View className="code">{orderInfo.orderCode}</View>
                  <Image className="qr-code" src={orderInfo.orderCodeUrl} />
                </View>
              )}
              {/*地址信息*/}
              {orderInfo.orderStatus != 10 &&
                (orderInfo.deliveryType == 2 || orderInfo.deliveryType == 4 || orderInfo.deliveryType == 5) && (
                  <AddressInfo
                    canEdit={false}
                    onAddressInfoClick={this.onAddressInfoClick}
                    addressInfo={orderInfo.addressInfo}
                  />
                )}
              {/*{orderInfo.deliveryType == 2 && <View className="line"></View>}*/}
              {/*<ShopInfo*/}
              {/*  shopInfo={orderInfo.shopAddress}*/}
              {/*  shopName={orderInfo.shopName}*/}
              {/*/>*/}
            </View>
          }

          <View className="product-layout">
            {orderInfo.skuList &&
              orderInfo.skuList.map((skuInfo, index) => {
                return (
                  <OrderProductItem
                    key={index}
                    skuInfo={skuInfo}
                    orderInfo={orderInfo}
                    canJumpToGoodsDetailPage={true}
                  />
                );
              })}
            {orderInfo.hasRefund == true && (
              <View className="refound-layout">
                <Text className="refound-text" onClick={this.onApplyRefoundClick}>
                  {this.getRefundText(orderInfo)}
                </Text>
              </View>
            )}
          </View>
          {orderInfo.afterSaleStatus == null && orderInfo.warehouseType != '3' && (
            <View className="money-layout">
              <View className="item">
                <View className="gary-title">订单总计</View>
                <View className="gary-content">{orderInfo.productAmountTotal / 100}元</View>
              </View>

              {!this.isOnlineOrder(orderInfo) && (
                <View className="item">
                  <View className="gary-title">货到付款订金</View>
                  <View className="gary-content">{orderInfo.codDeposit / 100}元</View>
                </View>
              )}

              <View className="item">
                <View className="gary-title">运费</View>
                <View className="gary-content">{orderInfo.freight / 100}元</View>
              </View>
              <View style={{ height: '1rpx', backgroundColor: '#F4F4FA' }} />
              {/* {*/}
              {/*    orderInfo.orderStatus != 14 && orderInfo.warehouseType != '8' && orderInfo.warehouseType != '11' &&*/}
              {/*    <View className="item">*/}
              {/*        <View className="gary-title">橙券抵用</View>*/}
              {/*        <View className="gary-content">{orderInfo.discountAmount / 100}橙券</View>*/}
              {/*    </View>*/}
              {/*}*/}

              {/*<View className="item">*/}
              {/*    <View className="gary-title">余额抵扣</View>*/}
              {/*    <View className="gary-content">抵扣¥{orderInfo.balanceAmount / 100}</View>*/}
              {/*</View>*/}
              {orderInfo.ticketDisamt && (
                <View className="item">
                  <View className="gary-title">优惠券抵扣</View>
                  <View className="gary-content">¥{orderInfo.ticketDisamt / 100 || '0.00'}</View>
                </View>
              )}

              {this.getPayAmountDetail(orderInfo)}
            </View>
          )}
          {orderInfo.afterSaleStatus == null && orderInfo.warehouseType == '3' && (
            <View className="money-layout">
              <View className="item">
                <View className="black-title">{'实付总额'}</View>
                <View className="red-content">{orderInfo.mabelPrice / 100}橙宝</View>
              </View>
            </View>
          )}

          {orderInfo.afterSaleStatus != null && (
            <View className="money-layout">
              <View className="item">
                <View className="black-title">退款原因</View>
                <View className="black-content">{orderInfo.respRefund.refundDesc}</View>
              </View>
              <View className="item">
                <View className="black-title">退款金额</View>
                <View className="black-title">{orderInfo.actuallyPayAmount / 100}元</View>
              </View>
            </View>
          )}

          {orderInfo.afterSaleStatus != null && (
            <View className="money-layout">
              <View className="item">
                <View className="black-title">申请时间</View>
                <View className="black-title">{TextUtil.formatDateWithYMDHMS(orderInfo.respRefund.refundTime)}</View>
              </View>
              <View className="item">
                <View className="black-title">退款编号</View>
                <View className="black-title">{orderInfo.respRefund.refundNo}</View>
              </View>
              <View className="picture-layout">
                <View className="title">凭证</View>
                <View className="pictures">
                  {orderInfo.respRefund.refundImages.map((item) => {
                    return <Image className="picture" src={item}></Image>;
                  })}
                </View>
              </View>
            </View>
          )}

          {orderInfo.afterSaleStatus == null && (
            <View className="money-layout">
              <View className="item">
                <View className="gary-title">订单编号</View>
                <View className="gary-content">{orderInfo.orderNo}</View>
              </View>
              <View className="item">
                <View className="gary-title">下单时间</View>
                <View className="gary-content">{TextUtil.formatDateWithYMDHMS(orderInfo.createTime)}</View>
              </View>

              {/*在线支付订单*/}
              {this.isOnlineOrder(orderInfo) && orderInfo.orderStatus != 1 && orderInfo.payTime != null && (
                <View className="item">
                  <View className="gary-title">付款时间</View>
                  <View className="gary-content">{TextUtil.formatDateWithYMDHMS(orderInfo.payTime)}</View>
                </View>
              )}

              {/*货到付款订单*/}
              {!this.isOnlineOrder(orderInfo) && orderInfo.depositPayTime && (
                <View>
                  <View className="item">
                    <View className="gary-title">订金付款时间</View>
                    <View className="gary-content">{TextUtil.formatDateWithYMDHMS(orderInfo.depositPayTime)}</View>
                  </View>
                </View>
              )}
              {!this.isOnlineOrder(orderInfo) && orderInfo.remainingPayTime && (
                <View>
                  <View className="item">
                    <View className="gary-title">尾款付款时间</View>
                    <View className="gary-content">{TextUtil.formatDateWithYMDHMS(orderInfo.remainingPayTime)}</View>
                  </View>
                </View>
              )}
            </View>
          )}

          {orderInfo.afterSaleStatus != null && (orderInfo.afterSaleStatus != 3 || orderInfo.orderStatus == 13) && (
            <View className="money-layout">
              {orderInfo.afterSaleStatus != 3 && (
                <View className="item">
                  <View className="black-title">商家操作</View>
                  <View className="black-title">{approvalStatusMap[orderInfo.respRefund.approvalStatus]}</View>
                </View>
              )}
              {orderInfo.afterSaleStatus != 3 && (
                <View className="item">
                  <View className="black-title">处理时间</View>
                  <View className="black-title">{TextUtil.formatDateWithYMDHMS(orderInfo.respRefund.updateTime)}</View>
                </View>
              )}
              {orderInfo.orderStatus == 13 && (
                <View className="item">
                  <View className="black-title">商家回复</View>
                  <View className="black-title">{orderInfo.respRefund.approveOpinion}</View>
                </View>
              )}
            </View>
          )}

          <View style={'height:100px'}></View>
        </View>
        {(orderInfo.orderStatus == 1 ||
          orderInfo.orderStatus == 3 ||
          orderInfo.orderStatus == 10 ||
          orderInfo.orderStatus == 11 ||
          orderInfo.orderStatus == 13 ||
          orderInfo.orderStatus == 14 ||
          orderInfo.payStatus == 2) && (
          <View className="button-layout" style={{ paddingBottom: this.detectionType(36, 0) }}>
            {orderInfo.orderStatus == 1 && (
              <View className="cancel" onClick={this.onCanecelOrder}>
                取消订单
              </View>
            )}
            {orderInfo.orderStatus == 1 && (
              <View className="pay-now" onClick={this.onPayNow}>
                {this.isOnlineOrder(orderInfo) ? '立即支付' : '支付订金'}
              </View>
            )}
            {orderInfo.orderStatus == 3 && orderInfo.deliveryType == 2 && (
              <View className="cancel" onClick={this.onSeeExpress}>
                查看物流
              </View>
            )}
            {orderInfo.orderStatus == 3 && orderInfo.payStatus != 2 && (
              <View className="pay-now" onClick={this.confirmTakeGoods}>
                确认收货
              </View>
            )}
            {orderInfo.orderStatus == 10 && (
              <View className="pay-now" onClick={this.confirmTakeGoods2}>
                确认提货
              </View>
            )}
            {orderInfo.orderStatus == 11 && (
              <Button
                onClick={this.oncontactService}
                openType="contact"
                sessionFrom={
                  '7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl
                }
                className="cancel"
              >
                联系客服
              </Button>
            )}
            {orderInfo.orderStatus == 11 && orderInfo.afterSaleStatus == 3 && (
              <View className="pay-now" onClick={this.cancelRefound}>
                取消退款
              </View>
            )}
            {orderInfo.orderStatus == 13 && (
              <Button
                onClick={this.oncontactService}
                openType="contact"
                sessionFrom={
                  '7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl
                }
                className="cancel"
              >
                联系客服
              </Button>
            )}
            {/* {
                            orderInfo.orderStatus == 13 && <View className="pay-now" onClick={this.onApplyRefoundClick}>再次申请退款</View>
                        } */}
            {orderInfo.orderStatus == 14 && (
              <View className="pay-now" onClick={this.onShareClick}>
                邀请好友参团
              </View>
            )}
            {orderInfo.showPayRemaining && orderInfo.orderStatus != 5 && orderInfo.payStatus == 2 && (
              <View className="pay-now" onClick={this.onPayNow}>
                支付尾款
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  render() {
    const { orderInfo } = this.state;
    return orderInfo ? this.getContentView(orderInfo) : <LoadingView />;
  }
}

export default XPage.connectFields()(orderDetail);
