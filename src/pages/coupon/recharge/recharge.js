import XPage from '@src/components/XPage/XPage'
import { View, Input } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import './recharge.less'
import request from "../../../servers/http";
import TextUtil from '../../../utils/TextUtil';

class recharge extends XPage {
    config = {
        navigationBarTitleText: '现金券充值'
    }

    state = {
        mxCouponBalance: 0,
        cardNo: null,
        cardKey: null,
    }

    componentDidShow() {
        this.getCouponBalance();
    }

    onRuleClick() {
        this.goPage({ url: 'coupon/rule', params: {} })
    }
    onCouponDetailClick() {
        this.goPage({ url: 'coupon/couponDetail', params: {} })
    }

    //获取现金券余额
    getCouponBalance() {
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/mxCoupon/queryCouponBalance', {}).then((res) => {
            Taro.hideLoading();
            this.setState({
                mxCouponBalance: res.mxCouponBalance
            })
        }).catch(res => {
            Taro.hideLoading();
        })
    }

    //充值
    rechargeNow() {
        const { cardNo, cardKey } = this.state
        if (TextUtil.isEmpty(cardNo)) {
            Taro.showToast({
                title: "请输入卡号",
                mask: true,
                icon: "none"
            });
            return
        }
        if (TextUtil.isEmpty(cardKey)) {
            Taro.showToast({
                title: "请输入卡密",
                mask: true,
                icon: "none"
            });
            return
        }
        request.post('/community-client/mxCoupon/chargeByCard', { cardNo, source: 0, cardKey }).then((res) => {
            Taro.showToast({
                title: "充值成功",
                mask: true,
                icon: "none"
            });
            this.getCouponBalance();
        })
    }

    onCardNumChange(value) {
        this.setState(
            {
                cardNo: value.detail.value
            }
        );
    }

    onCardKeyChange(value) {
        this.setState(
            {
                cardKey: value.detail.value
            }
        );
    }

    clearCardKey() {
        this.setState({ cardKey: '' })
    }

    clearCardNum() {
        this.setState({ cardNo: '' })
    }

    render() {
        const { mxCouponBalance } = this.state
        return (
            <View className="chrearge-page">
                <View className="top-layout">
                    <View className="balance-title">现金券余额(元)</View>
                    <View className="balance">{mxCouponBalance / 100}</View>
                    <View className="button-layout">
                        <View className="button" onClick={this.onRuleClick}>现金券规则</View>
                        <View className="button" onClick={this.onCouponDetailClick}>现金券明细</View>
                    </View>
                </View>
                <View className="recharge-text">充值方式</View>
                <View className="recharge-type">卡密充值</View>
                <View className="bottom-layout">
                    <View className="recharge-secret">卡密充值</View>
                    <View className="input-layout">
                        <View className="title">卡号</View>
                        <Input
                            onInput={this.onCardNumChange}
                            value={this.state.cardNo}
                            className="input-text"
                            placeholderClass="input-placeholder"></Input>
                        {
                            !TextUtil.isEmpty(this.state.cardNo) &&
                            <AtIcon prefixClass='icon' onClick={this.clearCardNum.bind(this)} value="guanbi" size='18' color='#666666'></AtIcon>
                        }

                    </View>
                    <View className="input-layout">
                        <View className="title">密码</View>
                        <Input
                            onInput={this.onCardKeyChange}
                            value={this.state.cardKey}
                            className="input-text"
                            placeholderClass="input-placeholder"></Input>
                        {
                            !TextUtil.isEmpty(this.state.cardKey) &&
                            <AtIcon prefixClass='icon' onClick={this.clearCardKey.bind(this)} value="guanbi" size='18' color='#666666'></AtIcon>
                        }
                    </View>
                    <View className="recharge-now" onClick={this.rechargeNow}>立即充值</View>
                </View>
                <View className="get-layout">
                    <View className="get">实物券获取方式>></View>
                </View>
            </View>
        )
    }
}

export default XPage.connectFields()(recharge)
