import XPage from '@src/components/XPage/XPage'
import { View, Input } from '@tarojs/components'
import './bindcard.less'
import request from '../../../servers/http'
import TextUtil from '../../../utils/TextUtil'

class bindcard extends XPage {
    config = {
        navigationBarTitleText: '绑定银行卡'
    }

    state = {
        name: '',
        bankNum: '',
        bankCompany: '',
        timeoutflag: null, // 多次输入请求接口时间判断
        isPageEdit: true,
        hasBanding: false,
    }

    componentDidMount() {
        const { hasBanding } = this.$router.params;
        this.setState({
            isPageEdit: !(hasBanding == 'true')
        }, () => {
            if (hasBanding) {
                this.queryBankInfo();
            }
        })

    }

    queryBankInfo() {
        request.post('/community-client/bank/card/query', {}).then(res => {
            this.setState({
                name: res.data.idName,
                bankNum: res.data.bankCardNo,
                bankCompany: res.data.brabankName
            })
        })
    }

    onNameChange(value) {
        this.setState({ name: value.detail.value });
    }

    onNumChange(value) {
        let { timeoutflag } = this.state
        if (timeoutflag != null) {
            clearTimeout(timeoutflag);
            timeoutflag = null
        }
        timeoutflag = setTimeout(() => {
            this.getBankCompany(value.detail.value)
        }, 500);
        this.setState({ timeoutflag: timeoutflag })
        this.setState({ bankNum: value.detail.value });
    }

    getBankCompany(num) {
        request.post('/community-client/member/card/name', { bankCardNo: num }).then((res) => {
            this.setState({
                bankCompany: res.data
            })
        })
    }

    onBindClick() {
        const { name, bankNum, bankCompany } = this.state
        if (TextUtil.isEmojiCharacter(name)) {
            Taro.showToast({
                title: "姓名不能包含表情或特殊符号",
                mask: true,
                icon: "none"
            });
            return false;
        }
        if (TextUtil.isEmpty(bankCompany)) {
            Taro.showToast({
                title: "您输入的银行卡号有误请检查卡号",
                mask: true,
                icon: "none"
            });
            return false;
        }
        this.showLoading();
        request.post('/community-client/member/card/bind', { idName: name, bankCardNo: bankNum, bankCardName: bankCompany }).then(res => {
            this.hideLoading();
            Taro.showToast({
                title: "信息保存成功",
                mask: true
            });
            setTimeout(() => {
                this.setState({
                    isPageEdit: false
                })
            }, 300);
        })
    }

    onEditClick() {
        this.setState({
            isPageEdit: true
        })
    }

    render() {
        const { isPageEdit } = this.state
        return (
            < View className="bind-card-page" >
                {
                    isPageEdit ?
                        <View className="content-layout">
                            <View className="item-layout">
                                <View className="title">开户人</View>
                                <Input className="input"
                                    value={this.state.name}
                                    onInput={this.onNameChange}
                                    maxLength={10}
                                    placeholder="请输入开户人姓名"
                                    placeholderClass="placeholder"></Input>
                            </View>
                            <View className="line"></View>
                            <View className="item-layout">
                                <View className="title">银行卡号</View>
                                <Input className="input2"
                                    type="number"
                                    value={this.state.bankNum}
                                    onInput={this.onNumChange}
                                    maxLength={30}
                                    placeholder="请输入银行卡号"
                                    placeholderClass="placeholder"></Input>
                            </View>
                        </View>
                        :
                        <View className="info-layout">
                            <View className="name">
                                {this.state.name}
                            </View>
                            <View className="bank-info-layout">
                                <View className="bank-name-text">银行卡号</View>
                                <View className="bank-num">{this.state.bankNum}</View>
                            </View>
                        </View>
                }
                {
                    isPageEdit ?
                        <View className="bind" onClick={this.onBindClick}>完成</View>
                        :
                        <View className="change" onClick={this.onEditClick}>修改</View>
                }


            </View >
        )
    }
}

export default XPage.connectFields()(bindcard)
