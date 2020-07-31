import Taro from '@tarojs/taro';
import PriceUtil from './PriceUtil';

class TextUtil {
  // 检查文字是否包含表情
  static isEmojiCharacter(substring) {
    if (substring) {
      const reg = new RegExp('[~#^$@%&!?%*]', 'g');
      if (substring.match(reg)) {
        return true;
      }
      for (let i = 0; i < substring.length; i++) {
        let hs = substring.charCodeAt(i);
        if (0xd800 <= hs && hs <= 0xdbff) {
          if (substring.length > 1) {
            let ls = substring.charCodeAt(i + 1);
            let uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;
            if (0x1d000 <= uc && uc <= 0x1f77f) {
              return true;
            }
          }
        } else if (substring.length > 1) {
          let ls = substring.charCodeAt(i + 1);
          if (ls == 0x20e3) {
            return true;
          }
        } else {
          if (0x2100 <= hs && hs <= 0x27ff) {
            return true;
          } else if (0x2b05 <= hs && hs <= 0x2b07) {
            return true;
          } else if (0x2934 <= hs && hs <= 0x2935) {
            return true;
          } else if (0x3297 <= hs && hs <= 0x3299) {
            return true;
          } else if (
            hs == 0xa9 ||
            hs == 0xae ||
            hs == 0x303d ||
            hs == 0x3030 ||
            hs == 0x2b55 ||
            hs == 0x2b1c ||
            hs == 0x2b1b ||
            hs == 0x2b50
          ) {
            return true;
          }
        }
      }
    }
  }

  /**
   * 判断对象是否是一个非空的对象
   * @param {object} obj 待验证的对象
   * @return {boolean} 返回判断结果, true 非空， false 为空或不是对象
   */

  static isNotEmptyObject(obj) {
    if (typeof obj !== 'object') return false;
    for (let k in obj) {
      if (obj.hasOwnProperty(k)) return true;
    }
    return false;
  }

  // 验证手机号是否合法
  static isPoneAvailable(str) {
    var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    if (!myreg.test(str)) {
      return false;
    } else {
      return true;
    }
  }

  //给金额加逗号以及小数点
  static formateMoneyWithDot(num) {
    if (isNaN(num))
      //如果传过来的不是数字类型就赋值为0
      num = '0';
    //判断是否为负数的标记
    let sign = num == (num = Math.abs(num));
    //对小数部分四舍五入
    num = Math.floor(num * 100 + 0.50000000001);
    let cents = num % 100;
    num = Math.floor(num / 100).toString();
    // 保留两位小数，如果小数部分只有一位则前面要加0
    if (cents < 10) cents = '0' + cents;
    let len = num.length;
    let str = '';
    for (let i = len - 1; i >= 0; i--) {
      str = num.charAt(i) + str;
      if (!(i % 3) && i) str = ',' + str;
    }
    num = str;
    //三目运算符判断是否为负数
    return (sign ? '' : '-') + num + '.' + cents;
  }

  // 给小于10的数字补0
  static addZero(num) {
    num = num.toString();
    return num[1] ? num : '0' + num;
  }

  // 时间格式化 返回的是 年月日时分秒
  static formatDateWithYMDHMS(time) {
    if (time === null || time === undefined) return '';
    const date = new Date(time);
    return (
      date.getFullYear() +
      '-' +
      this.addZero(date.getMonth() + 1) +
      '-' +
      this.addZero(date.getDate()) +
      ' ' +
      this.addZero(date.getHours()) +
      ':' +
      this.addZero(date.getMinutes()) +
      ':' +
      this.addZero(date.getSeconds())
    );
  }

  static getCurrentYeatAndMonth() {
    const data = new Date();
    return data.getFullYear() + '年' + this.addZero(data.getMonth() + 1) + '月';
  }

