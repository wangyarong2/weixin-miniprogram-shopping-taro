import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./PasswordDialog.less";

export default class PasswordDialog extends Taro.Component {
    static defaultProps = {

    };
    constructor() {
        super(...arguments);
        this.state = {
            payFocus: true,
            pwdVal: '',
        }
    }

    // 检验密码 
    hidePayLayer = () => {
        let val = this.state.pwdVal
        this.props.onPasswordInptClose(val);
    }

    // 密码输入
    inputPwd = (e) => {
        this.setState({
            pwdVal: e.detail.value
        }, () => {
            if (e.detail.value.length >= 6) {
                this.hidePayLayer()
            }
        })
    }
    render() {
        return (
            <View className="dialog">
                <View className="input_main">
                    <View className="input_title">
                        <AtIcon prefixClass='icon' value='guanbi' size='13' color='#909090'></AtIcon>
                        <Text>支付密码</Text>
                    </View>
                    <View className="input_row">
                        {
                            [0, 1, 2, 3, 4, 5].map((item, index) => {
                                return (
                                    <View key={index} className="pwd_item">
                                        {
                                            this.state.pwdVal.length > index ? <Text className="pwd_itemtext"></Text> : null
                                        }
                                    </View>
                                )
                            })
                        }
                    </View>
                    <Input focus={this.state.payFocus} password type="number" maxLength="6" onInput={this.inputPwd} className="input_control"></Input>
                </View>
            </View>
        )
    }
}
