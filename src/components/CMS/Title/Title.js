import { View } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import XPage from '@src/components/XPage/XPage'

import './Title.less'

class Title extends XPage {
  static defaultProps = {
    flag: false,
  }

  state = {}

  componentDidMount () {}

  render () {
    const { datas } = this.props

    return (
      <View className="content">
        <View className="line"/>
        <View className="title-text">{datas.data.title}</View>
        <View className="line"/>
      </View>
    )
  }
}

export default XPage.connectFields()(Title)
