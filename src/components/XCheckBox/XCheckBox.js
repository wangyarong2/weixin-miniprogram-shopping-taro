

import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import classes from 'classnames'
import './XCheckBox.less'
import { AtIcon } from 'taro-ui'

export default class XCheckBox extends Taro.Component {

    // 接受的外部样式类
    static externalClasses = ['class-wrapper']

    static defaultProps = {
        onClick: () => null,
        size: 40,// checkBox的大小
        iconSize: 10,// icon的大小
        checked: false,//当前是否选中
        theme: 'primary', // 常规主题
        text: ''
    }

    _onClick = () => {
        this.props.onClick()
    }

    render() {
        const { size, checked, iconSize, theme, text } = this.props
        return (
            <View onClick={this._onClick} className={classes("checkbox-container", "flex-center", "class-wrapper")}>
                <View
                    className={classes("checkBoxWrapper", `theme-${checked ? theme : "background"}`)}
                    style={` width: ${size}rpx; height:  ${size}rpx`}
                >
                    {
                        checked ?
                            <AtIcon prefixClass='icon' value='queren' size={iconSize} color='#fff'></AtIcon>
                            : null
                    }
                </View>
                {text ? <Text style="margin-left: 20rpx">{text}</Text> : null}
            </View>
        )
    }
}