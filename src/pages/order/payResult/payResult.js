import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './payResult.less'
import { get as getGlobalData, set as setGlobalData } from '@utils/globalData';
import success from '@images/order/pay_success.png'

class payResult extends XPage {
    config = {
        navigationBarTitleText: '支付'
    }

    state = {}

    goToOrderCenter() {
        setGlobalData('payTemplateId', null)
        // 骑呗新增代码 - zhaofei
        const fromMiniProgram = getGlobalData('fromMiniProgram');
        if (fromMiniProgram == 'qibei') {
            Taro.navigateToMiniProgram({
                appId: 'wx75c1e3c71c1796b4',
                path: `pages/qibaoOrder/orderList/orderList`,
                envVersion: 'release',
                success(res) {
                    // 打开成功
                }
            })
            // ---------------------------------------------------------------------------
        } else {
            this.goPage({ url: 'order/orderList', params: {}, type: 'replace' })
        }
    }
    onBackHomeClick() {
        setGlobalData('payTemplateId', null)
        // 骑呗新增代码 - zhaofei
        const fromMiniProgram = getGlobalData('fromMiniProgram');
        if (fromMiniProgram == 'qibei') {
            Taro.navigateToMiniProgram({
                appId: 'wx75c1e3c71c1796b4',
                path: `pages/homeIndex/home`,
                envVersion: 'release',
                success(res) {
                    // 打开成功
                }
            })
            // ---------------------------------------------------------------------------
        } else {
            Taro.switchTab({
                url: '/pages/home/home'
            })
        }

    }


    render() {
        const spuRateAmount = this.params.spuRateAmount || 0
        return (
            <View className="pay-result-page">
                <Image className="result-img" src={success} ></Image>
                <Text className="result-text">
                    支付成功
                </Text>
                {/* {
                    spuRateAmount > 0 &&
                    <View className="money-layout">
                        <View className="black-text">确认收货后您将获得</View>
                        <View className="red-text">{spuRateAmount / 100}</View>
                        <View className="black-text">元返利哦</View>
                    </View>
                } */}

                {/* <View className="btn-to-center" onClick={this.goToOrderCenter}>去订单中心看看</View> */}
                <View className="btn-back-home" onClick={this.goToOrderCenter}>去订单中心看看</View>
                <View className="btn-back-home" onClick={this.onBackHomeClick}>返回首页</View>
                {/* <View className="more-product-text">更多商品推荐</View>
                <View className="product-list"></View> */}
            </View>
        )
    }
}

export default XPage.connectFields()(payResult)
