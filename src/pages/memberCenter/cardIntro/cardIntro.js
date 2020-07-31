import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'

import cardIntro from "@images/member/card-s3.png";

import './cardIntro.less'

class CardIntro extends XPage {
  config = {
    navigationBarTitleText: ''
  }

  state = {}

  componentWillMount() {
    Taro.setNavigationBarTitle({
      title: this.params.intro ? '橙卡介绍' : '分享赚钱'
    })
  }

  render() {
    return (
      <View>
        <Image className="card-image" src={cardIntro} mode="widthFix" />
        <View className="title-container flex-center">
          <View className="line line-left"></View>
          <View className="title">{this.params.intro ? '橙卡介绍' : '分享赚钱'}</View>
          <View className="line line-right"></View>
        </View>
        { this.params.intro ?
          <View className="text-container">
            <View className="content-text">1、橙卡为商家权益的集合，线下实体门店会提供店内的超值权益。</View>
            <View className="content-text">2、会员购买橙卡后可享受所购买卡内的全部商家权益，可以直接到店核销哦。</View>
            <View className="content-text">3、每个地区可以购买多张橙卡。</View>
            <View className="content-text">4、橙卡有效期为365天，尽快核销享受超值权益。</View>
          </View>
          :
          <View className="text-container">
            <View className="content-text">可将橙卡分享给好友，好友购买后分享者可以获得橙卡价值50%的佣金，佣金会以余额的形式存入分享者的账号余额，可直接进行提现哦，分享越多赚的越多！</View>
          </View>
        }
      </View>
    )
  }
}

export default XPage.connectFields()(CardIntro)
