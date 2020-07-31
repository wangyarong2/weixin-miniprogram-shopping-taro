import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './chooseShop.less'
import { AtIcon } from 'taro-ui'
import request from "../../../servers/http";
import EmptyView from '../../../components/EmptyView/EmptyView';

class chooseShop extends XPage {
    config = {
        navigationBarTitleText: '选择门店',
        enablePullDownRefresh: true
    }

    state = {
        shopList: [],
        pageNo: 1,
        pageSize: 50,
        type: null, //fromAsk 要券 contact 联系店主
    }

    componentDidMount() {
        this.getShopList();
        const { type } = this.$router.params;
        console.log(this.$router.params)
        this.setState({
            type
        })
    }

    onPullDownRefresh() {
        this.setState({
            pageNo: 1,
            shopList: []
        }, () => {
            this.getShopList(true)
        })
    }

    getShopList(refresh) {
        const { pageNo, pageSize } = this.state
        request.post('/community-client/member/queryBindShops', { pageNo, pageSize }).then((res) => {
            Taro.hideLoading();
            Taro.stopPullDownRefresh();
            let { shopList } = this.state
            if (refresh) {
                shopList = res.list == null ? [] : res.list;
            } else {
                let resultList = res.list
                if (resultList != null && resultList.length > 0) {
                    //有更多数据
                    shopList = shopList.concat(resultList)
                } else {
                    //没有更多数据
                }
            }
            this.setState({
                shopList: shopList,
                pageNo
            }, () => {

            })
        })
    }


    onShopClick(shop) {
        if (this.state.type == 'fromAsk') {
            this.goPage({ url: 'coupon/askCoupon', params: { shopId: shop.id } })
        }
        if (this.state.type == 'contact') {
            this.goPage({ url: 'coupon/contactDetail', params: { shopId: shop.id } })
        }

    }

    render() {
        const { shopList } = this.state
        return (
            <View className="shop-list">
                {
                    shopList == null || shopList.length == 0 &&
                    <EmptyView type={6}></EmptyView>
                }
                {
                    shopList.map((shop, index) => {
                        return (
                            <View className="item-layout">
                                <View className="shop" onClick={this.onShopClick.bind(this, shop)}>
                                    <View className="name">{shop.shopName}</View>
                                    <AtIcon prefixClass='icon' value='youjiantou' color='#999999' size='10' ></AtIcon>
                                </View>
                                <View className="line"></View>
                            </View>
                        )
                    })
                }
            </View>
        )
    }
}

export default XPage.connectFields()(chooseShop)
