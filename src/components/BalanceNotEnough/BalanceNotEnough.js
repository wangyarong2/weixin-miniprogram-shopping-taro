import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./BalanceNotEnough.less";

import notEnough from '@images/order/not_enough.png'

export default class BalanceNotEnough extends Taro.Component {
    static defaultProps = {
        couponPrice: 0
    };
    constructor() {
        super(...arguments);
    }
    render() {
        return (
            <View className="balance-not-enough-dialog">
                <View className="dialog-content">
                    <Image className="head-image" src={notEnough}></Image>
                    <View className="content-layout">
                        <View className="notice">本单可抵券{this.props.couponPrice}元，您的券额不足，不足部分将使用现金支付</View>
                        <View className="confirm" onClick={this.props.onCategoryConfirmClick}>确定并继续购买</View>
                        <View className="ask" onClick={this.props.onAskClick}>向店主索要</View>
                        <View className="cancel" onClick={this.props.onCancelClick}>考虑一下</View>
                    </View>
                </View>
            </View>
        )
    }
}
