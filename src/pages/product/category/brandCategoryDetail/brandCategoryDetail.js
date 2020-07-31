import XPage from '@src/components/XPage/XPage';
import { View } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import PriceView from '@src/components/PriceView/price';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import './brandCategoryDetail.less';
import { get as getGlobalData } from '@utils/globalData';
import request from '@src/servers/http';
import GuidePage from '@src/components/GuidePage/GuidePage';

import ProductItem from '@src/components/ProductItem/ProductItem';
import ProductSortView from '@src/components/ProductSortView/ProductSortView';
import CategoryProductListView from '@src/components/CategoryProductListView/CategoryProductListView';

const FILTER_KEY_BRAND = 'brand';

/**
 * 品牌分类
 */
class brandCategoryDetail extends XPage {
  config = {
    navigationBarTitleText: '',
    enablePullDownRefresh: true,
  };

  state = {
    brandId: '',
  };

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: this.$router.params.categoryName,
    });
    this.setState(
      {
        brandId: this.$router.params.categoryId,
      },
      () => {
        this.onPullDownRefresh();
      }
    );
  }

  onPullDownRefresh() {
    this.productListView.requestProductList(true, this.generateReqParams());
  }

  generateReqParams() {
    const { brandId } = this.state;
    let filters = [];
    filters.push({ filterType: FILTER_KEY_BRAND, filterKeyList: [brandId] });
    return { filters };
  }

  getProductById(refresh) {
    let { pageNo, pageSize, categoryTabs, categoryTabIndex } = this.state;
    if (refresh) {
      pageNo = 1;
    } else {
      pageNo += 1;
    }
    const requestData = {
      frontCateId: categoryTabs[categoryTabIndex].categoryId,
      pageSize: pageSize,
      pageNo: pageNo,
      shopId: Taro.getStorageSync('currentShopId'),
    };
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request.post('/community-client/miniapp/goods/home/list', requestData).then((res) => {
      Taro.hideLoading();
      Taro.stopPullDownRefresh();
      let { productList } = this.state;
      if (refresh) {
        productList = res.list == null ? [] : res.list;
      } else {
        let resultList = res.list;
        if (resultList != null && resultList.length > 0) {
          //有更多数据
          productList = productList.concat(resultList);
        }
      }
      this.setState({
        noMoreData: pageNo * pageSize >= res.totalSize,
        productList: productList,
        pageNo,
      });
    });
  }

  onSearchProductClick() {
    this.goPage({
      url: 'product/searchProduct',
    });
  }

  onBuyNowClick(product) {
    this.goPage({
      url: 'goodsDetail',
      params: {
        spuId: product.spuId,
        shopId: Taro.getStorageSync('currentShopId'),
      },
    });
  }

  onTabHandle(index) {
    this.setState(
      {
        currentSelectedCategoryIndex: index,
      },
      () => {
        this.setState({
          scrollIndex: 'id' + index,
        });
        this.onPullDownRefresh();
      }
    );
  }

  sortTimeRef = (node) => (this.sortTimeView = node);
  sortPriceRef = (node) => {
    this.sortPriceView = node;
  };
  sortSaleRef = (node) => {
    this.sortSaleView = node;
  };

  onSortTimeClick(isAscending) {
    this.changeSortStatus(this.sortTimeView, isAscending);
  }
  onSortPriceClick(isAscending) {
    this.changeSortStatus(this.sortPriceView, isAscending);
  }
  onSortSaleClick(isAscending) {
    this.changeSortStatus(this.sortSaleView, isAscending);
  }
  changeSortStatus(changeView, isAscending) {
    if (this.sortTimeView === changeView) {
      this.sortPriceView.resetStatus();
      this.sortSaleView.resetStatus();
    }

    if (this.sortPriceView === changeView) {
      this.sortTimeView.resetStatus();
      this.sortSaleView.resetStatus();
    }

    if (this.sortSaleView === changeView) {
      this.sortTimeView.resetStatus();
      this.sortPriceView.resetStatus();
    }
    //todo 请求网络
  }

  productListRef = (node) => (this.productListView = node);

  onReachBottom() {
    this.productListView.loadMoreData(this.generateReqParams());
  }

  render() {
    const { categoryTabs, categoryTabIndex, scrollIndex, productList } = this.state;
    return (
      <View className="category-detail-page">
        {/*<View className="top-layout">*/}
        {/*  <View className="search-layout" onClick={this.onSearchProductClick}>*/}
        {/*    <View className="search-bg">*/}
        {/*      <AtIcon prefixClass="icon" value="sousuo" size="16" color="#666666" />*/}
        {/*      <View className="search-text">搜索商品</View>*/}
        {/*    </View>*/}
        {/*    <View className="button">搜索</View>*/}
        {/*  </View>*/}
        {/*  /!*<View className="sort-layout">*!/*/}
        {/*  /!*  <ProductSortView*!/*/}
        {/*  /!*    text={'上架时间'}*!/*/}
        {/*  /!*    ref={this.sortTimeRef}*!/*/}
        {/*  /!*    onClickCallback={this.onSortTimeClick.bind(this)}*!/*/}
        {/*  /!*  />*!/*/}
        {/*  /!*  <ProductSortView text={'价格'} ref={this.sortPriceRef} onClickCallback={this.onSortPriceClick.bind(this)} />*!/*/}
        {/*  /!*  <ProductSortView text={'销量'} ref={this.sortSaleRef} onClickCallback={this.onSortSaleClick.bind(this)} />*!/*/}
        {/*  /!*</View>*!/*/}
        {/*</View>*/}
        <View className="bottom-layout">
          <CategoryProductListView marginTop={'0rpx'} ref={this.productListRef} />
        </View>
      </View>
    );
  }
}

export default XPage.connectFields()(brandCategoryDetail);
