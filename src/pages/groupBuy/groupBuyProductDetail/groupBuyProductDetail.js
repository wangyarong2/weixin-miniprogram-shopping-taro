import Taro from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem } from '@tarojs/components'
import { AtIcon } from 'taro-ui'

import XPage from '@src/components/XPage/XPage'
import XAuthorize from '@src/components/XAuthorize/XAuthorize'
import SkuModel from '@src/components/SkuModel/SkuModel'
import XSwiper from '@src/components/XSwiper/XSwiper'
import PriceView from '@src/components/PriceView/price'

import LoginUtil from '@utils/LoginUtil'
import TextUtil from '@utils/TextUtil'
import request from '@src/servers/http'
import { set as setGlobalData } from '@utils/globalData';
import GroupProductShareDialog from '@src/components/GroupProductShareDialog/GroupProductShareDialog'
import PeopleListDialog from '../components/peopleListDialog/peopleListDialog'

// import priceBg from '../../../assets/images/product/ic_gprice_bg.png'
import groupTextImage from '@images/product/ic_gprice.png'
import groupInfoBg from '@images/product/group_detail_info_bg.png'

import {
    getAddressList
} from '@src/servers/servers'

import './groupBuyProductDetail.less'
import GaryCountDown from '../components/garyCountDown/garyCountDown'

class groupBuyProductDetail extends XPage {
    config = {
        navigationBarTitleText: '商品详请',
        navigationStyle: 'custom'
    }

