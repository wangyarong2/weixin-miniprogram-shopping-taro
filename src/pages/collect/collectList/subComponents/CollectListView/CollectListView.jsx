import { Image, View } from '@tarojs/components';

import XPage from '@src/components/XPage/XPage';
import Taro from '@tarojs/taro';
import { AtSwipeAction } from 'taro-ui';

import { COLLECT_TAB_TYPE_LISTING, COLLECT_TAB_TYPE_GOODS } from '@src/constants/common';

import './CollectListView.less';
import request from '@src/servers/http';
import GuidePage from '@src/components/GuidePage/GuidePage';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import ProductItem from '@src/components/ProductItem/ProductItem';
import PriceView from '../../../../../components/PriceView/price';
import PriceUtil from '../../../../../utils/PriceUtil';
import CollectGoodsView from '../CollectGoodsView/CollectGoodsView';
import CollectListingView from '../CollectFolderView/CollectFolderView';

/**

 * Author: jianglong
 * -----------------------------
 * 收藏列表
 */
class CollectListView extends XPage {
  static defaultProps = {
    loadDataResultCallback: null, //数据加载成功回调
    tabType: null,
  };
  state = {
    productList: [], //列表数据
    hasMoreData: false, //是否有更多数据
    pageNo: 1,
    pageSize: 10,
    isShow: false,
  };
  componentDidMount() {
    this.requestData(true);
  }

  loadMoreData(reqParams) {
    if (this.state.hasMoreData) {
      this.requestData(false, reqParams);
    }
  }

  resetStatus() {
    this.setState({
      productList: [], //列表数据
      hasMoreData: false, //是否有更多数据
      pageNo: 1,
      pageSize: 15,
    });
  }

  hasOrderData(reqParams) {
    if (reqParams.orders == null || reqParams.orders.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  updateViewStatus(isShow) {
    console.log(isShow);
    this.setState({
      isShow,
    });
  }
  requestProductList(isPullRefresh, reqParams, pageNo) {
    let { pageSize } = this.state;
    request.post('/community-client/good/follow/list', reqParams).then((res) => {
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
        this.props.loadDataResultCallback(true);
      }
    });
  }

  requestData(isPullRefresh, reqParams) {
    let { pageNo, pageSize } = this.state;
    pageNo = isPullRefresh ? 1 : (pageNo += 1);
    const requestData = {
      ...reqParams,
      pageNo,
      pageSize,
    };

    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });

    if (this.props.tabType === COLLECT_TAB_TYPE_GOODS) {
      this.requestProductList(isPullRefresh, requestData, pageNo);
    } else {
      this.requestFolderList(isPullRefresh, requestData, pageNo);
    }
  }
  requestFolderList(isPullRefresh, reqParams, pageNo) {
    let { pageSize } = this.state;
    request.post('/community-client/folder/flow/page', reqParams).then((res) => {
      Taro.hideLoading();
      Taro.stopPullDownRefresh();
      let { productList } = this.state;

      if (isPullRefresh) {
        productList = res.list == null ? [] : res.list;
      } else {
        let resultList = res.list;
        if (resultList != null && resultList.length > 0) {
          //有更多数据
          productList = productList.concat(resultList);
        }
      }
      this.setState({
        hasMoreData: pageNo * pageSize < res.totalSize,
        productList,
        pageNo,
      });
      //加载成功回调
      if (this.props.loadDataResultCallback) {
        this.props.loadDataResultCallback(true);
      }
    });
  }

  isEmpty(productList) {
    if (null == productList) return true;
    if (productList.length === 0) return true;
    return false;
  }

  render() {
    const { productList, isShow } = this.state;
    const { marginTop, tabType } = this.props;
    return (
      <View className="list" style={{ display: isShow ? 'block' : 'none' }}>
        {this.isEmpty(productList) && <GuidePage type={tabType === COLLECT_TAB_TYPE_GOODS ? 6 : 8} />}
        {/*商品*/}
        {!this.isEmpty(productList) && tabType === COLLECT_TAB_TYPE_GOODS && (
          <CollectGoodsView productList={productList} />
        )}

        {/*清单*/}
        {!this.isEmpty(productList) && tabType === COLLECT_TAB_TYPE_LISTING && (
          <CollectListingView productList={productList} />
        )}
      </View>
    );
  }
}

export default XPage.connectFields()(CollectListView);
