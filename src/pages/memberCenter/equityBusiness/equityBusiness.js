import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import request from "@src/servers/http";
import TextUtil from '@utils/TextUtil'

import card2 from "@images/member/card-s2.png";
import useBg from "@images/member/use-bg.png";


import './equityBusiness.less'

class EquityBusiness extends XPage {
  config = {
    navigationBarTitleText: '权益商家详情'
  }

  state = {
    shopDetail: {
      detail: []
    }
  }

  componentDidMount() {
    this.getShopDetail()
  }

  getShopDetail() {
    const requestParams = {
      shopId: this.params.shopId
    }
    request.post("/community-client/community/shopEquity/detail", requestParams).then(res => {
      Taro.setNavigationBarTitle({
        title: res.shopName || ''
      })
      this.setState({ shopDetail: res })
    });
  }

  goCardDetail() {
    this.goPage({
      url: 'memberCenter/cardDetail',
      params: {
        id: this.state.shopDetail.cardId
      }
    })
  }

  handleUseClick(data) {
    this.goPage({
      url: 'memberCenter/equityDetail',
      params: {
        equityId: data.equityId,
        cardId: this.state.shopDetail.cardId,
        from: 'shop'
      }
    })
  }

  render() {
    const { shopDetail } = this.state
    return (
      <View>
        <Image className="card-image" src={shopDetail.businessLicenseImage} />
        <View className="base-info">
          <View className="shop-box">
            <Image className="item-iamge" src={shopDetail.logoImage}></Image>
            <View className="shop-name">{shopDetail.shopName}</View>
          </View>
          <View className="card-contact" style={{ marginBottom: '16rpx' }}>
            <AtIcon prefixClass='icon' value='position' color='#333' size='20' ></AtIcon>
            <Text className="contact-text">{shopDetail.address}</Text>
          </View>
          <View className="card-contact">
            <AtIcon prefixClass='icon' value='call' color='#333' size='18' ></AtIcon>
            <Text className="contact-text">{shopDetail.mobilePhone}</Text>
          </View>
        </View>
        <View className="cardback-container flex-space-between" onClick={this.goCardDetail}>
          <View className="card-name">{shopDetail.cardName || ''}</View>
          <View className="card-share flex-center">
            <Image className="card-share-bg" src={useBg}></Image>
            <View className="card-share-text">去使用</View>
          </View>
        </View>
        <View className="card-data-container">
            { shopDetail.detail.map((detail, detailIndex) =>
              <View className="card-data" key={detail.equityId} onClick={this.handleUseClick.bind(this, detail)}>
                <View className="flex-space-between">
                  <View className="item-name">{detailIndex + 1}、{detail.equityName}</View>
                  <View className="item-count">
                    <Text>价值</Text>
                    <Text>¥{detail.cost}元</Text>
                  </View>
                </View>
                <View className="flex-space-between" style={{ marginTop: '12rpx' }}>
                  { detail.endTime ?
                    <View className="item-time">有效期 {TextUtil.formatDateWithYMD(detail.startTime)} ～ {TextUtil.formatDateWithYMD(detail.endTime)}</View>
                    :
                    <View className="item-time">有效期 不限</View>
                  }
                  <View className="item-btn flex-center">去使用</View>
                </View>
              </View>
            )}
        </View>
      </View>
    )
  }
}

export default XPage.connectFields()(EquityBusiness)
