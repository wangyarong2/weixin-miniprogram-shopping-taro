import XPage from '@src/components/XPage/XPage'
import { View, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import { AtIcon } from "taro-ui";
import './shopDetail.less'

import defaultShopImage from '../../../assets/images/default/icon_shop_def.png'
import phone from '../../../assets/images/default/icon_shop_phone.png'
import address from "../../../assets/images/shop/shop_detail_address.png";
import titleLeftImage from "@images/shop/near_shop_title_left_icon.png";
import titleRightImage from "@images/shop/near_shop_title_right_icon.png";

import EmptyView from '../../../components/EmptyView/EmptyView'
import AfterCouponPriceIcon from '../../../components/AfterCouponPrice/AfterCouponPrice'
import PriceView from '../../../components/PriceView/price'
import ShopDetailProductItem from '../../../components/ShopProductItem/ShopDetailProductItem'
import CouponItem from '@src/components/CouponItem/CouponItem'
import ListTitle from '@src/components/ListTitle/ListTitle'
import ShortCouponItem from './ShortCouponItem/ShortCouponItem'

import XAuthorize from '@src/components/XAuthorize/XAuthorize'




import request from '../../../servers/http'
import TextUtil from '../../../utils/TextUtil'



class shopDetail extends XPage {
    config = {
        navigationBarTitleText: '橙店详情'
    }

    componentDidMount() {
        const { shopId } = this.$router.params
        this.setState({
            shopId: shopId,
        }, () => {
            this.getShopDetail(shopId);
            this.getShopGoodsList(false)
        })
    }


    state = {
        shopId: null,
        shopInfo: {
            storeInsidePhoto: null,
            storePhoto: null,
            mobilePhone: "",
            bannerPics: [defaultShopImage],
            couponList: [],

        },
        productList: [],
        pageNo: 0,
        pageSize: 10,
        noMoreData: false,
    }

    onReachBottom() {
        if (!this.state.noMoreData) {
            this.getShopGoodsList(true);
        }
    }

    onShareAppMessage() {
        let path = `/pages/shop/shopDetail/shopDetail?shopId=${this.state.shopId}`;
        return {
            title: this.state.shopInfo.shopName,
            path: path,
        }
    }


    onPhoneClick(phone) {
        if (TextUtil.isEmpty(phone)) {
            this.showToast({
                title: '商户电话号码为空'
            })
            return
        }
        wx.makePhoneCall({
            phoneNumber: phone
        })
    }


    getShopDetail(shopId) {
        request.post('/community-client/member/queryOffPayShopDetail', { shopId }).then(res => {
            res.bannerPics = this.getBannerPics(res);
            if (res.couponList) {
                res.couponList.map(couponInfo => {
                    this.addCouponStataus(couponInfo);
                })
            }
            this.setState({
                shopInfo: res
            })
        })
    }

    addCouponStataus(res) {
        if (null == res) return
        // if (new Date().getTime() > res.useEndTime) {
        //     // 0.未领取 1.可使用/已领取 2.已使用 3.已过期
        //     res.userStatus = 3;
        // } else {
        //用户是否已领取 0：未领取 1：已领取
        res.userStatus = res.isReceived;
        // }
    }

    getBannerPics(res) {
        const result = [];
        if (!TextUtil.isEmpty(res.storePhoto)) {
            result.push(res.storePhoto);
        }

        if (!TextUtil.isEmpty(res.storeInsidePhoto)) {
            result.push(res.storeInsidePhoto);
        }
        if (!result.length) {
            result.push(defaultShopImage);
        }
        return result;
    }


    getShopGoodsList(isLoadMoreAction) {
        let { pageNo, pageSize, shopId } = this.state
        pageNo += 1;
        const requestData = {
            pageSize: pageSize,
            pageNo: pageNo,
            orderType: 0,
            shopId: shopId,
        }
        if (isLoadMoreAction) {
            Taro.showLoading({
                title: '请稍后...',
                mask: true
            })
        }
        request.post('/community-client/community/shop/goodsList', requestData).then((res) => {
            Taro.hideLoading();
            let { productList } = this.state

            let resultList = res.list
            if (resultList != null && resultList.length > 0) {
                //有更多数据
                productList = productList.concat(resultList)
            }

            this.setState({
                noMoreData: pageNo * pageSize >= res.totalSize,
                productList: productList || [],
                pageNo: pageNo
            })

        })
    }
    //优惠券领取成功，重新获取有优惠我券信息
    onGetCoupon(couponId, userCouponId) {
        const { shopInfo } = this.state;
        if (shopInfo.couponList == null || shopInfo.couponList == 0) return;
        shopInfo.couponList[0].userCouponId = userCouponId;
        //标识状态为 已领取
        shopInfo.couponList[0].userStatus = 1;
        this.setState({ shopInfo })
    }



    getCouponView(couponList) {
        if (!couponList || !couponList.length) {
            return null;
        }
        //只有一个红包券
        console.log(couponList)
        if (couponList.length == 1) {
            return (
                <XAuthorize>
                    <CouponItem
                        data={couponList[0]}
                        goDetail={true}
                        onGetCoupon={this.onGetCoupon.bind(this)}
                    ></CouponItem>
                </XAuthorize>
            );
        }
        //有多个红包券
        return (<ScrollView scrollX scrollWithAnimation>
            <View className="short-coupon-container">
                {
                    couponList.map((item, index) => {
                        return (
                            <XAuthorize>
                                <ShortCouponItem
                                    extraCouponInfo={item}
                                    onGetCoupon={this.onGetCoupon.bind(this)}
                                ></ShortCouponItem>
                            </XAuthorize>
                        )
                    })
                }
            </View>
        </ScrollView>);
    }
    render() {
        const { shopInfo, productList } = this.state
        return (
            <View className="detail-page">
                <View className="banner" >
                    <Swiper
                        className='swiper'
                        indicatorColor='#999'
                        indicatorActiveColor='#fff'
                        circular
                        indicatorDots
                        autoplay>
                        {
                            this.state.shopInfo.bannerPics.map((item) => (
                                <SwiperItem >
                                    <Image className="swiperimg" src={item} />
                                </SwiperItem>
                            ))
                        }
                    </Swiper>
                </View>
                <View className="shop-info-container">
                    <View className="line-1">
                        <View className="shop-icon">
                            <Image className="image" src={shopInfo.logoImage}></Image>
                        </View>
                        <View className="show-name-container">
                            <View className="shop-name">{TextUtil.formateStringIfEmpty(shopInfo.shopName)}</View>
                            <View className="tip">{shopInfo.business || ""}</View>
                        </View>
                        <View className="join-time">{shopInfo.joinTime ? TextUtil.formatDateWithYMD(shopInfo.joinTime) : ""}加入</View>
                    </View>

                    <View className="owner-info-container">
                        <View className="keeper-container">
                            <AtIcon prefixClass='icon' value="fuwushang" size='15' ></AtIcon>
                            <View className="text">{TextUtil.formateStringIfEmpty(shopInfo.shopKeeper)}</View>
                        </View>

                        <View className="phone-info-container" onClick={this.onPhoneClick.bind(this, shopInfo.mobilePhone)}>
                            <View className="phone-icon">
                                <AtIcon prefixClass='icon' value="phone" size='15' ></AtIcon>
                            </View>
                            <View className="phone" >{TextUtil.formateStringIfEmpty(shopInfo.mobilePhone)}</View>
                        </View>
                    </View>

                    <View className="line-2">
                        <Image className="image" src={address}></Image>
                        <View className="text" >
                            {
                                TextUtil.formateStringIfEmpty(shopInfo.province)
                                + TextUtil.formateStringIfEmpty(shopInfo.city)
                                + TextUtil.formateStringIfEmpty(shopInfo.district)
                                + TextUtil.formateStringIfEmpty(shopInfo.detailAddress)
                            }
                        </View>
                    </View>
                </View>

                {this.getCouponView(shopInfo.couponList)}
                <ListTitle title="店内商品"></ListTitle>

                {
                    productList == null || productList.length == 0 &&
                    <EmptyView type={10}></EmptyView>
                }

                {
                    productList.map((item, index) => {
                        return (
                            <ShopDetailProductItem product={item}></ShopDetailProductItem>
                        )
                    })
                }
                <View className="no-more-data" style={{ display: productList.length ? "block" : "none" }}>全部商品已展示</View>
            </View>
        )
    }
}

export default XPage.connectFields()(shopDetail)
