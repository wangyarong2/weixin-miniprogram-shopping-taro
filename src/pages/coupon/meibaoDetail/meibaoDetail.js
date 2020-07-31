import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './meibaoDetail.less'
import request from '../../../servers/http'
import TextUtil from '../../../utils/TextUtil'

class meibaoDetail extends XPage {
    config = {
        navigationBarTitleText: '橙宝明细',
        enablePullDownRefresh: true
    }

    state = {
        tabIndex: 0,
        tabs: [
            {
                name: '全部',
                status: 0,
            },
            {
                name: '收入',
                status: 1,
            },
            {
                name: '支出',
                status: 2,
            }
        ],
        pageNo: 1,
        pageSize: 10,
        detailList: [],
        noMoreData: false,
    }

    onTabHandle(index) {
        this.setState({
            tabIndex: index,
        }, () => {
            this.onPullDownRefresh()
        });
    }

    onPullDownRefresh() {
        this.setState({
            pageNo: 1,
            detailList: []
        }, () => {
            this.getDetailList(true);
        })
    }

    onReachBottom() {
        if (!this.state.noMoreData)
            this.getDetailList(false)
    }

    componentDidMount() {
        this.getDetailList(true);
    }

    getDetailList(refresh) {
        let { pageNo, pageSize, tabs, tabIndex } = this.state
        if (refresh) {
            pageNo = 1;
        } else {
            pageNo += 1;
        }
        const requestData = {
            type: tabs[tabIndex].status,
            pageSize: pageSize,
            pageNo: pageNo,
        }
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/meibao/recordList', requestData).then(res => {
            Taro.hideLoading();
            Taro.stopPullDownRefresh();
            let { detailList } = this.state
            if (refresh) {
                detailList = res.list == null ? [] : res.list;
            } else {
                let resultList = res.list
                if (resultList != null && resultList.length > 0) {
                    //有更多数据
                    detailList = detailList.concat(resultList)
                }
            }
            this.setState({
                noMoreData: pageNo * pageSize >= res.totalSize,
                detailList: detailList,
                pageNo
            })
        })
    }

    render() {
        const { tabs, tabIndex, detailList } = this.state
        return (
            <View className="account-detail-page">
                <View className="top-layout">
                    <ScrollView className="order-tab" scrollX scrollWithAnimation>
                        {tabs.map((item, index) => {
                            return (
                                <View
                                    id={"id" + index}
                                    key={index}
                                    className={`item-list ${
                                        index === tabIndex ? "selected" : ""
                                        }`}
                                    onClick={this.onTabHandle.bind(this, index)}
                                >
                                    {item.name}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>

                <View className="detail-list">
                    {
                        detailList.map((item, index) => {
                            return (
                                <View className="detail-item">
                                    {
                                        item.incomeAmount > 0 ?
                                            <View className="price">+{item.incomeAmount / 100}</View>
                                            :
                                            <View className="price" style={'color:#FF6400'}>-{item.payAmount / 100}</View>
                                    }
                                    <View className="type">{item.incomeAmount > 0 ? '获得方式' : '消费方式'}：{item.businessType}</View>
                                    <View className="time">结算时间：{TextUtil.formatDateWithYMDHMS(item.updateTime)}</View>
                                </View>
                            )
                        })
                    }
                </View>
            </View>
        )
    }
}

export default XPage.connectFields()(meibaoDetail)
