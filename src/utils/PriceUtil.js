import Taro from '@tarojs/taro';
import TextUtil from './TextUtil';

class PriceUtil {
  /**
   * priceNumber 为整数，不作处理；
   * priceNumber 带小数，四舍五入保留两位小数；
   */
  static convertToFormatYuan(priceNumber) {
    if (priceNumber == 0) return 0;
    const priceFormatYuan = priceNumber / 100;
    if (Number.isInteger(priceFormatYuan)) {
      return priceFormatYuan;
    } else {
      return parseFloat(priceFormatYuan).toFixed(2);
    }
  }
}
export default PriceUtil;
