import XPage from '@src/components/XPage/XPage'
import { View, Input } from '@tarojs/components'
import './searchShop.less'
import { AtIcon } from 'taro-ui'
import request from '../../../servers/http'
import PriceView from '../../../components/PriceView/price'
import AfterCouponPriceIcon from '../../../components/AfterCouponPrice/AfterCouponPrice'
import EmptyView from '../../../components/EmptyView/EmptyView'
import LoginUtil from '../../../utils/LoginUtil'
import TextUtil from '../../../utils/TextUtil'
import ShopItem from '../../../components/ShopItem/ShopItem'


class searchShop extends XPage {
    config = {
        navigationBarTitleText: '搜索商店',
        enablePullDownRefresh: false
    }

    state = {
        pageShowResult: false,
        searchKey: '',
        historyList: [],
        lastIndex: null,
        shopList: [],
        pageNo: 1,
        pageSize: 10,
        noMoreData: false,
    }

    componentDidMount() {
        if (LoginUtil.checkLogin()) {
            this.getHistorySearch();
        }
    }

    onSearchIntputChange(value) {
        this.setState({ searchKey: value.detail.value });
    }

    onCancelClick() {
        this.setState({
            searchKey: '',
            pageShowResult: false,
            lastIndex: null,
        })
    }

    onSearchClick(refresh) {
        const cacheCityInfo = Taro.getStorageSync('shopSelectedCityInfo')

        let { searchKey, pageNo, pageSize } = this.state
        if (searchKey == null || searchKey.length == 0) {
            Taro.showToast({
                title: '请输入搜索关键字',
                icon: 'none',
                duration: 2000
            })
            return
        }
        this.addNewHistory(searchKey);

        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })

        request.post('/community-client/member/queryOffPayShopsInArea', { areaCode: cacheCityInfo.code, shopKeyword: searchKey }).then(res => {
            Taro.hideLoading();
            let { shopList } = this.state
            if (refresh) {
                shopList = res || [];
            } else {
                let resultList = res
                if (resultList != null && resultList.length > 0) {
                    //有更多数据
                    shopList = shopList.concat(resultList)
                }
            }
            console.log('shopList', shopList)
            this.setState({
                noMoreData: pageNo * pageSize >= res.totalSize,
                shopList: shopList,
                pageNo,
                pageShowResult: true
            })
        }).catch(err => {
            Taro.hideLoading();
            this.setState({
                pageShowResult: true,
            })
        })

    }


    onReachBottom() {
        if (!this.state.noMoreData)
            this.onSearchClick(false)
    }

    getHistorySearch() {
        request.post('/community-client/history/search', { searchType: 4 }).then(res => {
            this.setState({
                historyList: res
            })
        })
    }

    addNewHistory(str) {
        if (!TextUtil.isEmpty(str)) {
            request.post('/community-client/record/search', {
                goodsName: str, searchType: 4
            }).then(res => {
                if (this.state.historyList.indexOf(str) == -1) {
                    this.state.historyList.unshift(str)
                    this.setState({
                        historyList: this.state.historyList
                    })
                }
            })
        }
    }

    clearAllHistory() {
        request.post('/community-client/record/delete', {
            searchType: 4
        }).then(res => {
            this.setState({
                historyList: []
            })
        })
    }

    onSortClick(index) {
        console.log('index', index)
        const { sortValue } = this.state
        sortValue[index] = !sortValue[index]
        this.setState({
            lastIndex: index,
            sortValue
        }, () => {
            this.onSearchClick(true);
        })
    }

    onBuyNowClick(product) {
        if (product.promotionSpu + '' == 'true') {
            if (product.promotionInfo.promotionType == 1) {
                this.goPage({ url: 'groupBuy/groupBuyProductDetail', params: { templateId: product.promotionInfo.templateId, shopId: Taro.getStorageSync('currentShopId') } })
            }
            if (product.promotionInfo.promotionType == 5) {
                this.goPage({ url: 'limitBuyGoodsDetail', params: { templateId: product.promotionInfo.templateId, shopId: Taro.getStorageSync('currentShopId') } })
            }
        } else {
            this.goPage({
                url: 'goodsDetail',
                params: {
                    spuId: product.spuId,
                    shopId: Taro.getStorageSync('currentShopId')
                }
            })
        }

    }

    onTagClick(item) {
        this.setState({
            searchKey: item,
            lastIndex: null,
            shopList: [],
        }, () => {
            this.onSearchClick(true);
        })
    }
    onShopClick(shopInfo) {
        this.goPage({
            url: 'shop/shopDetail',
            params: { shopId: shopInfo.shopId }
        })
    }

    render() {
        const { historyList, searchKey, pageShowResult, shopList } = this.state
        return (
            <View className="search-page">
                <View className="search-root">
                    <View className="search-layout">
                        <AtIcon prefixClass='icon' value='sousuo' size='16' color='#666666'></AtIcon>
                        <Input className="search-input" onInput={this.onSearchIntputChange} value={searchKey} onConfirm={this.onSearchClick.bind(this, true)} placeholder="搜索商店" placeholderClass="placeholder-input" confirmType="搜索"></Input>
                    </View>
                    {
                        pageShowResult ?
                            <View className="search-text" onClick={this.onCancelClick}>取消</View>
                            :
                            <View className="search-text" onClick={this.onSearchClick.bind(this, true)}>搜索</View>
                    }

                </View>
                {
                    pageShowResult ?
                        <View className="bottom-layout">

                            {
                                shopList == null || shopList.length == 0
                                &&
                                <EmptyView type={11}></EmptyView>
                            }

                            {
                                shopList.map((item, index) => {
                                    return (<ShopItem shopInfo={item} onItemClick={this.onShopClick.bind(this, item)}></ShopItem>)
                                })
                            }
                        </View>
                        :
                        <View className='quick-search'>
                            <View className='quick-search-item'>
                                <View className='flex-space-between' style='padding-right: 6rpx;'>
                                    <View className='search-title'>搜索历史</View>
                                    <View className="delete-layout" onClick={this.clearAllHistory}>
                                        <AtIcon prefixClass='icon' value='shanchu' size='16' color='#666666'></AtIcon>
                                        <View className="delete-all">全部删除</View>
                                    </View>
                                </View>
                                <View className='list-container'>
                                    {historyList.map((item, index) => {
                                        return (
                                            <View
                                                key={index}
                                                className='item-text'
                                                onClick={this.onTagClick.bind(this, item)}
                                            >
                                                {item}
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                        </View>
                }

            </View>

        )
    }
}

export default XPage.connectFields()(searchShop)
