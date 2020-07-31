import XPage from '@src/components/XPage/XPage'
import { View, Textarea } from '@tarojs/components'
import './applyRefound.less'

import TextUtil from '../../../utils/TextUtil'
import { AtImagePicker } from 'taro-ui'
import request from '../../../servers/http'
import { baseUrl } from '../../../servers/config'
import SpecTranslateUtil from '../../../utils/SpecTranslateUtil'
import meiBaoPrice from '../../../assets/images/product/icon_meibao_price.png'
import AfterCouponPriceIcon from '../../../components/AfterCouponPrice/AfterCouponPrice'

class applyRefound extends XPage {
    config = {
        navigationBarTitleText: '申请退款'
    }

    state = {
        inputLength: 0,
        reason: '',
        orderInfo: {
            skuList: []
        },
        files: [],
    }


    componentDidMount() {
        const { orderNo } = this.$router.params;
        this.setState({
            orderNo
        }, () => {
            this.getOrderDetail();
        })

    }

    getOrderDetail() {
        const { orderNo } = this.state
        this.showLoading();
        request.post('/community-client/orderDetail', { orderNo }).then(res => {
            this.hideLoading();
            console.log('订单详情', res)
            this.setState({
                orderInfo: res
            })
        }).catch(res => {
            this.hideLoading();
        })

    }

    onReasonChange(e) {
        const value = e.target.value
        this.setState({
            reason: value,
            inputLength: TextUtil.isEmpty(value) ? 0 : value.length
        })
    }

    onFail(mes) {
        console.log(mes)
    }

    onImageClick(index, file) {
        console.log(index, file)
    }

    // 上传操作
    uploadImage(tempFilePathsArr) {
        let that = this
        return new Promise((reslove, reject) => {
            const resultImgList = []
            tempFilePathsArr.forEach((item, index) => {
                console.log(baseUrl + '/pintuan-manage/img/noTokenUpload', item.url)
                wx.uploadFile({
                    url: baseUrl + '/pintuan-manage/img/noTokenUpload',
                    filePath: item.url,
                    name: 'file',
                    formData: {},
                    success(res) {
                        const dataImg = JSON.parse(res.data)
                        if (dataImg.resultCode === '0') {
                            resultImgList.push(dataImg.resultData)
                            if (resultImgList.length === tempFilePathsArr.length) {
                                reslove(resultImgList)
                            }
                        } else {
                            that.showToast({ title: '上传失败' })
                          reject('')
                        }
                    }
                }, that)
            })
        })
    }

    onSubmitClick() {
        if (TextUtil.isEmpty(this.state.reason)) {
            return this.showToast({ title: '请填写内容' })
        } else {
            if (TextUtil.isEmojiCharacter(this.state.reason)) {
                return this.showToast({ title: '输入内容不能包含表情或特殊符号' })
            }
            if (this.state.files != null && this.state.files.length > 0) {
                Taro.showLoading({ mask: true, title: '上传图片中...' });
                this.uploadImage(this.state.files).then(res => {
                    const requestParams = {
                        orderNo: this.state.orderNo,
                        nodes: this.state.reason,
                        image: res,
                    }
                    request.post('/community-client/customer/refund/apply', requestParams).then((res) => {
                      Taro.hideLoading();
                        this.showToast({
                            title: '申请成功'
                        })
                        Taro.setStorageSync('hasSubmitRefound', true)
                        Taro.setStorageSync('orderListNeedRefresh', true)
                        setTimeout(() => {
                            this.goBack();
                        }, 500);
                    }).catch(res => {
                      Taro.hideLoading();
                    })
                }).catch(res => {
                  Taro.hideLoading();
                })
            } else {
                const requestParams = {
                    orderNo: this.state.orderNo,
                    nodes: this.state.reason,
                    image: [],
                }
                this.showLoading();
                request.post('/community-client/customer/refund/apply', requestParams).then((res) => {
                    this.hideLoading();
                    this.showToast({
                        title: '申请成功'
                    })
                    Taro.setStorageSync('orderListNeedRefresh', true)
                    Taro.setStorageSync('hasSubmitRefound', true)
                    setTimeout(() => {
                        this.goBack();
                    }, 500);
                })
            }
        }

    }

    onChange(files) {
        this.setState({
            files
        })
    }

