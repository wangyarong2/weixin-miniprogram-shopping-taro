import Taro, { Component } from '@tarojs/taro';
import { View, Button, Text, Picker } from '@tarojs/components';
import { AtIcon, AtNavBar } from 'taro-ui';
import { AREA_CODE } from '@src/constants/common';

import XPage from '@src/components/XPage/XPage';
import XAuthorize from '@src/components/XAuthorize/XAuthorize';

import MSwiper from '@src/components/CMS/MSwiper/MSwiper';
import MGrid from '@src/components/CMS/MGrid/MGrid';
import MChunk from '@src/components/CMS/MChunk/MChunk';
import MCommodity from '@src/components/CMS/MCommodity/MCommodity';
import HotspotChunk from '@src/components/CMS/HotspotChunk/HotspotChunk';

import MMeibao from '@src/components/CMS/MMeibao/MMeibao';
import MRecommend from '@src/components/CMS/MRecommend/MRecommend';
import MGroupbuying from '@src/components/CMS/MGroupbuying/MGroupbuying';
import MSpecialSale from '@src/components/CMS/MSpecialSale/MSpecialSale';
import HomeItem from '@src/components/HomeItem/HomeItem';

import Title from '@src/components/CMS/Title/Title';

import RedPocketEntryDialog from '@src/components/RedPocketEntryDialog/RedPocketEntryDialog';

import request from '../../servers/http';
import LoginUtil from '@utils/LoginUtil';
import { set as setGlobalData, get as getGlobalData } from '@utils/globalData';
import TextUtil from '../../utils/TextUtil';

import arrowDown from '@src/assets/images/member/icon_arrow_down.png';
import loginImage from '@src/assets/images/logo.png';
import message from '@src/assets/images/member/icon_home_message.png';

import PermissionUtil from '../../utils/PermissionUtil';

import './home.less';

