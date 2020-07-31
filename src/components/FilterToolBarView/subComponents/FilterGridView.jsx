import { ScrollView, View } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './FilterGridView.less';

/**

 * Author: jianglong
 * -----------------------------
 *
 */

class FilterGridView extends XPage {
  static defaultProps = {
    dataList: [],
    itemClickCallback: null,
    selectedId: null,
  };
  config = {
    navigationBarTitleText: '',
  };

  state = {};
  onItemClick(id) {
    const { itemClickCallback } = this.props;
    if (null != itemClickCallback) {
      itemClickCallback(id);
    }
  }

  render() {
    const { dataList, selectedId } = this.props;
    return (
      <ScrollView scrollY scrollWithAnimation className="scroll-view">
        <View className="grid-layout">
          {dataList &&
            dataList.map((item, index) => {
              return (
                <View
                  className={`grid-item ${selectedId == (item.id || item.brandId) ? ' selected' : ''}`}
                  onClick={this.onItemClick.bind(this, item.id || item.brandId)}
                  style={{ marginRight: '18rpx' }}
                >
                  {item.name || item.brandName}
                </View>
              );
            })}
        </View>
      </ScrollView>
    );
  }
}

export default XPage.connectFields()(FilterGridView);
