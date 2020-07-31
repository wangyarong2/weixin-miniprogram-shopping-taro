import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./EmptyView.less";

import noAddress from '../../assets/images/default/bg_no_address.png'
import noCart from '../../assets/images/default/bg_no_cart.png'
import noMessage from '../../assets/images/default/bg_no_message.png'
import noOrder from '../../assets/images/default/bg_no_order.png'
import noProduct from '../../assets/images/default/bg_no_product.png'
import noShop from '../../assets/images/default/bg_no_shop.png'
import noCard from '../../assets/images/default/bg_no_card.png'
import noContent from '../../assets/images/default/bg_no_content.png'
import noProductUseShopHone from '../../assets/images/default/shop_detail_no_product.png'
import noShopUseSearchResult from '../../assets/images/default/bg_search_result_no_shop.png'

export default class EmptyView extends Taro.Component {
    static defaultProps = {
        type: 0, //1 地址 2无购物车 3 无消息 4无订单 5无商品 6无店铺
        text: '',
    };
    constructor(props) {
        super(props)
    }
    render() {
        const emptyMap = {
          0: {
            text: '',
            image: ''
          },
          1: {
            text: '暂无地址',
            image: noAddress
          },
          2: {
            text: '购物车暂时为空，去添加商品吧',
            image: noCart
          },
          3: {
            text: '暂无消息',
            image: noMessage
          },
          4: {
            text: '暂无订单记录',
            image: noOrder
          },
          5: {
            text: '暂无商品',
            image: noProduct
          },
          6: {
            text: this.props.text || '暂无店铺',
            image: noShop
          },
          7: {
            text: '当前橙卡正在筹备中',
            image: noCard
          },
          8: {
            text: '您还没有购买过卡',
            image: noCard
          },
          9: {
            text: this.props.text || '暂无内容',
            image: noContent
          },
          10: {
            text: this.props.text || '该店铺暂未上传商品',
            image: noProductUseShopHone
          },
          11: {
            text: this.props.text || '搜索结果为空',
            image: noShopUseSearchResult
          }
        }
        return (
            <View className="epmty-view">
              {
                <View className="content-layout">
                    <Image className="image" src={emptyMap[this.props.type].image}></Image>
                    <Text className="type">{emptyMap[this.props.type].text}</Text>
                </View>
              }
            </View>
        )
    }
}
