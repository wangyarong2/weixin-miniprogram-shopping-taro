import { View } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import XPage from '@src/components/XPage/XPage'
import PriceView from '@src/components/PriceView/price'
import CountDown from '@src/components/CountDown/CountDown'

import request from '@src/servers/http'

import './MSpecialSale.less'

class MSpecialSale extends XPage {
  static defaultProps = {
    flag: false,
  }

  state = {
    timer: null,
    dataList: [],
    isVertical: true,
    pageNo: 1,
    pageSize: 50,
    requestStatusList: [2, 1, 3],
    requestStatus: 2,
    noMoreData: false,
  }

  componentDidMount() {
    const currentShopId = Taro.getStorageSync('currentShopId')
    if (currentShopId) {
      this.getGroupList(currentShopId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.flag !== nextProps.flag) {
      const currentShopId = Taro.getStorageSync('currentShopId')
      if (currentShopId) {
        this.state.pageSize = 50
        this.state.requestStatusList = [2, 1, 3]
        this.state.dataList = []
        this.getGroupList(currentShopId);
      }
    }
  }

  componentDidHide() {
    clearInterval(this.state.timer)
  }

  getGroupList(shopId) {
    if (!this.state.requestStatusList.length) return
    if (this.props.showLoading) {
      Taro.showLoading({ title: '加载中...' })
    }
    let { pageNo, pageSize } = this.state
    const requestData = {
      // status: this.state.requestStatus,
      status: this.state.requestStatusList.shift(),
      pageSize,
      pageNo,
      shopId
    }
    request.post('/community-client/miniapp/special/page', requestData).then((res) => {
      if (this.props.showLoading) {
        Taro.hideLoading()
      }

      const resultList = res.list || []

      // const list = this.state.dataList.concat(resultList)
      this.state.dataList = this.state.dataList.concat(resultList)
      if (this.state.dataList.length < 50) {
        // this.state.pageSize = 3 - this.state.dataList.length
        this.getGroupList(shopId)
        if (this.state.requestStatusList.length) return
      }
      // if (!list.length) return
      // const list = res.list || []
      this.state.dataList.forEach(item => {
        if (item.status == 3) {
          // 已结束
          item.countdownTime = 0
          item.status = 3
        } else if (item.startTime - item.currentTime >= 1000) {
          // 未开始
          item.status = 1
          item.countdownTime = item.startTime - item.currentTime
        } else {
          // 进行中
          item.status = 2
          item.countdownTime = item.endTime - item.currentTime
        }
      })

      this.setState({
        dataList: this.state.dataList,
        // isVertical: list.length < 3 ? true : false
      })

      clearInterval(this.state.timer)
      this.state.timer = setInterval(this.countdownFn.bind(this), 1000)

    })
  }

  countdownFn() {
    this.state.dataList.forEach((item, index) => {
      if (item.countdownTime < 1000) {
        if (item.status == 3) {
          // 已结束
          item.countdownTime = 0
          item.status = 3
        } else if (item.startTime - item.currentTime >= 1000) {
          // 未开始
          item.status = 1
          item.countdownTime = item.startTime - item.currentTime
        } else {
          // 进行中
          item.status = 2
          item.countdownTime = item.endTime - item.currentTime
        }
      } else {
        item.countdownTime -= 1000;
      }
    });

    this.setState({
      dataList: this.state.dataList,
      // isVertical: this.state.dataList.length < 3 ? true : false
    }, () => {
      if (this.state.dataList.length === 0) {
        clearInterval(this.state.timer)
      }
    })
  }

  seeAllList() {
    this.goPage({ url: 'home/specialSaleList' })
  }

  onGroupBuyClick(item) {
    this.goPage({
      url: 'limitBuyGoodsDetail',
      params: { templateId: item.templateId, shopId: Taro.getStorageSync('currentShopId') }
    })
  }

  render() {
    const { datas } = this.props
    const { dataList, isVertical } = this.state
    return (
      dataList.length &&
      <View
        style={`padding-top: ${datas.style.margin.top}px;padding-bottom: ${datas.style.margin.bottom}px;padding-left: 24rpx;padding-right: 24rpx;`}
      >
        <View className="specialSale-container">
          {datas && datas.factor.adImage ?
            <View style={{ background: '#fff' }}>
              <Image
                className='ad-image'
                mode='widthFix'
                src={datas.factor.adImage}
                style={{ width: '100%' }}
                onClick={this.seeAllList}
              />
            </View>
            :
            <View className="more-container flex-space-between" onClick={this.seeAllList}>
              <View className="more-title">特价限购</View>
              <View className="flex-space-between">
                <Text className="more-text">更多</Text>
                <AtIcon prefixClass='icon' value='youjiantou' color='#999' size='12' ></AtIcon>
              </View>
            </View>
          }
          <View className={isVertical ? 'specialSale-list-page' : 'specialSale-list-page column'}>
            {
              dataList.map((item, index) => {
                return (
                  <View className="item" key={index} onClick={this.onGroupBuyClick.bind(this, item)}>
                    {isVertical &&
                      <View className="head-layout">
                        {item.status === 3 ?
                          <View className="sale-end">已结束</View>
                          :
                          <CountDown
                            label={item.status === 1 ? '距开始' : '距结束'}
                            countDownTime={item.countdownTime}
                            redBorder
                          />
                        }
                        <View className="sale-count">活动销量：{item.salesSum}</View>
                      </View>
                    }
                    <View className="top-layout">
                      <Image className="image" src={item.headImg}></Image>
                      {isVertical ?
                        <View className="info-layout">
                          <View>
                            <View className="title">{item.templateName}</View>
                            <View className="tag-layout">
                              {item.limitCount && <View className="tags">限购{item.limitCount}件</View>}
                              {item.limitNew && <View className="tags">新客专享</View>}
                            </View>
                          </View>
                          <View>
                            <View className="price-layout">
                              <View className="left-layout">
                                <PriceView price={item.activityPrice / 100} size={40} hasSymbol='¥' />
                                <Text className="special-text">特价</Text>
                              </View>
                            </View>
                            <View className="button-layout">
                              <View className="market-price">￥{item.price / 100}</View>
                              {item.status !== 3 && <View className="button-buy">马上抢</View>}
                            </View>
                          </View>
                        </View>
                        :
                        <View className="info-layout">
                          <View className="title">{item.name}</View>
                          <View className="price-layout">
                            <View className="left-layout">
                              <PriceView price={item.activityPrice / 100} size={28} hasSymbol='￥' />
                            </View>
                          </View>
                        </View>
                      }
                    </View>
                  </View>
                )
              })
            }
          </View >
        </View>
      </View>
    )
  }
}

export default XPage.connectFields()(MSpecialSale)
