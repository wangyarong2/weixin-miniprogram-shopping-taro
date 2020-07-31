import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './balanceDetail.less'

import balanceBg from '@images/mine/balance-bg.png'
import { AtIcon } from 'taro-ui'
import TextUtil from '../../../utils/TextUtil'

import request from '../../../servers/http'

class balanceDetail extends XPage {
    config = {
        navigationBarTitleText: '账户余额'
    }

    state = {
        balanceInfo: {},
        bankInfo: {}
    }

    componentDidShow() {
        this.getBalanceDetail();
        this.queryBankInfo();
    }

    getBalanceDetail() {
        request.post('/community-client/member/wallet', {}).then(res => {
            this.setState({
                balanceInfo: res
            })
        })
    }

    queryBankInfo() {
        request.post('/community-client/bank/card/query', {}).then(res => {
            this.setState({
                bankInfo: res.data
            })
        })
    }

    //明细
    onDetailClick() {
        this.goPage({ url: 'coupon/accountDetail', params: {} })
    }

    //待结算
    onSettlementClick() {
        this.goPage({ url: 'coupon/settlement', params: {} })
    }

    //银行卡
    onBankClick() {
        const { bankInfo } = this.state
        this.goPage({ url: 'coupon/bindcard', params: { hasBanding: !TextUtil.isEmpty(bankInfo.bankCardNo) } })
    }

    //提现
    onWithdrawalClick() {
        const { bankInfo } = this.state
        this.goPage({ url: 'coupon/withdrawal', params: {} })
    }

    render() {
        const { balanceInfo, bankInfo } = this.state
        return (
            <View className="balance-detail-page">
                <View className="red-bg"></View>
                <View className="white-bg"></View>
                <View className="balance-layout">
                    <Image className="image" src={balanceBg}></Image>
                    <View className="info-layout">
                        <View className="title">账户余额(元)</View>
                        <View className="balance">{balanceInfo.totalBalance / 100}</View>
                        <View className="can-withdrawal-layout">
                            <Text className="can-withdrawal-text">可提现金额</Text>
                            <Text className="can-withdrawal">{balanceInfo.withdrawable / 100}</Text>
                        </View>
                    </View>
                </View>
                <View className="operation-layout">
                    <View className="button-layout">
                        <View className="detail" onClick={this.onDetailClick}>明细</View>
                        <View className="withdraw" onClick={this.onWithdrawalClick}>提现</View>
                    </View>
                    <View className="item-layout" onClick={this.onSettlementClick}>
                        <View className="text">待结算</View>
                        <View className="money"> ￥{balanceInfo.waitSettleBalance / 100}元</View>
                        <View className="empty-view"></View>
                        <AtIcon prefixClass='icon' value='youjiantou' size='14' color='#909090'></AtIcon>
                    </View>
                    <View className="item-layout" onClick={this.onBankClick}>
                        <View className="text">银行卡</View>
                        {
                            TextUtil.isEmpty(bankInfo.bankCardNo)
                                ?
                                <View className="status-red">未绑定</View>
                                :
                                <View className="status-black">已绑定</View>
                        }


                        <View className="empty-view"></View>
                        <AtIcon prefixClass='icon' value='youjiantou' size='14' color='#909090'></AtIcon>
                    </View>
                </View>
            </View>
        )
    }
}

export default XPage.connectFields()(balanceDetail)
