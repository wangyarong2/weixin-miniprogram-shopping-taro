import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import { AtIcon, AtFloatLayout } from 'taro-ui';

import './ChoosePayType.less';

export default class ChoosePayType extends Taro.Component {
  static defaultProps = {
    isOpened: false,
    onCloseClick: null,
    changePayType: null, //点击确认时回调
    confirmInfo: {},
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
  onConfirmClick() {
    this.onCloseClick();
  }

  onSelectPayClick(isSelectedCashPay) {
    this.setState({
      isSelectedCashPay,
    });
  }
  //处理支付两种支付的商品
  onConfirmSelectedClick(supportAllPayGoods) {
    const { confirmInfo } = this.props;
    const { isSelectedCashPay } = this.state;

    if (confirmInfo.shopList) {
      confirmInfo.shopList.forEach((shopInfo) => {
        if (shopInfo.skuList) {
          shopInfo.skuList.forEach((skuInfo) => {
            if (skuInfo.payTypes && skuInfo.payTypes.length > 1) {
              //支付两种支付都支持的类型，需要更新用户选择的支付方式:
              skuInfo.payType = isSelectedCashPay ? 2 : 1;
            }
          });
        }
      });
    }

    if (this.props.changePayType) {
      this.props.changePayType(confirmInfo);
    }
  }
  render() {
    const { title, isOpened, confirmInfo } = this.props;
    const { isSelectedCashPay } = this.state;

    //支持所有支付
    const supportAllPayGoods = [];
    //支持在线支付
    const onlySupportOnlinePayGoods = [];
    if (confirmInfo.shopList) {
      confirmInfo.shopList.forEach((shopInfo) => {
        if (shopInfo.skuList) {
          shopInfo.skuList.forEach((skuInfo) => {
            if (skuInfo.payTypes && skuInfo.payTypes.length > 1) {
              //支付两种支付类型
              supportAllPayGoods.push(skuInfo);
            } else {
              onlySupportOnlinePayGoods.push(skuInfo);
            }
          });
        }
      });
    }

    return (
      <AtFloatLayout scrollY={false} isOpened={isOpened} onClose={this.onCloseClick.bind(this)}>
        <View className="popup_container">
          <View className="popup_title">
            支付方式
            <View className="pupup_close" onClick={this.onCloseClick.bind(this)}>
              <AtIcon prefixClass="icon" value="shurukuang-qingchu" size="18" color="#CCCCCC" />
            </View>
          </View>

          <ScrollView scrollY={true} scrollWithAnimation className="scroll">
            {supportAllPayGoods.length && (
              <View className="goods-list">
                <View className="title" style={{ marginTop: 0 }}>
                  支持货到付款商品
                </View>
                <ScrollView className="image-list" scrollX scrollWithAnimation>
                  {supportAllPayGoods.map((item) => {
                    return <Image className="sku-image" src={item.spuImage} />;
                  })}
                </ScrollView>
                <View className="select-container">
                  <View
                    className={!isSelectedCashPay ? 'action selected' : 'action'}
                    onClick={this.onSelectPayClick.bind(this, false)}
                  >
                    在线支付
                  </View>
                  <View
                    className={isSelectedCashPay ? 'action selected' : 'action'}
                    onClick={this.onSelectPayClick.bind(this, true)}
                  >
                    货到付款
                  </View>
                </View>
              </View>
            )}

            {onlySupportOnlinePayGoods.length && (
              <View className="goods-list">
                <View className="title">仅支持在线支付商品</View>
                <ScrollView className="image-list" scrollX={true} scrollWithAnimation>
                  {onlySupportOnlinePayGoods.map((item) => {
                    return <Image className="sku-image" src={item.spuImage} />;
                  })}
                </ScrollView>

                <View className="select-container">
                  <View className="action  selected ">在线支付</View>
                  <View className="action disable">货到付款</View>
                </View>
              </View>
            )}
          </ScrollView>

          <View className="button-container">
            <View className="button" onClick={this.onConfirmSelectedClick.bind(this, supportAllPayGoods)}>
              确认
            </View>
          </View>
        </View>
      </AtFloatLayout>
    );
  }
}
