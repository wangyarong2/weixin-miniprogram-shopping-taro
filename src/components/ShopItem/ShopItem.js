import Taro from '@tarojs/taro'

import './ShopItem.less'

import { AtIcon } from 'taro-ui'
import { View, Image } from '@tarojs/components'
import TextUtil from '../../utils/TextUtil'
import address from "../../assets/images/shop/shop_detail_address.png";




export default class ShopItem extends Taro.Component {

    static defaultProps = {
        shopInfo: {},
        onItemClick: {}
    }

    _getHumanDistanceStr(distance) {
        //与服务端约定返回-1不展示 
        if (distance == -1) return "";
        if (distance > 1000) {
            return Number((distance / 1000).toFixed(2)) + "km";
        } else {
            return distance + "m";
        }
    }


    render() {
        const { shopInfo, onItemClick } = this.props
        return (
            <View className="shop-item" onClick={onItemClick.bind(this, shop)}>
                <View className="shop-img"
                    style={{ background: "#F6F3FB url(" + address + ") no-repeat center", backgroundSize: "34rpx 34rpx" }}>
                    <Image src={shopInfo.logoImage} />
                </View>
                <View className="shop-info-layout">
                    <View className="shop-name">{shopInfo.shopName || ""}</View>

                    <View className="second-category-container">
                        <View className="text">{shopInfo.business || ""}</View>
                        <View className="text">{this._getHumanDistanceStr(shopInfo.distance)}</View>
                    </View>

                    {shopInfo.tips && shopInfo.tips.length
                        &&
                        (
                            <View className="tips-container">
                                {
                                    shopInfo.tips.map(tipStr => {
                                        return <View className="tip"></View>
                                    })
                                }
                            </View>

                        )

                    }

                    <View className="address">{TextUtil.formateStringIfEmpty(shopInfo.province)
                        + TextUtil.formateStringIfEmpty(shopInfo.city)
                        + TextUtil.formateStringIfEmpty(shopInfo.district)
                        + TextUtil.formateStringIfEmpty(shopInfo.detailAddress)}
                    </View>

                    {
                        shopInfo.goodsImage && shopInfo.goodsImage.length
                        &&
                        <View className="shop-detail-image-container">
                            {
                                shopInfo.goodsImage.map(imageUrl => {
                                    return (
                                        <Image className="shop-detail-image" src={imageUrl}></Image>
                                    )
                                })
                            }

                        </View>


                    }

                </View>
            </View>
        )

    }
}
