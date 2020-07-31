import XPage from '@src/components/XPage/XPage'
import { View, Input, Textarea } from '@tarojs/components'
import './askCoupon.less'
import { AtIcon } from 'taro-ui'
import request from "../../../servers/http";
import TextUtil from '../../../utils/TextUtil'

class askCoupon extends XPage {
    config = {
        navigationBarTitleText: '索要橙券'
    }

    state = {
        inputMoney: '',
        reason: '',
        shopId: null,
        inputLength: 0,
    }

    componentDidMount() {
        const { shopId } = this.$router.params;
        this.setState({
            shopId
        })
    }


    askCoupon() {
        const { inputMoney, reason, shopId } = this.state
        if (isNaN(inputMoney)) {
            this.showToast({ title: '请输入正确的券额' })
            return
        }
        if (inputMoney.indexOf('.') != -1) {
            const temp = inputMoney.split('.')[1];
            if (temp.length > 2 || temp.length == 0) {
                this.showToast({ title: '请输入规范的券额' })
                return
            }
        }
        if (parseFloat(inputMoney) == 0) {
            this.showToast({ title: '券额不能为0' })
            return
        }
        if (TextUtil.isEmpty(reason)) {
            this.showToast({ title: '请输入索要理由' })
            return
        }
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/mxCoupon/ask', { shopId, askAmount: parseInt(inputMoney * 100), askReason: reason }).then((res) => {
            Taro.hideLoading();
            this.goPage({ url: 'coupon/askResult', params: {} })
        }).catch(res => {
            Taro.hideLoading();
            Taro.showToast({
                title: res.resultDesc,
                icon: 'none',
                duration: 2000
            })
            // this.showToast({ title: res.message })
        })

    }

    seeDetail() {
        this.goPage({ url: 'coupon/askDetail', params: {} })
    }

    onInputChange(e) {
        const value = e.target.value
        this.setState({
            inputMoney: value
        })
    }

    onReasonChange(e) {
        const value = e.target.value
        this.setState({
            reason: value,
            inputLength: TextUtil.isEmpty(value) ? 0 : value.length
        })
    }

    render() {
        const { inputLength } = this.state
        return (
            <View className="ask-coupon-page">
                <View className="ask-shop-manage">向店主索要橙券</View>
                <View className="input-layout">
                    <Input className="input"
                        placeholder="请输入券额"
                        onInput={this.onInputChange}
                        value={this.state.inputMoney}
                        placeholderClass="place-holder"></Input>
                    <AtIcon prefixClass='icon' value="guanbi" size='18' color='#666666'></AtIcon>
                </View>
                <View className="line"></View>
                <View className="relason-layout">
                    <View className="reason-title">索要理由</View>
                    <View className="num-layout">
                        <View className="count-num">{inputLength}</View>
                        <View className="total-num">/20</View>
                    </View>
                </View>
                <Textarea
                    onInput={this.onReasonChange}
                    value={this.state.reason}
                    className="reason-text"
                    maxlength="20"
                    placeholderClass="reason-placeholder"
                    placeholder="请输入索要理由"></Textarea>
                <View className="ask-button" onClick={this.askCoupon}>要券</View>
                <View className="detail-button" onClick={this.seeDetail}>要券明细</View>
            </View>
        )
    }
}

export default XPage.connectFields()(askCoupon)
