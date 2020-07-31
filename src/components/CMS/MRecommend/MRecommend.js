import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import PriceView from '@src/components/PriceView/price'
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice'

import request from '@src/servers/http'

import './MRecommend.less'

export default class Recommend extends Taro.Component {

  static externalClasses = ['class-wrapper']

  static defaultProps = {
    flag: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      winHeight: 0,
      winWidth: 0,
      commondityList: [],
      lineOneList: [],
      lineTwoList: [],
      page: {
        switch: false,
        pageSize: 50,
        pageNo: 1,
        totalSize: 0,
      },
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

  componentWillReceiveProps(nextProps) {
    if (this.props.flag !== nextProps.flag) {
      this.getRecommendList()
    }
  }

  getRecommendList() {
    if (this.props.showLoading) {
      Taro.showLoading()
    }
    const shopId = Taro.getStorageSync('currentShopId')
    if (!shopId) return
    const requestParams = {
      pageNo: 1,
      pageSize: 50,
      reviewStatus: null,  // 审核状态 0：未提交，1:待审核，2:未通过，3:通过
      saleStatus: "0", // 上下架 0:上架 1:下架
      selfSupport: true, // 自营true 平台false
      shopId
    };
    request.post('/community-client/seller/goods/list', requestParams).then(res => {
      if (this.props.showLoading) {
        Taro.hideLoading()
      }
      if (res && res.list) {
        // this.setState({ commondityList: res.list })
        let resultList = []
        if (res.list.length > 6) {
          resultList = res.list.slice(0, res.list.length)
        } else {
          resultList = res.list
        }
        if (resultList.length > 3) {
          this.state.lineOneList = resultList.slice(0, 3)
          this.state.lineTwoList = resultList.slice(3, resultList.length)
          this.setState({
            lineOneList: this.state.lineOneList,
            lineTwoList: this.state.lineTwoList,
            lineOneVertical: this.state.lineOneList.length < 3 ? true : false,
            lineTwoVertical: this.state.lineTwoList.length < 3 ? true : false
          })
          // this.setState({
          //   lineOneList: resultList.slice(0, 3),
          //   lineTwoList: resultList.slice(3, resultList.length),
          // })
        } else {
          this.setState({
            lineOneList: resultList,
            lineTwoList: [],
            lineOneVertical: resultList.length < 3 ? true : false,

          })
        }
      } else {
        this.setState({
          lineOneList: [],
          lineTwoList: []
        })
      }
    })
  }

  goProductDetail(data) {
    Taro.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?shopId=${Taro.getStorageSync('currentShopId')}&spuId=${data.spuId}`,
    })
  }

  goAllCommendList() {
    Taro.navigateTo({
      url: '/pages/home/recommendList/recommendList',
    })
  }

  render() {
    const { datas } = this.props
    const { lineOneList, lineTwoList, lineOneVertical, lineTwoVertical } = this.state
    return (
      datas && lineOneList.length &&
        <View
          className="commondity-container"
          style={`padding-top: ${datas.style.margin.top}px; padding-bottom: ${datas.style.margin.bottom}px;`}
        >
          { lineOneList.length && datas.factor.adImage &&
            <View className="title-box">
              <Image
                className='ad-image'
                mode='widthFix'
                src={datas.factor.adImage}
                onClick={this.goAllCommendList}
              />
            </View>
          }
          <View className={`${lineOneVertical ? 'spu-list spu-list1' : 'spu-list spu-list3'}`}>
            {
              lineOneList.map((item) => (
                <View className="item" key={item.id} onClick={this.goProductDetail.bind(this, item)}>
                  <View className="image-container">
                      <Image
                        className="image"
                        src={item.imageUrl}
                      />
                  </View>
                  <View className="info-layout">
                    <View className="title">{item.name}</View>
                    <View className="price-layout">
                      <View className="left-layout">
                        <PriceView price={item.lowShowPrice / 100} size={28} hasSymbol='￥' />
                        <AfterCouponPriceIcon />
                      </View>
                      { lineOneVertical &&
                        <View className="market-price">￥{item.highOriginPrice / 100}</View>
                      }
                    </View>
                  </View>
                </View>
              ))
            }
          </View>

          <View className={`${lineTwoVertical ? 'spu-list spu-list1' : 'spu-list spu-list3'}`}>
            {
              lineTwoList.map((item) => (
                <View className="item" key={item.id} onClick={this.goProductDetail.bind(this, item)}>
                  <View className="image-container">
                      <Image
                        className="image"
                        src={item.imageUrl}
                      />
                  </View>
                  <View className="info-layout">
                    <View className="title">{item.name}</View>
                    <View className="price-layout">
                      <View className="left-layout">
                        <PriceView price={item.lowShowPrice / 100} size={28} hasSymbol='￥' />
                        <AfterCouponPriceIcon />
                      </View>
                      { lineTwoVertical &&
                        <View className="market-price">￥{item.highOriginPrice / 100}</View>
                      }
                    </View>
                  </View>
                </View>
              ))
            }
          </View>
        </View>
    )
  }

}
