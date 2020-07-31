import { View, Text, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import XPage from '@src/components/XPage/XPage';

import './OrderProductItem.less';
import SpecTranslateUtil from '../../utils/SpecTranslateUtil';
import { DELIVERY_TYPE_TEXT } from '@src/constants/common';

import meiBaoPrice from '../../assets/images/product/icon_meibao_price.png';
import TextUtil from '../../utils/TextUtil';
import AfterCouponPriceIcon from '../AfterCouponPrice/AfterCouponPrice';
import PriceView from '../../components/PriceView/price';

/**
 * Date:  2020-04-21
 * Time:  12:14
 * Author: jianglong
 * -----------------------------
 * 订单中使用
 */
export default class OrderProductItem extends XPage {
  static defaultProps = {
    skuInfo: {},
    orderInfo: {},
    canJumpToGoodsDetailPage: false,
  };
  state = {};

  getHintText(orderInfo, skuInfo) {
    if (orderInfo.orderStatus === 1) {
      if (!isNaN(skuInfo.deliveryIn)) {
        return `预计发货时间：付款后${Math.round(skuInfo.deliveryIn / (24 * 60 * 60 * 1000))}天内`;
      }
    } else if (orderInfo.orderStatus === 2 || orderInfo.orderStatus === 150) {
      if (skuInfo.expectDeliveryTime != null) {
        return '预计发货日期：' + TextUtil.formatDateWithYMD(skuInfo.expectDeliveryTime);
      }
    }
    return '';
  }

  onJumpToGoodsDetailPage(skuInfo) {
    const { canJumpToGoodsDetailPage } = this.props;
    if (canJumpToGoodsDetailPage) {
      this.goPage({
        url: 'goodsDetail',
        params: {
          spuId: skuInfo.spuId,
          shopId: Taro.getStorageSync('currentShopId'),
        },
      });
    }
  }

  render() {
    const { skuInfo, orderInfo } = this.props;
    const price = skuInfo.unitPrice / 100;
    const priceText = parseFloat(price).toFixed(2);
    const [pointBeforeText, pointAfterText] = priceText.split('.');

    const groupPrice = skuInfo.activityPrice / 100;
    const groupPriceText = parseFloat(groupPrice).toFixed(2);
    const [groupBeforeText, groupAfterText] = groupPriceText.split('.');

    return (
      <View className="item">
        <View className="product-info-layout" onClick={this.onJumpToGoodsDetailPage.bind(this, skuInfo)}>
          <View className="product-image-layout">
            <Image className="product-image" src={skuInfo.spuImage} />
            {orderInfo.deliveryType === 1 && (
              <Text className="send-type">{DELIVERY_TYPE_TEXT[orderInfo.deliveryType]}</Text>
            )}
          </View>
          <View className="product-right-content">
            <View className="line-1">
              <View className="product-name">{skuInfo.spuName}</View>
              <View style={{ paddingTop: '25rpx' }}>
                <PriceView price={skuInfo.unitPrice / 100} size={32} hasSymbol="￥" />
              </View>
            </View>
            <View className="line-2">
              <Text className="spec">{SpecTranslateUtil.translateSpecToText(skuInfo.skuSpecDesc)}</Text>
              <Text className="product-count">X{skuInfo.skuNumber}</Text>
            </View>
            {/*{this.isShowHint(orderInfo.orderStatus) && (*/}
            <View className="line-3">{this.getHintText(orderInfo, skuInfo)}</View>
            {/*)}*/}
          </View>
        </View>
        <View className="emark-layout">
          <View className="remark-text">订单备注：</View>
          <Text className="remark-input">{TextUtil.isEmpty(skuInfo.userRemark) ? '无' : skuInfo.userRemark}</Text>
        </View>
      </View>
    );
  }
}
