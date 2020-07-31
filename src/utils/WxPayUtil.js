import { address } from '../lib/ip/ip'
import Taro from '@tarojs/taro'
import request from "../servers/http"

class WxPayUtil {
  /**
   * [getPayInfo 支付提交]
   * @param  {[type]} payNo    [提交订单接口生成的支付单号]
   * @param  {String} payPrice [支付金额]
   * @param  {String} sendTime [预约时间]
   * @param  {Boolean} isDetail [业务标识,是否从订单详情页面进入]
   * @param  {String} orderNo  [订单编号]
   * @param  {Boolean} isVend  [业务标识,无人货柜业务]
   * @return {[type]}          [description]
   */
  static getPay({ payNo }, callBack = '', payFail = '') {
    request.post("/checkout-stand/changePayChannel", {
      payNo,
      ip: address(),
      payChannelId: 7
    }).then(res => {
      console.log(res)
      const data = JSON.parse(res.payInfo);
      Taro.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: `${data.package}`,
        signType: data.signType,
        paySign: data.sign,
        success: () => {
          Taro.hideLoading()
          console.log('pay success')
          callBack && callBack()
        },
        fail: err => {
          Taro.hideLoading()
          console.log("wxpay:fail", err);
          wx.showToast({
            title: "取消付款",
            icon: "none",
            duration: 3000
          });
          if (payFail) {
            payFail();
          }
        }
      });
    }).catch(res => {
      wx.showToast({
        title: "网络不稳定，支付失败",
        icon: "none",
        duration: 3000
      });
      if (payFail) {
        payFail();
      }
    });
  }
}

export default WxPayUtil;
