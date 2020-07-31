import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './askResult.less'

import success from '@images/order/pay_success.png'

class askResult extends XPage {
    config = {
        navigationBarTitleText: '索要橙券'
    }

    state = {}

    seeDetail() {
        this.goPage({ url: 'coupon/askDetail', params: {} })
    }

    onBackToMineClick() {
        Taro.switchTab({
            url: '/pages/mine/mine'
        })
    }

    render() {
        return (
            <View className="ask-result-page">
                <Image className="result-img" src={success} ></Image>
                <Text className="result-text">

                </Text>
                <View className="money-layout">
                    <View className="black-text">已向店主提交索要橙券申请，请耐心等候</View>
                </View>
                <View className="btn-to-center" onClick={this.onBackToMineClick}>返回个人中心</View>
                {/* <View className="btn-back-home" onClick={this.seeDetail}>查看要券明细</View> */}
            </View>
        )
    }
}

export default XPage.connectFields()(askResult)
