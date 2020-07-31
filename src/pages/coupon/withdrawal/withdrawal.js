import XPage from '@src/components/XPage/XPage'
import { View, Input } from '@tarojs/components'
import './withdrawal.less'
// import PasswordDialog from '../../../components/PasswordDialog/PasswordDialog'
import request from '../../../servers/http'

class withdrawal extends XPage {
    config = {
        navigationBarTitleText: '提现'
    }

    state = {
        money: '',
        showPasswordDialog: false,
        balanceInfo: {
            withdrawable: 0,
        }
    }

    componentDidShow() {
        this.getBalanceDetail();
    }

    onMoneyChange(value) {
        this.setState({ money: value.detail.value });
    }

    onConfrimWithdrawalClick() {
        const { money } = this.state
        if (isNaN(money)) {
            Taro.showToast({
                title: "请输入正确的提现金额",
                mask: true,
                icon: "none"
            });
            return false;
        }
        if (money.length == 0) {
            Taro.showToast({
                title: "请输入提现金额",
                mask: true,
                icon: "none"
            });
            return false;
        }
        try {
            const withdrawalMoney = parseFloat(money);
            if (withdrawalMoney < 10) {
                Taro.showToast({
                    title: "最低提现金额为10元",
                    mask: true,
                    icon: "none"
                });
                return false;
            }

            if (money.toString().indexOf('.') != -1) {
                const temp = money.split('.')[1];
                if (temp.length > 2 || temp.length == 0) {
                    Taro.showToast({
                        title: "提现金额仅精确到分",
                        mask: true,
                        icon: "none"
                    });
                    return
                }
            }
            if (withdrawalMoney * 100 > this.state.balanceInfo.withdrawable) {
                Taro.showToast({
                    title: "输入提现金额大于可提现金额",
                    mask: true,
                    icon: "none"
                });
                return false;
            }
            Taro.showLoading({
                title: '请稍后...',
                mask: true
            })
            request.post('/community-client/member/withdraw', { amount: money * 100 })
                .then(res => {
                    Taro.hideLoading();
                    this.goPage({ url: 'coupon/withdrawalResult', params: {}, type: 'replace' })
                }).catch(res => {
                    this.showToast({ title: res.message })
                })

        }
        catch (e) {
            Taro.showToast({
                title: "请输入正确的提现金额",
                mask: true,
                icon: "none"
            });
        }
        // this.setState({
        //     showPasswordDialog: true
        // })
    }

    onAllWithdrawalClick() {
        const { balanceInfo } = this.state
        this.setState({
            money: balanceInfo.withdrawable / 100 + ''
        })
    }

    getBalanceDetail() {
        request.post('/community-client/member/wallet', {}).then(res => {
            this.setState({
                balanceInfo: res
            })
        })
    }

    render() {
        // const { showPasswordDialog } = this.state
        const { balanceInfo } = this.state
        return (
            <View className="withdrawal-page">
                {/* {showPasswordDialog &&
                    <PasswordDialog></PasswordDialog>
                } */}
                <View className="content-layout">
                    <View className="title-layout">
                        <View className="black-text">提现金额</View>
                        <View className="gary-text">（10元起提现）</View>
                    </View>
                    <View className="input-layout">
                        <View className="money-text">￥</View>
                        <Input className="input"
                            type="digit"
                            value={this.state.money}
                            onInput={this.onMoneyChange}
                            maxLength={10}
                            placeholder="请输入提现金额"
                            placeholderClass="placeholder">
                        </Input>
                        <View className="all-withdrawal" onClick={this.onAllWithdrawalClick}>
                            全部提现
                        </View>
                    </View>
                    <View className="line"></View>
                    <View className="can-withdrawal">
                        可提现金额 ¥ {balanceInfo.withdrawable / 100}元
                    </View>
                </View>
                <View className="confrim-withdrawal" onClick={this.onConfrimWithdrawalClick}>确认提现</View>
            </View>
        )
    }
}

export default XPage.connectFields()(withdrawal)
