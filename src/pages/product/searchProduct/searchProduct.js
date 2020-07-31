import XPage from '@src/components/XPage/XPage';
import { View, Input } from '@tarojs/components';
import './searchProduct.less';
import { AtIcon } from 'taro-ui';
import request from '@src/servers/http';
import PriceView from '@src/components/PriceView/price';
import ProductItem from '@src/components/ProductItem/ProductItem';

import CategoryTabList from '@src/components/CategoryTabList/CategoryTabList';

import LoginUtil from '@src/utils/LoginUtil';
import TextUtil from '@src/utils/TextUtil';
import CategoryProductListView from '@src/components/CategoryProductListView/CategoryProductListView';
import FilterToolBarView from '@src/components/FilterToolBarView/FilterToolBarView';

class searchProduct extends XPage {
  config = {
    navigationBarTitleText: '搜索',
    enablePullDownRefresh: false,
  };

  state = {
    searchKey: '',
    historyList: [],
    sortValue: {
      0: false,
      1: false,
      2: false,
    },
    lastIndex: null,
    pageNo: 1,
    pageSize: 10,
    noMoreData: false,
    coditionS: {}, //搜索商品的条件
    isShowRightDrawer: false,
    isSearchSuccess: false, //搜索是否成功（但搜索结果可能为空）
    searchResultIsEmpty: false, //搜索结果是否为空
    currentSelectCategoryId: null, //当前选中的类目id
  };

  componentDidMount() {
    if (LoginUtil.checkLogin()) {
      this.getHistorySearch();
    }
  }

  onSearchIntputChange(value) {
    this.setState({
      searchKey: value.detail.value,
      coditionS: { searchKey: value.detail.value },
    });
  }

  onCancelClick() {
    this.setState(
      {
        searchKey: '',
        isSearchSuccess: false,
        searchResultIsEmpty: false,
        lastIndex: null,
      },
      () => {
        //重置列表状态
        this.productListView.resetStatus();
      }
    );
  }

  onSearchClick() {
    let { searchKey, coditionS } = this.state;
    if (!searchKey) {
      this.showToast({ title: '请输入搜索关键词' });
      return;
    }
    this.setState(
      {
        currentSelectCategoryId: null,
      },
      () => {
        this.addNewHistory(searchKey);
        this.categoryTabListView.getCategoryList();
        // this.productListView.requestProductList(true, coditionS);
      }
    );
  }
  onFocus() {
    this.setState({
      isSearchSuccess: false,
    });
  }

  onReachBottom() {
    this.productListView.loadMoreData(this.state.coditionS);
  }

  getHistorySearch() {
    request.post('/community-client/history/search', { searchType: 1 }).then((res) => {
      this.setState({
        historyList: res,
      });
    });
  }

  addNewHistory(str) {
    if (!TextUtil.isEmpty(str)) {
      request
        .post('/community-client/record/search', {
          goodsName: str,
          searchType: 1,
        })
        .then((res) => {
          if (this.state.historyList.indexOf(str) == -1) {
            this.state.historyList.unshift(str);
            this.setState({
              historyList: this.state.historyList,
            });
          }
        });
    }
  }
  onDrawerShowCallback(isShowRightDrawer) {
    this.setState({
      isShowRightDrawer,
    });
  }
  clearAllHistory() {
    request
      .post('/community-client/record/delete', {
        searchType: 1,
      })
      .then((res) => {
        this.setState({
          historyList: [],
        });
      });
  }

  onTagClick(item) {
    this.setState(
      {
        searchKey: item,
        lastIndex: null,
        productList: [],
        coditionS: { searchKey: item }, //重置搜索条件
        currentSelectCategoryId: null,
      },
      () => {
        this.onSearchClick();
      }
    );
  }
  loadDataResultCallback(isLoadSuccess, searchResultIsEmpty) {
    this.setState({
      isSearchSuccess: isLoadSuccess,
      searchResultIsEmpty,
    });
  }

