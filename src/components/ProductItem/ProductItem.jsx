import { Image, Text, View } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './ProductItem.less';
import Taro from '@tarojs/taro';
import PriceView from '../../components/PriceView/price';
import TextUtil from '@utils/TextUtil';
import PriceUtil from '../../utils/PriceUtil';

export default class ProductItem extends Taro.Component {
  static defaultProps = {
    productInfo: {},
    onItemClick: null,
  };
  state = {};

  onItemClick() {
    const { productInfo, onItemClick } = this.props;
    if (onItemClick) {
      onItemClick(productInfo);
    }
  }

  render() {
    const { productInfo } = this.props;
    return (
      <View className="content" onClick={this.onItemClick}>
        <Image className="image" src={productInfo.imageUrl} />
        <View className="right-content">
          <View className="product-name">{productInfo.name}</View>
          <View className="right-bottom-content">
            <View>
              <PriceView price={productInfo.lowShowPrice / 100} size={32} hasSymbol="￥" />
            </View>

            <View className="market-price">￥{PriceUtil.convertToFormatYuan(productInfo.lowOriginPrice)}</View>
            <View className="buy"> 立即购买</View>
          </View>
        </View>
      </View>
    );
  }
}
