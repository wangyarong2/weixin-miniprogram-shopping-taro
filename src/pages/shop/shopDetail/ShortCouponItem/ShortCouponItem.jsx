import { View } from '@tarojs/components'
import XPage from '@src/components/XPage/XPage'

import request from '../../../../servers/http'


import "./ShortCouponItem.less"



/**
 * Date:  2020-02-27
 * Time:  12:14
 * Author: jianglong
 * -----------------------------
 * 有多张券的情况
 */


class ShortCouponItem extends XPage {
  config = {
    navigationBarTitleText: ''
  }

  static defaultProps = {
    extraCouponInfo: "",//优惠券信息
    onGetCoupon: "",//优惠券领取成功回调
  }
  componentDidMount() {
    this.setState({
      couponInfo: this.props.extraCouponInfo,
    })

  }

  state = {
    couponInfo: {},
  }


  // 领取优惠券
  onGetCoupon(e) {
    e.stopPropagation()
    const { couponInfo } = this.state
    request.post('/community-client/receive/coupon', { couponIds: [couponInfo.couponId] }).then(res => {
      couponInfo.isReceived = 1;
      couponInfo.userCouponId = res.userCouponId;
      this.setState({
        //标记已领取
        couponInfo: couponInfo,
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
    const { couponInfo } = this.state;
    return (
      <View className="item" onClick={this.onItemClick.bind(this, couponInfo)}>
        <View className="info">
          <View className="name">商品特惠券</View>
          <View className="price-content">
            <Text style={{ fontSize: '28rpx', color: 'white' }}>¥</Text>
            <Text style={{ fontSize: '48rpx', color: 'white' }}>{couponInfo.cutAmount / 100}</Text>
          </View>
          <View className="rule">满{couponInfo.fullAmount / 100}元可用</View>

        </View>

        <View className="action" onClick={this.onGetCoupon.bind(this)} >
          <View className={couponInfo.isReceived == 0 ? "text get" : "text"} style>{couponInfo.isReceived == 0 ? "立即领取" : "已领取"}</View>
        </View>

      </View>
    )
  }
}

export default XPage.connectFields()(ShortCouponItem)
