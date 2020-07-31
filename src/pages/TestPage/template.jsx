import { View } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';

/**

 * Author: jianglong
 * -----------------------------
 * 用于测试动画
 */

class testPage extends XPage {
  static defaultProps = {};
  config = {
    navigationBarTitleText: '',
  };

  state = {};

  render() {
    return <View></View>;
  }
}

export default XPage.connectFields()(testPage);
