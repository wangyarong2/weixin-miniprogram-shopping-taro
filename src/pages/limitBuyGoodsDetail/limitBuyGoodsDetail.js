import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import XPage from '@src/components/XPage/XPage'
import XAuthorize from '@src/components/XAuthorize/XAuthorize'
import SkuModel from '@src/components/SkuModel/SkuModel'
import XSwiper from '@src/components/XSwiper/XSwiper'
import PriceView from '@src/components/PriceView/price'

import LoginUtil from '@utils/LoginUtil'
import TextUtil from '@utils/TextUtil'
import request from '@src/servers/http'
import { set as setGlobalData, get as getGlobalData } from '@utils/globalData';
import ShareDialog from '../../components/ShareDialog/ShareDialog'
import BalanceNotEnoughDialog from '../../components/BalanceNotEnough/BalanceNotEnough'

import bgLimitBuy from '../../assets/images/product/bg_limit_buy.png'
import bgLimitBuyS from '../../assets/images/product/flash_sale_bg_l.png'
import tagLimit from '../../assets/images/product/tag_litmit_buy.png'

import {
    getAddressList
} from '@src/servers/servers'

import './limitBuyGoodsDetail.less'

class limitBuyGoodsDetail extends XPage {
    config = {
        navigationBarTitleText: '限购详请',
        navigationStyle: 'custom'
    }

    constructor(props) {
        super(props)
        this.state = {
            productDetail: {
                highUnitPrice: 0,
                lowShowPrice: 0,
                showPrice: 0,
                highOriginPrice: 0,
                lowOriginPrice: 0,
                highOriginPrice: 0,
                skuList: [],
                promotionInfo: {
                    limitCount: 0,
                    useCountLimit: 0
                },
                shop: {
                    shopName: '',
                }
            },
            isOpen: false, // 是否显示弹层
            productType: 5,// 5限购商品
            currentAddressData: '请选择收货地址', // 选择的地址信息
            checkAddressData: null,// 选中的地址

            allSpecText: '请选择商品规格',
            currentSpecData: null,
            currentSpecCount: 1,
            cartAction: 'cart', // cart(加入购物车) buy(立即购买)
            showShareDialog: false,
            templateId: null, //限购活动id
            shopId: null,
            deliveryType: null,//deliveryType  发货类型：1自提，2快递 3两种方式都有
            qrCodeImage: '',
            getQrcodeErrorCount: 0,// 获取海报图片失败次数
            shareUserId: null,
            showNotEnoughDialog: false,
            couponPrice: 0,
            mxCouponBalance: 0,
            pageType: null,// 0距离多久开始 -1结束 1可以购买
            beginTimeIntervalId: null,
            finishTimeIntervalId: null,
            beginTime: 0,//开始时间
            finishTime: 0,//结束时间
        }
    }

    componentWillMount() {
        this.getSystemInfo()
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
        console.log('取限购活动id', getGlobalData('payTemplateId'))
        if (!TextUtil.isEmpty(getGlobalData('payTemplateId'))) {
            this.afterDidMount();
            setGlobalData('payTemplateId', null)
        }
    }

