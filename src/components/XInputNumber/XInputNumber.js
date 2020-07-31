import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtInputNumber } from 'taro-ui'

import './XInputNumber.less'

export default class XInputNumber extends Component {
  constructor(props) {
    super(props)
  }
  static defaultProps = {
    min: 1, // 最小值	
    max: 99, // 最大值
    step: 1, // 每次点击改变的间隔大小	
    value: 1, // 输入框当前值，通过 onChange 事件更新
    onChange: '', // 输入框值改变时触发的事件
    disabled: false, // 是否禁止输入，禁止点击按钮	
  }
  render() {
    const { disabled, min, max, step, value, onChange } = this.props
    return (
      <View className='input-number-container'>
        <AtInputNumber
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
        />
      </View>
    )
  }

}
