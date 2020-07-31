import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './couponBalance.less'
import request from '../../../servers/http'
import detail from '../../../assets/images/mine/balance_see_detail.png'

class couponBalance extends XPage {
    config = {
        navigationBarTitleText: '橙券余额'
    }

    state = {
        balanceInfo: {
            totalBalance: 0,
            mbPoint: 0,
            couponBalance: 0,
        },
    }

    componentDidShow() {
        this.getBalanceDetail();
    }

    //获取账户余额
    getBalanceDetail() {
        request.post('/community-client/member/wallet', {}).then(res => {
            this.setState({
                balanceInfo: res
            })
        })
    }

    onSeeDetailClick() {
        this.goPage({ url: 'coupon/couponDetail', params: {} })
    }
    onAskClick() {
        this.goPage({ url: 'coupon/chooseShop', params: { type: 'fromAsk' } })
    }
    onAskDetailClick() {
        this.goPage({ url: 'coupon/askDetail', params: {} })
    }

    render() {
        const { balanceInfo } = this.state
        return (
            <View className="coupon-balance-page">
                <View className="red-bg">
                    <View className="balance-text">橙券余额</View>
                    <View className="balance">{balanceInfo.couponBalance / 100}</View>
                    <View className="see-detail" onClick={this.onSeeDetailClick}>
                        <Image className="img" src={detail}></Image>
                        <View className="detail-text">查看明细</View>
                    </View>
                </View>
                <View className="btn-to-center" onClick={this.onAskClick}>要券</View>
                <View className="btn-back-home" onClick={this.onAskDetailClick}>索要明细</View>
            </View>
        )
    }
}

export default XPage.connectFields()(couponBalance)
