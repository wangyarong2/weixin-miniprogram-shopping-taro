import { View } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';

/**

 * Author: jianglong
 * -----------------------------
 * MISSION
 */

class template extends XPage {
  static defaultProps = {};
  config = {
    navigationBarTitleText: '',
  };

  state = {};

  render() {
    return <View></View>;
  }
}

export default XPage.connectFields()(template);
