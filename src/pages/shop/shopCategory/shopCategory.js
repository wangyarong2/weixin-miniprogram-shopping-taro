import XPage from '@src/components/XPage/XPage'
import { View, Input } from '@tarojs/components'
import './shopCategory.less'
import { AtIcon } from 'taro-ui'
import request from '../../../servers/http'
import EmptyView from '../../../components/EmptyView/EmptyView'
import LoginUtil from '../../../utils/LoginUtil'

import ShopItem from '../../../components/ShopItem/ShopItem'




class shopCategory extends XPage {

    config = {
        navigationBarTitleText: ''
    }

    state = {
        isShowCategoryView: false,
        topCategoryId: "",
        shopList: [],
        categoryList: [],
        cityCode: "",
        secondBusinessId: 0,
    }


    componentDidMount() {
        Taro.setNavigationBarTitle({
            title: this.$router.params.categoryName,
        })

        this.setState({
            topCategoryId: this.$router.params.categoryId,
            cityCode: this.$router.params.cityCode,
        }, () => {
            this.getSecondCategoryList();
            this.getShopList("");
        })


    }


    onShopClick(shopInfo) {
        //如果二级分类已展开，先隐藏二级分类
        if (this.state.isShowCategoryView) {
            this.setState({
                isShowCategoryView: false,
            })
            return;
        }
        this.goPage({
            url: 'shop/shopDetail',
            params: { shopId: shopInfo.shopId }
        })
    }
    onChange() {
        this.setState({
            isShowCategoryView: !this.state.isShowCategoryView,
        })
    }
    onSecondCategoryClick(item) {
        this.setState({
            isShowCategoryView: false,
            shopList: [],
            secondBusinessId: item.id,
        });
        // ===0 表示全部
        this.getShopList(item.id === 0 ? "" : item.businessName);
    }

    getSecondCategoryList() {
        request.post('/community-client/community/business/subList', { parentId: this.state.topCategoryId }).then(res => {
            this.setState({
                categoryList: [{
                    "id": 0,//全部的默认值
                    "businessName": "全部",
                    "parentId": 1,
                    "businessLevel": 2,
                }].concat(res.data),
            })
        })
    }
    /**
     * 
     * @param {*} businessName 二级分类的名称
     */

    getShopList(businessName) {
        Taro.showLoading({
            title: '加载中...',
            mask: true
        })
        const requestParsms = {
            areaCode: this.state.cityCode,
            businessId: this.state.topCategoryId,
            businessName: businessName,
        }
        request.post('/community-client/member/queryOffPayShopsInArea', requestParsms).then(res => {
            Taro.hideLoading()
            this.setState({
                shopList: res
            })
        }).catch(erroe => {
            Taro.hideLoading()
        })
    }
    _getItemSelectedStatus(item) {
        return this.state.secondBusinessId === item.id;
    }

    render() {
        const { shopList, isShowCategoryView, categoryList } = this.state;
        return (
            <View className="root" >
                <View style={{ position: "relative" }}>
                    <View className="category-container" onClick={this.onChange.bind(this)}>
                        <View className="text">分类</View>
                        <View className="arrow">
                            <View >
                                <AtIcon prefixClass='icon' value={isShowCategoryView ? 'shangjiantou' : 'xiajiantou'} size='6' color='#999'></AtIcon>
                            </View>
                        </View>
                    </View>
                    <View className="second-category" style={{ display: isShowCategoryView ? 'block' : 'none' }}>
                        {
                            categoryList.map((item, index) => {
                                return (<View className={`item ${this._getItemSelectedStatus(item) ? "selected" : null}`} onClick={this.onSecondCategoryClick.bind(this, item)}>{item.businessName}</View>)
                            })
                        }
                    </View>

                </View>

                {
                    shopList == null || shopList.length == 0 &&
                    <EmptyView type={10} text={"该类店铺正在加入中 敬请期待~"}></EmptyView>
                }
                {
                    shopList.map(item => {
                        return (<ShopItem shopInfo={item} onItemClick={this.onShopClick.bind(this, item)}></ShopItem>)
                    })
                }


            </View>

        );
    }


}

export default XPage.connectFields()(shopCategory)