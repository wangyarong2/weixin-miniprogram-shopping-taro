import Taro, { Component } from '@tarojs/taro'
import { View, } from '@tarojs/components'

import XPage from '@src/components/XPage/XPage'
import PriceView from '@src/components/PriceView/price'
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice'

import request from '@src/servers/http'
import { get as getGlobalData } from '@utils/globalData';

import '../../../components/CMS/MCommodity/MCommodity.less';

class Index extends XPage {

  config = {
    navigationBarTitleText: '店主推荐',
  }

  constructor(props) {
    super(props)
    this.state = {
      winHeight: 0,
      winWidth: 0,
      pageNo: 1,
      pageSize: 10,
      hasMoreData: false,
      commondityList: [],
    }
  }

  componentWillMount() {
    Taro.getSystemInfo({
      success: res => {
        this.setState({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth,
        })
      }
    })
  }

  componentDidMount() {
    this.getRecommendList()
  }

  getRecommendList() {
    Taro.showLoading({ title: '加载中...' })
    const shopId = Taro.getStorageSync('currentShopId')
    if (!shopId) return
    const { pageNo, pageSize } = this.state
    const requestParams = {
      pageNo,
      pageSize,
      reviewStatus: null,  // 审核状态 0：未提交，1:待审核，2:未通过，3:通过
      saleStatus: "0", // 上下架 0:上架 1:下架
      selfSupport: true, // 自营true 平台false
      shopId
    };
    request.post('/community-client/seller/goods/list', requestParams).then(res => {
      Taro.hideLoading()
      if (res && res.list) {
        const list = [...this.state.commondityList, ...res.list]
        const hasMoreData = (res.pageNo * res.pageSize) < res.totalSize
        this.setState({
          commondityList: list,
          hasMoreData
        })
      }
    })
  }

  onReachBottom() {
    if (this.state.hasMoreData) {
      this.state.pageNo += 1
      this.getRecommendList()
    }
  }

  goProductDetail(data) {
    Taro.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?shopId=${data.shopId}&spuId=${data.spuId}`,
    })
  }

  render() {
    const { winWidth, commondityList } = this.state
    return (
      <View className='base-view'>
        <View
          className="commondity-container"
          style={`padding-top: 20rpx; padding-bottom: 20rpx;`}
        >
          <View className="spu-list spu-list2">
            {
              commondityList.map((item, index) => (
                <View className="item" onClick={this.goProductDetail.bind(this, item)}>
                  <View className="image-container">
                    <Image
                      className="image"
                      src={item.imageUrl}
                      style={`width: ${(winWidth - 36) / 2}px; height: ${(winWidth - 36) / 2}px`}
                    />
                  </View>
                  <View className="info-layout">
                    <View className="title">{item.name}</View>
                      <View className="price-layout">
                        <View className="left-layout">
                          <PriceView price={item.lowShowPrice / 100} size={28} hasSymbol='￥' />
                          <AfterCouponPriceIcon />
                        </View>
                        <View className="market-price">￥{item.highOriginPrice / 100}</View>
                      </View>
                  </View>
                </View>
              ))
            }
          </View>
        </View>
      </View>

    )
  }
}

export default Index
