import { AtIcon } from 'taro-ui'
import { View } from '@tarojs/components'

import XPage from '@src/components/XPage/XPage'
import XAuthorize from "@src/components/XAuthorize/XAuthorize";

import request from "@src/servers/http";
import TextUtil from '@utils/TextUtil'
import { set as setGlobalData, get as getGlobalData } from '@utils/globalData';
import LoginUtil from '@utils/LoginUtil'
import ShareDialog from '../../../components/ShareCardDialog/ShareCardDialog'
import cardShare from "@images/member/card-share.png";

import './cardDetail.less'

class CardDetail extends XPage {
  config = {
    navigationBarTitleText: ''
  }

  state = {
    cardDetail: {
      communityList: []
    },
    qrCodeImage: '',
    getQrcodeErrorCount: 0,// 获取海报图片失败次数
    showShareDialog: false,
    cardId: null,
    shareUserId: null,
  }

  componentDidMount() {
    const user = Taro.getStorageSync('userData');
    const that = this;
    if (user != null && LoginUtil.isTokenExpired()) {
      //token过期
      console.log('---', 'token过期')
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            wx.login({
              success: function (res) {
                wx.getUserInfo({
                  withCredentials: true,
                  success: function (eee) {
                    console.log('eeeee', eee)
                    const data = { detail: eee }
                    that.onGetUserInfo(data).then(res => {
                      Taro.hideLoading();
                      const userData = Taro.getStorageSync('userData')
                      Taro.setStorageSync('userData', userData);
                      that.afterDidMount();
                    })
                  }
                })
              }
            })
          }
        }
      })
    } else {
      console.log('---', '未登录/或未过期')
      this.afterDidMount();
    }
  }

  componentDidShow() {
    const needRefresh = getGlobalData('refreshCardDetail')
    if (!TextUtil.isEmpty(needRefresh)) {
      this.getCardDetail()
      setGlobalData('refreshCardDetail', null)
    }
  }


  afterDidMount() {
    Taro.showLoading({ title: '加载中...' })
    const { scene } = this.$router.params
    if (scene) {
      //扫码进入首页
      const sceneData = decodeURIComponent(this.$router.params.scene).split('&')
      //userid + 加密字符串
      request.post('/wx-agent/exchangeId/get', { id: sceneData[1] }).then(res => {
        let sceneResult = res.scene.split('&');
        console.log('sceneData', sceneResult)
        let shareUserId = null;
        let cardId = null;
        shareUserId = sceneData[0];
        cardId = sceneResult[0];

        this.setState({
          shareUserId,
          cardId,
        }, () => {
          this.doAfterLogin();
        })
      })

    } else {
      let { shareUserId, id } = this.$router.params
      console.log('----1111', shareUserId, id)
      this.setState({
        shareUserId,
        cardId: id,
      }, () => {
        this.doAfterLogin();
      })
    }
  }

  doAfterLogin() {
    this.getCardDetail()
  }

  getCardDetail() {
    const requestParams = {
      cardId: this.state.cardId
    }
    request.post("/community-client/community/equityCard/detail", requestParams).then(res => {
      Taro.hideLoading();
      this.setState({ cardDetail: res })
      Taro.setNavigationBarTitle({
        title: res.cardName || ''
      })
      if (this.state.shareUserId && LoginUtil.checkLogin()) {
        this.toRelationCard()
      }
    }).catch(e => {
      Taro.hideLoading();
    })
  }

  toRelationCard() {
    const bindRequestParams = {
      fromUserId: this.state.shareUserId,
      toUserId: Taro.getStorageSync('userData').userId,
      equityCardId: this.state.cardId
    }
    console.log('bindRequestParams', bindRequestParams)
    request.post("/community-client/community/equityCard/share", bindRequestParams).then(result => { })
  }

  handleUseClick(data) {
    this.goPage({
      url: 'memberCenter/equityDetail',
      params: {
        equityId: data.equityId,
        cardId: this.state.cardDetail.id
      }
    })
  }

  onLoginSuccess() {
    request.post("/community-client/mx/member/home", {}).then(res => {
      Taro.setStorageSync("currentShopId", res.shop.shopId);
      this.getCardDetail()
    });
  }

  // 购买
  async handleBuyclick() {
    Taro.showLoading({ title: '请稍候...', mask: true });

    const { cardDetail } = this.state
    const currentShopId = Taro.getStorageSync('currentShopId')
    const requestParams = {
      shopId: currentShopId,
      spuId: cardDetail.spuId
    }
    const goodsDetail = await request.post("/community-client/buyer/goods/detail", requestParams)

    const skuData = goodsDetail.skuList.map(item => {
      return {
        number: 1,
        skuId: item.skuId,
        spuId: goodsDetail.spuId
      }
    })
    const shopList = [{
      deliveryType: goodsDetail.deliveryType,
      shopId: currentShopId,
      supplyId: goodsDetail.supplyId,
      skuIdAndCountList: skuData
    }]
    const confirmRequestParams = {
      actionFlag: 0,
      addressId: null,
      shopList
    }
    confirmRequestParams.hasBalance = true
    console.log(confirmRequestParams)

    request.post('/community-client/cartConfirm', confirmRequestParams).then(res => {
      Taro.hideLoading();

      setGlobalData('cartConfirmData', res)
      this.goPage({ url: 'order/confirmOrder', params: { productType: 2 } })
    })
  }

  onShareAppMessage() {
    let path = `/pages/memberCenter/cardDetail/cardDetail?id=${this.state.cardDetail.id}&shareUserId=${Taro.getStorageSync('member_info').userId}`;
    return {
      title: this.state.cardDetail.cardName,
      path: path,
    }
  }

  phoneCall(mobilePhone) {
    if (!mobilePhone) return
    wx.makePhoneCall({
      phoneNumber: mobilePhone
    })
  }

  //分享相关
  shareDialogRef = (node) => this.ShareDialog = node

  onShareClick = () => {
    this.getQrCodeImage();
  }

  //获取二维码
  getQrCodeImage() {
    Taro.showLoading({
      title: '生成中...'
    })
    let shareOriginId = {}
    shareOriginId = this.state.cardDetail.id + "&" + Taro.getStorageSync('member_info').userId
    request.post('/wx-agent/exchangeId/save', { scene: shareOriginId }).then(res => {
      const id = res.id;
      request.post('/wx-agent/wxdrcode/get', {
        userId: Taro.getStorageSync('member_info').userId,
        originId: id,
        sharePage: "pages/memberCenter/cardDetail/cardDetail",
        type: 1
      }).then((res) => {
        this.setState({
          qrCodeImage: res
        }, () => {
          this.setState({
            showShareDialog: true
          }, () => {
            this.ShareDialog.init();
          })
        })
      }).catch(res => {
        this.state.getQrcodeErrorCount += 1;
        if (this.state.getQrcodeErrorCount > 2) {
          this.state.getQrcodeErrorCount = 0;
          Taro.hideLoading();
          this.onCloseDialogClick();
          Taro.showToast({
            title: '分享海报生成失败',
            icon: 'none',
            duration: 2000
          })
        } else {
          Taro.hideLoading();
          this.getQrCodeImage();
        }
      })
    })
  }

  onCloseDialogClick() {
    this.setState({
      showShareDialog: false
    })
  }

  render() {
    const { cardDetail, showShareDialog, qrCodeImage } = this.state
    return (
      <XAuthorize loginCallback={this.onLoginSuccess.bind(this)} isFullHeight>
        {
          showShareDialog &&
          <ShareDialog
            qrCodeImage={qrCodeImage}
            meicardImg={cardDetail.imgUrl}
            totalPrice={cardDetail.cost}
            price={cardDetail.price / 100}
            name={cardDetail.cardName}
            ref={this.shareDialogRef}
            onCloseClick={this.onCloseDialogClick.bind(this)}
          >
          </ShareDialog>
        }
        <View>
          <View className="card-box">
            <View className="flex-space-between">
              <View className="card-name">{cardDetail.cardName}</View>
              <View className="card-share flex-center">
                <Image className="card-share-bg" src={cardShare}></Image>
                <View className="card-share-text" onClick={this.onShareClick}>
                  分享
                  {/* <Button
                    openType="share"
                    className='btn-transparent'
                  /> */}
                </View>
              </View>
            </View>
            <View className="card-des">门店{cardDetail.equityCount}项权益</View>
            <View className="card-bottom flex-space-between">
              {cardDetail.buy ?
                <View className="card-time">
                  <Text>有效期至</Text>
                  <Text>{TextUtil.formatDateWithYMDHMS(cardDetail.endTime)}</Text>
                </View>
                :
                <View className="card-time"></View>
              }
              <View>
                <Text>总价值¥</Text>
                <Text className="card-num">{cardDetail.cost}</Text>
              </View>
            </View>
          </View>
          <View className="list-container">
            {cardDetail.communityList.map(item =>
              <View className="list-item" key={item.cardId}>
                <View className="shop-box">
                  <Image className="item-iamge" src={item.logoImage}></Image>
                  <View className="shop-name">{item.shopName}</View>
                </View>
                <View className="card-contact" style={{ marginBottom: '16rpx' }}>
                  <AtIcon prefixClass='icon' value='position' color='#333' size='20' ></AtIcon>
                  <Text className="contact-text">{item.address}</Text>
                </View>
                <View className="card-contact" onClick={this.phoneCall.bind(this, item.mobilePhone)}>
                  <AtIcon prefixClass='icon' value='call' color='#333' size='18' ></AtIcon>
                  <Text className="contact-text">{item.mobilePhone}</Text>
                </View>
                <View className="card-data-container">
                  {item.detail.map((detail, detailIndex) =>
                    <View className="card-data" onClick={this.handleUseClick.bind(this, detail)}>
                      <View className="flex-space-between">
                        <View className="item-name">{detailIndex + 1}、{detail.equityName}</View>
                        <View className="item-count">
                          <Text>价值</Text>
                          <Text>¥{detail.cost}元</Text>
                        </View>
                      </View>
                      <View className="flex-space-between" style={{ marginTop: '12rpx' }}>
                        {detail.endTime ?
                          <View className="item-time">有效期 {TextUtil.formatDateWithYMD(detail.startTime)} ～ {TextUtil.formatDateWithYMD(detail.endTime)}</View>
                          :
                          <View className="item-time">有效期 不限</View>
                        }
                        <View className="item-btn flex-center">去使用</View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
          <View className="bottom-container fixed-bottom" style={{ paddingBottom: this.detectionType(36, 24) }}>
            {cardDetail.buy ?
              <View className="btn-buy flex-center btn-transparent" onClick={this.onShareClick}>
                去分享 可赚{(cardDetail.price / 2 / 100).toFixed(2)}元
                {/* <Button
                  openType="share"
                  className='btn-transparent'
                /> */}
              </View>
              :
              <View className="btn-buy flex-center" onClick={this.handleBuyclick}>立即购买 仅需{cardDetail.price / 100}元</View>
            }
          </View>
        </View>
      </XAuthorize>
    )
  }
}

export default XPage.connectFields()(CardDetail)
