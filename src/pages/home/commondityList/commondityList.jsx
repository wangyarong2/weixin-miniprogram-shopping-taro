import Taro, { Component } from '@tarojs/taro'
import { View, } from '@tarojs/components'

import XPage from '@src/components/XPage/XPage'
import PriceView from '@src/components/PriceView/price'
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice'

import request from '@src/servers/http'
import { get as getGlobalData } from '@utils/globalData';

import '../../../components/CMS/MCommodity/MCommodity.less';
class commondityList extends XPage {

  config = {
    navigationBarTitleText: '',
  }

  constructor(props) {
    super(props)
    this.state = {
      winHeight: 0,
      winWidth: 0,
      commondityList: [],
      cmsCurrentSpuListData: {}
    }
  }

  componentWillMount() {
    this.state.cmsCurrentSpuListData = getGlobalData('cmsCurrentSpuListData')
    this.state.cmsCurrentSpuListData.number = 2
    Taro.getSystemInfo({
      success: res => {
        this.setState({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth,
          cmsCurrentSpuListData: this.state.cmsCurrentSpuListData
        })
      }
    })
  }

  componentDidMount() {
    const spuList = this.state.cmsCurrentSpuListData.data.imgCollection
    const queryParams = {
      projectId: "siji",
      spuList
    }

    request.cmsPost({
      url: '/spu/query',
      data: queryParams,
    }).then(res => {
      if (res) {
        this.setState({
          commondityList: res
        })
      }
    })
  }

  goProductDetail(data) {
    Taro.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?shopId=${Taro.getStorageSync('currentShopId')}&spuId=${data.spuId}`,
    })
  }

  render() {
    const { winWidth, commondityList, cmsCurrentSpuListData } = this.state
    return (
      <View
        className="commondity-container"
        style={{ paddingTop: '24rpx' }}
      >
        <View className={`spu-list spu-list${cmsCurrentSpuListData.number}`}>
          {
            commondityList.map((item, index) => (
              <View className="item" onClick={this.goProductDetail.bind(this, item)}>
                <View className="image-container">
                  {cmsCurrentSpuListData.number === 1 ?
                    <Image
                      className="image"
                      src={item.imageUrl}
                    />
                    :
                    <Image
                      className="image"
                      src={item.imageUrl}
                      style={`width: ${(winWidth - 36) / cmsCurrentSpuListData.number}px; height: ${(winWidth - 36) / cmsCurrentSpuListData.number}px`}
                    />
                  }
                </View>
                <View className="info-layout">
                  <View className="title">{item.name}</View>
                  {cmsCurrentSpuListData.number > 2 ?
                    <View className="price-layout">
                      <View className="left-layout">
                        <PriceView price={item.lowShowPrice / 100} size={28} hasSymbol='￥' />
                        <View className="coupon-text">券</View>
                      </View>
                    </View>
                    :
                    <View className="price-layout">
                      <View className="left-layout">
                        <PriceView price={item.lowShowPrice / 100} size={28} hasSymbol='￥' />
                        <AfterCouponPriceIcon />
                      </View>
                      <View className="market-price">￥{item.highOriginPrice / 100}</View>
                    </View>
                  }
                </View>
              </View>
            ))
          }
        </View>
      </View>
    )
  }
}

export default commondityList
