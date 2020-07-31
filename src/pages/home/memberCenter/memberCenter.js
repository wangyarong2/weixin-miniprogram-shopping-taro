import XPage from "@src/components/XPage/XPage";
import { View, Swiper, SwiperItem } from "@tarojs/components";
import { AtIcon, AtNavBar } from 'taro-ui'

import linkCard from "@images/member/link-card.png";
import linkCardShare from "@images/member/link-card-share.png";

import addressIcon from "@images/member/icon_member_address.png";
import card1 from "@images/member/card-s1.png";
import card2 from "@images/member/card-s2.png";
import shopDefault from "@images/member/shop-default.png";

import request from "@src/servers/http";
import LoginUtil from "../../../utils/LoginUtil";

import XAuthorize from "@src/components/XAuthorize/XAuthorize";
import EmptyView from '@src/components/EmptyView/EmptyView';
import PriceView from '@src/components/PriceView/price'


import "./memberCenter.less";

class memberCenter extends XPage {
  config = {
    navigationBarTitleText: "橙卡",
    enablePullDownRefresh: true
  };

  state = {
    isLogin: false,
    cityInfo: {
      cityCode: "",
      cityName: "定位中..."
    },
    tabIndex: 0,
    storeList: [],
    cardList: [],
    isLocationRefuse: false
  };

  componentDidMount() {
    this.setState({ isLogin: LoginUtil.checkLogin() });
    Taro.showLoading({
      title: "请稍后...",
      mask: true
    });
    const that = this;
    Taro.getLocation()
      .then(res => {
        this.setState({
          isLocationRefuse: false
        });
        this.getCityFromBaiDu(res);
      })
      .catch(e => {
        this.setState({
          isLocationRefuse: true
        });
        Taro.hideLoading();
      });
  }

  componentDidShow() {
    const userHasChooseCity = Taro.getStorageSync('userHasChooseCity');
    if (userHasChooseCity) {
      const userChooseCity = Taro.getStorageSync('userChooseCity');
      if (userChooseCity.code != this.state.cityInfo.cityCode) {
        this.getInfoWithArea(userChooseCity.code, userChooseCity.name)
      }
    }
  }

  componentDidHide() {
    Taro.setStorageSync('userHasChooseCity', false)
  }

  onChooseCityClick() {
    this.goPage({ url: "memberCenter/chooseCity" });
  }

  getCityFromBaiDu(res) {
    const that = this;
    //调取百度查询当前地址
    wx.request({
      url:
        "https://api.map.baidu.com/reverse_geocoding/v3/?ak=iyuXt4QKGcdMMx6XgNi3jpBR21b8gNIg&location=" +
        res.latitude +
        "," +
        res.longitude +
        "&output=json",
      data: {},
      method: "GET",
      header: {
        "content-type": "application/json"
      },
      success(response) {
        console.log("城市编码", response.data.result.addressComponent.adcode);
        console.log("城市", response.data.result.addressComponent.city);
        Taro.setStorageSync("userChooseCity", {
          code: response.data.result.addressComponent.adcode.substring(0, 4) + "00",
          name: response.data.result.addressComponent.city
        });
        that.getInfoWithArea(
          response.data.result.addressComponent.adcode.substring(0, 4) + "00",
          response.data.result.addressComponent.city
        );
      },
      fail(res) {
        console.log("fail", res);
      }
    });
  }

  getInfoWithArea(areaCode, areaName) {
    Taro.hideLoading();
    this.setState({
      cityInfo: {
        cityCode: areaCode,
        cityName: areaName
      }
    }, () => {
      console.log('get list')
      this.getList()
    });
  }

  getList() {
    const { tabIndex } = this.state
    const requestParams = {
      areaNo: this.state.cityInfo.cityCode
    }
    const requestUrl = tabIndex === 0 ? "/community-client/community/ShopEquity/list" : "/community-client/community/equityCard/listNew"
    request.post(requestUrl, requestParams).then(res => {
      Taro.stopPullDownRefresh();
      const resultList = res || []
      if (tabIndex === 0) {
        this.setState({ storeList: resultList })
      } else {
        this.setState({ cardList: resultList })
      }
    });
  }

  onLoginSuccess() {
    request.post("/community-client/mx/member/home", {}).then(res => {
      Taro.setStorageSync("currentShopId", res.shop.shopId);
      this.getInfoWithArea(
        this.state.cityInfo.cityCode,
        this.state.cityInfo.cityName
      );
    });
  }

  openSetting() {
    const that = this;
    wx.openSetting({
      success(res) {
        console.log(res.authSetting);
        if (res.authSetting["scope.userLocation"]) {
          Taro.getLocation().then(res => {
            that.setState({
              isLocationRefuse: false
            });
            console.log(res);
            that.getCityFromBaiDu(res);
          });
        }
      }
    });
  }

