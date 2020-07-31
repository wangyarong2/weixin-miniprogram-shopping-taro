import { Image, Input, Text, View } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './CategoryProductListView.less';
import Taro from '@tarojs/taro';
import { AtDrawer, AtIcon } from 'taro-ui';
import request from '@src/servers/http';

import GuidePage from '@src/components/GuidePage/GuidePage';
import ProductItem from '@src/components/ProductItem/ProductItem';

/**
 * 分类的商品列表
 */
export default class CategoryProductListView extends XPage {
  static defaultProps = {
    loadDataResultCallback: null, //数据加载成功回调
    marginTop: '176rpx',
    isShowBlankPage: false, //是否展示空白页
  };
  state = {
    productList: [], //列表数据
    hasMoreData: false, //是否有更多数据
    pageNo: 1,
    pageSize: 10,
  };

  loadMoreData(reqParams) {
    if (this.state.hasMoreData) {
      this.requestProductList(false, reqParams);
    }
  }
  resetStatus() {
    this.setState({
      productList: [], //列表数据
      hasMoreData: false, //是否有更多数据
      pageNo: 1,
      pageSize: 10,
    });
  }
  hasOrderData(reqParams) {
    if (reqParams.orders == null || reqParams.orders.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  requestProductList(isPullRefresh, reqParams) {
    let { pageNo, pageSize } = this.state;
    pageNo = isPullRefresh ? 1 : (pageNo += 1);
    const requestData = {
      ...reqParams,
      pageNo,
      pageSize,
    };
    if (!this.hasOrderData(requestData)) {
      requestData.orders = [{ orderKey: 'default', sort: 'desc' }];
    }

    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request
      .post('/community-client/miniapp/goods/condition/list', requestData)
      .then((res) => {
        Taro.hideLoading();
        Taro.stopPullDownRefresh();
        let { productList } = this.state;
        const data = res.data;

        if (isPullRefresh) {
          productList = data.list == null ? [] : data.list;
        } else {
          let resultList = data.list;
          if (resultList != null && resultList.length > 0) {
            //有更多数据
            productList = productList.concat(resultList);
          }
        }
        this.setState({
          hasMoreData: pageNo * pageSize < res.data.totalSize,
          productList,
          pageNo,
        });
        //加载成功回调
        if (this.props.loadDataResultCallback) {
          this.props.loadDataResultCallback(true, productList.length === 0);
        }
      })
      .catch(() => {
        Taro.hideLoading();
        Taro.stopPullDownRefresh();
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
  isEmpty(productList) {
    if (null == productList) return true;
    if (productList.length == 0) return true;
    return false;
  }

  render() {
    const { productList } = this.state;
    const { marginTop, isShowBlankPage } = this.props;
    return (
      <View className="list" style={{ marginTop: marginTop }}>
        {this.isEmpty(productList) && <GuidePage type={isShowBlankPage ? 9 : 3} />}
        {!this.isEmpty(productList) &&
          productList.map((item, index) => {
            return <ProductItem productInfo={item} key={'id' + index} onItemClick={this.onBuyNowClick.bind(this)} />;
          })}
      </View>
    );
  }
}
