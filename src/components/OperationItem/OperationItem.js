import { View, Text } from '@tarojs/components';
import { AtIcon } from 'taro-ui';

import './OperationItem.less';

/**
 * Date:  2020-02-25
 * Time:  12:14
 * Author: jianglong
 * -----------------------------
 * 列表中用于选择数据用
 */
export default class OperationItem extends Taro.Component {
  static defaultProps = {
    labelStr: '',
    content: '',
    onClick: null,
  };
  onClick() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    const { content, labelStr } = this.props;
    return (
      <View className="item" onClick={this.onClick}>
        <Text className="label">{labelStr}</Text>
        <Text className="select-content">{content}</Text>

        <AtIcon prefixClass="icon" value="gengduo1" size="8" color="#333" />
      </View>
    );
  }
}
