import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';

import XPage from '@src/components/XPage/XPage';

import XAuthorize from '../../../components/XAuthorize/XAuthorize';

import HomeItem from '@src/components/HomeItem/HomeItem';

import request from '@src/servers/http';
import LoginUtil from '@utils/LoginUtil';
import { set as setGlobalData } from '@utils/globalData';

import '../home.less';

class Index extends XPage {
  config = {
    navigationBarTitleText: '',
  };

  componentDidMount() {
    // 骑呗新增代码 - zhaofei
    setGlobalData('fromMiniProgram', this.params.fromMiniProgram);
    // ---------------------------------------------------------------------------
    this.bindShopIfLogin();
    this.getCMSData();
  }

  componentDidShow() {}

  constructor(props) {
    super(props);
    this.state = {
      currentShop: '',
      cmsPageData: [],
      pageName: '',
      pageFlag: false, // 触发滚动到底部
    };
  }

  bindShopIfLogin() {
    if (LoginUtil.checkLogin() && this.params.shopId) {
      request.post('/community-client/member/bind', { shopId: this.params.shopId }).then((res) => {
        if (res.suc) {
          Taro.setStorageSync('currentShopId', this.params.shopId);
        } else {
          Taro.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000,
          });
        }
      });
    } else {
      if (this.params.shopId) {
        setGlobalData('shareUserId', this.params.shopId);
      }
    }
  }

  getCMSData() {
    const queryParams = {
      platform_id: 6,
      projectId: 'siji',
      appVersion: '11100',
      shopId: '6666',
      platform: 'MINIPROGRAM',
      pageId: this.params.pageId,
    };
    request
      .cmsPost({
        url: '/pagehome/program',
        data: queryParams,
      })
      .then((res) => {
        const title = res.pageName || '活动页';
        Taro.setNavigationBarTitle({ title });
        this.state.pageName = title;
        if (res.lightPageInfo) {
          this.setState({
            cmsPageData: JSON.parse(res.lightPageInfo),
          });
        } else {
          this.setState({ cmsPageData: [] });
        }
      });
  }

  goCategoryList() {
    this.goPage({
      url: 'product/categorylist',
    });
  }

  goCategoryListById(data) {
    setGlobalData('currentCategoryData', data.siblingsCategoryKids);
    // TODO:
    this.goPage({
      url: 'product/category/brandCategoryDetail',
      params: {
        kidsIndex: data.categoryIndex - 1,
      },
    });
  }

  onSwiperClick(data) {
    if (data.radio === 1 && data.activeId) {
      this.goActivePage(data.activeId);
    } else if (data.radio === 2 && data.goodsInfo) {
      this.goProductDetail(data.goodsInfo);
    }
  }

  onGridClick(data) {
    if (data.radio === 1 && data.categoryIds) {
      this.goCategoryListById(data);
    } else if (data.radio === 2) {
      this.goCategoryList();
    } else if (data.radio === 4 && data.activeId) {
      this.goActivePage(data.activeId);
    } else if (data.radio === 5) {
      this.goPage({
        url: 'home/shopList',
      });
    }
  }

  onImageClick(data) {
    if (data.radio === 1 && data.activeId) {
      this.goActivePage(data.activeId);
    } else if (data.radio === 2 && data.categoryIds) {
      this.goCategoryListById(data);
    }
  }

  goActivePage(pageId) {
    this.goPage({
      url: 'home/activePage',
      params: { pageId },
    });
  }

  goProductDetail(data) {
    this.goPage({
      url: 'goodsDetail',
      params: {
        shopId: Taro.getStorageSync('currentShopId'),
        spuId: data.spuId,
      },
    });
  }

  onReachBottom() {
    if (this.state.cmsPageData.length === 1) {
      this.setState({ pageFlag: !this.state.pageFlag });
    }
  }

  //分享给好友
  onShareAppMessage() {
    const currentShopId = Taro.getStorageSync('currentShopId');
    const shopId = currentShopId || this.params.shopId;

    const path = `/pages/home/activePage/activePage?pageId=${this.params.pageId}&shopId=${shopId}`;
    return {
      title: this.state.pageName,
      path: path,
    };
  }

  onLoginCallBack() {
    request.post('/community-client/mx/member/home', {}).then((res) => {
      Taro.setStorageSync('currentShopId', res.shop.shopId);
      Taro.setStorageSync('userHasLogin', true);
    });
  }


  render() {
    const { cmsPageData } = this.state;
    return (
      <XAuthorize loginCallback={this.onLoginCallBack.bind(this)}>
        <View className="base-view">
          <HomeItem cmsDataList={cmsPageData} />
        </View>
      </XAuthorize>
    );
  }
}

export default Index;
