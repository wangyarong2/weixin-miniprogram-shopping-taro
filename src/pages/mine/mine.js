import XPage from '@src/components/XPage/XPage';
import { View, Button } from '@tarojs/components';
import './mine.less';
import { AtIcon, AtBadge } from 'taro-ui';
import LoginUtil from '../../utils/LoginUtil';

import svipBg from '@images/mine/svip_bg.png';
import svipText from '@images/mine/svip_text.png';
import seeIcon from '@images/mine/icon_see.png';
import defaultHead from '@images/mine/default_head.png';

import TextUtil from '../../utils/TextUtil';
import request from '../../servers/http';
import XAuthorize from '../../components/XAuthorize/XAuthorize';

class mine extends XPage {
  config = {
    navigationBarTitleText: '我的',
  };

  state = {
    memberInfo: {
      member: {
        code: '',
      },
    },
    isLogin: false,
    userInfo: {},
    isSvip: false,
    balanceInfo: {
      totalBalance: 0,
      mbPoint: 0,
      couponBalance: 0,
    }, //账户余额
    orderLinkList: [
      {
        unread: 0,
        text: '待付款',
        orderStatus: 1,
        icon: 'daifukuan',
      },
      {
        unread: 0,
        text: '待发货',
        orderStatus: 2,
        icon: 'daifahuo',
      },
      {
        unread: 0,
        text: '待收货',
        orderStatus: 3,
        icon: 'daishouhuo',
      },
      {
        unread: 0,
        text: '待提货',
        orderStatus: 21,
        icon: 'dingdan',
      },
      {
        unread: 0,
        text: '退款/售后',
        orderStatus: 6,
        icon: 'shouhou',
      },
    ],
    serviceList: [
      {
        icon: 'shoucang',
        name: '我的收藏',
        path: 'collect/collectList',
        params: {},
        size: 24,
      },
      // {
      //   icon: "youhuijuan",
      //   name: "优惠券",
      //   path: "couponModule/myCoupon",
      //   params: {},
      //   size: 20
      // },
      {
        icon: 'shouhuodizhi',
        name: '收货地址',
        path: 'order/addressList',
        params: {},
        size: 24,
      },
      // {
      //   icon: 'lianxijingjiren',
      //   name: '联系经纪人',
      //   path: 'coupon/chooseShop',
      //   params: { type: 'contact' },
      //   size: 24,
      // },
      {
        icon: '',
        name: '',
        path: null,
        params: {},
      },
      {
        icon: '',
        name: '',
        path: null,
        params: {},
      },
    ],
  };

  componentDidShow() {
    this.setUIWithLoginStatus();
  }

  setUIWithLoginStatus() {
    const isLogin = LoginUtil.checkLogin();
    if (isLogin) {
      this.setState(
        {
          isLogin,
          userInfo: Taro.getStorageSync('userinfo'),
        },
        () => {
          this.getBalanceDetail();
          this.getOrderCount();
          this.getMebmerInfo();
        }
      );
    }
  }

  getMebmerInfo() {
    request.post('/community-client/member/home', {}).then((res) => {
      Taro.setStorageSync('member_info', res);
      this.setState({
        memberInfo: res,
        isSvip: res.hasEquityCard,
      });
    });
  }

  onLoginSuccess() {
    request.post('/community-client/mx/member/home', {}).then((res) => {
      Taro.setStorageSync('currentShopId', res.shop.shopId);
      Taro.setStorageSync('userHasLogin', true);
    });
    this.setUIWithLoginStatus();
  }

  seeOrderList(orderStatus) {
    if (orderStatus == -1) {
      this.goPage({ url: 'order/orderList', params: {} });
    } else {
      console.log('xxxx', 'zhixing');
      this.goPage({
        url: 'order/orderList',
        params: { orderStatus: orderStatus },
      });
    }
  }

  goToPage(item) {
    // if (item.path == null) return;
    // this.goPage({ url: item.path, params: item.params });
    this.goPage({
      url: 'active/redPacketRain',
    });
  }

  //充值
  goToRecharge() {
    this.goPage({ url: 'coupon/recharge', params: {} });
  }

  //要券
  askCoupon() {
    this.goPage({ url: 'coupon/chooseShop', params: { type: 'fromAsk' } });
  }

  //余额
  onBalanceClick() {
    this.goPage({ url: 'coupon/balanceDetail', params: {} });
  }

