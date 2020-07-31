import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './rule.less'

class rule extends XPage {
    config = {
        navigationBarTitleText: '现金券规则'
    }

    state = {}

    render() {
        return (
            <View className="rule-page">
                <View className="title">一、什么是橙券</View>
                <View className="content">现金券用于抵扣商品的“可抵扣券额”，如一款商品原价20元，抵扣券额10元，则会员可以券后价10元购买此款商品；</View>
                <View className="title">二、如何获得现金券</View>
                <View className="content">1、通过线下活动领取橙券后，通过充值充入线上电子账户<br />2、店铺会不定期的通过各种活动赠送橙券；<br />3、可以直接向店主申请索要橙券;</View>
                <View className="title">二、现金券的使用</View>
                <View className="content">获得的橙券都充入您的橙券账户，可根据实际抵扣金额分拆使用；<br />如发生退款售后等操作，实际退款后橙券金额会根据每个商品的实际抵用金额退回您的橙券账户；</View>
            </View>
        )
    }
}

export default XPage.connectFields()(rule)
