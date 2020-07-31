import Taro from '@tarojs/taro'

import './CountDown.less'
import TextUtil from '../../utils/TextUtil'
import { View } from '@tarojs/components'

export default class CountDown extends Taro.Component {

    static defaultProps = {
      redBorder: false,
      label: '距结束'
    }

    static externalClasses = ['class-wrapper']

    render() {
        const { countDownTime, redBorder, label } = this.props
        return (
            <View className='class-wrapper'>
                <View className={redBorder ? 'count-down-view red-border' : 'count-down-view'}>
                    <View className="text">{label}</View>
                    <View className="countdown-content">
                      <View className="time">{TextUtil.getDay(countDownTime)}</View>
                      <View className="time">天</View>
                      <View className="time">{TextUtil.addZero(TextUtil.getHours(countDownTime))}</View>
                      <View className="dot">:</View>
                      <View className="time">{TextUtil.addZero(TextUtil.getMinutes(countDownTime))}</View>
                      <View className="dot">:</View>
                      <View className="time">{TextUtil.addZero(TextUtil.getSeconds(countDownTime))}</View>
                    </View>
                </View>
            </View>
        )
    }
}
