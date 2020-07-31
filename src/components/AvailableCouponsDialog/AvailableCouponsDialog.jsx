import XPage from '@src/components/XPage/XPage'
import Taro from "@tarojs/taro";
import { View, Text, ScrollView } from "@tarojs/components";
import './AvailableCouponsDialog.less'
import request from '../../servers/http'
import TextUtil from '@utils/TextUtil'



import { AtIcon } from "taro-ui";


import PriceView from '../PriceView/price'





/**
 * 可领取优惠券 弹窗
 */
export default class AvailableCouponsDialog extends XPage {
  config = {
    navigationBarTitleText: ''
  }

  static defaultProps = {
    shopId: null,
    closeDialogCallback: null,
    onItemClick: {},
  }
  state = {
    couponList: [],
  }

  componentDidMount() {
    this.setState({
      couponList: this.props.extraCouponList,
    })
  }


  getScrollViewHeight() {
    const itemHeight = 132 + 34;
    return itemHeight * Math.min(3, this.state.couponList.length);
  }

  receiveCouponOnClick(couponInfo, index, event) {
    event.stopPropagation();
    if (couponInfo.isAlreadyGet) return;
    this._receiveCoupon([couponInfo.couponId], (isSuccess, userCouponId) => {
      if (isSuccess) {
        // 标识优惠券已领取
        this.state.couponList[index].isAlreadyGet = true;
        this.state.couponList[index].userCouponId = userCouponId;

        this.setState({
          couponList: this.state.couponList,
        })
      }
    })
  }

  //获取所有红包券
  receiveAllCouponOnClick() {
    const couponIdList = [];
    this.state.couponList.forEach(item => {
      if (!item.isAlreadyGet) {
        //筛选出还未领取的优惠券
        couponIdList.push(item.couponId);
      }
    })

    this._receiveCoupon(couponIdList, (isSuccess, userCouponId) => {
      if (isSuccess) {
        //全部领取成功，关闭页面
        this.props.closeDialogCallback();
      }
    });
  }

  _receiveCoupon(couponIdList, callback) {
    request.post('/community-client/receive/coupon', { couponIds: couponIdList }).then(res => {

      Taro.showToast({
        title: "领取成功后,请到“个人中心-优惠券”里查看",
        icon: 'none',
      })
      if (callback) {
        callback(true, res.userCouponId);
      }
    }).catch((err) => {
      Taro.showToast({
        title: "领取失败，请重试",
        icon: 'none',
      })
    })

  }
  onItemClick(couponInfo) {
    this.goPage({
      url: 'couponModule/couponDetail',
      params: {
        couponId: couponInfo.couponId,
        userCouponId: couponInfo.userCouponId,
      }
    })
  }


  render() {
    const { couponList } = this.state;
    const { closeDialogCallback } = this.props;

    return (
      <View className="root">
        <View className="dialog-content" >
          <View className="title-container">
            <View className="title" >可领取优惠券</View>
            <View className="subtitle">领取成功后可到“个人中心-优惠券”里查看</View>
          </View>
          <ScrollView
            scrollY
            scrollWithAnimation
            className="scroll-view" style={{ height: this.getScrollViewHeight() + "rpx" }}>
            {
              couponList.map((item, index) => {
                return (
                  <View className="item" onClick={this.onItemClick.bind(this, item)}>
                    <View className="column-item" style={{ width: "157rpx" }}>
                      <PriceView color="#333"
                        size="36"
                        price={item.amount / 100}
                        afterSize="24"
                        hasSymbol />
                      <View className="full-amount">{`满${item.fullAmount / 100 || 0}元减`} </View>
                    </View>

                    <View className="column-item" style={{ flexGrow: 1, alignContent: "flex-start", marginRight: "17rpx" }}>
                      <View className="coupon-info" style={{ fontWeight: 800 }}>{item.couponName || ''}</View>
                      {item && item.useFromTime ?
                        <View className="coupon-info" style={{ fontSize: "24rpx", color: "#999", marginTop: "6rpx" }} >
                          {`${TextUtil.formatDateWithYMDHMS(item.useFromTime)}至${TextUtil.formatDateWithYMDHMS(item.useEndTime)}`}
                        </View>
                        :
                        <View className="coupon-info" style={{ fontSize: "24rpx", color: "#999", marginTop: "6rpx" }} >
                          领取优惠券后{item.receiveTimeEffective} 天过期
                        </View>
                      }
                    </View>

                    <View className="column-item" style={{ width: "96rpx" }}>
                      <View className={item.isAlreadyGet ? "already-get" : "get"} onClick={this.receiveCouponOnClick.bind(this, item, index)}>{item.isAlreadyGet ? "已领取" : "领取"}</View>
                      <View className="type">店铺券</View>
                    </View>


                  </View>
                )
              })
            }
          </ScrollView>
          <View className="bottom-image-container">
            <View className="bottom-text" onClick={this.receiveAllCouponOnClick.bind(this)}>全部领取</View>
          </View>

          <View className="close-container" onClick={closeDialogCallback}>
            <AtIcon prefixClass='icon' value="close-o" size='25' color="white" ></AtIcon>
            <View style={{ fontSize: "28rpx", color: "white" }}>关闭</View>
          </View>

        </View>
      </View >)
  }
}
