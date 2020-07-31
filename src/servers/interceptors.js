import Taro from '@tarojs/taro';
import { HTTP_STATUS } from './config';

function showErrToast(errTip) {
  Taro.showToast({
    title: errTip,
    icon: 'none',
  });
}

const customInterceptor = (chain) => {
  const requestParams = chain.requestParams;

  return chain.proceed(requestParams).then((res) => {
    let errTip = '';
    if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
      errTip = '请求资源不存在';
      // return Promise.reject(errTip)
    } else if (res.statusCode === HTTP_STATUS.SERVER_ERROR) {
      errTip = '服务端出现了问题';
      // return Promise.reject(errTip)
    } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
      errTip = '服务端出现了问题';
      // return Promise.reject(errTip)
    } else if (res.statusCode === HTTP_STATUS.SUCCESS) {
      const data = res.data;
      if (data.resultCode === '0') {
        return Promise.resolve(data.resultData);
      } else if (data.resultCode === '-5') {
        // showErrToast(data.resultDesc)
        Taro.setStorageSync('Authorization', '');
        Taro.setStorageSync('userData', null);
        return Promise.reject(data);
      } else {
        showErrToast(data.resultDesc);
        return Promise.reject(data);
      }
    }
    if (errTip) {
      showErrToast(errTip);
      return Promise.reject(errTip);
    }
  });
};

const interceptors =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? [customInterceptor, Taro.interceptors.logInterceptor]
    : [customInterceptor];

export default interceptors;
