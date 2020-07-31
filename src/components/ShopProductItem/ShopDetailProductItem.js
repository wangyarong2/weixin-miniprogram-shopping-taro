import Taro from '@tarojs/taro'
import XPage from '@src/components/XPage/XPage'
import { Text, View, Image } from '@tarojs/components'
import './ShopProductItem.less'
import PriceView from '../PriceView/price'

/**
 * Date:  2020-02-25
 * Time:  12:14
 * Author: jianglong
 * -----------------------------
 * 店铺详情页的商品item
 */
export default class ShopDetailProductItem extends XPage {

    static defaultProps = {
        product: {}
    }

    onProductClick(product) {

        if (product.promotionSpu + '' == 'true') {
            if (product.promotionInfo.promotionType == 1) {
                this.goPage({ url: 'groupBuy/groupBuyProductDetail', params: { templateId: product.promotionInfo.templateId, shopId: product.shopId, fromProductItem: true } })
            }
            if (product.promotionInfo.promotionType == 5) {
                this.goPage({ url: 'limitBuyGoodsDetail', params: { templateId: product.promotionInfo.templateId, shopId: product.shopId, fromProductItem: true } })
            }
        } else {
            this.goPage({
                url: 'goodsDetail',
                params: {
                    spuId: product.spuId,
                    shopId: product.shopId,
                    fromProductItem: true
                }
            })
        }
    }

    render() {
        const { product } = this.props
        return (
            <View className="item" onClick={this.onProductClick.bind(this, product)}>
                <Image className="image" src={product.imageUrl}></Image>
                <View className="info-layout">
                    <View className="title">{product.name}</View>
                    <View className="tip-container">
                        {
                            product.deliveryTypeTitleList.map((itemTip) => {
                                return <View className="delivery-item">{itemTip}</View>
                            })
                        }
                    </View>
                    {
                        product.promotionSpu + '' == 'true'
                        &&
                        <View className="price-layout">
                            <View className="left-layout">
                                <PriceView price={product.promotionInfo.lowActivePrice / 100} size={48} afterSize={32} hasSymbol='￥' />
                                {
                                    (product.promotionInfo.promotionType == 5
                                        || product.promotionInfo.promotionType == 1)
                                    &&
                                    <View className='special-price'>{product.promotionInfo.promotionType == 5 ? "特价" : "拼团"}</View>
                                }

                            </View>
                            <View className="market-price">￥{product.highOriginPrice / 100}</View>
                        </View>
                    }
                    {
                        (product.promotionSpu == null || product.promotionSpu + '' == 'false') &&
                        <View className="price-layout">
                            <View className="left-layout">
                                <PriceView price={product.showUnitPrice / 100} size={48} afterSize={32} hasSymbol='￥' />
                                <View className='special-price'>券后价</View>
                            </View>
                            <View className="market-price">￥{product.highOriginPrice / 100}</View>
                        </View>
                    }


                </View>
            </View>
        )
    }
}
