import Taro from '@tarojs/taro';

import './AddressInfo.less';

import addressIcon from '@images/order/icon_address.png';
import { AtIcon } from 'taro-ui';
import { View } from '@tarojs/components';

export default class AddressInfo extends Taro.Component {
  static defaultProps = {
    addressInfo: null,
    canEdit: true,
  };

  static externalClasses = ['class-wrapper'];

  render() {
    const { addressInfo, canEdit } = this.props;
    return (
      <View className="class-wrapper">
        <View className="address-layout" onClick={this.props.onAddressInfoClick}>
          <Image className="address-image" src={addressIcon}>
            {' '}
          </Image>
          <View className="content-layout">
            {addressInfo == null ? (
              <Text className="empty-address-text">请添加收货地址</Text>
            ) : (
              <View className="info-layout">
                <View className="people-info-layout">
                  <View className="name">{addressInfo.name}</View>
                  <View className="phone">{addressInfo.phone}</View>
                  {addressInfo.defFlag && canEdit && <View className="default">默认</View>}
                </View>
                <View className="address-detail">
                  {addressInfo.province + addressInfo.city + addressInfo.district + addressInfo.detailAddress}
                </View>
              </View>
            )}
          </View>
          {canEdit && <AtIcon prefixClass="icon" value="youjiantou" size="13" color="#909090"></AtIcon>}
        </View>
      </View>
    );
  }
}
