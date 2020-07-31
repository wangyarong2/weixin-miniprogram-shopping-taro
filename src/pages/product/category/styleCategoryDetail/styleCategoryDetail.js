import XPage from '@src/components/XPage/XPage';
import { View } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import PriceView from '@src/components/PriceView/price';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import './styleCategoryDetail.less';
import { get as getGlobalData } from '@utils/globalData';
import request from '@src/servers/http';
import GuidePage from '@src/components/GuidePage/GuidePage';

import ProductItem from '@src/components/ProductItem/ProductItem';
import FilterToolBarView from '@src/components/FilterToolBarView/FilterToolBarView';
import CategoryProductListView from '@src/components/CategoryProductListView/CategoryProductListView';

const FILTER_KEY_SYTLE = 'style';

/**
 * 风格分类
 */
class styleCategoryDetail extends XPage {
  config = {
    navigationBarTitleText: '',
    enablePullDownRefresh: true,
  };

  state = {
    styleId: '',
    coditionS: {}, //搜索商品的条件
    isShowRightDrawer: false,
  };

  componentDidMount() {
    const styleId = this.$router.params.categoryId;
    Taro.setNavigationBarTitle({
      title: this.$router.params.categoryName,
    });
    this.setState(
      {
        styleId,
        coditionS: { filters: [{ filterType: FILTER_KEY_SYTLE, filterKeyList: [styleId] }] },
      },
      () => {
        this.filterToolBarView.resetViewStatus();
      }
    );
  }

  onPullDownRefresh() {
    const { coditionS } = this.state;
    this.productListView.requestProductList(true, coditionS);
  }

  onSearchProductClick() {
    this.goPage({
      url: 'product/searchProduct',
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
  productListRef = (node) => (this.productListView = node);
  filterToolBarRef = (node) => (this.filterToolBarView = node);

  onDrawerShowCallback(isShowRightDrawer) {
    this.setState({
      isShowRightDrawer,
    });
  }
  onReachBottom() {
    this.productListView.loadMoreData(this.state.coditionS);
  }

  render() {
    const { styleId, isShowRightDrawer } = this.state;
    return (
      <View className="category-detail-page" style={{ position: isShowRightDrawer ? 'fixed' : 'none' }}>
        <View className="top-layout">
          <View className="search-layout">
            <View className="search-bg" onClick={this.onSearchProductClick}>
              <AtIcon prefixClass="icon" value="sousuo" size="16" color="#666666" />
              <View className="search-text">搜索商品</View>
            </View>
          </View>
          <FilterToolBarView
            styleId={styleId}
            ref={this.filterToolBarRef}
            onDrawerShowCallback={this.onDrawerShowCallback.bind(this)}
            resultCallback={this.onSelectedResult.bind(this)}
          />
        </View>
        <CategoryProductListView marginTop={`${88 + 64}rpx`} ref={this.productListRef} />
      </View>
    );
  }
}

export default XPage.connectFields()(styleCategoryDetail);
