/* eslint-disable import/prefer-default-export */
import HTTPREQUEST from "./http";

// 登录
export function postLogin(data) {
  return HTTPREQUEST.post('/wx-agent/user/login/simple', data);
}

export function getMebmerInfo() {
  return HTTPREQUEST.post('/community-client/member/home');
}

// 商品详情
export function getGoodsDetail(postData) {
  return HTTPREQUEST.post('/community-client/buyer/goods/detail', postData)
}

// 地址列表
export function getAddressList() {
  return HTTPREQUEST.post('/community-client/addressList')
}
