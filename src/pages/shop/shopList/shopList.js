import XPage from '@src/components/XPage/XPage'

import { View } from '@tarojs/components'
import './shopList.less'
import request from '../../../servers/http'

import addressIcon from '../../../assets/images/member/icon_member_address.png'
import TextUtil from '../../../utils/TextUtil'
import ArraysUtil from '../../../utils/ArraysUtil'


import { AtIcon } from 'taro-ui'

import EmptyView from '../../../components/EmptyView/EmptyView'
import ShopItem from '../../../components/ShopItem/ShopItem'
import AvailableCouponsDialog from '../../../components/AvailableCouponsDialog/AvailableCouponsDialog';//可领导优惠券
import ListTitle from '@src/components/ListTitle/ListTitle'

import * as iconList from "nervjs";
import taro from '../../../../dist/npm/@tarojs/taro'


// import shopCategoryIcon1 from "@images/shop/category/shop_list_category_1.png";
// import shopCategoryIcon2 from "@images/shop/category/shop_list_category_2.png";
// import shopCategoryIcon3 from "@images/shop/category/shop_list_category_3.png";
// import shopCategoryIcon4 from "@images/shop/category/shop_list_category_4.png";
// import shopCategoryIcon5 from "@images/shop/category/shop_list_category_5.png";
// import shopCategoryIcon6 from "@images/shop/category/shop_list_category_6.png";
// import shopCategoryIcon7 from "@images/shop/category/shop_list_category_7.png";
// import shopCategoryIcon8 from "@images/shop/category/shop_list_category_8.png";
// import shopCategoryIcon9 from "@images/shop/category/shop_list_category_9.png";
// import shopCategoryIcon10 from "@images/shop/category/shop_list_category_10.png";
// import shopCategoryIcon11 from "@images/shop/category/shop_list_category_11.png";
// import shopCategoryIcon131 from "@images/shop/category/shop_list_category_131.png";
// import shopCategoryIcon140 from "@images/shop/category/shop_list_category_140.png";
import { checkSession } from '@tarojs/taro'
import { utils } from 'stylelint'



class shopList extends XPage {
    config = {
        navigationBarTitleText: '橙圈'
    }

    state = {
        isLocationRefuse: false,
        cityInfo: {
            code: null,
            name: '定位中...',
            districtName: '',
            districtCode: '',
        },
        shopList: [],
        categoryList: [],
        searchKey: '',
        phoneLocation: null,
        isShowCouponDialog: false,//控制页面是否可滑动
        couponList: [],
        lastSearchCouponUseAreaCode: "",//上一次查询红包券所使用的地区码

    }

    componentDidMount() {

        //获取分类
        this.getCategoryList()
    }

    componentDidShow() {
        const cacheCityInfo = Taro.getStorageSync('shopSelectedCityInfo')
        if (
            cacheCityInfo
            && cacheCityInfo.code
            && cacheCityInfo.name) {
            //使用缓存中的数据
            this.setState({
                cityInfo: {
                    code: cacheCityInfo.code,
                    name: cacheCityInfo.name,
                    districtName: cacheCityInfo.districtName,
                    districtCode: cacheCityInfo.districtCode,
                    shopList: [],//切换地址，清空上一次数据
                },
            }, () => {
                //不需要再次定位，直接请求附近店铺数据
                this.getCitysShop()
                //请求优惠券相关数据
                this.getCouponList();
            })
        } else {
            this.startLocation()
        }
    }


    getCouponList() {
        const { cityInfo } = this.state;

        const reqParams = {
            areaCode: cityInfo.districtCode || cityInfo.code,
            querySource: 3,//小程序
        }
        if (this.state.lastSearchCouponUseAreaCode == reqParams.areaCode) {
            //同一次打开页面，只展示 一次
            return;
        }

        request.post('/community-client/coupon/list', reqParams).then(res => {
            this.setState({
                couponList: this.expandCouponList(res),
                lastSearchCouponUseAreaCode: reqParams.areaCode,
                isShowCouponDialog: res == null || res.length === 0 ? false : true,
            })
        })
    }

    //存在券
    expandCouponList(res) {
        if (null == res || res.length == 0) return res;
        let resultArr = new Array();
        res.map(item => {
            for (let i = 0; i < item.singleCanReceiveCount; i++) {
                resultArr.push(JSON.parse(JSON.stringify(item)));
            }

        })
        return resultArr;

    }


    startLocation() {
        this.getWXPermissionIsRejectByUser("scope.userLocation")
            .then((isReject) => {
                if (isReject) {
                    //用户拒绝过一次
                    this.openConfirm();
                } else {
                    //第一次申请权限
                    this._startLocation()
                }
            })

    }

