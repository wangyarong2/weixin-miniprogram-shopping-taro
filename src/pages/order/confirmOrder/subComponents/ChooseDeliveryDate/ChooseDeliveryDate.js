import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Image, Picker } from '@tarojs/components';
import { AtIcon, AtFloatLayout } from 'taro-ui';
import TextUtil from '@utils/TextUtil';

import './ChooseDeliveryDate.less';

export default class ChooseDeliveryDate extends Taro.Component {
  static defaultProps = {
    isOpened: false,
    changeCallback: null, //点击确认时回调
    confirmInfo: null,
    onCloseClick: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      isSelectedCashPay: false, //选中货到付款
    };
  }
  onCloseClick() {
    if (this.props.onCloseClick) {
      this.props.onCloseClick();
    }
  }
  setDefaultDate() {
    if (this.props.changeCallback) {
      this.props.changeCallback({ title: '按商品发货时间发货', value: '' });
    }
  }
  setDeliveryDate(e) {
    //用户点击确定时返回的时间
    if (this.props.changeCallback) {
      this.props.changeCallback({ title: e.detail.value, value: e.detail.value });
    }
  }
  //获取当前商品中发货时间最晚的一个时间戳+10天
  getStartDate() {
    //当前时间  时间戳
    let startDate = 0;
    const { confirmInfo } = this.props;
    if (confirmInfo == null) return startDate;
    if (confirmInfo.shopList == null) return startDate;
    confirmInfo.shopList.forEach((shopInfo) => {
      if (shopInfo.skuList) {
        shopInfo.skuList.forEach((skuInfo) => {
          startDate = Math.max(startDate, skuInfo.deliveryInTime);
        });
      }
    });

    return startDate + 10 * 24 * 60 * 60 * 1000;
  }

  render() {
    const { isOpened } = this.props;
    const startDate = TextUtil.formatDateWithYMD(this.getStartDate());
    return (
      <AtFloatLayout isOpened={isOpened} onClose={this.onCloseClick.bind(this)}>
        <View className="popup_container">
          <View className="item" onClick={this.setDefaultDate.bind(this)}>
            默认收货时间
          </View>
          <Picker
            className="item"
            mode="date"
            start={startDate}
            end="2030-09-01"
            onChange={this.setDeliveryDate.bind(this)}
          >
            <View>指定收货时间</View>
          </Picker>
          <View className="item" onClick={this.onCloseClick.bind(this)}>
            取消
          </View>
        </View>
      </AtFloatLayout>
    );
  }
}
