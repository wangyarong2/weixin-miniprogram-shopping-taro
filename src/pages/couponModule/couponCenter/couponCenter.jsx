import { View } from '@tarojs/components'
import XPage from '@src/components/XPage/XPage'
import CouponItem from '@src/components/CouponItem/CouponItem'
import EmptyView from '@src/components/EmptyView/EmptyView';

import request from '@src/servers/http'

class couponCenter extends XPage {
  config = {
    navigationBarTitleText: '领券中心'
  }

  state = {
    pageNo: 1,
    pageSize: 10,
    hasMoreData: false,
    couponList: [],
    isLoading: true,
  }

  componentDidMount() {
    this.getCouponList()
  }

  getCouponList() {
    const { couponList, pageNo, pageSize } = this.state
    request.post('/community-client/community/coupon/miniapp/couponList', {
      pageNo,
      pageSize,
      couponSource: 1,
    }).then(res => {
      if (res.list) {
        const resultList = res.list
        resultList.forEach(item => {
          if (!item.userStatus) {
            item.userStatus = 0
          }
        })
        this.setState({
          isLoading: false,
          couponList: [...couponList, ...resultList],
          hasMoreData: pageNo * pageSize < res.totalSize
        })
      }
    })
  }

  onGetCoupon(index, userCouponId) {
    const { couponList } = this.state
    // const getCouponIndex = couponList.findIndex(item => item.id == id)
    couponList[index].userStatus = 1
    couponList[index].userCouponId = userCouponId

    this.setState({ couponList })
  }

  // onReachBottom() {
  //   if (this.state.hasMoreData) {
  //     this.state.pageNo += 1
  //     this.getCouponList()
  //   }
  // }

  render() {
    const { couponList, isLoading } = this.state
    return (
      <View>
        {
          couponList.map((item, i) => {
            return (
              <CouponItem
                key={item.id}
                data={item}
                index={i}
                belong="couponCenter"
                goDetail={true}
                onGetCoupon={this.onGetCoupon.bind(this)}
              />
            )
          })
        }
        {!couponList.length && !isLoading && <EmptyView type={9} text="暂无优惠券"></EmptyView> }
      </View>
    )
  }
}

export default XPage.connectFields()(couponCenter)
