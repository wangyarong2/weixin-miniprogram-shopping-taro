import { AtIcon } from 'taro-ui'
import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import EmptyView from '@src/components/EmptyView/EmptyView';

import shopDefault from "@images/member/shop-default.png";

import './shopSearch.less'

class ShopSearch extends XPage {
  config = {
    navigationBarTitleText: '搜索'
  }

  state = {
    pageShowResult: false,
    searchKey: '',
    storeList: []
  }

  onSearchIntputChange(value) {
    this.setState({ searchKey: value.detail.value });
  }

  onSearchClick() {}

  render() {
    const { searchKey, storeList } = this.state
    return (
      <View>
        <View className="search-root" style={{ marginBottom: '24rpx' }}>
          <View className="search-layout">
            <AtIcon prefixClass='icon' value='sousuo' size='16' color='#666666'></AtIcon>
            <Input
              className="search-input"
              onInput={this.onSearchIntputChange}
              value={searchKey}
              onConfirm={this.onSearchClick.bind(this)}
              placeholder="搜索商家名称"
              placeholderClass="placeholder-input"
              confirmType="搜索" />
          </View>
          <View className="search-text" onClick={this.onSearchClick.bind(this, true)}>搜索</View>

        </View>
        {
          storeList.map((item, index) =>
            <View className="store-item" key={index} onClick={this.goShopDetail.bind(this, item)}>
              <View className="item-image-box flex-center">
                { item.logoImage ?
                  <Image className="item-image" src={item.logoImage} />
                  :
                  <Image className="item-iamge-default" src={shopDefault} />
                }
              </View>
              <View className="item-content">
                <View className="item-name">{item.title}</View>
                <View className="item-address">{item.address}</View>
                <View className="item-des text-mult-clip-2">{item.shopSize}项权益价值{item.cost}元</View>
              </View>
            </View>
          )
        }

        { !storeList.length && <EmptyView type={6} text="未搜索到结果"></EmptyView> }
      </View>
    )
  }
}

export default XPage.connectFields()(ShopSearch)
