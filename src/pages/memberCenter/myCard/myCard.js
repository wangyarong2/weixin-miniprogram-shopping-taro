import { View } from '@tarojs/components'

import XPage from '@src/components/XPage/XPage'
import PriceView from '@src/components/PriceView/price'
import EmptyView from '@src/components/EmptyView/EmptyView';

import request from "@src/servers/http";

import addressIcon from "@images/member/icon_member_address.png";
import card1 from "@images/member/card-s1.png";

import './myCard.less'

class myCard extends XPage {
  config = {
    navigationBarTitleText: '我购买的卡'
  }

  state = {
    cardList: [],
    cityInfo: {
      cityCode: "",
      cityName: "定位中..."
    },
    isLocationRefuse: false,
    isGetResult: false
  }

  componentDidMount() {
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
        this.setState({
          cityInfo: {
            cityCode: userChooseCity.code,
            cityName: userChooseCity.name
          }
        })
        this.getList()
      }
    }
  }

  componentDidHide() {
    Taro.setStorageSync('userHasChooseCity', false)
  }

  getList() {
    const userChooseCity = Taro.getStorageSync('userChooseCity');
    const requestParams = {
      areaNo: userChooseCity.code
    }
    request.post("/community-client/member/equityCard/list", requestParams).then(res => {
      console.log(res)
      this.setState({
        cardList: res || [],
        isGetResult: true
      })
    }).catch(() => {
      this.setState({ isGetResult: true })
    });
  }

  goCardDetail(data) {
    this.goPage({
      url: 'memberCenter/cardDetail',
      params: {
        id: data.id
      }
    })
  }

  onChooseCityClick() {
    this.goPage({
      url: "memberCenter/chooseCity",
      params: {
        from: 'myCard'
      }
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
        const code = response.data.result.addressComponent.adcode.substring(0, 4) + "00"
        const name = response.data.result.addressComponent.city
        Taro.setStorageSync("userChooseCity", {
          code,
          name
        });
        that.setState({
          cityInfo: {
            cityCode: code,
            cityName: name
          }
        })
        that.getList()
      },
      fail(res) {
        console.log("fail", res);
      }
    });
  }

  render() {
    const { cityInfo, isLocationRefuse, cardList, isGetResult } = this.state
    return (
      <View>
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
        </View>

        { cardList.map(item =>
          <View className="card-item" onClick={this.goCardDetail.bind(this, item)} key={item.id}>
            <View className="flex-space-between" >
              <View>
                <View className="item-name">{item.cardName}</View>
                <PriceView price={item.price / 100} size={32} hasSymbol='¥' />
              </View>
              <View className="item-btn flex-center">去使用</View>
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
        )}

        { isGetResult && !cardList.length && <EmptyView type={8}></EmptyView> }
      </View>
    )
  }
}

export default XPage.connectFields()(myCard)