    afterDidMount() {
        Taro.showLoading({ title: '加载中...' })
        const { scene } = this.$router.params
        if (scene) {
            //扫码进入首页
            const sceneData = decodeURIComponent(this.$router.params.scene).split('&')
            //userid + 加密字符串
            request.post('/wx-agent/exchangeId/get', { id: sceneData[1] == null ? sceneData[0] : sceneData[1] }).then(res => {
                let sceneResult = res.scene.split('&');
                console.log('sceneData', sceneResult)
                let shareUserId = null;
                let shopId = null;
                let templateId = null;

                //从h5分享过来
                if (sceneData[1] == null) {
                    shareUserId = sceneResult[0];
                    templateId = sceneResult[1];
                    shopId = sceneResult[2];
                }

                //从小程序扫码分享进来
                if (sceneData[1] != null) {
                    shareUserId = sceneData[0];
                    templateId = sceneResult[0];
                    shopId = sceneResult[1];
                }

                this.setState({
                    shareUserId,
                    templateId,
                    shopId,
                }, () => {
                    if (LoginUtil.checkLogin() && !TextUtil.isEmpty(shopId)) {
                        request.post('/community-client/member/bind', { shopId }).then(res => {
                            if (res.suc) {
                                Taro.setStorageSync('HomePageRefreshShopList', true);
                                Taro.setStorageSync('currentShopId', shopId);
                            } else {
                                Taro.showToast({
                                    title: res.message,
                                    icon: 'none',
                                    duration: 2000
                                })
                            }
                        })
                    } else {
                        setGlobalData('shareUserId', this.state.shopId);
                    }
                    this.doAfterLogin();
                })
            })

        } else {
            let { shareUserId, shopId, templateId, fromProductItem } = this.$router.params
            console.log('----1111', shareUserId, shopId, templateId)
            if (LoginUtil.checkLogin()) {
                const mShopId = Taro.getStorageSync('currentShopId')
                if (shopId != mShopId && !(fromProductItem + '' == 'true')) {
                    //进来的shopid 与 当前用户的shopId不一样 绑定关系
                    request.post('/community-client/member/bind', { shopId }).then(res => {
                        if (res.suc) {
                            Taro.setStorageSync('HomePageRefreshShopList', true);
                            Taro.setStorageSync('currentShopId', shopId);
                        } else {
                            Taro.showToast({
                                title: res.message,
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    })
                }
            } else {
                setGlobalData('shareUserId', shopId);
            }
            this.setState({
                shareUserId,
                shopId,
                templateId
            }, () => {
                this.doAfterLogin();
            })
        }
    }

    doAfterLogin() {
        const isLogin = LoginUtil.checkLogin()
        const { templateId, shopId } = this.state
        console.log('00000', templateId, shopId)
        request.post('/community-client/miniapp/special/detail', { templateId, shopId }).then(data => {
            Taro.hideLoading();
            console.log('商品详情(goods/detail)', data)
            const resultData = data
            Taro.setNavigationBarTitle({
                title: resultData.name
            })
            this.setState({
                isLogin,
                productDetail: resultData,
                skuList: resultData.skuList,
                specList: resultData.specList,
                isFavorites: resultData.favorites,
            }, () => {
                if (isLogin) {
                    this.getAddressList();
                }
                const useCountLimit = resultData.promotionInfo.limitCount != null && resultData.promotionInfo.currentUserBuyCount < resultData.promotionInfo.limitCount
                const maxCount = (resultData.promotionInfo.limitCount == null ? 0 : resultData.promotionInfo.limitCount) - resultData.promotionInfo.currentUserBuyCount
                // 当Sku只有一件时 默认选中
                if (resultData.skuList.length == 1) {
                    let specValueArr = []
                    resultData.skuList[0].specList.forEach(item => {
                        specValueArr.push(item.specValue)
                    })
                    const { skuList, specList } = this.state
                    setTimeout(() => {
                        this.SkuModel.initWithNewData2(skuList, specList, specValueArr, useCountLimit, maxCount);
                        this.SkuModel.setDefaultDeliveryType(resultData.deliveryType)
                        this.setDefaultSpec();
                    }, 300);
                } else {
                    const { skuList, specList } = this.state
                    setTimeout(() => {
                        this.SkuModel.initWithDefaultData2(skuList, specList, useCountLimit, maxCount);
                        this.SkuModel.setDefaultDeliveryType(resultData.deliveryType)
                    }, 300);
                }
                if (resultData.promotionInfo.groupProgress == 1) {
                    this.setState({
                        pageType: 0,
                        finishTime: resultData.promotionInfo.endTime - resultData.promotionInfo.startTime,
                        beginTime: resultData.promotionInfo.startTime - resultData.promotionInfo.now
                    }, () => {
                        this.startBeginCountDown();
                    })
                }
                if (resultData.promotionInfo.groupProgress == 2) {
                    this.setState({
                        pageType: 1,
                        finishTime: resultData.promotionInfo.endTime - resultData.promotionInfo.now,
                        beginTime: 0
                    }, () => {
                        this.startFinishCountDown();
                    })
                }
                if (resultData.promotionInfo.groupProgress == 3) {
                    this.setState({
                        pageType: -1,
                        finishTime: 0,
                        beginTime: 0
                    })
                }
            })
        })
    }

    // 规格默认显示的内容
    setDefaultSpec() {
        const { skuList } = this.state
        let strBuff = ""
        skuList[0].specList.forEach(element => {
            strBuff += element.specName + ":" + element.specValue + "; "
        })
        strBuff = strBuff.substring(0, strBuff.length - 2) + ""
        this.setState({
            currentSpecData: skuList[0],
            allSpecText: "已选" + 1 + "件; " + strBuff,
            currentSpecCount: 1
        })
    }

    // 获取地址列表
    getAddressList() {
        getAddressList().then((res) => {
            res.list.forEach(element => {
                if (element.defFlag == true) {
                    this.setState({
                        checkAddressData: element
                    }, () => {
                        this.setState({ currentAddressData: this.state.checkAddressData.province + this.state.checkAddressData.city + this.state.checkAddressData.district + this.state.checkAddressData.detailAddress })
                    })
                }
            });
        })
    }

    //活动开始倒计时
    startBeginCountDown() {
        const beginTimeIntervalId = setInterval(() => {
            let { beginTime } = this.state
            if (beginTime <= 0) {
                beginTime = 0;
                clearInterval(beginTimeIntervalId);
                this.setState({
                    pageType: 1
                }, () => {
                    this.startFinishCountDown();
                })
            } else {
                beginTime -= 1000;
            }
            this.setState({
                beginTime
            })
        }, 1000);
        this.setState({
            beginTimeIntervalId: beginTimeIntervalId
        })
    }

    //限购结束倒计时
    startFinishCountDown() {
        const finishTimeIntervalId = setInterval(() => {
            let { finishTime } = this.state
            if (finishTime <= 0) {
                finishTime = 0;
                clearInterval(finishTimeIntervalId);
                this.setState({
                    pageType: -1
                })
            } else {
                finishTime -= 1000;
            }
            this.setState({
                finishTime
            })
        }, 1000);
        this.setState({
            finishTimeIntervalId: finishTimeIntervalId
        })
    }



    // 收藏商品
    postGoodsStar() {
        request.post('/community-client/good/follow', { spuId: this.state.productDetail.spuId, shopId: this.state.productDetail.shop.id })
            .then(res => {
                this.state.productDetail.favorites = res.data
                this.setState({ productDetail: this.state.productDetail })
                Taro.showToast({
                    title: res.data ? '收藏成功' : '取消收藏',
                    icon: 'none'
                })
            })
    }

    // 点击立即购买
    handleBuyClick() {
        this.showSku(true, 'buy')
    }

    skuModelRef = (node) => this.SkuModel = node
    shareDialogRef = (node) => this.ShareDialog = node

    // 显示 Sku
    showSku(isOpen, cartAction = 'cart') {
        if (this.state.pageType == -1) return
        this.setState({
            isOpen,
            cartAction
        })
    }

    // sku 选择确定后的回调
    onSkuConfirm(data) {
        console.log('回调的数据', data)
        const { currentSpecData, allSpecText, currentSpecCount, deliveryType } = data
        this.setState({
            allSpecText: "已选" + currentSpecCount + "件 " + allSpecText,
            currentSpecData: currentSpecData,
            currentSpecCount,
            deliveryType,
        }, () => {
            this.setState({ isOpen: false })
            if (this.state.cartAction === 'cart') {
                this.postAddCart()
            }
            if (this.state.cartAction === 'buy') {
                this.postPay()
            }
        })
    }

    // 加入购物车
    postAddCart() {
        const { currentSpecData, currentSpecCount, productDetail, deliveryType } = this.state;
        const postData = {
            skuId: currentSpecData.skuId,
            skuNumber: currentSpecCount,
            shopId: this.params.shopId,
            supplyId: productDetail.supplyId,
            deliveryType
        }
        request.post('/community-client/addCart', postData).then(res => {
            Taro.showToast({
                title: '已加入购物车',
                icon: 'none'
            })
        })
    }

    postPay() {
        this.requestConformProduct();
    }

    requestConformProduct() {
        this.onCancelClick();
        const { productDetail, currentSpecData, currentSpecCount } = this.state
        if (productDetail.promotionInfo.limitCount == null || (productDetail.promotionInfo.currentUserBuyCount + currentSpecCount) <= productDetail.promotionInfo.limitCount) {
            this.postConfirmOrder(false)
        } else {
            Taro.showModal({
                title: '提示',
                content: "已超出购买限制将以原价" + (currentSpecData.marketPrice / 100) + "元购买，是否继续购买？",
                success: res => {
                    if (res.confirm) {
                        this.postConfirmOrder(true)
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        }

    }

    postConfirmOrder(useNormalPrice) {
        //是否使用正常的价格下单
        const { productType } = this.state
        Taro.showLoading({ title: '请求中...', mask: true });
        console.log('currentSpecData', this.state.currentSpecData)
        console.log('currentSpecCount', this.state.currentSpecCount)
        const { currentSpecData, checkAddressData, currentSpecCount, productDetail, deliveryType } = this.state;
        const skuIdAndCountList = [{
            skuId: currentSpecData.skuId,
            spuId: productDetail.spuId,
            number: currentSpecCount
        }]
        let shopList = {};
        shopList = [{
            deliveryType,
            shopId: productDetail.shop.id,
            supplyId: productDetail.supplyId,
            skuIdAndCountList: skuIdAndCountList
        }];
        let requestData = { actionFlag: 0, shopList };
        if (checkAddressData != null) {
            requestData.addressId = checkAddressData.addressId
        }

        if (useNormalPrice) {

        } else {
            requestData.warehouseType = 11
            requestData.templateId = this.state.templateId
        }


        requestData.hasBalance = true
        request.post('/community-client/cartConfirm', requestData).then(res => {
            Taro.hideLoading();
            console.log('是否已正常价格下单', useNormalPrice)
            if (useNormalPrice) {

            } else {
                res.templateId = this.state.templateId
            }
            res.selfSupport = this.state.productDetail.selfSupport
            setGlobalData('cartConfirmData', res)
            this.goPage({ url: 'order/confirmOrder', params: { productType: useNormalPrice ? 0 : 5 } })
        }).catch(res => {
            Taro.hideLoading();
            Taro.showToast({
                title: res.resultDesc,
                icon: 'none'
            })
        })
    }

    onAskClick() {
        this.onCancelClick();
        this.goPage({ url: 'coupon/chooseShop', params: { type: 'fromAsk' } })
    }
    onCancelClick() {
        this.setState({
            showNotEnoughDialog: false
        })
    }

    onLinkHome() {
        console.log('shareUserId', this.state.shareUserId)
        if (TextUtil.isEmpty(this.state.shareUserId)) {
            this.goBack();
        } else {
            this.goPage({
                url: 'home',
                type: 'switchTab'
            })
        }
    }

    onLinkShopcart() {
        Taro.switchTab({
            url: '/pages/shopcart/shopcart'
        })
    }

    onShareClick = () => {
        this.getQrCodeImage();
    }

    //获取二维码
    getQrCodeImage() {
        Taro.showLoading({
            title: '生成中...'
        })
        let shareOriginId = {}
        shareOriginId = this.state.templateId + "&" + this.state.shopId
        request.post('/wx-agent/exchangeId/save', { scene: shareOriginId }).then(res => {
            const id = res.id;
            request.post('/wx-agent/wxdrcode/get', {
                userId: Taro.getStorageSync('member_info').userId,
                originId: id,
                sharePage: "pages/limitBuyGoodsDetail/limitBuyGoodsDetail",
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

    onProductDown() {
        Taro.showToast({
            title: '该商品已售罄',
            icon: 'none',
            duration: 2000
        })
    }

    onCloseDialogClick() {
        this.setState({
            showShareDialog: false
        })
    }

    onBuyNotBeginClick() {
        Taro.showModal({
            title: '活动暂未开始',
            showCancel: false,
            success: res => {
            }
        })
    }

    //分享给好友
    onShareAppMessage() {
        let path = null;
        path = `/pages/limitBuyGoodsDetail/limitBuyGoodsDetail?templateId=${this.state.templateId}&shareUserId=${Taro.getStorageSync('member_info').userId}&shopId=${this.state.productDetail.shop.id}`
        console.log('path', path)
        return {
            title: this.state.productDetail.name,
            path: path,
            imageUrl: this.state.productDetail.imageUrl
        }
    }

    onLoginSuccess() {
        request.post('/community-client/mx/member/home', {}).then(res => {
            console.log('店铺信息', res)
            Taro.setStorageSync('currentShopId', res.shop.shopId)
            Taro.setStorageSync('userHasLogin', true)
            if (TextUtil.isEmpty(this.state.shopId)) {
                this.setState({
                    shopId: res.shop.shopId
                }, () => {
                    this.doAfterLogin();
                })
            }
        })
    }

    onShopClick() {
        this.goPage({ url: 'coupon/contactDetail', params: { shopId: this.state.productDetail.supplyId } })
    }

    render() {
        let {
            productDetail,
            skuList,
            specList,
            allSpecText,
            showShareDialog,
            productType,
            currentAddressData,
            qrCodeImage,
            showNotEnoughDialog,
            couponPrice,
            beginTime,
            finishTime,
            pageType
        } = this.state

        const priceSame = (productDetail.lowShowPrice == productDetail.highUnitPrice)
        const topStyle = { width: '750rpx', height: !priceSame ? '244rpx' : '211rpx' }
        return (
            <View style={{ paddingBottom: this.detectionType(136, 100), height: '100%', overflowY: 'scroll' }}>
                {
                    showShareDialog &&
                    <ShareDialog
                        qrCodeImage={qrCodeImage}
                        productType={productType}
                        onCloseClick={this.onCloseDialogClick.bind(this)}
                        productImage={productDetail.imageUrl}
                        productName={productDetail.name}
                        oldPrice={'原价￥' + (productDetail.highOriginPrice / 100) + '元'}
                        shopName={productDetail.shop.shopName}
                        price={TextUtil.formateMoney(productDetail.lowShowPrice, productDetail.highUnitPrice)}
                        return={''}
                        ref={this.shareDialogRef}
                    >
                    </ShareDialog>
                }

                {
                    showNotEnoughDialog &&
                    <BalanceNotEnoughDialog couponPrice={couponPrice} onConfirmClick={this.requestConformProduct.bind(this)} onAskClick={this.onAskClick.bind(this)} onCancelClick={this.onCancelClick.bind(this)}></BalanceNotEnoughDialog>
                }

                <View className="custombar-container" onClick={this.onLinkHome} style={{ top: this.systemInfo.statusBarHeight + 8 + 'px' }}>
                    <View className="back-box">
                        <AtIcon prefixClass='icon' value='zuo' size='14' color='#000'></AtIcon>
                    </View>
                </View>
                <View className='swip-layout'>
                    <XSwiper
                        autoplay={false}
                        height={750}
                        swiperList={productDetail.headImageList}
                    />

                    <View className='limit-buy-layout' style={topStyle}>
                        <Image className='bg' style={topStyle} src={bgLimitBuy}></Image>
                        <View className='limit-info-layout'>
                            <View className='flex-space-between'>
                                <Image className='image' src={tagLimit}></Image>
                                {//活动结束
                                    pageType == -1 &&
                                    <View className='end'>活动已结束</View>
                                }
                                {
                                    pageType != -1 &&
                                    <View className='countdown-time-layout'>
                                        {
                                            pageType == 0 &&
                                            <View className='end-text'>距开始</View>
                                        }
                                        {
                                            pageType == 1 &&
                                            <View className='end-text'>距结束</View>
                                        }
                                        {
                                            pageType == 0 &&
                                            <View className='time-layout'>{TextUtil.getDay(beginTime) + '天 ' + TextUtil.getHours(beginTime) + ':' + TextUtil.getMinutes(beginTime) + ':' + TextUtil.getSeconds(beginTime)}</View>
                                        }
                                        {
                                            pageType == 1 &&
                                            <View className='time-layout'>{TextUtil.getDay(finishTime) + '天 ' + TextUtil.getHours(finishTime) + ':' + TextUtil.getMinutes(finishTime) + ':' + TextUtil.getSeconds(finishTime)}</View>
                                        }
                                    </View>
                                }
                            </View>
                            {
                                !priceSame &&
                                <View className='flex-space-between'>
                                    <View className='price-layout'>
                                        {
                                            productDetail.lowShowPrice == productDetail.highUnitPrice &&
                                            <PriceView price={productDetail.lowShowPrice / 100} color={"white"} size={48} afterSize={32} hasSymbol={true}></PriceView>
                                        }
                                        {
                                            productDetail.lowShowPrice != productDetail.highUnitPrice &&
                                            <PriceView price={productDetail.lowShowPrice / 100} color={"white"} size={48} afterSize={32} hasSymbol={true}></PriceView>
                                        }
                                        {
                                            productDetail.lowShowPrice != productDetail.highUnitPrice &&
                                            <View className="wave">~</View>
                                        }
                                        {
                                            productDetail.lowShowPrice != productDetail.highUnitPrice &&
                                            <PriceView price={productDetail.highUnitPrice / 100} color={"white"} size={48} afterSize={32} hasSymbol={true}></PriceView>
                                        }
                                    </View>
                                    <View className='slae-count'>活动销量 {productDetail.totalSales} 件</View>
                                </View>
                            }
                            {
                                !priceSame &&
                                <View className='market-price'>￥{TextUtil.formateMoney(productDetail.showPrice, productDetail.highOriginPrice)}</View>
                            }

                            {
                                priceSame &&
                                <View className='flex-space-between' style={{ marginTop: '15rpx' }}>
                                    <View className='s-price-layout'>
                                        <PriceView price={productDetail.lowShowPrice / 100} color={"white"} size={48} afterSize={32} hasSymbol={true}></PriceView>
                                        <View className='s-market-price'>￥{TextUtil.formateMoney(productDetail.showPrice, productDetail.highOriginPrice)}</View>
                                    </View>
                                    <View className='slae-count'>活动销量 {productDetail.totalSales} 件</View>
                                </View>
                            }


                            <View className="freight-text">邮费 ¥{productDetail.freight / 100 || 0}</View>
                        </View>
                    </View>

                </View>
                <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
                    <View className="info-container">
                        <View className="flex-space-between">
                            <View className="product-title text-mult-clip-2">{productDetail.name}</View>
                            <View className="flex-center">
                                <View className="collection-box" onClick={this.onShareClick} style={{ marginRight: '20rpx' }}>
                                    <AtIcon
                                        prefixClass='icon'
                                        value='fenxiang'
                                        size='20'
                                        color='#242424' />
                                    <View className='text'>分享</View>
                                </View>
                                <View className="collection-box" onClick={this.postGoodsStar.bind(this)}>
                                    <AtIcon
                                        prefixClass='icon'
                                        value={productDetail.favorites ? 'yishoucang' : 'shoucang'}
                                        size='20'
                                        color={productDetail.favorites ? '#ff9900' : '#242424'} />
                                    <View className='text'>收藏</View>
                                </View>
                            </View>
                        </View>

                        <View className='tag-layout'>
                            {
                                productDetail.promotionInfo.limitCount != null &&
                                <View className='tag'>限购{productDetail.promotionInfo.limitCount}件</View>
                            }
                            {
                                productDetail.promotionInfo.limitNew &&
                                <View className='tag'>新人专享</View>
                            }
                        </View>

                    </View>
                    <View style={{ margin: '20rpx 0', backgroundColor: '#fff' }}>
                        <View className="check-item flex-space-between" onClick={this.showSku.bind(this, true, 'nothing')}>
                            <View className="check-label">规格</View>
                            <View className="flex-space-between flex-1">
                                <View className="check-value">{allSpecText}</View>
                                <AtIcon prefixClass='icon' value='gengduo' size='14' color='#D8D8D8'></AtIcon>
                            </View>
                        </View>
                    </View>
                    <View className="detail-list">
                        <View className="label">图文详情</View>
                        {productDetail.detailImageList.map((item, index) => {
                            return (
                                <Image
                                    mode="widthFix"
                                    key={index}
                                    className="details-image"
                                    src={item}
                                />
                            )
                        })}
                    </View>

                    {/* 底部 */}
                    <View className="product-bottom fixed-bottom" style={{ paddingBottom: this.detectionType(36, 0) }}>
                        <View className="product-bottom-container flex-space-between">
                            <View className="icon-group-container">
                                <View className="icon-group">
                                    {/* <Button openType="contact" sessionFrom={'7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl} className='btn-transparent'></Button> */}
                                    {
                                        productDetail.selfSupport &&
                                        <Button className='btn-transparent' onClick={this.onShopClick.bind(this)}></Button>
                                    }
                                    {
                                        !productDetail.selfSupport &&
                                        <Button
                                            openType="contact"
                                            className='btn-transparent'
                                            sendMessageTitle={productDetail.name}
                                            sendMessageImg={productDetail.imageUrl}
                                            sendMessagePath={`/pages/limitBuyGoodsDetail/limitBuyGoodsDetail?templateId=${this.state.templateId}&shareUserId=${Taro.getStorageSync('member_info').userId}&shopId=${this.state.productDetail.shop.id}`}
                                            showMessageCard={true}
                                        >
                                        </Button>
                                    }
                                    <AtIcon prefixClass='icon' value='kefu' size='20' color='#242424'></AtIcon>
                                    <View className='text'>客服</View>
                                </View>

                            </View>
                            <View className="product-button-group flex-center">
                                {
                                    productDetail.vendibility && (productDetail.skuList != null && productDetail.skuList.length > 0) && pageType == 1 &&
                                    <View
                                        style={'border-radius:100px'}
                                        className="btn btn-buy flex-center"
                                        onClick={this.handleBuyClick.bind(this)}
                                    >立即购买</View>
                                }
                                {
                                    (!productDetail.vendibility || (productDetail.skuList == null || productDetail.skuList.length == 0) || pageType == -1) &&
                                    <View
                                        style={{ borderRadius: '100px', background: '#d8d8d8', color: '#fff' }}
                                        className="btn btn-buy flex-center"
                                    // onClick={this.onProductDown.bind(this)}
                                    >已结束</View>
                                }
                                {
                                    productDetail.vendibility && (productDetail.skuList != null && productDetail.skuList.length > 0) && pageType == 0 &&
                                    <View
                                        style={'border-radius:100px'}
                                        className="btn btn-buy flex-center"
                                        onClick={this.onBuyNotBeginClick.bind(this)}
                                    >距开始:{TextUtil.getDay(beginTime) + '天' + TextUtil.getHours(beginTime) + '小时' + TextUtil.getMinutes(beginTime) + '分' + TextUtil.getSeconds(beginTime) + '秒'}</View>
                                }
                            </View>
                        </View>
                    </View>

                    {/* <View className="share-fixed flex-center" onClick={this.onShareClick} style={{ bottom: this.detectionType(176, 140) }}>
                        <AtIcon prefixClass='icon' value='fenxiang' size='16'></AtIcon>
                        <Text className="text">分享</Text>
                    </View> */}
                </XAuthorize>
                <SkuModel
                    productType={productType}
                    ref={this.skuModelRef}
                    isOpened={this.state.isOpen}
                    onClose={this.showSku.bind(this, false, 'nothing')}
                    skuList={skuList}
                    deliveryType={productDetail.deliveryType}
                    specList={specList}
                    productImageUrl={productDetail.headImageList != null && productDetail.headImageList.length > 0 ? productDetail.headImageList[0] : ""}
                    sellingPrice={productDetail.lowShowPrice}
                    redeemPrice={productDetail.lowRedeemPrice}
                    onAddCart={this.onSkuConfirm.bind(this)}
                    groupBuyMode={false}
                />
            </View >

        )
    }
}

export default XPage.connectFields()(limitBuyGoodsDetail)
