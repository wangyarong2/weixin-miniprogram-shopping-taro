import XPage from '@src/components/XPage/XPage';
import { View } from '@tarojs/components';
import './contactDetail.less';
import request from '../../../servers/http';

import shopIcon from '@images/mine/icon_shop_info.png';
import ShopInfo from '../../../components/ShopInfo/ShopInfo';
import TextUtil from '../../../utils/TextUtil';
import defaultQr from '@images/default/qr_code_def.png';
import { AtIcon } from 'taro-ui';

class contactDetail extends XPage {
  config = {
    navigationBarTitleText: '联系方式',
  };

  state = {
    shopInfo: {},
  };

  componentDidMount() {
    const { shopId } = this.$router.params;
    this.getShopDetail(shopId);
  }

  getShopDetail(shopId) {
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request
      .post('/community-client/member/queryShopDetail', { shopId })
      .then((res) => {
        Taro.hideLoading();
        this.setState({
          shopInfo: res,
        });
      })
      .catch((res) => {
        Taro.hideLoading();
      });
  }

  render() {
    const { shopInfo } = this.state;
    return (
      <View className="contact-detail-page">
        {/* <View className="top-layout">
          <View className="black-text">联系店主</View>
          <View className="red-text">获赠实物券</View>
        </View> */}
        <View className="info-layout">
          <View className="level">店主</View>
          <View className="info">
            <View className="user-name">{shopInfo.keeperName}</View>
            <View className="tel-layout">
              <View className="tel">电话 {TextUtil.formateStringIfEmpty(shopInfo.keeperPhone)}</View>
              <View className="wx">微信 {TextUtil.formateStringIfEmpty(shopInfo.keeperWechat)}</View>
            </View>
            <View className="address-layout">
              <View className="icon">
                <AtIcon prefixClass="icon" value="dianpu" size="18" color="#000" />
              </View>
              <View className="line"></View>
              <View className="detail-address">
                <View className="shop-name">{shopInfo.shopName}</View>
                <View className="shop-address">
                  {TextUtil.formateStringIfEmpty(shopInfo.province) +
                    TextUtil.formateStringIfEmpty(shopInfo.city) +
                    TextUtil.formateStringIfEmpty(shopInfo.district) +
                    TextUtil.formateStringIfEmpty(shopInfo.detailAddress)}
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="qr-code-layout">
          <View className="head-layout">
            <Image className="head-image" src={shopInfo.keeperFaceLink}></Image>
            <View className="name">{shopInfo.keeperName}</View>
          </View>
          <Image
            className="qr-code"
            src={TextUtil.isEmpty(shopInfo.keeperWechatQRCode) ? defaultQr : shopInfo.keeperWechatQRCode}
          ></Image>
          <View className="add-me">
            {TextUtil.isEmpty(shopInfo.keeperWechatQRCode)
              ? '店主未上传二维码，请使用电话联系'
              : '扫一扫上面二维码，加我微信'}
          </View>
        </View>
      </View>
    );
  }
}

export default XPage.connectFields()(contactDetail);