  handlesearch() {
    this.goPage({ url: "memberCenter/shopSearch" });
  }

  goCardIntro(bool) {
    if (bool) {
      this.goPage({
        url: 'memberCenter/cardIntro',
        params: { intro: 'yes' }
      })
    } else {
      this.goPage({ url: 'memberCenter/cardIntro', })
    }
  }

  goMyCard() {
    this.goPage({ url: 'memberCenter/myCard' })
  }

  changeTab(index) {
    this.setState({
      tabIndex: index
    }, () => {
      this.getList()
    })
  }

  goShopDetail(data) {
    this.goPage({
      url: 'memberCenter/equityBusiness',
      params: {
        shopId: data.shopId
      }
    })
  }

  goCardDetail(data) {
    this.goPage({
      url: 'memberCenter/cardDetail',
      params: {
        id: data.id
      }
    })
  }

  onPullDownRefresh() {
    this.getList()
  }

  render() {
    const { isLocationRefuse, cityInfo, tabIndex, storeList, cardList } = this.state;
    return (
      <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
        <View className="" style={{ background: '#fff', height: '585rpx' }}>
          <View className="member-topcontainer">
            <View className="address-layout">
              <Image
                className="address-img"
                onClick={this.onChooseCityClick}
                src={addressIcon}
              ></Image>
              <View className="address-city" onClick={this.onChooseCityClick}>
                {cityInfo.cityName}
              </View>
              {isLocationRefuse && (
                <View onClick={this.openSetting} className="relocation-btn">
                  重新定位
                </View>
              )}
            </View>
            {/* <View className="search-content" onClick={this.handlesearch.bind(this)}>
              <AtIcon prefixClass='icon' value='sousuo' color='#666666' size='14'></AtIcon>
              <Text className="text">搜索商家名称</Text>
            </View> */}
          </View>
          <Image className="card-image" src={card2} onClick={this.goCardIntro.bind(this, true)} />
          <View className="nav-container">
            <View className="nav-item flex-column-center" onClick={this.goMyCard}>
              <Image className="item-image" src={linkCard} />
              <View className="item-text">我购买的卡</View>
            </View>
            {/* <View className="nav-item flex-column-center">
              <Image className="item-image" />
              <View className="item-text">推广明细</View>
            </View> */}
            <View className="nav-item flex-column-center" onClick={this.goCardIntro.bind(this, false)}>
              <Image className="item-image" src={linkCardShare} />
              <View className="item-text">分享赚钱</View>
            </View>
          </View>
        </View>
        <View className="tab-container">
          <View
            className={tabIndex === 0 ? 'item selected' : 'item'}
            onClick={this.changeTab.bind(this, 0)}
          >权益门店</View>
          <View
            className={tabIndex === 1 ? 'item selected' : 'item'}
            onClick={this.changeTab.bind(this, 1)}
          >权益橙卡</View>
        </View>
        <View className="data-list-container">
          { tabIndex === 0 ?
            storeList.map((item, index) =>
              <View className="store-item" key={index} onClick={this.goShopDetail.bind(this, item)}>
                <View className="item-image-box flex-center">
                  { item.logoImage ?
                    <Image className="item-image" src={item.logoImage} />
                    :
                    <Image className="item-iamge-default" src={shopDefault} />
                  }
                </View>
                <View className="item-content">
                  <View className="item-name">{item.title}</View>
                  <View className="item-address">{item.address}</View>
                  <View className="item-des text-mult-clip-2">{item.shopSize}项权益价值{item.cost}元</View>
                </View>
              </View>
            ) :
            cardList.map(item =>
              <View className="card-item" key={item.id} onClick={this.goCardDetail.bind(this, item)}>
                <View className="flex-space-between">
                  <View className="item-name">{item.cardName}</View>
                  <PriceView price={item.price / 100} size={28} hasSymbol='￥' />
                </View>
                <View>
                  <Image className="item-image" src={item.imgUrl || card1} />
                </View>
                <View className="flex-space-between" style={{ padding: '0 60rpx' }}>
                  <View className="flex-column-center">
                    <View className="item-count">{item.shopCount}</View>
                    <View className="item-gray">门店数量</View>
                  </View>
                  <View className="flex-column-center">
                    <View className="item-count">{item.equityCount}</View>
                    <View className="item-gray">门店权益</View>
                  </View>
                  <View className="flex-column-center">
                    <View className="item-count">{item.cost}</View>
                    <View className="item-gray">权益总价值</View>
                  </View>
                </View>
              </View>
            )
          }
        </View>
        { tabIndex === 0 && !storeList.length && <EmptyView type={7}></EmptyView> }
        { tabIndex === 1 && !cardList.length && <EmptyView type={7}></EmptyView> }
      </XAuthorize>
    );
  }
}

export default XPage.connectFields()(memberCenter);
