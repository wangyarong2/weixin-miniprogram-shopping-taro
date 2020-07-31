import { connect } from '@tarojs/redux';
import XPage from '@src/components/XPage/XPage';
import { View, Image, Text, ScrollView, Button } from '@tarojs/components';

import './orderList.less';
import TextUtil from '../../../utils/TextUtil';
import WxPayUtil from '../../../utils/WxPayUtil';
import LoginUtil from '../../../utils/LoginUtil';
import request from '../../../servers/http';
import shopIcon from '@images/order/icon_shop.png';
import SpecTranslateUtil from '../../../utils/SpecTranslateUtil';
import GuidePage from '../../../components/GuidePage/GuidePage';
import PriceView from '../../../components/PriceView/price';
import AfterCouponPriceIcon from '../../../components/AfterCouponPrice/AfterCouponPrice';
import meiBaoPrice from '../../../assets/images/product/icon_meibao_price.png';
import OrderProductItem from '@src/components/OrderProductItem/OrderProductItem';

import { AtIcon } from 'taro-ui';
import Taro from '@tarojs/taro';

class orderList extends XPage {
  config = {
    navigationBarTitleText: '我的订单',
    enablePullDownRefresh: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      scrollIndex: 'id10000',
      orderTabIndex: 0,
      pageNo: 1,
      pageSize: 10,
      noMoreData: false,
      countDownTimeId: null,
      orderAutoClose: 15,
      orderTab: [
        {
          name: '全部',
          status: 0,
        },
        {
          name: '待付款',
          status: 1,
        },
        {
          name: '待发货',
          status: 2,
        },
        {
          name: '待收货',
          status: 3,
        },
        {
          name: '待提货',
          status: 21,
        },
        {
          name: '售后退款',
          status: 6,
        },
      ],
      orderTabMap: {
        1: { title: '待付款', color: '#FF6400' },
        2: { title: '待发货', color: '#FF6400' },
        150: { title: '待发货', color: '#FF6400' },
        3: { title: '待收货', color: '#FF6400' },
        250: { title: '待收货', color: '#FF6400' },
        4: { title: '交易成功', color: '#FF6400' },
        5: { title: '已关闭', color: '#242424' },
        11: { title: '退款中', color: '#FF6400' },
        12: { title: '退款成功', color: '#242424' },
        13: { title: '退款失败', color: '#242424' },
        10: { title: '待自提', color: '#FF6400' },
        14: { title: '团购中', color: '#FF6400' },
      },
      orderList: [],
    };
  }

  componentDidMount() {
    let orderStatus = parseInt(this.$router.params.orderStatus, 10);
    if (isNaN(orderStatus)) {
      orderStatus = 0;
    }

    const orderTabIndex = this.state.orderTab.findIndex((item) => item.status === orderStatus);
    this.setState({ orderTabIndex: orderTabIndex == -1 ? 0 : orderTabIndex }, () => {
      if (orderTabIndex > 1) {
        this.setState({
          scrollIndex: 'id' + orderTabIndex,
        });
      }
      this.onPullDownRefresh();
    });
  }

  componentDidShow() {
    const needRefresh = Taro.getStorageSync('orderListNeedRefresh');
    if (needRefresh != null && needRefresh == true) {
      Taro.setStorageSync('orderListNeedRefresh', null);
      this.onPullDownRefresh();
    }
  }

  onPullDownRefresh() {
    this.setState(
      {
        pageNo: 1,
        orderList: [],
      },
      () => {
        this.getOrderListByStatus(true);
      }
    );
  }

  onReachBottom() {
    if (!this.state.noMoreData) this.getOrderListByStatus(false);
  }

  onTabHandle(index) {
    this.setState(
      {
        orderTabIndex: index,
      },
      () => {
        this.setState({
          scrollIndex: 'id' + index,
        });
        this.onPullDownRefresh();
      }
    );
  }

  getOrderListByStatus(refresh) {
    let { pageNo, pageSize, orderTab, orderTabIndex } = this.state;
    if (refresh) {
      pageNo = 1;
    } else {
      pageNo += 1;
    }
    const requestData = {
      type: orderTab[orderTabIndex].status,
      pageSize: pageSize,
      pageNo: pageNo,
      warehouseTypes: [0, 1, 3, 4, 5, 8, 11],
    };
    console.log('xxxx', orderTab[orderTabIndex].status);
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request
      .post('/community-client/orderList', requestData)
      .then((res) => {
        Taro.hideLoading();
        Taro.stopPullDownRefresh();
        let { orderList } = this.state;
        if (res.list != null && res.list.length > 0) {
          res.list.map((item) => {
            item.countDownTime =
              this.state.orderAutoClose * 60 * 1000 - (Date.parse(new Date()) - item.createTime) + '';
            if (orderTabIndex == 5) {
              if (item.afterSaleStatus == 1) {
                item.orderStatus = 12;
              }
              if (item.afterSaleStatus == 2) {
                item.orderStatus = 13;
              }
              if (item.afterSaleStatus == 3 || item.afterSaleStatus == 0) {
                item.orderStatus = 11;
              }
            } else {
              item.afterSaleStatus = null;
            }
            if (item.deliveryType == 1 && item.orderStatus == 3) {
              item.orderStatus = 10;
            }
            if (item.groupStatus != null && item.groupStatus == 1) {
              item.orderStatus = 14;
            }
          });
        }
        if (refresh) {
          orderList = res.list == null ? [] : res.list;
        } else {
          let resultList = res.list;
          if (resultList != null && resultList.length > 0) {
            //有更多数据
            orderList = orderList.concat(resultList);
          }
        }
        console.log('订单列表', orderList);
        this.setState({
          noMoreData: pageNo * pageSize >= res.totalSize,
          orderList: orderList,
          pageNo,
        });
      })
      .catch((err) => {
        Taro.hideLoading();
        Taro.showToast({
          title: res.resultDesc,
          icon: 'none',
        });
      });
  }

  // 取消订单
  onCanecelOrder(data, e) {
    e.stopPropagation();
    Taro.showModal({
      title: '提示',
      content: '确认取消该订单吗?',
    }).then((res) => {
      if (res.confirm) {
        this.showLoading();
        request
          .post('/community-client/cancelOrder', {
            orderNo: data.orderNo,
          })
          .then((res) => {
            this.hideLoading();
            Taro.showToast({
              title: '订单取消成功',
              icon: 'success',
            });
            setTimeout(() => {
              this.onPullDownRefresh();
            }, 300);
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
  async onPayNow(data, e) {
    e.stopPropagation();
    Taro.showLoading({
      title: '请等待...',
      mask: true,
    });
    const wxCode = await LoginUtil.getWXCode();
    request
      .post('/community-client/requestPayNo', {
        orderNoList: Array.of(data.orderNo),
        wxCode,
      })
      .then((res) => {
        Taro.hideLoading();
        WxPayUtil.getPay(
          {
            payNo: res.payNo,
          },
          this.onOrderPaySuccess.bind(this, data),
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
  onOrderPaySuccess(data) {
    this.onPullDownRefresh();
    if (data.warehouseType == 4) {
      setGlobalData('refreshCardDetail', 'true');
    }
    // this.goPage({
    //     type: 'replace',
    //     url: 'order/payResult',
    //     params: {
    //         orderNo
    //     }
    // })
  }

  // 支付失败不做任何操作
  onOrderPayFail() {}

  //查看物流
  onSeeExpress(data, e) {
    e.stopPropagation();
    this.goPage({
      url: 'order/expressDetail',
      params: {
        expressNo: data.expressNo,
        expressCompanyCode: data.expressCompCode,
        orderNo: data.orderNo,
      },
    });
  }

  // 确认收货
  confirmTakeGoods(data, e) {
    e.stopPropagation();
    Taro.showModal({
      title: '提示',
      content: '确定收货吗?',
    }).then((res) => {
      if (res.confirm) {
        this.showLoading();
        request.post('/community-client/order/finish', { orderNo: data.orderNo }).then((res) => {
          Taro.showToast({
            title: '收货成功',
            icon: 'success',
          });
          setTimeout(() => {
            this.onPullDownRefresh();
          }, 300);
        });
      }
    });
  }

  connectService(data, e) {
    e.stopPropagation();
    // this.goPage({
    //     url: 'order/applyRefound',
    //     params: {
    //         orderNo: data.orderNo
    //     }
    // })
  }

  //取消退款
  cancelRefound(data, e) {
    e.stopPropagation();
    Taro.showModal({
      title: '提示',
      content: '确定取消退款吗?',
    }).then((res) => {
      if (res.confirm) {
        this.showLoading();
        request
          .post('/community-client/customer/refund/cancel', {
            orderNo: data.orderNo,
            refundId: data.respRefund.refundNo,
          })
          .then((res) => {
            setTimeout(() => {
              this.onPullDownRefresh();
            }, 300);
          });
      }
    });
  }

  // 跳转到订单详情
  gotoOrderDetail(index) {
    const params = {
      orderNo: this.state.orderList[index].orderNo,
      orderTabIndex: this.state.orderTabIndex,
    };
    this.goPage({ url: 'order/orderDetail', params });
  }

  onSearchOrderClick() {
    this.goPage({ url: 'order/searchOrder', params: {} });
  }
  isShowBottomLine(orderStatus, payStatus) {
    return (
      orderStatus == 1 ||
      orderStatus == 3 ||
      orderStatus == 4 ||
      orderStatus == 11 ||
      orderStatus == 13 ||
      payStatus == 2
    );
  }

  searchProduct() {
    this.goPage({
      url: 'order/searchOrder',
    });
  }
  render() {
    const { orderTab, orderList, orderTabMap, scrollIndex } = this.state;
    return (
      <View className="order-list-page">
        <View className="top-layout">
          {/*<View className="search-layout" onClick={this.searchProduct}>*/}
          {/*  <View className="input">*/}
          {/*    <AtIcon prefixClass="icon" value="sousuo" color="#666666" size="14" />*/}
          {/*    <Text className="hint">商品名称</Text>*/}
          {/*  </View>*/}
          {/*  <View className="action">搜索</View>*/}
          {/*</View>*/}
          <ScrollView scrollIntoView={scrollIndex} className="order-tab" scrollX scrollWithAnimation>
            {orderTab.map((item, index) => {
              return (
                <View
                  id={'id' + index}
                  key={index}
                  className={`item-list ${index === orderTabIndex ? 'selected common-bg-linear-gradient' : ''}`}
                  onClick={this.onTabHandle.bind(this, index)}
                >
                  {item.name}
                </View>
              );
            })}
          </ScrollView>
        </View>
        <View className="bottom-layout">
          {orderList == null || (orderList.length == 0 && <GuidePage type={1}></GuidePage>)}
          {orderList.map((order, index) => {
            return (
              <View className="order-item" key={index} onClick={this.gotoOrderDetail.bind(this, index)}>
                <View className="shop-info-layout">
                  <View className="order-id">{`订单号：${order.orderNo}`}</View>
                  <View className="order-status">{orderTabMap[order.orderStatus].title}</View>
                </View>
                {order.skuList &&
                  order.skuList.map((skuInfo, innerIndex) => {
                    return <OrderProductItem key={index + innerIndex} skuInfo={skuInfo} orderInfo={order} />;
                  })}
                <View className="real-pay-layout">
                  {order.warehouseType != '3' && (
                    <View className="real-pay">
                      {order.orderStatus == 1 ? '应付款：' : '实付款：'}
                      {
                        <PriceView
                          price={(order.orderStatus == 1 ? order.orderAmountTotal : order.actuallyPayAmount) / 100}
                          size={28}
                          hasSymbol="￥"
                          color="#333"
                        />
                      }
                    </View>
                  )}
                </View>
                {this.isShowBottomLine(order.orderStatus, order.payStatus) && (
                  <View style={{ height: '1rpx', backgroundColor: '#F4F4FA' }} />
                )}
                {this.isShowBottomLine(order.orderStatus, order.payStatus) && (
                  <View className="button-layout">
                    {order.orderStatus == 1 && (
                      <Text className="button" onClick={this.onCanecelOrder.bind(this, order)}>
                        取消订单
                      </Text>
                    )}
                    {order.orderStatus == 1 && (
                      <Text className="button-red" onClick={this.onPayNow.bind(this, order)}>
                        立即付款
                      </Text>
                    )}
                    {order.orderStatus == 3 && order.deliveryType == 2 && (
                      <Text className="button" onClick={this.onSeeExpress.bind(this, order)}>
                        查看物流
                      </Text>
                    )}
                    {order.orderStatus == 3 && order.payStatus != 2 && (
                      <Text className="button-red" onClick={this.confirmTakeGoods.bind(this, order)}>
                        确认收货
                      </Text>
                    )}
                    {(order.orderStatus == 11 || order.orderStatus == 13 || order.orderStatus == 4) && (
                      <Button
                        className="button"
                        onClick={this.connectService.bind(this, order)}
                        openType="contact"
                        sessionFrom={
                          '7moor|' +
                          Taro.getStorageSync('userinfo').nickName +
                          '|' +
                          Taro.getStorageSync('userinfo').avatarUrl
                        }
                      >
                        联系客服
                      </Button>
                    )}
                    {order.orderStatus == 11 && (
                      <Text className="button-red" onClick={this.cancelRefound.bind(this, order)}>
                        取消退款
                      </Text>
                    )}
                    {order.showPayRemaining && order.orderStatus != 5 && order.payStatus == 2 && (
                      <View className="button-red" onClick={this.onPayNow.bind(this, order)}>
                        支付尾款
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}

export default connect(XPage.connectFields())(orderList);
