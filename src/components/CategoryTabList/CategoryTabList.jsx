import { View, ScrollView } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './CategoryTabList.less';
import request from '@src/servers/http';

import { FILTER_KEY_APPLICABLE_SPACE } from '@src/constants/filters';

/**

 * Author: jianglong
 * -----------------------------
 * 搜索页、空间类目详情
 */

class CategoryTabList extends XPage {
  static defaultProps = {
    searchKey: '', //搜索页
    spaceId: '', //空间页使用
    onTabClickCallback: null,
    getTabResultEmptyCallback: null, //tab列表为空的回调
  };
  config = {
    navigationBarTitleText: '',
  };

  state = {
    currentSelectedCategoryId: null,
    currentSelectedCategoryIndex: 'id10000',
    scrollIndex: 0,
    categoryList: [],
  };

  componentDidMount() {
    const { searchKey, spaceId } = this.props;
    if (searchKey || spaceId) {
      this.getCategoryList();
    }
  }

  /**
   * 分类列表
   */
  getCategoryList() {
    const { getTabResultEmptyCallback } = this.props;
    request.post('/community-client/filter/categoryList', this.generateReqParams()).then((res) => {
      this.setState(
        {
          categoryList: res,
        },
        () => {
          if (res && res.length) {
            //标记选中第一个
            this.onCategoryClick(0);
          } else {
            if (getTabResultEmptyCallback) {
              getTabResultEmptyCallback();
            }
          }
        }
      );
    });
  }

  generateReqParams() {
    const params = { filters: [] };
    const { searchKey, spaceId } = this.props;
    if (searchKey) {
      params.searchKey = searchKey;
    }

    if (spaceId) {
      params.filters.push({ filterType: FILTER_KEY_APPLICABLE_SPACE, filterKeyList: [spaceId] });
    }

    return params;
  }

  onCategoryClick(cateoryIndex) {
    const { onTabClickCallback } = this.props;
    const { categoryList } = this.state;

    this.setState(
      {
        currentSelectedCategoryIndex: cateoryIndex,
        currentSelectedCategoryId: categoryList[cateoryIndex].id,
      },
      () => {
        this.setState(
          {
            scrollIndex: 'id' + cateoryIndex,
          },
          () => {
            if (onTabClickCallback) {
              onTabClickCallback(this.state.currentSelectedCategoryId);
            }
          }
        );
      }
    );
  }

  render() {
    const { categoryList } = this.state;
    const { currentSelectedCategoryIndex, scrollIndex } = this.state;
    return categoryList && categoryList.length > 0 ? (
      <ScrollView scrollIntoView={scrollIndex} className="tab-list" scrollX scrollWithAnimation>
        {categoryList.map((item, index) => {
          return (
            <View
              id={'id' + index}
              key={index}
              className={`item-list ${
                index === currentSelectedCategoryIndex ? 'selected common-bg-linear-gradient' : ''
              }`}
              onClick={this.onCategoryClick.bind(this, index)}
            >
              {item.name}
            </View>
          );
        })}
      </ScrollView>
    ) : null;
  }
}

export default XPage.connectFields()(CategoryTabList);
