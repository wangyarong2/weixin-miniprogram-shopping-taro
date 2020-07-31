import XPage from '@src/components/XPage/XPage';
import { View, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import PriceView from '@src/components/PriceView/price';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import './goodsCategoryDetail.less';
import { get as getGlobalData } from '@utils/globalData';
import request from '@src/servers/http';
import GuidePage from '@src/components/GuidePage/GuidePage';

import CategoryProductListView from '@src/components/CategoryProductListView/CategoryProductListView';
import FilterToolBarView from '@src/components/FilterToolBarView/FilterToolBarView';

import { FILTER_KEY_CATEGORY } from '@src/constants/filters';

/**
 *通用分类
 */
class goodsCategoryDetail extends XPage {
  config = {
    navigationBarTitleText: '',
    enablePullDownRefresh: true,
  };

  state = {
    scrollIndex: 'id10000',
    categoryTabIndex: 0,
    currentSelectCategoryId: -1, //当前选中的categoryid
    categoryTabs: [],
    filters: [],
  };

  componentDidMount() {
    const categoryId = this.$router.params.categoryId;
    this.setState(
      {
        currentSelectCategoryId: categoryId,
      },
      () => {
        this.getCategoryList(this.$router.params.parentCategoryId);
      }
    );
  }

  //分类列表
  getCategoryList(parentCategoryId) {
    this.showLoading();
    request.post('/community-client/front/cate/byParent', { parentId: parentCategoryId }).then((res) => {
      this.hideLoading();
      Taro.setNavigationBarTitle({
        title: res.data.parentCateName || '',
      });

      let { categoryTabs } = this.state;
      categoryTabs = categoryTabs.concat(res.data.childrenList);
      this.setState(
        {
          categoryTabs,
        },
        () => {
          this.onTabHandle(this.findIndexByCategoryId(categoryTabs));
        }
      );
    });
  }

  findIndexByCategoryId(categoryTabs) {
    const { currentSelectCategoryId } = this.state;
    if (!currentSelectCategoryId) return 0;
    return categoryTabs.findIndex((item) => {
      return item.childrenId == currentSelectCategoryId;
    });
  }

  onSearchProductClick() {
    this.goPage({
      url: 'product/searchProduct',
    });
  }

  onTabHandle(index) {
    const { categoryTabs } = this.state;
    this.setState(
      {
        categoryTabIndex: index,
        currentSelectCategoryId: categoryTabs[index].childrenId,
      },
      () => {
        this.setState(
          {
            scrollIndex: 'id' + index,
          },
          () => {
            this.filterToolBarView.resetViewStatus(this.state.currentSelectCategoryId);
          }
        );
      }
    );
  }

  generateReqParams() {
    const { currentSelectCategoryId } = this.state;
    let filters = [];
    filters.push({ filterType: FILTER_KEY_CATEGORY, filterKeyList: [currentSelectCategoryId] });
    return { filters };
  }

  productListRef = (node) => (this.productListView = node);
  filterToolBarRef = (node) => (this.filterToolBarView = node);

  loadDataResultCallback(isLoadSuccess) {
    this.setState({
      pageShowResult: isLoadSuccess,
    });
  }

  onDrawerShowCallback(isShowRightDrawer) {}

  //FilterToolBarView  选择条件后回调
  onSelectedResult(coditionS) {
    this.productListView.requestProductList(true, coditionS);
  }

  onReachBottom() {
    this.productListView.loadMoreData(this.generateReqParams());
  }

  onPullDownRefresh() {
    this.productListView.requestProductList(true, this.generateReqParams());
  }

  render() {
    const {
      categoryTabs,
      categoryTabIndex,
      scrollIndex,
      filters,
      lastSelectedOriginData,
      currentSelectCategoryId,
    } = this.state;
    return (
      <View className="category-detail-page">
        <View className="top-layout">
          <ScrollView scrollIntoView={scrollIndex} className="category-tab" scrollX scrollWithAnimation>
            {categoryTabs.map((item, index) => {
              return (
                <View
                  id={'id' + index}
                  key={index}
                  className={`item-list ${index === categoryTabIndex ? 'selected common-bg-linear-gradient' : ''}`}
                  onClick={this.onTabHandle.bind(this, index)}
                >
                  {item.childrenCateName}
                </View>
              );
            })}
          </ScrollView>
          <FilterToolBarView
            ref={this.filterToolBarRef}
            categoryId={currentSelectCategoryId}
            onDrawerShowCallback={this.onDrawerShowCallback.bind(this)}
            resultCallback={this.onSelectedResult.bind(this)}
          />
        </View>
        <View className="bottom-layout">
          <CategoryProductListView ref={this.productListRef} />
        </View>
      </View>
    );
  }
}

export default XPage.connectFields()(goodsCategoryDetail);
