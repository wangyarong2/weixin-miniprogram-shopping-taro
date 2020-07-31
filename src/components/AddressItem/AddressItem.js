import Taro from '@tarojs/taro'

import './AddressItem.less'

import { AtIcon } from 'taro-ui'
import { View, Image } from '@tarojs/components'
import editImage from '../../assets/images/order/icon_address_edit.svg'

export default class AddressItem extends Taro.Component {

    static defaultProps = {
        addressInfo: {},
    }

    _onEditClick(addressInfo,e) {
        e.stopPropagation();
        this.props.onEditClick();
    }

    static externalClasses = ['class-wrapper']

    render() {
        const { addressInfo } = this.props
        return (
            <View className='class-wrapper'>
                <View className="address-layout" onClick={this.props.onAddressSelect}>
                    <View className="name-layout">
                        <View className="name">{addressInfo.name}</View>
                        {
                            addressInfo.defFlag &&
                            <View className="default">默认地址</View>
                        }
                    </View>
                    <View className="info-layout">
                        <View className="phone">{addressInfo.phone}</View>
                        <View className="address">{addressInfo.province + addressInfo.city + addressInfo.district + addressInfo.detailAddress}</View>
                    </View>
                    <View className="icon-layout" onClick={this._onEditClick.bind(this, addressInfo)}>
                        <Image style={'width:37rpx;height:37rpx;margin-bottom:10rpx'} src={editImage}></Image>
                        <View className="edit">编辑</View>
                    </View>
                </View>
            </View>
        )
    }
}
