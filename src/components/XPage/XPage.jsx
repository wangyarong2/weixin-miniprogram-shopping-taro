import Taro from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import queryString from 'query-string';
import TextUtil from '../../utils/TextUtil';
import LoginUtil from '@utils/LoginUtil';
import { set as setGlobalData, get as getGlobalData } from '@utils/globalData.js';
import { postLogin, getMebmerInfo } from '@src/servers/servers';

export default class XPage extends Taro.Component {
  static connect = connect;

  static connectFields(fields) {
    let _fields = ['user'];

    if (typeof fields === 'string') {
      _fields.push(fields);
    } else if (fields instanceof Array) {
      _fields = _fields.concat(fields);
    }

    return (state) => {
      let expectState = {};
      _fields.forEach((field) => {
        expectState[field] = state[field];
      });
      return expectState;
    };
  }

  constructor() {
    super(...arguments);
    this.systemInfo = {};
  }

  // 简化路由参数获取， 在页面上直接 this.params
  get params() {
    return this.$router.params;
  }

  onGetUserInfo = async (e) => {
    const wxcode = await LoginUtil.getWXCode();
    const userinfo = e.detail;

    console.log('----', userinfo.errMsg);
    if (userinfo.errMsg !== 'getUserInfo:ok') {
      return Promise.reject(userinfo.errMsg);
    }

    return this.onPostLogin({
      code: wxcode,
      encryptedData: userinfo.encryptedData,
      iv: userinfo.iv,
      userInfo: userinfo.userInfo,
    });
  };

  onPostLogin(data) {
    const shareUserId = getGlobalData('shareUserId');
    data.shareUserId = shareUserId || '';
    console.log('------', 'ssss');
    return postLogin(data).then((res) => {
      const loginResult = res;
      loginResult.time = parseInt(new Date().getTime() / 1000, 10);
      Taro.setStorageSync('userData', loginResult);
      Taro.setStorageSync('Authorization', loginResult.access_token);
      Taro.setStorageSync('userinfo', data.userInfo);
      return getMebmerInfo().then((mebmerInfo) => {
        Taro.setStorageSync('member_info', mebmerInfo);
        setGlobalData('shareUserId', null);
        return Promise.resolve(true);
      });
    });
  }

  postFormId(formId) {
    if (formId === 'the formId is a mock one') return;
    request({
      url: '/wx-agent/ins/formId',
      data: { formId },
    });
  }

  previewOneImage(image) {
    Taro.previewImage({
      urls: [image],
    });
  }

  waitLater = () => {
    this.showToast({ title: '玩命开发中...' });
  };

  getSystemInfo() {
    const res = Taro.getSystemInfoSync();
    this.systemInfo = res;
  }

  /**
   * 检测手机机型是否是iphone X
   */
  detectionType = (size, nomaralSize) => {
    const that = this;
    let _size = '';
    Taro.getSystemInfo(
      {
        success: function (res) {
          var model = res.model;
          if (model.search('iPhone X') != -1) {
            that.isIpx = true;
            _size = size + 'rpx';
          } else {
            that.isIpx = false;
            _size = nomaralSize ? nomaralSize + 'rpx' : 0;
          }
        },
      },
      that
    );
    return _size;
  };

  /**
   * 页面跳转封装
   *
   */
  goPage = (options) => {
    const { url, type = 'push', params = {}, backCount = 1 } = options;

    const _params = TextUtil.isNotEmptyObject(params) ? '?' + queryString.stringify(params) : '';
    //作用：1、防止重复添加分隔线   2、方便取最后一个字段
    const _path = String(url).split('/');
    const _url = `/pages/${_path.join('/')}/${_path[_path.length - 1]}${_params}`;
    const _options = type === 'back' ? { delta: backCount } : { url: _url };

    console.log('%cRouter parmas:', 'color: #39c', _options);

    switch (type) {
      case 'replace': {
        return Taro.redirectTo(_options);
      }
      case 'back': {
        return Taro.navigateBack(_options);
      }
      case 'relaunch': {
        return Taro.reLaunch(_options);
      }
      case 'switchTab': {
        return Taro.switchTab(_options);
      }
      default: {
        return Taro.navigateTo(_options);
      }
    }
  };

  /**
   * 页面返回封装
   */
  goBack = (count = 1) => {
    return this.goPage({
      type: 'back',
      backCount: count,
    });
  };

  showToast = (options) => {
    const { icon = 'none' } = options;
    return Taro.showToast({
      ...options,
      icon,
    });
  };

  showLoading = (options = {}) => {
    const { title = '请稍后...', mask = true } = options;
    return Taro.showLoading({
      title,
      mask,
    });
  };

  hideLoading = () => {
    return Taro.hideLoading();
  };
}
