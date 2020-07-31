import Taro from '@tarojs/taro'

import './garyCountDown.less'
import TextUtil from '../../../../utils/TextUtil'
import { View } from '@tarojs/components'

export default class garyCountDown extends Taro.Component {

    static defaultProps = {
    }

    componentDidMount() {
    }



    static externalClasses = ['class-wrapper']


    render() {
        const { countDownTime } = this.props
        return (
            <View className='class-wrapper'>
                <View className="count-down-view">
                    <View className="text">剩余</View>
                    {/* <View className="time">{TextUtil.getDay(time)}</View> */}
                    <View className="time">{TextUtil.addZero(TextUtil.getHours(countDownTime))}:</View>
                    <View className="time">{TextUtil.addZero(TextUtil.getMinutes(countDownTime))}:</View>
                    <View className="time">{TextUtil.addZero(TextUtil.getSeconds(countDownTime))}</View>
                </View>
            </View>
        )
    }
}