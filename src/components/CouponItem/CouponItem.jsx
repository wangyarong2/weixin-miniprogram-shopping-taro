import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'

import XCheckBox from '@src/components/XCheckBox/XCheckBox'

import request from '@src/servers/http'
import TextUtil from '@utils/TextUtil'

import coupon_bg_red from '@images/coupon/coupon_bg_red.png'
import coupon_bg_gray from '@images/coupon/coupon_bg_gray.png'
import coupon_useed from '@images/coupon/coupon_useed.png'
import coupon_fail from '@images/coupon/coupon_fail.png'
import coupon_geted from '@images/coupon/coupon_geted.png'

import './CouponItem.less'

export default class CouponItem extends Taro.Component {
  /* 写在前面
    前台自定义状态 0.未领取 1.可使用/已领取 2.已使用 3.已过期
    后台领券中心接口返回在的优惠券状态 1.未发布 2.进行中，3已过期
    后台我的优惠券接口返回的状态 1.可使用，2.已使用， 3.已过期
  */

 static defaultProps = {
    data: null,
    selectOpen: false, // 默认不能选择,
    showGetted: true, // 已领取优惠券后是否显示已领取状态
    goDetail: false, // 是否可跳转到优惠券详请，默认不可跳转
    onGetCoupon: null, // 领取优惠券之后触发的事件
  }

  // 领取优惠券
  onGetCoupon(e) {
    e.stopPropagation()
    const { data, belong, index } = this.props
    const couponId = data.couponId || data.id
    request.post('/community-client/receive/coupon', { couponIds: [couponId] }).then(res => {
      // 成功的事件传给你组件，将本组件的状态改为已领取
      Taro.showToast({
        icon: 'none',
        title: '领取成功'
      })
      if (belong === 'goodsDetail' || belong === 'couponCenter') {
        this.props.onGetCoupon(index, res.userCouponId)
      } else {
        this.props.onGetCoupon(couponId, res.userCouponId)
      }
    })
  }

  // 点击优惠券事件
  onCouponClick() {
    const { data, selectOpen, index, goDetail } = this.props
    // 选择优惠券
    const couponId = data.couponId || data.id
    if (selectOpen) {
      this.props.onSlecteCoupon(index)
    } else if (goDetail) {
      Taro.navigateTo({
        url: `/pages/couponModule/couponDetail/couponDetail?couponId=${couponId}&userCouponId=${data.userCouponId}`,
      })
    }
  }

  render() {
    const {
      data,
      selectOpen,
      showGetted
    } = this.props
    return (
      <View className="coupon-item" onClick={this.onCouponClick.bind(this)}>
        <View className="coupon-left">
          {data.shopName &&
            <View className="coupon_shop_name">{data.shopName}</View>
          }
          <View className="price-content">
            <Text style={{ fontSize: '36rpx' }}>¥</Text>
            <Text>{data.cutAmount / 100}</Text>
          </View>
          <View style={{ fontSize: '26rpx' }}>满{data.fullAmount / 100}元可用</View>
          {data.userStatus == 0 || data.userStatus == 1 || selectOpen ?
            <Image className="coupon-bg" src={coupon_bg_red} />
            :
            <Image className="coupon-bg" src={coupon_bg_gray} />
          }
        </View>
        <View className="coupon-content">
          <View className="coupon-info">
            <View>
              <View className="item-name">{data.couponName}</View>
              <View className="item-desc">{data.description || data.desc || ""}</View>
            </View>
            {data && data.useFromTime ?
              <View className="item-time">
                <View>{TextUtil.formatDateWithYMDHMS(data && data.useFromTime)} 至</View>
                <View>{TextUtil.formatDateWithYMDHMS(data && data.useEndTime)}</View>
              </View>
              :
              <View className="item-time">
                领取优惠券后{data.receiveTimeEffective / 86400}天过期
              </View>
            }
          </View>
          {/* 前台自定义状态 0.未领取 1.可使用/已领取 2.已使用 3.已过期 */}
          {data.userStatus == 0 &&
            <View className="coupon-right red" onClick={this.onGetCoupon.bind(this)}><Text>立即领取</Text></View>
          }
          {data.userStatus == 1 && showGetted &&
            <View className="coupon-iconbox">
              <Image src={coupon_geted} className="coupon-icon"></Image>
            </View>
          }
          {data.userStatus == 2 &&
            <View className="coupon-iconbox">
              <Image src={coupon_useed} className="coupon-icon"></Image>
            </View>
          }
          {data.userStatus == 3 &&
            <View className="coupon-iconbox">
              <Image src={coupon_fail} className="coupon-icon"></Image>
            </View>
          }
          {selectOpen &&
            <View className="coupon-select">
              <XCheckBox
                checked={data.selected}
              />
            </View>
          }
        </View>
      </View>
    )

  }
}
