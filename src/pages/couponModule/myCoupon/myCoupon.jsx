import { View } from '@tarojs/components'
import XPage from '@src/components/XPage/XPage'
import CouponItem from '@src/components/CouponItem/CouponItem'
import EmptyView from '@src/components/EmptyView/EmptyView';

import request from '@src/servers/http'

import './myCoupon.less'

class myCoupon extends XPage {
  config = {
    navigationBarTitleText: '优惠券'
  }

  state = {
    tabs: [
      {
        text: '全部',
        value: -1
      },
      {
        text: '可使用',
        value: 1
      },
      {
        text: '已使用',
        value: 2
      },
      {
        text: '已过期',
        value: 3
      },
    ],
    activeTabValue: -1,

    pageNo: 1,
    pageSize: 10,
    hasMoreData: false,
    isLoading: true,
    couponList: []
  }

  componentDidShow() {
    this.state.pageNo = 1
    this.state.couponList = []
    this.getCouponList()
  }

  getCouponList() {
    const { couponList, activeTabValue, pageNo, pageSize } = this.state
    const requestParams = {
      pageNo,
      pageSize,
    }
    if (activeTabValue !== -1) {
      requestParams.status = activeTabValue
    }
    request.post('/community-client/community/coupon/miniapp/userCouponList', requestParams).then(res => {
      if (res.list) {
        const resultList = res.list
        // resultList.forEach(item => {
        //   if (item.status == 2) {
        //     item.status = 0
        //   }
        // })
        this.setState({
          couponList: [...couponList, ...resultList],
          hasMoreData: pageNo * pageSize < res.totalSize,
          isLoading: false,
        })
      }
    })
  }

  onTabClick(val) {
    this.setState({
      pageNo: 1,
      hasMoreData: false,
      couponList: [],
      activeTabValue: val,
      isLoading: true,
    }, () => {
      this.getCouponList()
    })
  }

  goPageCoupon() {
    this.goPage({ url: 'couponModule/couponCenter', params: {} })
  }

  onReachBottom() {
    if (this.state.hasMoreData) {
      this.state.pageNo += 1
      this.getCouponList()
    }
  }

  render() {
    const { tabs, activeTabValue, couponList, isLoading } = this.state
    return (
      <View style={{ paddingBottom: '120rpx' }}>
        <View className="tab-container flex-center">
          { tabs.map(item => (
            <View
              key={item.value}
              className={`${activeTabValue == item.value ? 'item selected flex-center' : 'item flex-center'}`}
              onClick={this.onTabClick.bind(this, item.value)}
            >
                {item.text}
            </View>
          ))}
        </View>
        {
          couponList.map(item => {
            return (
              <CouponItem
                key={item.id}
                data={item}
                showGetted={false}
                goDetail={true}
              />
            )
          })
        }
        {!couponList.length && !isLoading && <EmptyView type={9} text="暂无优惠券"></EmptyView> }


        <View className="bottom-container fixed-bottom" style={{ paddingBottom: this.detectionType(36, 24) }}>
          <View className="bottom-btn" onClick={this.goPageCoupon}>领券中心</View>
        </View>
      </View>
    )
  }
}

export default XPage.connectFields()(myCoupon)