    render() {
        const { orderInfo, reason, inputLength } = this.state
        return (
            <View className="apply-refound-page">
                <View className="product-layout">
                    {
                        orderInfo.skuList && orderInfo.skuList.map((product, index) => {
                            const price = product.unitPrice / 100;
                            const priceText = parseFloat(price).toFixed(2);
                            const [pointBeforeText, pointAfterText] = priceText.split(".");

                            const groupPrice = product.activityPrice / 100;
                            const groupPriceText = parseFloat(groupPrice).toFixed(2);
                            const [groupBeforeText, groupAfterText] = groupPriceText.split(".");
                            return (
                                <View className="product-info-layout" onClick={this.onProductClick.bind(this, product)}>
                                    <View className="product-image-layout">
                                        <Image className="product-image" src={product.spuImage}></Image>
                                        <Text className="send-type">{orderInfo.deliveryType == 2 ? '邮寄' : '自提'}</Text>
                                    </View>
                                    <View className="product-right-content">
                                        <View className="product-name">{product.spuName}</View>
                                        <View className="spec-layout">
                                            <Text className="spec">{SpecTranslateUtil.translateSpecToText(product.skuSpecDesc)}</Text>
                                        </View>

                                        <View className="price-layout">
                                            <View className='left-layout'>
                                                {
                                                    orderInfo.warehouseType == '3' &&
                                                    <View className="bao-price">{product.mabelPrice / 100}</View>
                                                }
                                                {
                                                    orderInfo.warehouseType != '3' && orderInfo.warehouseType != '8' && orderInfo.warehouseType != '11' &&
                                                    <View className="price-wrapper">
                                                        <Text className="red-color" style={{ fontSize: 28 - 6 + "rpx" }}> {"¥"}</Text>
                                                        <Text className="red-color" style={{ fontSize: 28 + "rpx" }}>
                                                            {TextUtil.isEmpty(pointBeforeText) ? "0" : pointBeforeText}
                                                        </Text>
                                                        <Text className="red-color" style={{ fontSize: 28 + "rpx" }}>.</Text>
                                                        <Text className="red-color" style={{ fontSize: 28 - 6 + "rpx" }}>{pointAfterText}</Text>
                                                    </View>
                                                }
                                                {
                                                    (orderInfo.warehouseType == '8' || orderInfo.warehouseType == '11') &&
                                                    <View className="price-wrapper">
                                                        <Text className="red-color" style={{ fontSize: 28 - 6 + "rpx" }}> {"¥"}</Text>
                                                        <Text className="red-color" style={{ fontSize: 28 + "rpx" }}>
                                                            {TextUtil.isEmpty(groupBeforeText) ? "0" : groupBeforeText}
                                                        </Text>
                                                        <Text className="red-color" style={{ fontSize: 28 + "rpx" }}>.</Text>
                                                        <Text className="red-color" style={{ fontSize: 28 - 6 + "rpx" }}>{groupAfterText}</Text>
                                                    </View>
                                                }

                                                {
                                                    orderInfo.warehouseType != '3' && orderInfo.warehouseType != '8' && orderInfo.warehouseType != '11' &&
                                                    < AfterCouponPriceIcon />
                                                }
                                                {
                                                    orderInfo.warehouseType == '11' &&
                                                    <View className='sepcial-price'>特价</View>
                                                }
                                                {
                                                    orderInfo.warehouseType == '3' &&
                                                    <Image className='meibao-price' src={meiBaoPrice}></Image>
                                                }
                                                {
                                                    orderInfo.warehouseType != '3' &&
                                                    < Text className="market-price" style={{ marginTop: (orderInfo.warehouseType == '8') ? '7rpx' : '0rpx' }}>￥{product.sellingPrice / 100}</Text>
                                                }

                                            </View>
                                            <Text className="product-count">x{product.skuNumber}</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>

                <View className="reason-layout">
                    <View className="reason-text-layout">
                        <View className="reson-text">退款原因</View>
                        <View className="num-layout">
                            <View className="count-num">{inputLength}</View>
                            <View className="total-num">/100</View>
                        </View>
                    </View>
                    <Textarea className="input" value={reason} onInput={this.onReasonChange} maxlength={100} placeholderClass="placehold" placeholder="请输入退款原因"></Textarea>
                </View>

                <View className="money-layout">
                    <View className="item">
                        <View className="black-title">退款金额</View>
                        <View className="black-title">￥{orderInfo.actuallyPayAmount / 100}</View>
                    </View>
                    {/* {
                        orderInfo.warehouseType != '8' && orderInfo.warehouseType != '11' &&
                        <View className="item">
                            <View className="black-title">退回橙券</View>
                            <View className="black-title">￥{orderInfo.discountAmount / 100}</View>
                        </View>
                    }

                    <View className="item">
                        <View className="black-title">退回余额</View>
                        <View className="black-title">￥{TextUtil.isEmpty(orderInfo.balanceAmount + "") ? 0 : orderInfo.balanceAmount / 100}</View>
                    </View> */}
                </View>

                <View className="pricture-layout">
                    <View className="picture-text-layout">
                        <View className="picture-text">上传凭证</View>
                        <View className="num-layout">
                            <View className="count-num">{this.state.files.length}</View>
                            <View className="total-num">/6</View>
                        </View>
                    </View>

                    <View className="picker-layout">
                        <AtImagePicker
                            length={3}
                            count={6 - this.state.files.length}
                            showAddBtn={this.state.files.length >= 6 ? false : true}
                            sizeType={['compressed']}
                            files={this.state.files}
                            onChange={this.onChange.bind(this)}
                            onFail={this.onFail.bind(this)}
                            onImageClick={this.onImageClick.bind(this)}>
                        </AtImagePicker>
                    </View>
                </View>

                <View style={'height:100px'}></View>

                <View className="submit" style={{ marginBottom: this.detectionType(36, 0) }} onClick={this.onSubmitClick}>提交</View>
            </View>
        )
    }
}

export default XPage.connectFields()(applyRefound)
