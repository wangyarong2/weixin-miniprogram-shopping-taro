import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import shopIcon from '@images/order/icon_shop.png'
import request from '../../../servers/http'
import SpecTranslateUtil from '../../../utils/SpecTranslateUtil'
import EmptyView from '../../../components/EmptyView/EmptyView'
import TextUtil from '../../../utils/TextUtil'
import AfterCouponPriceIcon from '../../../components/AfterCouponPrice/AfterCouponPrice'
import meiBaoPrice from '../../../assets/images/product/icon_meibao_price.png'
import './searchResult.less'

class searchResult extends XPage {
    config = {
        navigationBarTitleText: '搜索结果',
        enablePullDownRefresh: true
    }

    state = {
        orderList: [],
        pageNo: 1,
        pageSize: 10,
        orderAutoClose: 15,
        noMoreData: false,
        orderTabMap: {
            1: { title: '待付款', color: '#FF6400' },
            2: { title: '待发货', color: '#FF6400' },
            3: { title: '待收货', color: '#FF6400' },
            4: { title: '交易成功', color: '#FF6400' },
            5: { title: '已关闭', color: '#242424' },
            11: { title: '退款中', color: '#FF6400' },
            12: { title: '退款成功', color: '#242424' },
            13: { title: '退款失败', color: '#242424' },
            10: { title: '待自提', color: '#FF6400' },
        },
        keyword: '',

    }


    componentDidMount() {
        const { keyword } = this.$router.params;
        this.setState({
            keyword: keyword
        }, () => {
            this.searchOrder(true)
        })

    }

    onPullDownRefresh() {
        this.setState({
            pageNo: 1,
            orderList: []
        }, () => {
            this.searchOrder(true)
        })
    }

    onReachBottom() {
        if (!this.state.noMoreData)
            this.searchOrder(false)
    }