    _startLocation() {
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        Taro.getLocation().then(res => {
            this.setState({
                isLocationRefuse: false,
                phoneLocation: res,
            })
            this.getCityFromBaiDu(res)
        }).catch(e => {
            this.setState({
                isLocationRefuse: true
            })
            Taro.hideLoading()
            this.goBack()
        })
    }

    //用户是否拒绝了授权
    getWXPermissionIsRejectByUser(wxPermissionName) {
        /**
         * {"errMsg":"getSetting:ok","authSetting":{"scope.userLocation":false,"scope.userInfo":true}}
         */
        return new Promise((resolve, reject) => {
            //获取小程序获取了那些授权
            wx.getSetting({
                success: (res) => {
                    if (!res.authSetting.hasOwnProperty(wxPermissionName)) {
                        //不存在该属性，说明用户未拒绝该权限授权
                        resolve(false);
                    } else {
                        resolve(!res.authSetting[wxPermissionName]);
                    }
                }, fail: (err) => {
                    reject();
                }
            });
        })
    }




    getCityFromBaiDu(res) {
        const that = this;
        //调取百度查询当前地址
        wx.request({
            url: 'https://api.map.baidu.com/reverse_geocoding/v3/?ak=iyuXt4QKGcdMMx6XgNi3jpBR21b8gNIg&location=' + res.latitude + ',' + res.longitude + '&output=json',
            data: {},
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success(response) {
                console.log('城市编码', response.data.result.addressComponent.adcode)
                console.log('城市', response.data.result.addressComponent.city)
                const _cityInfo = {
                    code: response.data.result.addressComponent.adcode.substring(0, 4) + '00',
                    name: response.data.result.addressComponent.city,
                    districtName: response.data.result.addressComponent.districtName
                }

                that.setState({
                    cityInfo: _cityInfo,
                }, () => {
                    that.getCitysShop();
                    //请求优惠券相关数据
                    that.getCouponList();
                })
                //保存定位城市信息
                Taro.setStorageSync("shopListLocationCityInfo", JSON.stringify(_cityInfo));
                //添加到最近访问列表里
                Taro.setStorageSync("shopListChooseCity_SearchCity", JSON.stringify([_cityInfo]));
                //保存当前选中城市信息
                Taro.setStorageSync('shopSelectedCityInfo', _cityInfo);
                Taro.hideLoading();

            },
            fail(res) {
                Taro.hideLoading();
                console.log('fail', res)
            }
        })
    }

    getCategoryList() {
        request.post('/community-client/community/business/list').then(res => {
            this.setState({
                categoryList: res.data
            })
        })
    }

    getCitysShop() {
        if (this.state.phoneLocation) {
            const areaCode = this.state.cityInfo.districtCode ? this.state.cityInfo.districtCode : this.state.cityInfo.code;
            const { latitude, longitude } = this.state.phoneLocation;
            const reqParams = {
                areaCode: areaCode,
                latitude: latitude,
                longitude: longitude,
            }
            request.post('/community-client/member/queryOffPayShopsInArea', reqParams).then(res => {
                Taro.hideLoading();
                this.setState({
                    shopList: res
                })
            })
        } else {
            //每打开一次橙圈都需要定位一次
            this.retryLocation();
        }
    }
    retryLocation() {
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        Taro.getLocation().then(res => {
            this.setState({
                phoneLocation: res,
            }, () => {
                //重新请求shop list
                this.getCitysShop();
            })

        }).catch(e => {
            Taro.hideLoading()
        })
    }

    openConfirm() {
        let that = this
        wx.showModal({
            content: '检测到您没打开定位权限，是否去设置打开？',
            confirmText: "确认",
            cancelText: "取消",
            success: function (res) {
                console.log(res);
                if (res.confirm) {
                    that.openSetting();
                } else {
                    that.goBack();
                }
            }
        });
    }


    openSetting() {
        const that = this;
        console.log("wx.openSetting");
        wx.openSetting({
            success(res) {
                console.log(res.authSetting)
                if (res.authSetting["scope.userLocation"]) {
                    Taro.getLocation().then(res => {
                        that.setState({
                            isLocationRefuse: false
                        })
                        console.log(res)
                        that.getCityFromBaiDu(res);
                    })
                }
            },
            fail(err) {
                console.log("err====" + JSON.stringify(err))

            }
        })
    }

    onShopClick(shopInfo) {
        //跳转到优惠券详情
        this.goPage({
            url: 'shop/shopDetail',
            params: { shopId: shopInfo.shopId }
        })
    }

    onSearchIntputChange(value) {
        this.setState({ searchKey: value.detail.value });
    }

