import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'

import XPage from '@src/components/XPage/XPage'
import PriceView from '@src/components/PriceView/price'
import CountDown from '@src/components/CountDown/CountDown'
import EmptyView from '@src/components/EmptyView/EmptyView';

import request from '@src/servers/http'

import './specialSaleList.less'
import '../../../components/CMS/MSpecialSale/MSpecialSale.less'

class specialSaleList extends XPage {

  config = {
    navigationBarTitleText: '特价限购',
  }

  constructor(props) {
    super(props)
    this.state = {
      timer: null,
      isVertical: true,
      tabs: [
        {
          text: '进行中',
          status: 2,
        },
        {
          text: '未开始',
          status: 1,
        },
        {
          text: '已结束',
          status: 3,
        }
      ],
      tabIndex: 0,
      winHeight: 0,
      winWidth: 0,
      pageNo: 1,
      pageSize: 5,
      hasMoreData: false,
      listData: [],
      loading: true,
    }
  }

  componentDidMount() {
    this.getList()
  }

  getList() {
    const { tabs, tabIndex, pageNo, pageSize } = this.state
    const requestData = {
      status: tabs[tabIndex].status,
      pageSize,
      pageNo,
      shopId: Taro.getStorageSync('currentShopId')
    }
    request.post('/community-client/miniapp/special/page', requestData).then((res) => {
      const resultList = res.list
      resultList.forEach(item => {
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
      const list = [...this.state.listData, ...resultList]
      const hasMoreData = (res.pageNo * res.pageSize) < res.totalSize
      this.setState({
        listData: list,
        hasMoreData,
        loading: false
      })
      clearInterval(this.state.timer)
      this.state.timer = setInterval(this.countdownFn.bind(this), 1000)
    })
  }

  handleTabClick(index) {
    this.setState({
      tabIndex: index,
      pageNo: 1,
      listData: [],
      loading: true
    }, () => {
      this.getList()
    })

  }

  countdownFn() {
    this.state.listData.forEach((item, index) => {
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
      listData: this.state.listData,
      // isVertical: this.state.listData.length < 3 ? true : false
    }, () => {
      if (this.state.listData.length === 0) {
        clearInterval(this.state.timer)
      }
    })
  }

  onGroupBuyClick(item) {
    this.goPage({
      url: 'limitBuyGoodsDetail',
      params: { templateId: item.templateId, shopId: Taro.getStorageSync('currentShopId') }
    })
  }

  onReachBottom() {
    if (this.state.hasMoreData) {
      this.state.pageNo += 1
      this.getList()
    }
  }

  componentDidHide() {
    clearInterval(this.state.timer)
  }

  render() {
    const { tabIndex, tabs, listData, isVertical, loading } = this.state
    return (
      <View className='container'>
        <View className='tabs'>
          <View className="line-box" style={{ transform: `translateX(${tabIndex * 250}rpx)` }}>
            <View className="line"></View>
          </View>
          {tabs.map((item, i) => (
            <View
              className={tabIndex === i ? 't_item selected' : 't_item'}
              onClick={this.handleTabClick.bind(this, i)}
            >{item.text}</View>
          ))}
        </View>
        <View className="list-container">
          <View className="specialSale-list-page">
            {
              listData.map((item, index) => {
                return (
                  <View className="item" key={index} onClick={this.onGroupBuyClick.bind(this, item)}>
                    {isVertical &&
                      <View className="head-layout">
                        { item.status === 3 ?
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
                              { item.limitCount && <View className="tags">限购{item.limitCount}件</View>}
                              { item.limitNew && <View className="tags">新客专享</View> }
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
                              { item.status !== 3 && <View className="button-buy">马上抢</View> }
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
            { !listData.length && !loading &&
              <EmptyView type={9}></EmptyView>
            }
          </View >
        </View>
      </View>

    )
  }
}

export default specialSaleList