    searchOrder(refresh) {
        let { pageNo, pageSize, keyword } = this.state
        if (refresh) {
            pageNo = 1;
        } else {
            pageNo += 1;
        }
        const requestData = {
            keyWord: keyword,
            pageSize: pageSize,
            type: 0,
            pageNo: pageNo,
        }
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/orderList', requestData).then((res) => {
            Taro.hideLoading();
            Taro.stopPullDownRefresh();
            let { orderList } = this.state
            if (res.list != null && res.list.length > 0) {
                res.list.map(item => {
                    item.countDownTime = this.state.orderAutoClose * 60 * 1000 - ((Date.parse(new Date()) - item.createTime)) + '';
                    if (item.afterSaleStatus == 1) {
                        // item.orderStatus = 12
                        item.afterSaleStatus = null;
                    }
                    if (item.afterSaleStatus == 2) {
                        // item.orderStatus = 13
                        item.afterSaleStatus = null;
                    }
                    if (item.afterSaleStatus == 3 || item.afterSaleStatus == 0) {
                        // item.orderStatus = 11
                        item.afterSaleStatus = null;
                    }
                    if (item.deliveryType == 1 && item.orderStatus == 3) {
                        item.orderStatus = 10
                    }
                })
            }
            if (refresh) {
                orderList = res.list == null ? [] : res.list;
            } else {
                let resultList = res.list
                if (resultList != null && resultList.length > 0) {
                    //有更多数据
                    orderList = orderList.concat(resultList)
                }

            }
            this.setState({
                noMoreData: pageNo * pageSize >= res.totalSize,
                orderList: orderList,
                pageNo
            })

        })
    }

    // 取消订单
    onCanecelOrder(data, e) {
        e.stopPropagation()
        Taro.showModal({
            title: '提示',
            content: '确认取消该订单吗?',
        }).then(res => {
            if (res.confirm) {
                this.showLoading();
                request.post('/community-client/cancelOrder', {
                    orderNo: data.orderNo
                }).then(res => {
                    this.hideLoading()
                    Taro.showToast({
                        title: '订单取消成功',
                        icon: 'success'
                    })
                    setTimeout(() => {
                        this.onPullDownRefresh();
                    }, 300);
                }).catch(res => {
                    this.showToast({
                        title: res.resultDesc
                    })
                })
            }
        })
    }

    // 立即付款
    async onPayNow(data, e) {
        e.stopPropagation()
        Taro.showLoading({
            title: '请等待...',
            mask: true
        })
        const wxCode = await LoginUtil.getWXCode()
        request.post('/community-client/requestPayNo', {
            orderNoList: Array.of(data.orderNo),
            wxCode
        }).then(res => {
            Taro.hideLoading()
            WxPayUtil.getPay({
                payNo: res.payNo,
            }, this.onOrderPaySuccess.bind(this, Array.of(data.orderNo)), this.onOrderPayFail.bind(this))
        }).catch(res => {
            this.showToast({
                title: res.resultDesc
            })
        })
    }

    // 订单支付成功
    onOrderPaySuccess(orderNo) {
        // this.goPage({
        //     type: 'replace',
        //     url: 'order/payResult',
        //     params: {
        //         orderNo
        //     }
        // })
    }

    // 支付失败不做任何操作
    onOrderPayFail() { }

    //查看物流
    onSeeExpress(data, e) {
        e.stopPropagation()
        this.goPage({
            url: 'order/expressDetail',
            params: {
                expressNo: data.expressNo,
                expressCompanyCode: data.expressCompCode,
                orderNo: data.orderNo
            }
        })
    }

    // 确认收货
    confirmTakeGoods(data, e) {
        e.stopPropagation()
        Taro.showModal({
            title: '提示',
            content: '确定收货吗?',
        }).then(res => {
            if (res.confirm) {
                this.showLoading();
                request.post('/community-client/order/finish', { orderNo: data.orderNo }).then((res) => {
                    Taro.showToast({
                        title: "收货成功",
                        icon: 'success',
                    })
                    setTimeout(() => {
                        this.onPullDownRefresh();
                    }, 300);
                })
            }
        })
    }

    // 跳转到订单详情
    gotoOrderDetail(index) {
        const params = {
            orderNo: this.state.orderList[index].orderNo,
        }
        this.goPage({ url: 'order/orderDetail', params })
    }

    connectService(data, e) {
        e.stopPropagation()
        this.goPage({
            url: 'order/applyRefound',
            params: {
                orderNo: data.orderNo
            }
        })
    }

    //取消退款
    cancelRefound(data, e) {
        e.stopPropagation()
        Taro.showModal({
            title: '提示',
            content: '确定取消退款吗?',
        }).then(res => {
            if (res.confirm) {
                this.showLoading();
                request.post('/community-client/customer/refund/cancel', { orderNo: data.orderNo, refundId: data.refundId }).then((res) => {
                    setTimeout(() => {
                        this.onPullDownRefresh();
                    }, 300);
                })
            }
        })
    }

    render() {
        const { orderList } = this.state
        return (
            <View className="order-layout">
                {
                    orderList == null || orderList.length == 0
                    &&
                    <EmptyView type={4}></EmptyView>
                }
                {
                    orderList.map((order, index) => {
                        return (
                            <View className="order-item" onClick={this.gotoOrderDetail.bind(this, index)}>
                                <View className="shop-info-layout">
                                    <View className="shop-name-layout">
                                        <Image className="shop-icon" src={shopIcon} ></Image>
                                        <Text className="shop-name">{order.shopName}</Text>
                                    </View>
                                    <View className="order-status" style={`color:${orderTabMap[order.orderStatus].color}`}>{orderTabMap[order.orderStatus].title}</View>
                                </View>
                                {
                                    order.skuList && order.skuList.map((product, index) => {
                                        const price = product.unitPrice / 100;
                                        const priceText = parseFloat(price).toFixed(2);
                                        const [pointBeforeText, pointAfterText] = priceText.split(".");
                                        return (
                                            <View className="product-info-layout">
                                                <View className="product-image-layout">
                                                    <Image className="product-image" src={product.spuImage}></Image>
                                                    <Text className="send-type">{order.deliveryType == 2 ? '邮寄' : '自提'}</Text>
                                                </View>
                                                <View className="product-right-content">
                                                    <View className="product-name">{product.spuName}</View>
                                                    <View className="spec-layout">
                                                        <Text className="spec">{SpecTranslateUtil.translateSpecToText(product.skuSpecDesc)}</Text>
                                                        {/* <View className="less-layout">
                                                                <View className="less-text">返</View>
                                                                <View className="less-money-text">￥{product.spuRateAmount / 100}</View>
                                                            </View> */}

                                                    </View>

                                                    <View className="price-layout">
                                                        <View className='left-layout'>
                                                            {
                                                                order.warehouseType == '3' &&
                                                                <View className="bao-price">{product.mabelPrice / 100}</View>
                                                            }
                                                            {
                                                                order.warehouseType == '3' &&
                                                                <Image className="meibao-price" src={meiBaoPrice}></Image>
                                                            }
                                                            {
                                                                order.warehouseType != '3' &&
                                                                <View className="price-wrapper">
                                                                    <Text className="red-color" style={{ fontSize: 22 + "rpx" }}> {"¥"}</Text>
                                                                    <Text className="red-color" style={{ fontSize: 28 + "rpx" }}>
                                                                        {TextUtil.isEmpty(pointBeforeText) ? "0" : pointBeforeText}
                                                                    </Text>
                                                                    <Text className="red-color" style={{ fontSize: 28 + "rpx" }}>.</Text>
                                                                    <Text className="red-color" style={{ fontSize: 22 + "rpx" }}>{pointAfterText}</Text>
                                                                </View>
                                                            }
                                                            {
                                                                order.warehouseType != '3' &&
                                                                <AfterCouponPriceIcon />
                                                            }

                                                            <Text className="market-price">￥{product.sellingPrice / 100}</Text>
                                                        </View>
                                                        <Text className="product-count">x{product.skuNumber}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                                <View className="real-pay-layout">
                                    {
                                        order.warehouseType == "3" &&
                                        <Text className="real-pay">{order.orderStatus == 1 ? "应" : "实"}付款:{order.mabelPrice / 100}橙宝</Text>
                                    }
                                    {
                                        order.warehouseType != "3" &&
                                        <Text className="real-pay">{order.orderStatus == 1 ? "应" : "实"}付款:￥{(order.orderStatus == 1 ? order.orderAmountTotal : order.actuallyPayAmount) / 100}</Text>
                                    }
                                </View>
                                <View className="button-layout">
                                    {order.orderStatus == 1 && <Text className="button" onClick={this.onCanecelOrder.bind(this, order)}>取消订单</Text>}
                                    {order.orderStatus == 1 && <Text className="button-red" onClick={this.onPayNow.bind(this, order)}>立即付款</Text>}
                                    {order.orderStatus == 3 && <Text className="button" onClick={this.onSeeExpress.bind(this, order)}>查看物流</Text>}
                                    {order.orderStatus == 3 && <Text className="button-red" onClick={this.confirmTakeGoods.bind(this, order)}>确认收货</Text>}
                                    {order.orderStatus == 4 && <Button className="button" onClick={this.connectService.bind(this, order)} openType="contact" sessionFrom={'7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl}>联系客服</Button>}
                                    {order.orderStatus == 11 && <Button className="button" onClick={this.connectService.bind(this, order)} openType="contact" sessionFrom={'7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl}>联系客服</Button>}
                                    {order.orderStatus == 11 && <Text className="button-red" onClick={this.cancelRefound.bind(this, order)}>取消退款</Text>}
                                    {order.orderStatus == 13 && <Button className="button" onClick={this.connectService.bind(this, order)} openType="contact" sessionFrom={'7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl} > 联系客服</Button>}
                                </View>
                            </View>
                        )
                    })
                }
            </View>
        )
    }
}

export default XPage.connectFields()(searchResult)
