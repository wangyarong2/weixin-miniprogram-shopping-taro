import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import PriceView from '@src/components/PriceView/price'

import request from '@src/servers/http'

import meibaoPrice from '@src/assets/images/product/icon_meibao_price.png'
import './MMeibao.less'

export default class MCommodity extends Taro.Component {

  static externalClasses = ['class-wrapper']

  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      winHeight: 0,
      winWidth: 0,
      pageNo: 1,
      pageSize: 10,
      hasMoreData: false,
      templateIdList: [], // 模板 Id 列表
      requestList: [],
      meibaoList: [],
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
    const datas = this.props.datas
    const templateIdList = datas.data.displayedCommodities.map(item => item.templateIdString)
    this.state.templateIdList = templateIdList

    if (this.props.openPage) {
      this.state.requestList = this.state.templateIdList.splice(0, this.state.pageSize)
      this.state.hasMoreData = Boolean(this.state.templateIdList.length)
    } else {
      this.state.pageSize = 100
      this.state.requestList = this.state.templateIdList
    }
    if (this.props.showLoading) {
      Taro.showLoading({ title: '加载中...' })
    }
    this.getListData()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.openPage && this.props.pageFlag !== nextProps.pageFlag) {
      if (this.state.hasMoreData) {
        this.state.requestList = this.state.templateIdList.splice(0, this.state.pageSize)
        this.state.hasMoreData = Boolean(this.state.templateIdList.length)
        this.getListData()
      }
    }
  }

  getListData() {
    const { requestList, pageNo, pageSize } = this.state
    const queryParams = {
      projectId: "siji",
      spuId: "",
      shopId: "6666",
      name: "",
      templateIdList: requestList
    }
    if (!this.props.openPage) {
      Object.assign(queryParams, {pageNo, pageSize})
    }
    request.cmsPost({
      url: '/spu/meibao/list',
      data: queryParams,
    }).then(res => {
      if (this.props.showLoading) { Taro.hideLoading() }
      if (res.list) {
        // 排序处理
        let meibaoList = this.state.meibaoList
        let resultList = res.list
        for (let index = 0; index < requestList.length; index++) {
          const sortData = resultList.find(item => requestList[index] == item.templateIdString)
          sortData && meibaoList.push(sortData)
        }
        this.setState({ meibaoList })
      } else {
        this.state.meibaoList.length = 0
        this.setState({ meibaoList: this.state.meibaoList })
      }
    })
  }

  goProductDetail(data) {
    Taro.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?templateId=${data.templateIdString}&productType=1`,
    })
  }

  onLoginCallBack() {
    request.post('/community-client/mx/member/home', {}).then(res => {
      Taro.setStorageSync('currentShopId', res.shop.shopId)
      Taro.setStorageSync('userHasLogin', true)
    })
  }

  render() {
    const { winWidth } = this.state
    const { datas } = this.props
    if (datas) {
      datas.number = 2
    }
    // console.log(datas)
    return (
      datas && datas.data.displayedCommodities.length > 0 ?
        <View
          className="commondity-container"
          style={`padding-top: ${datas.style.margin.top}px; padding-bottom: ${datas.style.margin.bottom}px;`}
        >
            <View className={`spu-list spu-list${datas.number}`}>
              {
                this.state.meibaoList.map(item => (
                  <View className="item" onClick={this.goProductDetail.bind(this, item)} key={item.templateId}>
                    <View className="image-container">
                      { datas.number === 1 ?
                        <Image
                          className="image"
                          src={item.imageUrl}
                        />
                        :
                        <Image
                          className="image"
                          src={item.imageUrl}
                          style={`width: ${(winWidth - 36) / datas.number}px; height: ${(winWidth - 36) / datas.number}px`}
                        />
                      }
                    </View>
                    <View className="info-layout">
                      <View className="title">{item.name}</View>
                      { datas.number > 2 ?
                        <View className="price-layout">
                          <View className="left-layout">
                            <PriceView price={item.lowShowPrice / 100} size={28} hasSymbol='￥' />
                            <View className="coupon-text">券</View>
                          </View>
                        </View>
                        :
                        <View className="price-layout">
                          <View className="left-layout">
                            <View className="meibao-price">{item.lowRedeemPrice / 100}</View>
                            <Image className="meibao-icon" src={meibaoPrice}></Image>
                          </View>
                          {/* <View className="market-price">￥{item.highOriginPrice / 100}</View> */}
                        </View>
                      }
                    </View>
                  </View>
                ))
              }
            </View>
        </View>
        : null
    )
  }

}
