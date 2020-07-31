import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './askDetail.less'
import request from "../../../servers/http";
import TextUtil from '../../../utils/TextUtil';

class askDetail extends XPage {
    config = {
        navigationBarTitleText: '要券明细'
    }

    state = {
        list: [],
        pageNo: 1,
        pageSize: 10,
        statusMap: {
            1: { status: '待同意', color: '#FF6400' },
            2: { status: '已同意', color: '#333333' },
            3: { status: '已拒绝', color: '#C0C0C0' }
        }

    }

    componentDidMount() {
        this.getAskDetail(true);
    }

    getAskDetail(refresh) {
        const { pageNo, pageSize } = this.state
        request.post('/community-client/mxCoupon/member/askLog', { pageNo, pageSize }).then((res) => {
            Taro.hideLoading();
            let { list } = this.state
            if (refresh) {
                list = res.list == null ? [] : res.list;
            } else {
                let resultList = res.list
                if (resultList != null && resultList.length > 0) {
                    //有更多数据
                    list = list.concat(resultList)
                } else {
                    //没有更多数据

                }
            }
            this.setState({
                list: list,
                pageNo
            }, () => {

            })
        })
    }

    getStatus(status) {
        if (status == 1) {
            return '';
        }
        if (status == 2) {
            return '已同意';
        }
        if (status == 3) {
            return '已拒绝'
        }
    }

    render() {
        const { list, statusMap } = this.state
        return (
            <View className="detail-list">
                {
                    list.map((item, index) => {
                        return (
                            <View className="detail-item">
                                <View className="price-layout">
                                    <View className="price">{item.askAmount / 100}</View>
                                    <View className="status" style={`color:${statusMap[item.status].color}`}>{statusMap[item.status].status}</View>
                                </View>
                                <View className="type">索要理由：{item.askReason}</View>
                                <View className="time">要券时间：{TextUtil.formatDateWithYMDHMS(item.createTime)}</View>
                            </View>
                        )
                    })
                }
            </View>
        )
    }
}

export default XPage.connectFields()(askDetail)