class Index extends XPage {
  config = {
    navigationBarTitleText: '首页',
    navigationStyle: 'custom',
    enablePullDownRefresh: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      statusBarHeight: 0,
      currentShop: '',
      cmsPageData: [],
      list: [],
      isLogin: false,

      cmsDataRefresh: true,
      isShowNewShopMsgDialog: false, //店铺消息弹窗
      screenWidth: 0,
      isShowRedPocket: false, //是否展示红包入口
    };
  }

  componentWillMount() {
    const sysInfo = Taro.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight;
    this.setState({
      statusBarHeight,
      screenWidth: sysInfo.screenWidth,
    });
  }

  componentDidMount() {
    this.requestBindShop(true);
    const user = Taro.getStorageSync('userData');
    const that = this;
    if (user != null && LoginUtil.isTokenExpired()) {
      //token过期
      console.log('---', 'token过期');
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.login({
              success: function (res) {
                wx.getUserInfo({
                  withCredentials: true,
                  success: function (wxUserInfo) {
                    const userInfo = { detail: wxUserInfo };
                    that.onGetUserInfo(userInfo).then((res) => {
                      Taro.hideLoading();
                      const userData = Taro.getStorageSync('userData');
                      Taro.setStorageSync('userData', userData);
                      that.afterDidMount();
                    });
                  },
                });
              },
            });
          }
        },
      });
    } else {
      this.afterDidMount();
    }
    // this.requestCMSDataWrapper()
  }

  afterDidMount() {
    const { scene } = this.$router.params;
    if (scene) {
      //扫码进入首页
      const sceneData = decodeURIComponent(this.$router.params.scene).split('&');
      const shopId = sceneData[0];
      this.bindShopIfLogin(shopId, null);
      this.requestCMSDataWrapper();
    } else {
      let { shopId, shopName, redPocketId, shareUserId } = this.$router.params;

      if (!TextUtil.isEmpty(shareUserId)) {
        this.bindShopIfLogin(shareUserId, shopName);
      } else {
        this.requestCMSDataWrapper();
      }
      //抢红包活动
      if (!TextUtil.isEmpty(redPocketId)) {
        //延迟是为了：如果红包活动已结束，显示的toast能展示更长时间
        setTimeout(() => {
          this.requestRedPocketActiveIsFinish(redPocketId);
        }, 1000);
      }
    }
  }

  /**
   *请求红包活动是否结束
   */
  requestRedPocketActiveIsFinish(redPocketId) {
    request.post('/community-client/redPocket/check/time', { redPocketId }).then((res) => {
      this.setState({
        isShowRedPocket: res,
      });
    });
  }

  //通过userId  建立用户与门店的绑定关系（第一个参数请传userid）
  bindShopIfLogin(shareUserId, shopName) {
    if (LoginUtil.checkLogin()) {
      request.post('/community-client/member/bind', { shareUserId }).then((res) => {
        if (res.suc) {
          Taro.setStorageSync('currentShopId', shareUserId);
          Taro.setStorageSync('hasChangedShop', true);
          this.requestBindShop(true);
        } else {
          Taro.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000,
          });
        }
      });
      this.requestCMSDataWrapper();
    } else {
      setGlobalData('shareUserId', shareUserId);
      if (!TextUtil.isEmpty(shopName)) {
        Taro.setStorageSync('currentShopId', shareUserId);
        Taro.setStorageSync('hasChangedShop', true);
        this.setState(
          {
            currentShop: shopName,
          },
          () => {
            this.requestCMSDataWrapper();
          }
        );
      } else {
        this.requestCMSDataWrapper();
      }
    }
  }

  componentDidShow() {
    const homePageRefreshShopList = Taro.getStorageSync('HomePageRefreshShopList');
    if (
      typeof homePageRefreshShopList != 'undefined' &&
      homePageRefreshShopList != null &&
      homePageRefreshShopList == true
    ) {
      this.requestBindShop(true);
      Taro.setStorageSync('HomePageRefreshShopList', null);
    }
    // this.setState({ cmsDataRefresh: !this.state.cmsDataRefresh })
    // this.requestCMSDataWrapper()
  }

  onPullDownRefresh() {
    this.setState({ cmsDataRefresh: !this.state.cmsDataRefresh });
    this.requestCMSDataWrapper();
  }

  requestCMSDataWrapper() {
    if (getGlobalData(AREA_CODE) == null) {
      //未登陆 需要请求定位,根据经纬度去定位城市经理
      PermissionUtil.getWXPermissionIsRejectByUser('scope.userLocation').then((isReject) => {
        if (isReject) {
          //用户拒绝过一次
          this.openConfirm();
        } else {
          //第一次申请权限
          this._startLocation();
        }
      });
    }
    //请求cms数据
    this.requestCMSData();
  }

  _startLocation() {
    Taro.getLocation()
      .then((res) => {
        //重新请求cms数据
        this.getCityFromBaiDu(res);
      })
      .catch((err) => {
        this.requestCMSData();
      });
  }

  openConfirm() {
    let that = this;
    wx.showModal({
      content: '检测到您没打开定位权限，是否去设置打开？',
      confirmText: '确认',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          that.openSetting();
        }
      },
    });
  }

  openSetting() {
    const that = this;
    wx.openSetting({
      success(res) {
        if (res.authSetting['scope.userLocation']) {
          Taro.getLocation().then((res) => {
            that.getCityFromBaiDu(res);
          });
        }
      },
    });
  }

  getCityFromBaiDu(res) {
    const that = this;
    //调取百度查询当前地址
    wx.request({
      url:
        'https://api.map.baidu.com/reverse_geocoding/v3/?ak=Gl9MUIO4GgYGpOfzZlq6I07qxotFHiaV' +
        '&location=' +
        res.latitude +
        ',' +
        res.longitude +
        '&output=json',
      data: {},
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success(response) {
        const cityCode = response.data.result.addressComponent.adcode.substring(0, 4) + '00';
        setGlobalData(AREA_CODE, cityCode);

        that.requestCMSData(cityCode, response.data.result.addressComponent.city);
        Taro.hideLoading();
      },
      fail(res) {
        Taro.hideLoading();
        that.requestCMSData();
      },
    });
  }

  requestCMSData(cityCode, cityName) {
    const queryParams = {
      platform_id: 6,
      projectId: 'siji',
      appVersion: '11100',
      shopId: '6666',
      platform: 'MINIPROGRAM',
      cityCode,
      cityName,
    };
    request
      .cmsPost({
        url: '/pagehome/program',
        data: queryParams,
      })
      .then((res) => {
        Taro.stopPullDownRefresh();
        if (res.lightPageInfo) {
          this.setState({
            cmsPageData: JSON.parse(res.lightPageInfo),
          });
        } else {
          this.setState({ cmsPageData: [] });
        }
      });
  }

  onLoginCallBack() {
    request.post('/community-client/mx/member/home', {}).then((res) => {
      console.log('店铺信息', res);
      const inviteShopId = getGlobalData('shareUserId');
      console.log('----邀请店铺信息', inviteShopId);
      if (!TextUtil.isEmpty(inviteShopId)) {
        Taro.setStorageSync('currentShopId', inviteShopId);
        Taro.setStorageSync('userHasLogin', true);
        this.setState({ isLogin: true });
        this.requestBindShop(true);
        this.setState({ cmsDataRefresh: !this.state.cmsDataRefresh });
        this.requestCMSDataWrapper();
      } else {
        Taro.setStorageSync('currentShopId', res.shop.shopId);
        Taro.setStorageSync('userHasLogin', true);
        this.setState({ isLogin: true });
        this.requestBindShop(true);
        this.setState({ cmsDataRefresh: !this.state.cmsDataRefresh });
        this.requestCMSDataWrapper();
      }
    });
  }

  onMessageClick() {
    this.goPage({
      url: 'message/messageCenter',
    });
  }

  //分享给好友
  onShareAppMessage() {
    let path = null;
    if (LoginUtil.checkLogin()) {
      path = `/pages/home/home?shopId=${Taro.getStorageSync('member_info').userId}`;
    } else {
      path = `/pages/home/home`;
    }
    console.log('-----', path);
    return {
      title: '好橙家',
      path: path,
    };
  }

  /**
   * 查询用户绑定店铺的列表
   * */
  requestBindShop(isFirst) {
    if (LoginUtil.checkLogin()) {
      request
        .post('/community-client/member/queryBindShops', {
          pageNo: 1,
          pageSize: 100,
        })
        .then((res) => {
          console.log('店铺列表', res);
          Taro.hideLoading();
          if (res != null && res.list != null && res.list.length > 0) {
            this.setState(
              {
                list: res.list,
              },
              () => {
                //默认取第一个，并且更新本地的shopId
                const currentShop = res.list[0];
                Taro.setStorageSync('currentShopId', currentShop.id + '');
                Taro.setStorageSync('hasChangedShop', true);
                this.setState({
                  currentShop: currentShop.shopName,
                });
              }
            );
          } else {
            this.setState({
              currentShop: '好橙家',
            });
          }
        })
        .catch((res) => {
          this.setState({
            currentShop: '好橙家',
          });
        });
    } else {
      this.setState({
        currentShop: '好橙家',
      });
    }
  }

  searchProduct() {
    this.goPage({
      url: 'product/searchProduct',
    });
  }

  onSelectChange(e) {
    // const { shopList } = this.state
    // const currentShop = shopList[e.detail.value]
    // this.setState({
    //   currentShop
    // }, () => {
    //   console.log('current', this.state.currentShop);
    //   const index = this.state.list.findIndex(item => item.shopName == this.state.currentShop)
    //   console.log('-----', index)
    //   console.log('-----', this.state.list[index])
    //   Taro.setStorageSync('currentShopId', this.state.list[index].id + '');
    //   Taro.setStorageSync('hasChangedShop', true);
    //   this.setState({ cmsDataRefresh: !this.state.cmsDataRefresh })
    //   this.requestCMSDataWrapper();
    // })
  }

  closeOnClick() {
    this.setState({
      isShowNewShopMsgDialog: false,
    });
  }

  onRedPocketClick() {
    this.setState({
      isShowRedPocket: false,
    });
  }

  render() {
    const {
      statusBarHeight,
      screenWidth,
      currentShop,
      messageInfo,
      isShowNewShopMsgDialog,
      isShowRedPocket,
    } = this.state;
    const { redPocketId, shareUserId } = this.$router.params;

    return (
      <View className="home-contaienr">
        {isShowRedPocket && (
          <RedPocketEntryDialog
            redPocketId={redPocketId}
            shareUserId={shareUserId}
            closeOnClick={this.onRedPocketClick.bind(this)}
          />
        )}

        <View className="top-layout">
          <XAuthorize logined={this.state.isLogin} isFullWith loginCallback={this.onLoginCallBack.bind(this)}>
            <View className="status" style={{ height: statusBarHeight + 'px' }} />
            <View className="navi">
              {/*周扬要求写死*/}
              <View className="current-shop text-clip">{'好橙家官方店'}</View>
            </View>
            <View className="top-bar flex-center">
              <View className="search-content" onClick={this.searchProduct}>
                <AtIcon prefixClass="icon" value="sousuo" color="#666666" size="14" />
                <Text className="text">搜索全部商品</Text>
              </View>
              {/*<Button openType="contact" sessionFrom={'7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl} className="icon-box flex-column-center">*/}
              <Button onClick={this.onMessageClick} className="icon-box flex-column-center">
                <AtIcon prefixClass="icon" value="xiaoxi" size="24" color="#333" />
                {/*<Text className="text message">消息</Text>*/}
              </Button>
            </View>
          </XAuthorize>
        </View>
        <ScrollView
          scrollY
          scrollWithAnimation
          style={{
            marginTop: 180 + statusBarHeight * 2 - (screenWidth > 375 ? 8 : 0) + 'rpx',
            paddingBottom: 180 + statusBarHeight * 2 - (screenWidth > 375 ? 8 : 0) + 'rpx',
          }}
          className="bottom-layout"
        >
          {/* <View style={'height:2000px'}>底部布局</View> */}
          <HomeItem cmsDataList={this.state.cmsPageData} onLoginCallBack={this.onLoginCallBack.bind(this)} />
        </ScrollView>
      </View>
    );
  }
}

export default Index;
