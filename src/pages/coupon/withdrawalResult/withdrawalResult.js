import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './withdrawalResult.less'

import resultImage from '../../../assets/images/mine/icon_withdrawal_result.png'

class withdrawalResult extends XPage {
    config = {
        navigationBarTitleText: '提现结果'
    }

    state = {}

    onBackHomeClick() {
        Taro.switchTab({
            url: '/pages/home/home'
        })
    }

    render() {
        return (
            <View className="withdrawal-result-page">
                <View className="image-layout">
                    <Image className="image" src={resultImage}></Image>
                    <View className="content">您的提现申请已提交，预计2～3个工作日到账</View>
                </View>
                <View className="back-home" onClick={this.onBackHomeClick}>返回首页</View>
            </View>
        )
    }
}

export default XPage.connectFields()(withdrawalResult)
