import XPage from '@src/components/XPage/XPage'
import { View, Input } from '@tarojs/components'
import './searchProduct.less'
import { AtIcon } from 'taro-ui'
import request from '../../../servers/http'
import PriceView from '../../../components/PriceView/price'
import AfterCouponPriceIcon from '../../../components/AfterCouponPrice/AfterCouponPrice'
import EmptyView from '../../../components/EmptyView/EmptyView'
import LoginUtil from '../../../utils/LoginUtil'
import TextUtil from '../../../utils/TextUtil'

import meibaoPrice from '../../../assets/images/product/icon_meibao_price.png'

class searchProduct extends XPage {
    config = {
        navigationBarTitleText: '搜索',
        enablePullDownRefresh: false
    }

    state = {
        pageShowResult: false,
        searchKey: '',
        historyList: [],
        sortValue: {
            0: false,
            1: false,
            2: false,
        },
        lastIndex: null,
        productList: [],
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
        let { lastIndex, sortValue, searchKey, pageNo, pageSize } = this.state
        // if (searchKey == null || searchKey.length == 0) {
        //     Taro.showToast({
        //         title: '请输入搜索关键字',
        //         icon: 'none',
        //         duration: 2000
        //     })
        //     return
        // }
        this.addNewHistory(searchKey);
        const requestData = {}
        // if (lastIndex == 0) {
        //     requestData.sort = '1'
        // }
        // if (lastIndex == 1) {
        //     requestData.sort = '2'
        // }
        // if (lastIndex == 2) {
        //     requestData.sort = '3'
        // }
        // if (lastIndex != null) {
        //     if (sortValue[lastIndex] == true) {
        //         requestData.isAscending = true
        //     } else {
        //         requestData.isAscending = false
        //     }
        // }
        if (refresh) {
            pageNo = 1;
        } else {
            pageNo += 1;
        }
        requestData.groupName = searchKey;
        requestData.pageNo = pageNo;
        requestData.pageSize = pageSize;
        // requestData.shopId = Taro.getStorageSync('currentShopId')
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/promotion/groupTemplateList', requestData).then(res => {
            Taro.hideLoading();
            let { productList } = this.state
            if (refresh) {
                productList = res.list == null ? [] : res.list;
            } else {
                let resultList = res.list
                if (resultList != null && resultList.length > 0) {
                    //有更多数据
                    productList = productList.concat(resultList)
                }
            }
            console.log('productList', productList)
            this.setState({
                noMoreData: pageNo * pageSize >= res.totalSize,
                productList: productList,
                pageNo,
                pageShowResult: true
            })
        })

    }

    onReachBottom() {
        if (!this.state.noMoreData)
            this.onSearchClick(false)
    }

    getHistorySearch() {
        request.post('/community-client/history/search', { searchType: 1 }).then(res => {
            this.setState({
                historyList: res
            })
        })
    }

    addNewHistory(str) {
        if (!TextUtil.isEmpty(str)) {
            request.post('/community-client/record/search', {
                goodsName: str, searchType: 1
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
            searchType: 1
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

    onProductClick(product) {
        this.goPage({
            url: 'goodsDetail',
            params: {
                templateId: product.templateId,
                productType: 1
            }
        })
    }

    onTagClick(item) {
        this.setState({
            searchKey: item,
            lastIndex: null,
            productList: [],
        }, () => {
            this.onSearchClick(true);
        })
    }

    render() {
        const { historyList, searchKey, pageShowResult, sortValue, productList, lastIndex } = this.state
        return (
            <View className="search-page">
                <View className="search-root">
                    <View className="search-layout">
                        <AtIcon prefixClass='icon' value='sousuo' size='16' color='#666666'></AtIcon>
                        <Input className="search-input" onInput={this.onSearchIntputChange} value={searchKey} onConfirm={this.onSearchClick.bind(this, true)} placeholder="请输入商品名称" placeholderClass="placeholder-input" confirmType="搜索"></Input>
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
                            {/* <View className="sort-layout">
                                <View className="sort-item">
                                    <View className="text" onClick={this.onSortClick.bind(this, 0)}>默认排序</View>
                                    <View className="sort-image-layout" onClick={this.onSortClick.bind(this, 0)}>
                                        <AtIcon prefixClass='icon' value='shangjiantou' size='4' color={sortValue[0] && lastIndex == 0 ? '#EF0B0B' : '#999999'}></AtIcon>
                                        <AtIcon prefixClass='icon' value='xiajiantou' size='4' color={!sortValue[0] && lastIndex == 0 ? '#EF0B0B' : '#999999'}></AtIcon>
                                    </View>
                                </View>
                                <View className="sort-item">
                                    <View className="text" onClick={this.onSortClick.bind(this, 1)}>价格</View>
                                    <View className="sort-image-layout" onClick={this.onSortClick.bind(this, 1)}>
                                        <AtIcon prefixClass='icon' value='shangjiantou' size='4' color={sortValue[1] && lastIndex == 1 ? '#EF0B0B' : '#999999'}></AtIcon>
                                        <AtIcon prefixClass='icon' value='xiajiantou' size='4' color={!sortValue[1] && lastIndex == 1 ? '#EF0B0B' : '#999999'}></AtIcon>
                                    </View>
                                </View>
                                <View className="sort-item">
                                    <View className="text" onClick={this.onSortClick.bind(this, 2)}>销量</View>
                                    <View className="sort-image-layout" onClick={this.onSortClick.bind(this, 2)}>
                                        <AtIcon prefixClass='icon' value='shangjiantou' size='4' color={sortValue[2] && lastIndex == 2 ? '#EF0B0B' : '#999999'}></AtIcon>
                                        <AtIcon prefixClass='icon' value='xiajiantou' size='4' color={!sortValue[2] && lastIndex == 2 ? '#EF0B0B' : '#999999'}></AtIcon>
                                    </View>
                                </View>
                            </View> */}
                            {
                                productList == null || productList.length == 0
                                &&
                                <EmptyView type={5}></EmptyView>
                            }
                            <View className="product-list">
                                {
                                    productList.map((product, index) => {
                                        return (
                                            <View style={index % 2 == 0 ? 'margin-right:10rpx' : 'margin-left:10rpx'} className="product-item" onClick={this.onProductClick.bind(this, product)}>
                                                <Image className="product-image" src={product.imageUrl}></Image>
                                                <View className="product-info-layout">
                                                    <View className="product-name">{product.name}</View>
                                                    <View className="price-layout">
                                                        <View className="left-price">
                                                            <View className="price">{product.lowRedeemPrice / 100}</View>
                                                            <Image className="meibao-price" src={meibaoPrice}></Image>
                                                        </View>
                                                        {/* <View className="market-price">￥{product.highOriginPrice / 100}</View> */}
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        </View>
                        :
                        <View className='quick-search'>
                            <View className='quick-search-item'>
                                <View className='flex-space-between' style='padding-right: 6rpx;'>
                                    <View className='search-title'>历史搜索</View>
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

export default XPage.connectFields()(searchProduct)
