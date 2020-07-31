import XPage from '@src/components/XPage/XPage';
import { View } from '@tarojs/components';
import './collectList.less';

import { AtSwipeAction } from 'taro-ui';
import request from '../../../servers/http';

import CollectListView from './subComponents/CollectListView/CollectListView';

import { COLLECT_TAB_TYPE_LISTING, COLLECT_TAB_TYPE_GOODS } from '@src/constants/common';

class collectList extends XPage {
  config = {
    navigationBarTitleText: '商品收藏',
    enablePullDownRefresh: true,
  };

  state = {
    productList: [],
    pageNo: 1,
    pageSize: 10,
    noMoreData: false,
    tabList: [
      { title: '商品', type: COLLECT_TAB_TYPE_GOODS },
      { title: '清单', type: COLLECT_TAB_TYPE_LISTING },
    ],
    currentSelectedTabIndex: 0,
    currentSelectedTabType: COLLECT_TAB_TYPE_GOODS,
  };

  componentDidMount() {
    //init
    this.getListView().updateViewStatus(true);
  }
  componentDidShow() {
    const needRefresh = Taro.getStorageSync('collectListRefresh');
    if (needRefresh) {
      this.onPullDownRefresh();
      Taro.setStorageSync('collectListRefresh', false);
    }
  }

  onReachBottom() {
    this.getListView().loadMoreData();
  }

  onPullDownRefresh() {
    this.getListView().requestData(true);
  }

  getListView() {
    if (this.state.currentSelectedTabIndex === 0) {
      return this.GoodsList;
    } else {
      return this.ListingList;
    }
  }
  onTabClick(index, type) {
    this.setState(
      {
        currentSelectedTabIndex: index,
        currentSelectedTabType: type,
      },
      () => {
        //更新view状态
        this.ListingList.updateViewStatus(type === COLLECT_TAB_TYPE_LISTING);
        this.GoodsList.updateViewStatus(type === COLLECT_TAB_TYPE_GOODS);
      }
    );
  }
  listingList = (node) => {
    this.ListingList = node;
  };
  goodsList = (node) => {
    this.GoodsList = node;
  };

  render() {
    const { productListm, tabList, currentSelectedTabIndex, currentSelectedTabType } = this.state;
    return (
      <View className="product-collect-page">
        <View className="top-layout">
          {tabList.map((item, index) => {
            return (
              <View className="item">
                <View
                  className={`text ${currentSelectedTabIndex === index ? 'selected' : 'none'}`}
                  onClick={this.onTabClick.bind(this, index, item.type)}
                >
                  {item.title}
                </View>
              </View>
            );
          })}
        </View>
        <View className="bottom-layout">
          <CollectListView ref={this.goodsList} tabType={COLLECT_TAB_TYPE_GOODS} />

          <CollectListView ref={this.listingList} tabType={COLLECT_TAB_TYPE_LISTING} />
        </View>
      </View>
    );
  }
}

export default XPage.connectFields()(collectList);
