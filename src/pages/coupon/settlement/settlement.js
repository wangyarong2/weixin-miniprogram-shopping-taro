import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './settlement.less'
import request from '../../../servers/http'
import TextUtil from '../../../utils/TextUtil'

class settlement extends XPage {
    config = {
        navigationBarTitleText: '待结算',
        enablePullDownRefresh: true
    }

    state = {
        pageNo: 1,
        pageSize: 10,
        noMoreData: false,
        list: [
            {}
        ],
    }

    componentDidMount() {
        this.getSettlementList(true);
    }

    onReachBottom() {
        if (!this.state.noMoreData) {
            this.getSettlementList(false);
        }
    }

    onPullDownRefresh() {
        this.setState({
            pageNo: 1,
            list: [],
        }, () => {
            this.getSettlementList(true);
        })
    }

    getSettlementList(refresh) {
        let { pageNo, pageSize } = this.state
        if (refresh) {
            pageNo = 1;
        } else {
            pageNo += 1;
        }
        const requestData = {
            pageSize: pageSize,
            pageNo: pageNo,
        }
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/settlement/wait/list', requestData).then((res) => {
            Taro.hideLoading();
            Taro.stopPullDownRefresh();
            let { list } = this.state
            if (refresh) {
                list = res.data.list == null ? [] : res.data.list;
            } else {
                let resultList = res.data.list
                if (resultList != null && resultList.length > 0) {
                    //有更多数据
                    list = list.concat(resultList)
                }
            }
            this.setState({
                noMoreData: pageNo * pageSize >= res.totalSize,
                list: list,
                pageNo
            })

        })
    }


    render() {
        const { list } = this.state
        return (
            <View className="detail-list">
                {
                    list.map((item, index) => {
                        return (
                            <View className="detail-item">
                                <View className="price-layout">
                                    <View className="price">{item.settlementAmount / 100}元</View>
                                    {
                                        item.balanceType == 1 && <View className="status-black">不可提现</View>
                                    }

                                </View>
                                <View className="type">获得方式：{item.remark}</View>
                                <View className="time">支付时间：{TextUtil.formatDateWithYMDHMS(item.settlementTime)}</View>
                            </View>
                        )
                    })
                }
            </View>
        )
    }
}

export default XPage.connectFields()(settlement)
