import { View } from '@tarojs/components'
import XPage from '@src/components/XPage/XPage'
import CouponItem from '@src/components/CouponItem/CouponItem'
import ListTitle from '@src/components/ListTitle/ListTitle'
import EmptyView from '../../../components/EmptyView/EmptyView'
import ShopDetailProductItem from '../../../components/ShopProductItem/ShopDetailProductItem'
import TextUtil from '@utils/TextUtil'






import request from '../../../servers/http'




import './couponDetail.less'

/**
 * Date:  2020-02-25
 * Time:  12:14
 * Author: jianglong
 * -----------------------------
 * 优惠券详情  券分三类 ：平台发的平台商品券、平台发的门店券、门店发的门店券
 */

class couponDetail extends XPage {
  config = {
    navigationBarTitleText: '优惠券详情'
  }

  static defaultProps = {
  }


  state = {
    productList: [],
    couponInfo: null,
    pageNo: 0,
    pageSize: 10,
    noMoreData: false,
  }

  componentDidMount() {
    const { couponId } = this.$router.params;
    this.setState({
      couponId: couponId,
    })
    //请求券详情
    this.getCouponInfo(couponId)

  }

  getCouponInfo(couponId) {
    Taro.showLoading({
      title: '请稍后...',
      mask: true
    })
    if (!TextUtil.isEmpty(this.$router.params.userCouponId)) {
      //用户券（即用户已领取的券）
      this.getUserCouponDetail(this.$router.params.userCouponId)
    } else {
      //未领取的券
      this.getCouponDetail(couponId)
    }
  }

  onReachBottom() {
    if (!this.state.noMoreData) {
      this.getGoodsList();
    }
  }

  getAreaContent() {
    if (!this.state.couponInfo) return "";
    const { limitAreas } = this.state.couponInfo;
    if (limitAreas == null || limitAreas.length === 0) return "暂无";
    let resultStr = "";

    limitAreas.forEach(item => {
      resultStr += item.areaName ? item.areaName.concat("、") : "";
    })
    return resultStr.substring(0, resultStr.length - 1);
  }

  getShopContent() {
    if (!this.state.couponInfo) return "";
    const { limitShops } = this.state.couponInfo;
    if (limitShops == null || limitShops.length === 0) return "暂无";
    let resultStr = "";
    limitShops.forEach(item => {
      resultStr += item.shopName ? item.shopName.concat("、") : "";
    })
    return resultStr.substring(0, resultStr.length - 1);
  }


  getCouponDetail(couponId) {
    request.post('/community-client/coupon/user/detail', { id: couponId })
      .then((res) => {
        this.addCouponStataus(res)
        this.setState({
          couponInfo: res || {},
        }, () => {
          //请求可用券的商品
          this.getGoodsList();
        })
        Taro.hideLoading();

      }).catch(res => {
        Taro.hideLoading();
      })
  }

  getUserCouponDetail(userCouponId) {
    request.post('/community-client/coupon/userCouponDetail', { id: userCouponId })
      .then((res) => {
        this.addCouponStataus(res)
        this.setState({
          couponInfo: res || {},
        }, () => {
          //请求可用券的商品
          this.getGoodsList();
        })
        Taro.hideLoading();

      }).catch(res => {
        Taro.hideLoading();
      })
  }

  addCouponStataus(res) {
    if (null == res) return;
    res.userStatus = res.userStatus == null ? 0 : res.userStatus;
  }


  getGoodsList() {
    //平台发的门店券，不需要展示商品（因为不知道展示那个门店的好）
    if (this.isPlatformShopCoupon()) return;
    let { pageNo, pageSize } = this.state;
    let couponId = this.$router.params.couponId;
    pageNo += 1;
    const requestData = {
      pageSize: pageSize,
      pageNo: pageNo,
      couponId: couponId,
    }

    request.post('/community-client/coupon/limit/goods/list', requestData).then((res) => {
      Taro.hideLoading();
      let { productList } = this.state

      let resultList = res.list
      if (resultList != null && resultList.length > 0) {
        //有更多数据
        productList = productList.concat(resultList)
      }

      this.setState({
        noMoreData: pageNo * pageSize >= res.totalSize,
        productList: productList || [],
        pageNo: pageNo,
      })

    })
  }
  onGetCoupon() {
    const { couponInfo } = this.state;
    couponInfo.userStatus = 1;
    this.setState({ couponInfo })
  }
  //平台发的门店券
  isPlatformShopCoupon() {
    const { couponInfo } = this.state;
    if (couponInfo) {
      return couponInfo.couponSource == 1 && couponInfo.spuLimitType == 2;
    }
    return false;

  }


  render() {
    const { productList, couponInfo } = this.state;
    return (
      <View>
        <CouponItem
          onGetCoupon={this.onGetCoupon.bind(this)}
          data={couponInfo}
        ></CouponItem>
        {/* 只有是平台发的门店券，才需要展示区域 */}
        <View className="area-and-shop" style={{ display: (this.isPlatformShopCoupon() ? "block" : "none") }}>
          <View className="tip">可用区域</View>
          <View className="content" >{this.getAreaContent()} </View>

          <View className="tip">可用门店</View>
          <View className="content" >{this.getShopContent()} </View>
        </View>
        {
          !this.isPlatformShopCoupon()
          && <ListTitle title="适用商品"></ListTitle>

        }

        {
          productList == null || productList.length == 0
          && !this.isPlatformShopCoupon()
          && <EmptyView type={10} text={"暂无适用商品"}></EmptyView>
        }

        {
          productList.map((item, index) => {
            return (
              <ShopDetailProductItem product={item}></ShopDetailProductItem>
            )
          })
        }
      </View>
    )
  }
}

export default XPage.connectFields()(couponDetail)
