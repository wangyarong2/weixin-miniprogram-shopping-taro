import { Image, Text, View } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './ProductSortView.less';
import Taro from '@tarojs/taro';
import { AtIcon } from 'taro-ui';
import PriceView from '../../components/PriceView/price';
import TextUtil from '@utils/TextUtil';
import PriceUtil from '../../utils/PriceUtil';

/**
 * 商品列表排序
 */
export default class ProductSortView extends Taro.Component {
  static defaultProps = {
    text: '',
    onClickCallback: null,
  };
  state = {
    ascending: null, // null:未选择  true:升序   false：降序
  };

  filterItemClick() {
    const { ascending } = this.state;
    let newAscending;
    if (ascending === null) {
      newAscending = true;
    } else {
      newAscending = !ascending;
    }

    this.setState(
      {
        ascending: newAscending,
      },
      () => {
        if (this.props.onClickCallback) {
          this.props.onClickCallback(newAscending);
        }
      }
    );
  }

  getSortStatus() {
    return this.state.ascending;
  }

  /**
   * 重置状态
   */
  resetStatus(successCallback) {
    this.setState(
      {
        ascending: null,
      },
      () => {
        if (successCallback) {
          successCallback();
        }
      }
    );
  }
  render() {
    const { text } = this.props;
    const { ascending } = this.state;
    return (
      <View className="filter-item" onClick={this.filterItemClick.bind(this)}>
        <View className="text">{text}</View>
        <View className="sort-image-layout">
          <AtIcon
            prefixClass="icon"
            value="shangjiantou"
            size="5"
            color={ascending != null && ascending ? '#FF6400' : '#333'}
          />
          <AtIcon
            prefixClass="icon"
            value="xiajiantou"
            size="5"
            color={ascending != null && !ascending ? '#FF6400' : '#333'}
          />
        </View>
      </View>
    );
  }
}