  productListRef = (node) => (this.productListView = node);
  categoryTabListRef = (node) => (this.categoryTabListView = node);
  filterToolBarRef = (node) => (this.filterToolBarView = node);

  //FilterToolBarView  选择条件后回调
  onSelectedResult(coditionS) {
    coditionS.searchKey = this.state.searchKey;
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

  getSearchView(searchKey, isSearchSuccess) {
    return (
      <View className="search-root">
        <View className="search-layout">
          <AtIcon prefixClass="icon" value="sousuo" size="16" color="#666666" />
          <Input
            className="search-input"
            onInput={this.onSearchIntputChange}
            value={searchKey}
            onConfirm={this.onSearchClick.bind(this)}
            placeholder="搜索商品"
            placeholderClass="placeholder-input"
            confirmType="搜索"
            onFocus={this.onFocus.bind(this)}
          />
        </View>
        {isSearchSuccess ? (
          <View className="search-text" onClick={this.onCancelClick}>
            取消
          </View>
        ) : (
          <View className="search-text" onClick={this.onSearchClick.bind(this)}>
            搜索
          </View>
        )}
      </View>
    );
  }

  getHistoryView(historyList) {
    return (
      <View className="quick-search">
        <View className="quick-search-item">
          <View className="flex-space-between" style="padding-right: 6rpx;">
            <View className="search-title">历史搜索</View>
            <View className="delete-layout" onClick={this.clearAllHistory}>
              <AtIcon prefixClass="icon" value="shanchu" size="16" color="#666666" />
              <View className="delete-all">全部删除</View>
            </View>
          </View>
          <View className="list-container">
            {historyList.map((item, index) => {
              return (
                <View key={index} className="item-text" onClick={this.onTagClick.bind(this, item)}>
                  {item}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
  onCategoryClick(catetoryId) {
    this.setState(
      {
        currentSelectCategoryId: catetoryId,
      },
      () => {
        this.filterToolBarView.resetViewStatus();
      }
    );
  }
  getTabResultEmptyCallback() {
    let { coditionS } = this.state;
    console.log('getTabResultEmptyCallback');
    this.productListView.requestProductList(true, coditionS);
  }
  getContentView(isSearchSuccess) {
    const { historyList, searchKey, searchResultIsEmpty, currentSelectCategoryId } = this.state;
    return (
      <View className="bottom-layout">
        <View className="sort-layout">
          <View
            className="tools"
            style={{ visibility: isSearchSuccess && currentSelectCategoryId ? 'visible' : 'hidden' }}
          >
            <CategoryTabList
              searchKey={searchKey}
              ref={this.categoryTabListRef}
              onTabClickCallback={this.onCategoryClick.bind(this)}
              getTabResultEmptyCallback={this.getTabResultEmptyCallback.bind(this)}
            />
            <FilterToolBarView
              searchKey={searchKey}
              categoryId={currentSelectCategoryId}
              isShow={currentSelectCategoryId != null}
              ref={this.filterToolBarRef}
              onDrawerShowCallback={this.onDrawerShowCallback.bind(this)}
              resultCallback={this.onSelectedResult.bind(this)}
            />
          </View>
          {!isSearchSuccess && this.getHistoryView(historyList)}
        </View>
        <CategoryProductListView
          isShowBlankPage={!isSearchSuccess}
          marginTop={'250rpx'}
          loadDataResultCallback={this.loadDataResultCallback.bind(this)}
          ref={this.productListRef}
        />
      </View>
    );
  }

  render() {
    const { searchKey, isSearchSuccess, sortValue, lastIndex, isShowRightDrawer } = this.state;

    return (
      <View className="search-page" style={{ position: isShowRightDrawer ? 'fixed' : 'none' }}>
        {this.getSearchView(searchKey, isSearchSuccess)}
        {this.getContentView(isSearchSuccess)}
      </View>
    );
  }
}

export default XPage.connectFields()(searchProduct);
