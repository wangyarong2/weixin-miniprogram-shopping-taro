import { View } from '@tarojs/components'
import { AtIcon } from "taro-ui";

import XPage from '@src/components/XPage/XPage'
import XAuthorize from '@src/components/XAuthorize/XAuthorize'
import CouponItem from '@src/components/CouponItem/CouponItem'
import ListTitle from '@src/components/ListTitle/ListTitle'

import request from '@src/servers/http'
import TextUtil from '@utils/TextUtil'
import LoginUtil from '@utils/LoginUtil';

import shopDefault from "@images/member/shop-default.png";

import './getShopCoupon.less'

class getShopCoupon extends XPage {
  config = {
    navigationBarTitleText: '优惠券'
  }

  state = {
    shopInfo: null,
    couponList: [],
    shopId: null,
    couponId: null,
    pageNo: 1,
    pageSize: 10
  }

  componentDidMount() {
    const { shopId, couponId } = this.params
    this.setState({
      shopId,
      couponId
    })
    this.getShopDetail(shopId)
    this.getCouponDetail(couponId)
    this.getShopCoupon(shopId)
  }

  getShopDetail(shopId) {
    request.post('/community-client/member/queryOffPayShopDetail', { shopId }).then(res => {
        this.setState({
            shopInfo: res
        })
    })
  }

  getCouponDetail(couponId) {
    const isLogin = LoginUtil.checkLogin()
    const reqeustUrl = `/community-client/coupon/user/detail${isLogin ? '' : '/noToken'}`
    request.post(reqeustUrl, { id: couponId }).then(res => {
      const result = res
      if (!result.userStatus) {
        result.userStatus = 0
      }
      this.setState({ couponDetail: result })
    })
  }

  getShopCoupon(shopId) {
    const isLogin = LoginUtil.checkLogin()
    const { couponList, pageNo, pageSize } = this.state
    const reqeustUrl = `/community-client/community/coupon/miniapp/couponList${isLogin ? '' : '/noToken'}`
    request.post(reqeustUrl, {
      pageNo,
      pageSize,
      couponSource: 2,
      shopId
    }).then(res => {
      if (res.list) {
        const resultList = res.list
        resultList.forEach(item => {
          if (!item.userStatus) {
            item.userStatus = 0
          }
        })
        this.setState({
          couponList: resultList
        })
      }
    })
  }

  onGetCouponSingle(id,userCouponId) {
    const { couponDetail } = this.state
    couponDetail.userStatus = 1
    couponDetail.userCouponId = userCouponId
    this.setState({
      couponDetail
    })
  }

  onGetCoupon(id,userCouponId) {
    const { couponList } = this.state
    const getCouponIndex = couponList.findIndex(item => item.id == id)
    couponList[getCouponIndex].userStatus = 1
    couponList[getCouponIndex].userCouponId = userCouponId

    this.setState({ couponList })
  }

  onPhoneClick(phone) {
    if (TextUtil.isEmpty(phone)) {
        this.showToast({
            title: '商户电话号码为空'
        })
        return
    }
    wx.makePhoneCall({
        phoneNumber: phone
    })
  }

  onLoginSuccess() {
    const { shopId, couponId } = this.params
    request.post("/community-client/mx/member/home", {}).then(res => {
      Taro.setStorageSync("currentShopId", res.shop.shopId);
      Taro.setStorageSync("userHasLogin", true);
    });
    this.getCouponDetail(couponId)
    this.getShopCoupon(shopId)
  }

  render() {
    const { couponList, shopInfo, couponDetail } = this.state
    return (
      <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
        { shopInfo &&
        <View className="shopinfo-contianer">
          <View className="flex-space-between">
            <Image className="shop-img" src={shopInfo.logoImage || shopDefault}></Image>
            <View style={{ flex: 1 }}>
              <View className="flex-space-between">
                <Text className="shop-name text-clip">{shopInfo.shopName}</Text>
                <Text className="shop-jointime">{TextUtil.formatDateWithYMD(shopInfo && shopInfo.joinTime)}加入</Text>
              </View>
              <View className="shop-jointime">{shopInfo.business}</View>
            </View>
          </View>
          <View style={{ fontSize: '24rpx', marginTop: '32rpx' }}>
            <View className="flex">
              <View className="flex flex-1">
                <AtIcon
                  prefixClass="icon"
                  value='shop_master'
                  size="18"
                  color="#333"
                />
                <Text className="c-text">{shopInfo.shopKeeper}</Text>
              </View>
              <View className="flex flex-1" onClick={this.onPhoneClick.bind(this, shopInfo.mobilePhone)}>
                <AtIcon
                  prefixClass="icon"
                  value='phone'
                  size="18"
                  color="#333"
                />
                <Text className="c-text">{shopInfo.mobilePhone}</Text>
              </View>
            </View>
            <View className="flex" style={{ marginTop: '20rpx' }}>
              <AtIcon
                prefixClass="icon"
                value='shop-black'
                size="18"
                color="#333"
              />
              <Text className="c-text">
                {shopInfo.province}
                {shopInfo.city}
                {shopInfo.district}
                {shopInfo.detailAddress || ''}
              </Text>
            </View>
          </View>
        </View>
        }
        { couponDetail &&
          <CouponItem data={couponDetail} goDetail={true} onGetCoupon={this.onGetCouponSingle.bind(this)} />
        }
        { couponList.length &&
          <ListTitle title="更多优惠券"></ListTitle>
        }
        {
          couponList.map(item => {
            return (
              <CouponItem key={item.id} data={item} onGetCoupon={this.onGetCoupon.bind(this)} />
            )
          })
        }
      </XAuthorize>
    )
  }
}

export default XPage.connectFields()(getShopCoupon)
