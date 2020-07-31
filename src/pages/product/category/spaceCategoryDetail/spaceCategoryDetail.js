import XPage from '@src/components/XPage/XPage';
import { View, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import PriceView from '@src/components/PriceView/price';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import './spaceCategoryDetail.less';
import { get as getGlobalData } from '@utils/globalData';
import request from '@src/servers/http';
import GuidePage from '@src/components/GuidePage/GuidePage';

import CategoryProductListView from '@src/components/CategoryProductListView/CategoryProductListView';
import FilterToolBarView from '@src/components/FilterToolBarView/FilterToolBarView';
import CategoryTabList from '@src/components/CategoryTabList/CategoryTabList';
import { FILTER_KEY_APPLICABLE_SPACE } from '@src/constants/filters';

/**
 * Author: jianglong
 * -----------------------------
 * 空间分类
 * 页面参数：spaceId=''&spaceName=''
 */
class spaceCategoryDetail extends XPage {
  config = {
    navigationBarTitleText: '',
    enablePullDownRefresh: true,
  };

  state = {
    coditionS: {},
    currentSelectCategoryId: '', //当前选中的categoryid
  };

  componentDidMount() {
    const spaceId = this.$router.params.spaceId;
    Taro.setNavigationBarTitle({
      title: this.$router.params.spaceName || '',
    });
  }

  onSearchProductClick() {
    this.goPage({
      url: 'product/searchProduct',
    });
  }

  productListRef = (node) => (this.productListView = node);
  filterToolBarRef = (node) => (this.filterToolBarView = node);

  onDrawerShowCallback(isShowRightDrawer) {
    this.setState({
      isShowRightDrawer,
    });
  }

  //FilterToolBarView  选择条件后回调
  onSelectedResult(coditionS) {
    this.setState(
      {
        coditionS,
        isShowRightDrawer: false,
      },
      () => {
        this.productListView.requestProductList(true, coditionS);
      }
    );
  }
  onTabClick(categoryId) {
    this.setState(
      {
        currentSelectCategoryId: categoryId,
      },
      () => {
        this.filterToolBarView.resetViewStatus();
      }
    );
  }

  onReachBottom() {
    this.productListView.loadMoreData(this.state.coditionS);
  }

  onPullDownRefresh() {
    const { coditionS } = this.state;
    this.productListView.requestProductList(true, coditionS);
  }

  render() {
    const { currentSelectCategoryId } = this.state;
    const spaceId = this.$router.params.spaceId;
    return (
      <View className="category-detail-page">
        <View className="top-layout">
          <CategoryTabList spaceId={spaceId} onTabClickCallback={this.onTabClick.bind(this)} />
          <FilterToolBarView
            ref={this.filterToolBarRef}
            spaceId={spaceId}
            isShow={currentSelectCategoryId ? true : false}
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

export default XPage.connectFields()(spaceCategoryDetail);