    constructor(props) {
        super(props)
        this.state = {
            productDetail: {
                highUnitPrice: 0,
                lowShowPrice: 0,
                showPrice: 0,
                lowOriginPrice: 0,
                lowActivePrice: 0,
                highActivePrice: 0,
                highOriginPrice: 0,
            },
            isOpen: false, // 是否显示弹层

            currentAddressData: '请选择收货地址', // 选择的地址信息
            checkAddressData: null,// 选中的地址

            allSpecText: '请选择商品规格',
            currentSpecData: null,
            currentSpecCount: 1,
            cartAction: 'single', // single(单独购买) group(拼团购买)
            showShareDialog: false,
            templateId: null,
            groupId: null,
            shopId: null,
            deliveryType: null,//deliveryType  发货类型：1自提，2快递 3两种方式都有
            qrCodeImage: '',
            getQrcodeErrorCount: 0,// 获取海报图片失败次数
            shareUserId: null,
            groupBuyFinish: false,
            fromShare: false,
            groupList: [],
            showJoinListDialog: false,
            showNotEnoughDialog: false,
            couponPrice: 0,
            mxCouponBalance: 0,

            intervalId: -1,//倒计时
            groupIntervalId: -1,//团列表自动结束倒计时
            time: 0,//时间
            groupModel: 0,// 0 单独购买 1主动开团 2参团
            currentGroupIndex: 0, //当前参团的group
            joinUserHeads: [],//参与人员头像
            groupListHasCurrentMember: false, //该团是否有本人参加
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
        const groupDetailNeedRefresh = Taro.getStorageSync('groupDetailNeedRefresh')
        console.log('xxxxx', 'xxssdsdsa', groupDetailNeedRefresh)
        if (!TextUtil.isEmpty(groupDetailNeedRefresh) && groupDetailNeedRefresh == 'true' && !TextUtil.isEmpty(this.state.templateId)) {
            const { templateId, shopId } = this.state
            Taro.setStorageSync('groupDetailNeedRefresh', null)
            request.post('/community-client/miniapp/group/detail', { templateId, shopId }).then(data => {
                console.log('团购详情(group/detail)', data)
                if (this.state.groupIntervalId != null) {
                    clearInterval(this.state.groupIntervalId)
                }
                this.setState({
                    groupList: [],
                }, () => {
                    this.setState({
                        groupList: data.groupPersonList == null ? [] : data.groupPersonList,
                    }, () => {
                        this.startGroupCountDown();
                    })
                })

            })
        }
    }

    afterDidMount() {
        const { scene } = this.$router.params
        if (scene) {
            //扫码进入首页
            const sceneData = decodeURIComponent(this.$router.params.scene).split('&')
            //userid + 加密字符串
            request.post('/wx-agent/exchangeId/get', { id: sceneData[1] == null ? sceneData[0] : sceneData[1] }).then(res => {
                let sceneResult = res.scene.split('&');
                console.log('sceneData', sceneResult)

                if (sceneResult != null) {
                    let shareUserId = null;
                    let templateId = null;
                    let shopId = null;
                    let groupId = null;
                    if (sceneData[1] == null) {
                        //从h5分享过来
                        shareUserId = sceneResult[0];
                        templateId = sceneResult[1];
                        shopId = sceneResult[2];
                        groupId = sceneResult[3];
                    }
                    if (sceneData[1] != null) {
                        //从小程序过来
                        shareUserId = sceneData[0];
                        templateId = sceneResult[0];
                        shopId = sceneResult[1];
                        groupId = sceneResult[2];
                    }
                    this.setState({
                        shareUserId,
                        templateId,
                        shopId,
                        groupId
                    }, () => {
                        if (!TextUtil.isEmpty(this.state.shareUserId) && !TextUtil.isEmpty(this.state.groupId)) {
                            this.setState({
                                fromShare: true
                            })
                        }
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
                            console.log('InviteShopId,', this.state.shopId)
                            setGlobalData('shareUserId', this.state.shopId);
                        }
                        this.doAfterLogin();
                    })
                }
            })

        } else {
            //获取商品类型
            let { shareUserId, groupId, shopId, templateId, fromProductItem } = this.$router.params
            console.log('数据', shareUserId, groupId, shopId, templateId)
            if (!TextUtil.isEmpty(shareUserId) && !TextUtil.isEmpty(groupId)) {
                this.setState({
                    fromShare: true
                })
            }
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
                templateId,
                groupId
            }, () => {
                this.doAfterLogin();
            })
        }
    }

    doAfterLogin() {
        const isLogin = LoginUtil.checkLogin()
        const { templateId, shopId, groupId } = this.state
        let mRequestData = {}
        if (TextUtil.isEmpty(groupId)) {
            mRequestData = { templateId, shopId }
        } else {
            mRequestData = { templateId, shopId, groupId }
        }
        Taro.showLoading({
            title: '请求中...',
            mask: true,
        })
        request.post('/community-client/miniapp/group/detail', mRequestData).then(data => {
            Taro.hideLoading();
            console.log('团购详情(group/detail)', data)
            const resultData = data
            Taro.setNavigationBarTitle({
                title: resultData.name
            })
            this.setState({
                isLogin,
                productDetail: resultData,
                groupBuyFinish: resultData.enable == 0,
                skuList: resultData.skuList,
                groupList: resultData.groupPersonList == null ? [] : resultData.groupPersonList,
                specList: resultData.specList,
                isFavorites: resultData.favorites,
                time: resultData.enable == 0 ? 0 : (resultData.endTime - (new Date()).getTime() > 0 ? resultData.endTime - (new Date()).getTime() : 0),
            }, () => {
                if (isLogin) {
                    this.getAddressList();
                }
                // 当Sku只有一件时 默认选中
                if (resultData.skuList.length == 1) {
                    let specValueArr = []
                    resultData.skuList[0].specList.forEach(item => {
                        specValueArr.push(item.specValue)
                    })
                    const { skuList, specList } = this.state
                    setTimeout(() => {
                        this.SkuModel.initWithNewData(skuList, specList, specValueArr);
                        this.SkuModel.setDefaultDeliveryType(resultData.deliveryType)
                        this.setDefaultSpec();
                    }, 300);
                } else {
                    const { skuList, specList } = this.state
                    setTimeout(() => {
                        this.SkuModel.initWithDefaultData(skuList, specList);
                        this.SkuModel.setDefaultDeliveryType(resultData.deliveryType)
                    }, 300);
                }
                this.startActivityCountDown();
                if (this.state.groupList != null && this.state.groupList.length > 0 && !this.state.fromShare) {
                    this.startGroupCountDown();
                }
            })
        }).catch(res => {
            Taro.hideLoading();
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

    // 收藏商品
    postGoodsStar() {
        const { productDetail } = this.state
        request.post('/community-client/good/follow', { spuId: productDetail.spuId, shopId: productDetail.shopId })
            .then(res => {
                this.state.productDetail.favorites = res.data
                this.setState({ productDetail: this.state.productDetail })
                Taro.showToast({
                    title: res.data ? '收藏成功' : '取消收藏',
                    icon: 'none'
                })
            })
    }

    skuModelRef = (node) => this.SkuModel = node
    shareDialogRef = (node) => this.GroupProductShareDialog = node

    // 显示 Sku
    showSku(isOpen, cartAction = 'single') {
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
            if (this.state.cartAction === 'single') {
                //正常下单
                console.log('正常下单')
                this.setState({
                    groupModel: 0,
                }, () => {
                    this.postPay()
                })

            }
            if (this.state.cartAction === 'group') {
                //开团
                console.log('开团')
                this.setState({
                    groupId: null,
                    groupModel: 1,
                }, () => {
                    this.postPay()
                })
            }
            if (this.state.cartAction === 'join') {
                //参团
                console.log('参团')
                this.setState({
                    groupId: this.state.groupId + '',
                    groupModel: 2,
                }, () => {
                    this.postPay()
                })
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
        const { groupBuyMode } = this.state
        //正常商品 弹框逻辑
        if (groupBuyMode == 0) {
            request.post('/community-client/mxCoupon/queryCouponBalance', {}).then((res) => {
                this.setState({
                    mxCouponBalance: res.mxCouponBalance
                }, () => {
                    const { currentSpecData, currentSpecCount } = this.state
                    let couponPrice = currentSpecCount * (currentSpecData.sellingPrice - currentSpecData.unitPrice)
                    this.setState({
                        couponPrice: couponPrice / 100
                    }, () => {
                        if (this.state.mxCouponBalance == 0 || this.state.mxCouponBalance < this.state.couponPrice * 100) {
                            this.setState({
                                showNotEnoughDialog: true
                            })
                        } else {
                            this.requestConformProduct();
                        }
                    })
                })
            })
        } else {
            this.requestConformProduct();
        }
    }

    //开启活动结束倒计时
    startActivityCountDown() {
        const intervalId = setInterval(() => {
            let { time } = this.state
            if (time <= 0) {
                time = 0;
                this.setState({
                    groupBuyFinish: true
                }, () => {
                    clearInterval(intervalId);
                })
            } else {
                time -= 1000;
            }
            this.setState({
                time
            })
        }, 1000);
        this.setState({
            intervalId: intervalId
        })
    }

    //开启团购自动结束倒计时
    startGroupCountDown() {
        const groupIntervalId = setInterval(() => {
            const { groupList } = this.state
            let mList = groupList;
            mList.forEach((v, index) => {
                if (v.remainingTime <= 0) {
                    mList.splice(index, 1);
                } else {
                    v.remainingTime -= 1;
                }
            });
            this.setState({
                groupList: mList
            }, () => {
                if (groupList.length == 0) {
                    clearInterval(this.state.groupIntervalId)
                }
            })
        }, 1000);
        this.setState({
            groupIntervalId: groupIntervalId
        })
    }

    requestConformProduct() {
        this.onCancelClick();
        //正常商品 做弹框
        Taro.showLoading({ title: '请求中...', mask: true });
        console.log('currentSpecData', this.state.currentSpecData)
        console.log('currentSpecCount', this.state.currentSpecCount)
        const { currentSpecData, checkAddressData, currentSpecCount, groupModel, productDetail, deliveryType } = this.state;
        const skuIdAndCountList = [{
            skuId: currentSpecData.skuId,
            spuId: productDetail.spuId,
            number: currentSpecCount
        }]
        //正常商品
        let shopList = [{
            deliveryType,
            shopId: this.state.shopId,
            supplyId: productDetail.supplyId,
            skuIdAndCountList: skuIdAndCountList
        }];
        let requestData = { actionFlag: 0, shopList };
        if (checkAddressData != null) {
            requestData.addressId = checkAddressData.addressId
        }
        if (groupModel == 0) {
            requestData.warehouseType = 1
        }
        if (groupModel == 1) {
            //开团
            requestData.warehouseType = 8
            requestData.templateId = this.state.templateId
        }
        if (groupModel == 2) {
            //参团
            requestData.warehouseType = 8
            requestData.templateId = this.state.templateId
            requestData.activityId = this.state.groupId
        }
        requestData.hasBalance = true
        request.post('/community-client/cartConfirm', requestData).then(res => {
            Taro.hideLoading();
            if (groupModel == 1) {
                //开团
                res.templateId = this.state.templateId
            }
            if (groupModel == 2) {
                //参团
                res.templateId = this.state.templateId
                res.activityId = this.state.groupId
            }
            res.selfSupport = this.state.productDetail.selfSupport
            setGlobalData('cartConfirmData', res)
            Taro.setStorageSync('groupDetailNeedRefresh', 'true')
            this.goPage({ url: 'order/confirmOrder', params: { productType: groupModel == 0 ? 0 : 4 } })
        }).catch(res => {
            Taro.hideLoading();
            Taro.showToast({
                title: res.resultDesc,
                icon: 'none'
            })
        })
    }

    onPeopleListDialogClose() {
        this.setState({
            showJoinListDialog: false
        })
    }

    //橙卡不足取消提示
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

    onShareClick = () => {
        this.getQrCodeImage();
    }

    //获取二维码
    getQrCodeImage() {
        Taro.showLoading({
            title: '生成中...'
        })
        let shareOriginId = {}
        //拼团分享
        shareOriginId = this.state.templateId + "&" + this.state.shopId + "&" + this.state.groupId
        request.post('/wx-agent/exchangeId/save', { scene: shareOriginId }).then(res => {
            const id = res.id;
            request.post('/wx-agent/wxdrcode/get', {
                userId: Taro.getStorageSync('member_info').userId,
                originId: id,
                sharePage: "pages/groupBuy/groupBuyProductDetail/groupBuyProductDetail",
                type: 1
            }).then((res) => {
                this.setState({
                    qrCodeImage: res
                }, () => {
                    this.setState({
                        showShareDialog: true
                    }, () => {
                        this.GroupProductShareDialog.init();
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
            title: '该团购已结束',
            icon: 'none',
            duration: 2000
        })
    }

    onCloseDialogClick() {
        this.setState({
            showShareDialog: false
        })
    }

    //分享给好友
    onShareAppMessage() {
        let path = null;
        path = `/pages/groupBuy/groupBuyProductDetail/groupBuyProductDetail?shareUserId=${Taro.getStorageSync('member_info').userId}&shopId=${this.state.shopId}&templateId=${this.state.templateId}&groupId=${this.state.groupId}`
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

    //单独购买
    onSingleBuyClick() {
        this.setState({
            groupModel: 0
        }, () => {
            this.showSku(true, 'single')
        })

    }
    //多人拼团
    onOpenGroupClick() {
        this.setState({
            groupModel: 1
        }, () => {
            this.showSku(true, 'group')
        })
    }

    //弹框加入拼团
    onDialogJoinGroupClick() {
        if (this.state.groupListHasCurrentMember) {
            Taro.showToast({
                title: '您已经参与过该团购了',
                icon: 'none',
                duration: 2000
            })
        } else {
            this.showSku(true, 'join')
        }

    }

    //参加团购
    onJoinClick(index) {
        this.setState({
            groupModel: 2,
            currentGroupIndex: index,
        }, () => {
            let { joinUserHeads, templateId, groupList } = this.state
            request.post('/community-client/miniapp/group/memberDetail', { templateId, groupId: groupList[index].groupId }).then(data => {
                console.log('小团详情(group/memberDetail)', data)
                joinUserHeads = [];
                data.data.groupMemberList.forEach(element => {
                    joinUserHeads.push(element.avatar)
                });
                const mData = data.data.groupMemberList.find(item => (Taro.getStorageSync('member_info').userId + '') == (item.userId + ''))
                console.log('mdata', mData)
                groupList[index].groupMemberList = joinUserHeads
                this.setState({
                    groupListHasCurrentMember: (mData == null || typeof mData == 'undefined') ? false : true,
                    groupId: groupList[index].groupId + '',
                    groupList
                }, () => {
                    this.setState({
                        showJoinListDialog: true
                    })
                })
            })

        })
    }
    //分享参团
    onJoinClickFromShare() {
        let { templateId, groupId } = this.state
        request.post('/community-client/miniapp/group/memberDetail', { templateId, groupId }).then(data => {
            console.log('小团详情(group/memberDetail)', data)
            const mData = data.data.groupMemberList.find(item => (Taro.getStorageSync('member_info').userId + '') == (item.userId + ''))
            if (typeof mData != 'undefined' && mData != null) {
                Taro.showToast({
                    title: '您已经参与过该团购了',
                    icon: 'none',
                    duration: 2000
                })
            } else {
                this.setState({
                    groupModel: 2
                }, () => {
                    this.showSku(true, 'join')
                })
            }

        })
    }

    onShopClick() {
        this.goPage({ url: 'coupon/contactDetail', params: { shopId: this.state.productDetail.supplyId } })
    }

    render() {
        const {
            productDetail,
            skuList,
            specList,
            allSpecText,
            showShareDialog,
            currentAddressData,
            groupBuyFinish,
            qrCodeImage,
            fromShare,
            couponPrice,
            time,
            showNotEnoughDialog,
            groupList,
            currentGroupIndex,
            showJoinListDialog,
        } = this.state
        return (
            <View style={{ paddingBottom: this.detectionType(136, 100), height: '100%' }}>
                {
                    showShareDialog &&
                    <GroupProductShareDialog
                        qrCodeImage={qrCodeImage}
                        onCloseClick={this.onCloseDialogClick.bind(this)}
                        productImage={productDetail.imageUrl}
                        productName={productDetail.name}
                        oldPrice={'￥' + TextUtil.formateMoney(productDetail.showPrice, productDetail.highOriginPrice)}
                        shopName={productDetail.shopName}
                        endTime={TextUtil.formatDateWithYMDHMS(productDetail.endTime)}
                        price={TextUtil.formateMoney(productDetail.lowActivePrice, productDetail.highActivePrice)}
                        ref={this.shareDialogRef}
                    >
                    </GroupProductShareDialog>
                }
                {
                    showNotEnoughDialog &&
                    <BalanceNotEnoughDialog couponPrice={couponPrice} onConfirmClick={this.requestConformProduct.bind(this)} onAskClick={this.onAskClick.bind(this)} onCancelClick={this.onCancelClick.bind(this)}></BalanceNotEnoughDialog>
                }

                {
                    showJoinListDialog &&
                    <PeopleListDialog groupInfo={groupList[currentGroupIndex]} onPeopleListDialogClose={this.onPeopleListDialogClose.bind(this)} onJoinGroupClick={this.onDialogJoinGroupClick.bind(this)}></PeopleListDialog>
                }

                <View className="custombar-container" onClick={this.onLinkHome} style={{ top: this.systemInfo.statusBarHeight + 8 + 'px' }}>
                    <View className="back-box">
                        <AtIcon prefixClass='icon' value='zuo' size='14' color='#000'></AtIcon>
                    </View>

                </View>
                <View className="swip-layout">
                    <XSwiper
                        autoplay={false}
                        height={750}
                        swiperList={productDetail.headImageList}
                    />
                </View>
                <View className="group-top-layout">
                    <View className="flex-space-between">
                        <Image className="grouptext-img" src={groupTextImage}></Image>
                        <View className="countdown-time-layout">
                            <View className="end-text">距结束</View>
                            <View className="time-layout">{TextUtil.getDay(time)}天 {TextUtil.addZero(TextUtil.getHours(time))}:{TextUtil.addZero(TextUtil.getMinutes(time))}:{TextUtil.addZero(TextUtil.getSeconds(time))}</View>
                        </View>
                    </View>
                    <View className="flex-space-between">
                        <View className="group-price-layout">
                            {
                                productDetail.lowActivePrice == productDetail.highActivePrice &&
                                <PriceView price={productDetail.lowActivePrice / 100} color={"white"} size={48} hasSymbol={true}></PriceView>
                            }
                            {
                                productDetail.lowActivePrice != productDetail.highActivePrice &&
                                <PriceView price={productDetail.lowActivePrice / 100} color={"white"} size={48} hasSymbol={true}></PriceView>
                            }
                            {
                                productDetail.lowActivePrice != productDetail.highActivePrice &&
                                <View className="wave">~</View>
                            }
                            {
                                productDetail.lowActivePrice != productDetail.highActivePrice &&
                                <PriceView price={productDetail.highActivePrice / 100} color={"white"} size={48}></PriceView>
                            }
                        </View>
                        <View className="group-salenum">活动销量 {productDetail.totalSales} 件</View>
                    </View>
                    <Image className="group-bg" src={groupInfoBg}></Image>
                </View>
                {/* <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}> */}
                <View className="info-container">
                    <View>
                        <View className="flex-row">
                            <View className='price-box'>
                                {
                                    <View className="flex-space-between" style={{ marginRight: '34rpx' }}>
                                        <Text className="label">原价</Text>
                                        <Text className="value">{TextUtil.formateMoney(productDetail.showPrice, productDetail.highOriginPrice)}</Text>
                                    </View>
                                }
                                {
                                    <View className="flex-space-between">
                                        <Text className="label">邮费</Text>
                                        <Text className="value">{productDetail.freight ? productDetail.freight / 100 : '0'}元</Text>
                                    </View>
                                }

                            </View>
                        </View>
                    </View>
                    <View className="flex-space-between" style={{ marginTop: '32rpx' }}>
                        <View className="product-title text-mult-clip-2">{productDetail.name}</View>
                    </View>

                    <View className="group-num-layout">
                        <View className="group-people-num">
                            {productDetail.groupCount}人成团
                            </View>
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

                {
                    !groupBuyFinish && groupList.length >= 1 && !fromShare &&
                    <View style={{ margin: '20rpx 0', backgroundColor: '#fff' }}>
                        <View className="group-list-item flex-column">
                            <View className="group-title-text">{groupList.length}人正在拼团，可直接加入</View>
                        </View>
                        <Swiper className="group-list-page" style={{ height: groupList.length > 1 ? "228rpx" : '114rpx' }} vertical autoplay={groupList.length > 2} interval='5000' displayMultipleItems={groupList.length > 1 ? 2 : 1}>
                            {
                                groupList.map((group, index) => {
                                    return (
                                        <SwiperItem className="group-style" key={index}>
                                            <View className="group-layout">
                                                <View className="head-list">
                                                    <Image className="head-img" src={group.avatar}></Image>
                                                    <View className="name">{group.name}</View>
                                                </View>
                                                <View className="join-right-layout">
                                                    <View className="left-layout">
                                                        <View className="people-layout">
                                                            <View className="black-text">
                                                                还差
                                                            </View>
                                                            <View className="red-text">
                                                                {group.needCount}人
                                                            </View>
                                                            <View className="black-text">
                                                                成团
                                                            </View>
                                                        </View>
                                                        <GaryCountDown countDownTime={group.remainingTime * 1000}></GaryCountDown>
                                                    </View>
                                                    <View className="join-button" onClick={this.onJoinClick.bind(this, index)}> 去拼团</View>
                                                </View>
                                            </View>
                                        </SwiperItem>
                                    )
                                })
                            }
                        </Swiper>
                    </View>
                }

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
                                        sendMessagePath={`/pages/groupBuy/groupBuyProductDetail/groupBuyProductDetail?shareUserId=${Taro.getStorageSync('member_info').userId}&shopId=${this.state.shopId}&templateId=${this.state.templateId}&groupId=${this.state.groupId}`}
                                        showMessageCard={true}
                                    >
                                    </Button>
                                }
                                {/* <Button openType="contact" sessionFrom={'7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl} className='btn-transparent'></Button> */}
                                <AtIcon prefixClass='icon' value='kefu' size='20' color='#242424'></AtIcon>
                                <View className='text'>客服</View>
                            </View>

                        </View>
                        <View className="product-button-group flex-center">
                            {
                                !fromShare &&
                                <View className="btn btn-cart flex-center flex-column" onClick={this.onSingleBuyClick.bind(this)}>
                                    <View>单独购买</View>
                                    <View>￥{productDetail.lowShowPrice / 100}</View>
                                </View>
                            }
                            {
                                !groupBuyFinish && !fromShare &&
                                <View
                                    className="btn btn-cart btn-buy flex-center flex-column"
                                    onClick={this.onOpenGroupClick.bind(this)}>
                                    <View>{productDetail.groupCount}人拼团</View>
                                    <View>￥{productDetail.lowActivePrice / 100}</View>
                                </View>
                            }
                            {
                                groupBuyFinish && !fromShare &&
                                <View
                                    style={{
                                        background: '#C0C0C0'
                                    }}
                                    className="btn btn-cart btn-buy flex-center flex-column"
                                >
                                    <View onClick={this.onProductDown.bind(this)}>已结束</View>
                                </View>
                            }
                            {
                                !groupBuyFinish && fromShare &&
                                <View
                                    style={{ borderRadius: '100px', background: '#FF6400', color: '#fff' }}
                                    className="btn btn-buy flex-center"
                                    onClick={this.onJoinClickFromShare.bind(this)}>
                                    立即参团</View>
                            }
                            {
                                groupBuyFinish && fromShare &&
                                <View
                                    style={{ borderRadius: '100px', background: '#d8d8d8', color: '#fff' }}
                                    className="btn btn-buy flex-center"
                                    onClick={this.onProductDown.bind(this)}
                                >团购已结束</View>
                            }
                        </View>
                    </View>
                </View>

                <View className="share-fixed flex-center" onClick={this.onShareClick} style={{ bottom: this.detectionType(176, 140) }}>
                    <AtIcon prefixClass='icon' value='fenxiang' size='16'></AtIcon>
                    <Text className="text">分享</Text>
                </View>
                {/* </XAuthorize> */}
                <SkuModel
                    productType={this.state.groupModel == 0 ? 0 : 4}
                    ref={this.skuModelRef}
                    isOpened={this.state.isOpen}
                    onClose={this.showSku.bind(this, false, 'cart')}
                    skuList={skuList}
                    deliveryType={productDetail.deliveryType}
                    specList={specList}
                    productImageUrl={productDetail.headImageList != null && productDetail.headImageList.length > 0 ? productDetail.headImageList[0] : ""}
                    sellingPrice={productDetail.lowShowPrice}
                    groupPrice={productDetail.lowActivePrice}
                    redeemPrice={productDetail.lowRedeemPrice}
                    onAddCart={this.onSkuConfirm.bind(this)}
                    groupBuyMode={this.state.groupModel == 0 ? false : true}
                />
            </View >

        )
    }
}

export default XPage.connectFields()(groupBuyProductDetail)
