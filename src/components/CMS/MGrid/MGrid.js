import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import request from '@src/servers/http'

import './MGrid.less'

export default class MGrid extends Taro.Component {

  static externalClasses = ['class-wrapper']

  static defaultProps = {
  }

  handleClick = (item) => {
    this.props.handleClick && this.props.handleClick(item)
  }

  onLoginCallBack() {
    request.post('/community-client/mx/member/home', {}).then(res => {
      Taro.setStorageSync('currentShopId', res.shop.shopId)
      Taro.setStorageSync('userHasLogin', true)
    })
  }

  render() {
    const { datas } = this.props
    return (
      <View
        className="textswiper"
        style={`padding-top: ${datas.style.margin.top}px; padding-bottom: ${datas.style.margin.bottom}px;`}
      >
        {
          datas.data.imgCollection.map((item, index) => (
            <View key={index} className="textSwrip-col" onClick={this.handleClick.bind(this, item)}>
              <Image className="img-col" src={item.url} />
              <View className="text-col">{item.text}</View>
            </View>
          ))
        }
      </View>
    )
  }

}
