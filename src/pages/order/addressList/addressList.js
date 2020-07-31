import XPage from "../../../components/XPage/XPage";
import { View } from "@tarojs/components";
import "./addressList.less";
import AddressItem from "../../../components/AddressItem/AddressItem";
import request from "../../../servers/http";
import { set as setGlobalData } from "../../../utils/globalData";
import GuidePage from "../../../components/GuidePage/GuidePage";

import getWeChatAddress from "../../../assets/images/default/icon_wechat_ads.png";
import { AtIcon } from "taro-ui";

class addressList extends XPage {
  config = {
    navigationBarTitleText: "收货地址",
  };

  state = {
    addressList: [],
    formChoose: false,
  };

  componentDidMount() {
    const formChoose = this.$router.params.formChoose;
    this.setState({
      formChoose,
    });
  }

  componentDidShow() {
    this.getAddressList();
  }

  // 获取地址列表
  getAddressList() {
    request.post("/community-client/addressList", {}).then((res) => {
      this.setState({
        addressList: res.list,
      });
    });
  }

  //编辑地址
  onEditClick(address) {
    console.log("编辑地址");
    this.goPage({ url: "order/addAddress", params: { ...address } });
  }

  //地址点击
  onAddressSelect(address) {
    console.log("xxxx", address);
    if (this.state.formChoose) {
      setGlobalData("currentAddressData", address);
      this.goBack();
    }
  }

  // 新建地址
  onHandelNewAddress() {
    console.log("新建地址");
    this.goPage({ url: "order/addAddress" });
  }

  //获取微信地址
  onGetWeChatAddress() {
    Taro.chooseAddress().then((res) => {
      if (res.errMsg.indexOf("ok") != -1) {
        const address = {
          province: res.provinceName,
          city: res.cityName,
          district: res.countyName,
          detailAddress: res.detailInfo,
          phone: res.telNumber,
          name: res.userName,
          adcode: res.nationalCode,
        };
        this.goPage({ url: "order/addAddress", params: { ...address } });
      }
    });
  }

  render() {
    const { addressList } = this.state;
    return (
      <View className="address-page">
        <View className="wechat-address" onClick={this.onGetWeChatAddress}>
          <Image className="wechat" src={getWeChatAddress} />
          <View className="text">获取微信收货地址</View>
          <AtIcon
            prefixClass="icon"
            value="youjiantou"
            size="13"
            color="#909090"
          />
        </View>
        {addressList == null ||
          (addressList.length === 0 && (
            <GuidePage type={5} onTrigger={this.onHandelNewAddress.bind(this)} />
          ))}
        {addressList.map((item, index) => {
          return (
            <AddressItem
              onAddressSelect={this.onAddressSelect.bind(this, item)}
              addressInfo={item}
              onEditClick={this.onEditClick.bind(this, item)}
            />
          );
        })}
        {addressList.length !== 0 && (
          <View
            style={{ paddingBottom: this.detectionType(36, 0) }}
            className="add-new"
            onClick={this.onHandelNewAddress.bind(this)}
          >
            + 新建收货地址
          </View>
        )}
      </View>
    );
  }
}

export default XPage.connectFields()(addressList);
