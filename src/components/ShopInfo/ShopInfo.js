import Taro from '@tarojs/taro'

import './ShopInfo.less'

import { AtIcon } from 'taro-ui'
import { View } from '@tarojs/components'
import TextUtil from '../../utils/TextUtil'


import shopIcon from '@images/order/icon_shop.png'

export default class ShopInfo extends Taro.Component {

    static defaultProps = {
        shopInfo: {},
        shopName: '',
    }

    static externalClasses = ['class-wrapper']

    render() {
        const { shopInfo, shopName } = this.props
        return (
            <View className='class-wrapper'>
                <View className="shop-layout">
                    <Image className="shop-image" src={shopIcon}> </Image>
                    <View className="content-layout">
                        <View className="shop-name">{shopName}</View>
                        <View className="author-layout">
                            <View className="author-name">店主: {shopInfo.name}</View>
                            <View className="phone">{shopInfo.phone}</View>
                        </View>
                        <View className="address-detail">{TextUtil.formateStringIfEmpty(shopInfo.province) + TextUtil.formateStringIfEmpty(shopInfo.city) + TextUtil.formateStringIfEmpty(shopInfo.district) + TextUtil.formateStringIfEmpty(shopInfo.detailAddress)}</View>

                    </View>

                </View>
            </View>
        )
    }
}
