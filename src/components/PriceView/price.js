import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './price.less';
import TextUtil from '../../utils/TextUtil';

export default class PriceView extends Taro.Component {
  static defaultProps = {
    price: 0.0, // 单位 元
    size: 28,
    hasSymbol: '', // 是否需要显示￥
    color: '', //字体颜色
  };
  render() {
    const { price = 0, size, afterSize, hasSymbol, color } = this.props;
    const _afterSize = afterSize ? afterSize : size - 8;
    const priceText = parseFloat(price).toFixed(2);
    const [pointBeforeText, pointAfterText] = priceText.split('.');
    return (
      <View className="price-wrapper">
        <Text className="red-color" style={{ fontSize: _afterSize + 'rpx', color: color ? color : '#FF6400' }}>
          {hasSymbol && '¥'}
        </Text>
        <Text className="red-color" style={{ fontSize: size + 'rpx', color: color ? color : '#FF6400' }}>
          {Number.isInteger(price) ? price : pointBeforeText || '0'}
        </Text>
        {!Number.isInteger(price) && (
          <View style={{ display: 'inline-block' }}>
            <Text className="red-color" style={{ fontSize: _afterSize + 'rpx', color: color ? color : '#FF6400' }}>
              .
            </Text>
            <Text className="red-color" style={{ fontSize: _afterSize + 'rpx', color: color ? color : '#FF6400' }}>
              {pointAfterText}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