    onSearchClick() {
        let { searchKey } = this.state
        // if (searchKey == null || searchKey.length == 0) {
        //     Taro.showToast({
        //         title: '请输入搜索关键字',
        //         icon: 'none',
        //         duration: 2000
        //     })
        //     return
        // }
        this.getCategoryList(this.state.cityInfo.code, searchKey)
        // this.addNewHistory(searchKey);
    }
    _chooseCity() {
        console.log(JSON.stringify(this.state.cityInfo))
        this.goPage({
            url: 'shop/shopListChooseCity',
            params: {
                "code": this.state.cityInfo.code,
                "name": this.state.cityInfo.name,
                "districtCode": this.state.cityInfo.districtCode,
                "districtName": this.state.cityInfo.districtName,
            }
        })

    }

    onCategoryItemClick(categoryInfo) {
        this.goPage({
            url: 'shop/shopCategory',
            params: {
                categoryId: categoryInfo.id,
                categoryName: categoryInfo.businessName,
                cityCode: this.state.cityInfo.code,
            }
        })

    }
    onSearchShopClick() {

        this.goPage({
            url: 'shop/searchShop',
        })
    }
    getCategoryIcon(id) {
        // switch (id) {
        //     case 1:
        //         return shopCategoryIcon1;
        //     case 2:
        //         return shopCategoryIcon2;
        //     case 3:
        //         return shopCategoryIcon3;
        //     case 4:
        //         return shopCategoryIcon4;
        //     case 5:
        //         return shopCategoryIcon5;
        //     case 6:
        //         return shopCategoryIcon6;
        //     case 7:
        //         return shopCategoryIcon7;
        //     case 8:
        //         return shopCategoryIcon8;
        //     case 9:
        //         return shopCategoryIcon9;
        //     case 10:
        //         return shopCategoryIcon10;
        //     case 11:
        //         return shopCategoryIcon11;
        //     case 140:
        //         return shopCategoryIcon140;
        //     default:
        //         return shopCategoryIcon131;
        // }

    }
    _closeDialogCallback() {
        this.setState({
            isShowCouponDialog: false
        })

    }
    goUseCouponPage() {
        this.goPage({
            url: 'couponModule/shopCoupon',
        })

        this.setState({
            isShowCouponDialog: false
        })

    }


    render() {
        const { cityInfo, shopList, categoryList, couponList, isShowCouponDialog } = this.state
        return (
            <View className='shop-list-page' style={{ position: isShowCouponDialog ? "fixed" : "none" }}>
                {
                    isShowCouponDialog &&
                    <AvailableCouponsDialog
                        extraCouponList={couponList}
                        // onItemClick={this.onCouponItemClick.bind(this, item)}
                        closeDialogCallback={this._closeDialogCallback.bind(this)}
                        goUseCouponPage={this.goUseCouponPage.bind(this)} />
                }

                <View className='address-layout'>
                    <Image className="address-img" src={addressIcon}></Image>
                    <View className="address-city" onClick={this._chooseCity}>{cityInfo.districtName || cityInfo.name || ""}</View>
                    {
                        isLocationRefuse && <View onClick={this.openSetting} className="relocation-btn">重新定位</View>
                    }
                    <View className="search-layout">
                        <View className="search-bg" onClick={this.onSearchShopClick}>
                            <AtIcon prefixClass='icon' value='sousuo' size='16' color='#666666'></AtIcon>
                            <Input className="search-text"
                                onInput={this.onSearchIntputChange}
                                value={searchKey}
                                disabled="true"
                                onConfirm={this.onSearchClick.bind(this, true)}
                                placeholder="搜索商店"
                                placeholderClass="placeholder-input"
                                confirmType="搜索"></Input>
                        </View>
                    </View>
                </View>

                <View className="category-list">
                    {
                        categoryList.map((categoryInfo, index) => {
                            return (
                                <View className="category-item" onClick={this.onCategoryItemClick.bind(this, categoryInfo)}>
                                    <Image className="category-image" src={categoryInfo.icon || this.getCategoryIcon(categoryInfo.id)}></Image>
                                    <View className="category-name">{categoryInfo.businessName}</View>
                                </View>
                            )

                        })
                    }
                </View>

                <ListTitle title="附近橙店"></ListTitle>

                {
                    shopList == null || shopList.length == 0 &&
                    <EmptyView type={6}></EmptyView>
                }

                {
                    shopList.map(item => {
                        return (<ShopItem shopInfo={item} onItemClick={this.onShopClick.bind(this, item)}></ShopItem>)
                    })
                }
                <View className="no-more-data" style={{ display: shopList.length ? "block" : "none" }}>附近商家已全部展示</View>

            </View>

        )
    }
}

export default XPage.connectFields()(shopList)
