import Taro from '@tarojs/taro';
import { baseUrl, cmsBaseUrl } from './config';
import interceptors from './interceptors';
import { AREA_CODE } from '@src/constants/common';
import { get as getGlobalData } from '@utils/globalData';

interceptors.forEach((i) => Taro.addInterceptor(i));

class httpRequest {
  baseOptions(params, method = 'GET') {
    let { url, data = {}, baseHeader = false, baseUrl } = params;
    const authorization =
      baseHeader || url.indexOf('login/simple') != -1
        ? 'Basic c2p5eDpzanl4'
        : Taro.getStorageSync('Authorization') || 'Basic c2p5eDpzanl4';
    const option = {
      url: baseUrl + url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
        Authorization: authorization,
        areaCode: this.getAreaCode(),
        client_source: 4293,
        biz_code: 1,
        platform_id: 6,
      },
    };
    return Taro.request(option);
  }
  getAreaCode() {
    let areaCode = getGlobalData(AREA_CODE);

    if (areaCode) {
      return areaCode;
    } else {
      return '';
    }
  }

  // get(url, data = "") {
  //   let option = { url, data };
  //   return this.baseOptions(option);
  // }

  post(url, data, baseHeader) {
    const params = { url, data, baseHeader, baseUrl };
    return this.baseOptions(params, 'POST');
  }

  cmsPost({ url, data, baseHeader }) {
    const params = { url, data, baseHeader, baseUrl: cmsBaseUrl };
    return this.baseOptions(params, 'POST');
  }
}

export default new httpRequest();