  //获取账户余额
  getBalanceDetail() {
    request.post('/community-client/member/wallet', {}).then((res) => {
      console.log('余额信息', res);
      this.setState({
        balanceInfo: res,
      });
    });
  }

  //订单角标
  getOrderCount() {
    request
      .post('/community-client/home/today/sales', {
        warehouseTypes: [0, 1, 3, 4, 5, 8, 11],
      })
      .then((res) => {
        console.log('角标结果', res);
        const { orderLinkList } = this.state;
        orderLinkList[0].unread = res.toPayCount;
        orderLinkList[1].unread = res.toDeliverCount;
        orderLinkList[2].unread = res.toSignCount;
        orderLinkList[3].unread = res.toTackCount;
        orderLinkList[4].unread = res.refundCount;
        this.setState({
          orderLinkList,
        });
      });
  }

  onCopyClick() {
    Taro.setClipboardData({ data: this.state.memberInfo.member.code }).then({});
  }

  onGoToMemberCenterClick() {
    this.goPage({ url: 'memberCenter', params: {} });
  }

  onCouponDetailClick() {
    this.goPage({ url: 'coupon/couponBalance', params: {} });
  }

  onMeiBaoDetailClick() {
    this.goPage({ url: 'coupon/meibaoDetail', params: {} });
  }
  onMessageOnClick() {
    this.goPage({ url: 'message/messageCenter', params: {} });
  }

  render() {
    const { userInfo, isLogin, isSvip, memberInfo, serviceList, balanceInfo } = this.state;
    return (
      <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
        <View className="mine-page">
          <View className="top-layout">
            <View className="info-layout flex-space-between">
              <View className="left-layout">
                <Image className="head" src={userInfo.avatarUrl ? userInfo.avatarUrl : defaultHead} />
                <View>
                  <View className="info-name text-clip">{!userInfo.nickName ? '登录' : userInfo.nickName}</View>
                  {/* TODO: */}
                  {/* { isLogin &&
                    <View>身份名称</View>
                  } */}
                </View>
              </View>
              <View className="flex">
                <View className="icon-box" onClick={this.onMessageOnClick}>
                  <AtIcon prefixClass="icon" value="xiaoxi" size="24" color="#333"></AtIcon>
                  {/*<View className="icon-text">消息</View>*/}
                </View>
              </View>
            </View>

            <View className="svip-layout" style={{ display: 'none' }}>
              <Image className="svip-bg" src={svipBg}></Image>
              <View className="left-layout">
                <Image className="svip-text" src={svipText}></Image>
                <View className="line"></View>
                <View className="vip-des">好橙家超级会员</View>
              </View>
              <View className="rigth-layout" onClick={this.onGoToMemberCenterClick}>
                <View className="see-now">立即{isSvip ? '查看' : '开通'}</View>
                <Image className="icon" src={seeIcon}></Image>
              </View>
            </View>
          </View>

          <View className="order-layout">
            <View className="top-layout-title">
              <View className="order-title">我的订单</View>

              <View className="all-order-layout" onClick={this.seeOrderList.bind(this, -1)}>
                <Text className="all-order">全部订单</Text>
                <AtIcon prefixClass="icon" value="youjiantou" color="#999999" size="10"></AtIcon>
              </View>
            </View>

            <View className="order-type-layout">
              {this.state.orderLinkList.map((item, index) => {
                return (
                  <View className="order-type" onClick={this.seeOrderList.bind(this, item.orderStatus)}>
                    <View className="brage-layout">
                      <AtBadge
                        className={item.unread > 10 ? 'numthanten' : 'numlessten'}
                        value={item.unread && item.unread > 0 ? item.unread : ''}
                        maxValue={99}
                      >
                        <AtIcon prefixClass="icon" value={item.icon} color="#666666" size="24" />
                        {/* <Image className="image" src={item.icon}></Image> */}
                      </AtBadge>
                      <View className="name">{item.text}</View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View className="service-layout">
            <View className="service-title">我的服务</View>
            <View className="services">
              {serviceList.map((item) => (
                <View key={item.icon} className="list-item flex-center" onClick={this.goToPage.bind(this, item)}>
                  <AtIcon prefixClass="icon" value={item.icon} size={item.size} color="#666666" />
                  <Text className="name">{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </XAuthorize>
    );
  }
}

export default XPage.connectFields()(mine);
