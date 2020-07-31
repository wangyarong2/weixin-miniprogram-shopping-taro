import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './groupBuyList.less'
import PriceView from '../../../components/PriceView/price'
import AfterCouponPriceIcon from '../../../components/AfterCouponPrice/AfterCouponPrice'
import CountDown from '../../../components/CountDown/CountDown'
import request from '../../../servers/http'
import TextUtil from '../../../utils/TextUtil'

class groupBuyList extends XPage {
    config = {
        navigationBarTitleText: '',
        enablePullDownRefresh: true
    }

    state = {
        groupList: [],
        pageNo: 1,
        pageSize: 10,
        noMoreData: false,
        intervalId: null,
    }

    componentDidMount() {
        this.getGroupList(true);
    }

    onPullDownRefresh() {
        this.setState({
            pageNo: 1,
            groupList: []
        }, () => {
            this.getGroupList(true)
        })
    }

    onReachBottom() {
        if (!this.state.noMoreData)
            this.getGroupList(false)
    }

    getGroupList(refresh) {
        let { pageNo, pageSize } = this.state
        if (refresh) {
            pageNo = 1;
        } else {
            pageNo += 1;
        }
        const requestData = {
            status: 2,
            pageSize: pageSize,
            pageNo: pageNo,
            shopId: Taro.getStorageSync('currentShopId')
        }
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/group/page', requestData).then((res) => {
            Taro.hideLoading();
            Taro.stopPullDownRefresh();
            let { groupList } = this.state
            if (refresh) {
                groupList = res.list == null ? [] : res.list;
            } else {
                let resultList = res.list
                if (resultList != null && resultList.length > 0) {
                    //有更多数据
                    groupList = groupList.concat(groupList)
                }

            }
            groupList.forEach(element => {
                element.countDownTime = element.endTime - element.currentTime
            });
            this.setState({
                noMoreData: pageNo * pageSize >= res.totalSize,
                groupList: groupList,
                pageNo
            }, () => {
                clearInterval(this.state.intervalId)
                this.startCountDown();
            })

        })
    }

    startCountDown() {
        const intervalId = setInterval(() => {
            const { groupList } = this.state
            let mList = groupList;
            mList.forEach((v, index) => {
                if (v.countDownTime <= 0) {
                    mList.splice(index, 1);
                } else {
                    v.countDownTime -= 1000;
                }
            });
            this.setState({
                groupList: mList
            }, () => {
                if (groupList.length == 0) {
                    clearInterval(this.state.intervalId)
                }
            })
        }, 1000);
        this.setState({
            intervalId: intervalId
        })
    }

    componentDidHide() {
        if (this.state.intervalId != null) {
            try {
                clearInterval(this.state.intervalId)
            } catch (error) {

            }
        }
    }

    onGroupBuyClick(item) {
        this.goPage({ url: 'groupBuy/groupBuyProductDetail', params: { templateId: item.templateId, shopId: Taro.getStorageSync('currentShopId') } })
    }

    render() {
        const { groupList } = this.state
        return (
            <View className="groupbuy-list-page">
                {
                    groupList.map((item, index) => {
                        return (
                            <View className="item" key={item.templateId} onClick={this.onGroupBuyClick.bind(this, item)}>
                                <View className="top-layout">
                                    <Image className="image" src={item.headImg}></Image>
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

                                </View>
                                <View className="bottom-layout">
                                    <CountDown countDownTime={item.countDownTime} redBorder></CountDown>
                                    <View className="sale-count">累计销售量：{TextUtil.isEmpty(item.salesNum + '') ? '0' : item.salesNum}</View>
                                </View>
                            </View>
                        )
                    })
                }
            </View >
        )
    }
}

export default XPage.connectFields()(groupBuyList)