  // 时间格式化 返回的是 年月日时分秒
  static formatDateWithYMDHMS2(time) {
    const date = new Date(time);
    return (
      date.getFullYear() +
      '年' +
      this.addZero(date.getMonth() + 1) +
      '月' +
      this.addZero(date.getDate()) +
      '日 ' +
      this.addZero(date.getHours()) +
      ':' +
      this.addZero(date.getMinutes()) +
      ':' +
      this.addZero(date.getSeconds())
    );
  }

  static formatDateWithYMD(time) {
    const date = new Date(time);
    return date.getFullYear() + '-' + this.addZero(date.getMonth() + 1) + '-' + this.addZero(date.getDate());
  }

  // 传入时间获取分钟
  static getMinutes(time) {
    const minutes = parseInt((time % (1000 * 60 * 60)) / (1000 * 60), 10);
    return this.addZero(minutes);
  }

  // 传入时间获取秒
  static getSeconds(time) {
    const seconds = parseInt((time % (1000 * 60)) / 1000, 10);
    return this.addZero(seconds);
  }

  // 传入时间获取天
  static getDay(time) {
    const days = parseInt(time / (1000 * 60 * 60 * 24), 10);
    return days;
  }

  // 获取一天过期时间
  static getOneDayOverTime() {
    const data = new Date();
    const hour = data.getHours();
    const minutes = data.getMinutes();
    const seconds = data.getSeconds();

    const time = hour * 60 * 60 + minutes * 60 + seconds;
    const oneDay = 86400;
    return oneDay - time;
  }

  // 传入时间获取小时
  static getHours(time) {
    const hours = parseInt((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60), 10);
    return hours;
  }

  static formateStringIfEmpty(str) {
    if (typeof str != 'undefined' && str != null && str.length > 0) {
      return str;
    } else {
      return '';
    }
  }

  static isEmpty(str) {
    if (typeof str != 'undefined' && str != 'undefined' && str != 'null' && str != null && str.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  static formateMoney(price1, price2) {
    if (price1 == null) {
      price1 = 0;
    }
    if (price2 == null) {
      price2 = 0;
    }
    if (price1 == price2) {
      return price2 / 100 == 0 ? '' : (price2 / 100).toFixed(2);
    } else {
      return price1 / 100 + '~' + price2 / 100;
    }
  }

  static formatMoneyNew(lowPrice, highPrice) {
    let price1FormatYuan = PriceUtil.convertToFormatYuan(lowPrice);
    let price2FormatYuan = PriceUtil.convertToFormatYuan(highPrice);
    if (price2FormatYuan == 0) {
      return price1FormatYuan;
    } else if (price1FormatYuan === price2FormatYuan) {
      return price1FormatYuan;
    } else {
      return price1FormatYuan + ' ~ ' + price2FormatYuan;
    }
  }
  static formateMoney2(price1, price2) {
    if (price1 == null) {
      price1 = 0;
    }
    if (price2 == null) {
      price2 = 0;
    }
    if (price1 == price2) {
      return price2 / 100 == 0 ? '' : price2 / 100;
    } else {
      return price1 / 100 + '~' + price2 / 100;
    }
  }

  static formateIntegral(integral1, integral2) {
    if (integral1 == null) {
      integral1 = 0;
    }
    if (integral2 == null) {
      integral2 = 0;
    }
    if (integral2 == integral2) {
      return integral1;
    } else {
      return integral1 + '~' + integral2;
    }
  }

  static formateMeiBaoPrice(price) {
    if (typeof price != 'undefined' && price != null && price.length > 0) {
      if (price % 100 == 0) {
        //不带小数点
        return price / 100;
      } else {
        //带小数点
        return (price / 100).toFixed(2);
      }
    }
  }

  /**
   * sendType字段转转
   */
  static convertSendTimeToStr(sendTimeFormatHour) {
    if (sendTimeFormatHour === 0) return '';
    if (sendTimeFormatHour >= 24 * 3) {
      return Math.ceil(sendTimeFormatHour / 24) + '天内';
    } else {
      return sendTimeFormatHour || '' + '小时';
    }
  }
}

export default TextUtil;
