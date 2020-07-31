import { View } from '@tarojs/components'

import XPage from '@src/components/XPage/XPage'
import PriceView from '@src/components/PriceView/price'
import CountDown from '@src/components/CountDown/CountDown'
import request from '@src/servers/http'
import TextUtil from '@utils/TextUtil'

import '../../../pages/groupBuy/groupBuyList/groupBuyList.less'

class MGroupBuyList extends XPage {
  static defaultProps = {
    flag: false,
  }

  state = {
    timer: null,
    groupList: [],
    isVertical: false,
    pageNo: 1,
    pageSize: 50,
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
        this.getGroupList(currentShopId);
      }
    }
  }

  componentDidHide() {
    clearInterval(this.state.timer)
  }

  getGroupList(shopId) {
    if (this.props.showLoading) {
      Taro.showLoading({ title: '加载中...' })
    }
    let { pageNo, pageSize } = this.state
    const requestData = {
      status: 2,
      pageSize,
      pageNo,
      shopId
    }
    request.post('/community-client/group/page', requestData).then((res) => {
      if (this.props.showLoading) {
        Taro.hideLoading()
      }
      const list = res.list || []
      list.forEach(item => {
        item.countdownTime = item.endTime - item.currentTime
      })
      this.setState({
        groupList: list,
        isVertical: list.length < 3 ? true : false
      })

      clearInterval(this.state.timer)
      this.state.timer = setInterval(this.countdownFn.bind(this), 1000)
      // this.setState({ groupList: [...res.list, ...res.list, ...res.list] || [] })

    })
  }

  countdownFn() {
    this.state.groupList.forEach((item, index) => {
      if (item.countdownTime < 1000) {
        this.state.groupList.splice(index, 1)
      } else {
        item.countdownTime -= 1000;
      }
    });

    this.setState({
      groupList: this.state.groupList,
      isVertical: this.state.groupList.length < 3 ? true : false
    }, () => {
      if (this.state.groupList.length === 0) {
        clearInterval(this.state.timer)
      }
    })
  }

  goAllGroupbuyingList() {
    this.goPage({ url: 'groupBuy/groupBuyList', params: {} })
  }

  onGroupBuyClick(item) {
    this.goPage({
      url: 'groupBuy/groupBuyProductDetail',
      params: { templateId: item.templateId, shopId: Taro.getStorageSync('currentShopId') }
    })
  }

  render() {
    const { datas } = this.props
    const { groupList, isVertical } = this.state
    return (
      groupList.length &&
      <View
        className="groupbuying-container"
        style={`padding-top: ${datas.style.margin.top}px;padding-bottom: ${datas.style.margin.bottom}px;padding-left: 24rpx;padding-right: 24rpx;`}
      >
        {datas && datas.factor.adImage &&
          <View style={{ background: '#fff' }}>
            <Image
              className='ad-image'
              mode='widthFix'
              src={datas.factor.adImage}
              style={{ width: '100%' }}
              onClick={this.goAllGroupbuyingList}
            />
          </View>
        }
        <View className={isVertical ? 'groupbuy-list-page' : 'groupbuy-list-page column'}>
          {
            groupList.map((item, index) => {
              return (
                <View className="item" key={item.templateId} onClick={this.onGroupBuyClick.bind(this, item)}>
                  <View className="top-layout">
                    <Image className="image" src={item.headImg}></Image>
                    {isVertical ?
                      <View className="info-layout">
                        <View className="title">{item.name}</View>
                        <View className="people-layout">
                          <View className="people-num">{item.groupCount}人成团</View>
                        </View>
                        <View className="price-layout">
                          <View className="left-layout">
                            <PriceView price={item.activityPrice / 100} size={28} hasSymbol='￥' />
                          </View>
                          <View className="market-price">￥{item.price / 100}</View>
                        </View>
                        <View className="button-layout">
                          <View className="button">立即购买</View>
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
                  {isVertical &&
                    <View className="bottom-layout">
                      <CountDown countDownTime={item.countdownTime} redBorder></CountDown>
                      <View className="sale-count">累计销售量：{TextUtil.isEmpty(item.salesNum + '') ? '0' : item.salesNum}</View>
                    </View>
                  }
                </View>
              )
            })
          }
        </View >
      </View>
    )
  }
}

export default XPage.connectFields()(MGroupBuyList)
