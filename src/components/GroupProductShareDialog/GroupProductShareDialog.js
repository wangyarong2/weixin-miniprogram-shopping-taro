import Taro from '@tarojs/taro'
import './GroupProductShareDialog.less'
import { View, Button } from '@tarojs/components'

import shareFriend from '@images/product/icon_share_wechat.png'
import dowload from '@images/product/icon_share_download.png'
import topBg from '@images/product/icon_top_bg.png'
import groupPrice from '@images/product/icon_group_price.png'
import { AtIcon } from 'taro-ui'
import { bold } from 'ansi-colors'

export default class GroupProductShareDialog extends Taro.Component {

    static defaultProps = {
        price: '',
        productImage: '',
        productName: '',
        oldPrice: '',
        shopName: '',
        return: '',
        qrCodeImage: '',
        endTime: '',
    }

    constructor() {
        super(...arguments)
        this.state = {
            factor: 0,
            pixelRatio: 1,
            screenWidth: 0,
        }
    }


    componentDidMount() {
        const sysInfo = Taro.getSystemInfoSync();
        const screenWidth = sysInfo.screenWidth;
        this.setState({
            factor: screenWidth / 750,
            screenWidth
        })
    }



    init() {
        Taro.showLoading({
            title: '绘制中...',
        })
        this.beginDownloadRes();
    }

    async beginDownloadRes() {
        if (this.props.productImage && this.props.qrCodeImage) {
            const productImageFile = await this.downloadHttpImg(this.props.productImage);
            const qrCodeImageFile = await this.downloadHttpImg(this.props.qrCodeImage);
            this.checkAllRescouseHasDownload(productImageFile, qrCodeImageFile);
        }
    }

    // 检查所有资源文件是否完整
    checkAllRescouseHasDownload(productImageFile, qrCodeImageFile) {
        if (productImageFile && qrCodeImageFile) {
            this.drawPoster(productImageFile, qrCodeImageFile);
            Taro.hideLoading();
        }
    }

    drawPoster = (productImageFile, qrCodeImageFile) => {
        const canvasWidth = this.toPx(560);
        const canvansHeight = this.toPx(920);
        const canvas = Taro.createCanvasContext('sharingCanvas', this.$scope);

        //画顶部红色
        canvas.fillStyle = "#FF6400";
        canvas.fillRect(0, 0, canvasWidth, canvansHeight);

        //画顶部店铺名称背景
        canvas.drawImage(topBg, this.toPx(80), 0, this.toPx(400), this.toPx(60));

        //画顶部店铺名称
        canvas.setTextAlign('left');
        canvas.setFontSize(15);
        canvas.setFillStyle('#000000');
        let shopName = this.props.shopName;
        if (shopName != null && shopName.length > 10) {
            shopName = shopName.substring(0, 10) + "..."
        }
        const shopNameWidth = canvas.measureText(shopName).width;
        canvas.fillText(shopName, this.toPx(80 + 400 / 2 - shopNameWidth), this.toPx(40))

        canvas.save();
        this.buildTopProductImage(canvas, this.toPx(32), this.toPx(92), this.toPx(496), this.toPx(496), 10);
        canvas.clip();
        //画产品图片
        canvas.drawImage(productImageFile, this.toPx(32), this.toPx(92), this.toPx(496), this.toPx(496));
        canvas.restore();
        canvas.draw(true)

        //画渐变色
        let grd = canvas.createLinearGradient(this.toPx(32), this.toPx(538), this.toPx(528), this.toPx(538))
        grd.addColorStop(0, '#E10000')
        grd.addColorStop(1, '#7302AA')
        // Fill with gradient
        canvas.setFillStyle(grd)
        canvas.fillRect(this.toPx(32), this.toPx(538), this.toPx(496), this.toPx(50))

        //画结束时间
        canvas.setTextAlign('left');
        canvas.setFontSize(12);
        canvas.setFillStyle('#ffffff');
        canvas.fillText('拼团截止时间 ' + this.props.endTime, this.toPx(56), this.toPx(572));


        //画底部白色
        canvas.fillStyle = "#ffffff";
        this.buildBottomWhiteBlock(canvas, this.toPx(32), this.toPx(588), this.toPx(496), this.toPx(300), 15);

        //画产品名称
        canvas.setTextAlign('left');
        canvas.setFontSize(15);
        canvas.setFillStyle('#242424');
        let productName = this.props.productName;
        if (productName != null && productName.length > this.state.screenWidth > 375 ? 20 : 16) {
            productName = productName.substring(0, this.state.screenWidth > 375 ? 16 : 14) + "..."
        }
        canvas.fillText(productName, this.toPx(46), this.toPx(664));

        //价格符号
        canvas.setTextAlign('left');
        canvas.setFontSize(12);
        canvas.setFillStyle('#EF0B0B');
        const symbolWidth = canvas.measureText('￥').width;
        canvas.fillText('￥', this.toPx(56), this.toPx(716));
        //画价格没有小数点
        canvas.setTextAlign('left');
        canvas.setFontSize(18);
        canvas.setFillStyle('#EF0B0B');
        const priceWidth = this.props.price.toString().length * 20;
        canvas.fillText(this.props.price, this.toPx(56 + symbolWidth + 10), this.toPx(716), priceWidth);
        // 券后价
        canvas.drawImage(groupPrice, this.toPx(56 + symbolWidth + 20 + priceWidth), this.toPx(716 - 28), this.toPx(74), this.toPx(28));

        //划线价
        canvas.setTextAlign('left');
        canvas.setFontSize(11);
        canvas.setFillStyle('#999999');
        const oldPriceWidth = canvas.measureText(this.props.oldPrice).width
        canvas.fillText(this.props.oldPrice, this.toPx(58), this.toPx(754))
        //画横线
        canvas.setStrokeStyle("#999999");
        canvas.moveTo(this.toPx(58), this.toPx(754) - 3)
        canvas.lineTo(this.toPx(58) + oldPriceWidth + 2, this.toPx(754) - 3)
        canvas.stroke();

        //画二维码
        canvas.drawImage(qrCodeImageFile, this.toPx(364), this.toPx(724), this.toPx(140), this.toPx(140));

        //画推荐词
        canvas.setTextAlign('left');
        canvas.setFontSize(12);
        canvas.setFillStyle('#242424');
        canvas.fillText('您身边的零售店', this.toPx(58), this.toPx(839))

        canvas.draw(true)
    }

    //画底部白色
    buildBottomWhiteBlock(ctx, x, y, w, h, r) {
        // 开始绘制
        ctx.beginPath()
        ctx.setFillStyle('white')
        // 左上角
        r = 0;
        ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
        // border-top
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.lineTo(x + w, y + r)
        // 右上角
        r = 0;
        ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
        // border-right
        r = 8;
        ctx.lineTo(x + w, y + h - r)
        ctx.lineTo(x + w - r, y + h)
        // 右下角
        r = 8;
        ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
        // border-bottom
        ctx.lineTo(x + r, y + h)
        ctx.lineTo(x, y + h - r)
        // 左下角
        ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
        // border-left
        r = 0;
        ctx.lineTo(x, y + r)
        ctx.lineTo(x + r, y)
        // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
        ctx.fill()
        ctx.closePath()
        ctx.draw(true)
    }
    //画顶部圆角图片
    buildTopProductImage(ctx, x, y, w, h, r) {
        // 开始绘制
        ctx.beginPath()
        ctx.setFillStyle('white')
        // 左上角
        r = 8;
        ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
        // border-top
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.lineTo(x + w, y + r)
        // 右上角
        r = 8;
        ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
        // border-right
        r = 0;
        ctx.lineTo(x + w, y + h - r)
        ctx.lineTo(x + w - r, y + h)
        // 右下角
        r = 0;
        ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
        // border-bottom
        ctx.lineTo(x + r, y + h)
        ctx.lineTo(x, y + h - r)
        // 左下角
        ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
        // border-left
        r = 8;
        ctx.lineTo(x, y + r)
        ctx.lineTo(x + r, y)
        // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
        ctx.fill()
        ctx.closePath()
    }

    downloadHttpImg(imageUrl) {
        return new Promise(((resolve, reject) => {
            Taro.downloadFile({
                url: imageUrl,
                success: (res) => {
                    if (res.statusCode === 200) {
                        resolve(res.tempFilePath)
                    } else {
                        Taro.showToast({
                            title: '图片下载失败！',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                },
                fail: (res) => {
                    Taro.showToast({
                        title: '图片下载失败！',
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }))
    }

    _onSaveClick() {
        let that = this.$scope
        Taro.showLoading({
            title: '正在保存',
            mask: true,
        })
        setTimeout(() => {
            Taro.canvasToTempFilePath({
                canvasId: 'sharingCanvas',
                success(res) {
                    Taro.hideLoading();
                    let tempFilePath = res.tempFilePath;
                    Taro.saveImageToPhotosAlbum({
                        filePath: tempFilePath,
                        success(res1) {
                            Taro.showModal({
                                content: '图片已保存到相册，赶紧晒一下吧~',
                                showCancel: false,
                                confirmText: '好的',
                                confirmColor: '#333',
                                success(res2) {
                                },
                            })
                        },
                        fail(res4) {
                            Taro.showToast({
                                title: '图片保存失败',
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    })
                },
                fail(err) {
                }
            }, that);
        }, 1000);
    }


    toPx = (rpx, int, factor = this.state.factor) => {
        if (int) {
            return parseInt(rpx * factor * this.state.pixelRatio);
        }
        return rpx * factor * this.state.pixelRatio;
    }

    onShareAppMessage() {
        this.props.onShareAppMessage();
    }

    render() {
        const canvansStyle = `width: 560rpx; height:920rpx;`
        return (
            <View className="product-share-dialog">
                <View className='root' onClick={this.props.onCloseClick}>
                    {/* <View className='close-layout'>
                        <AtIcon prefixClass='icon' value='guanbi' color='#FF6400' size='20' ></AtIcon>
                    </View> */}
                    <View className="empey-view" onClick={this.props.onCloseClick}></View>
                    <canvas canvasId='sharingCanvas' style={canvansStyle}></canvas>
                    <View className="empey-view" onClick={this.props.onCloseClick}></View>
                </View>

                <View className="dialog-content">
                    <Button className="share-friend" open-type="share" >
                        <Image className="image" src={shareFriend}></Image>
                        <View className="text">分享给朋友</View>
                    </Button>
                    <Button className="download" onClick={this._onSaveClick}>
                        <Image className="image" src={dowload}></Image>
                        <View className="text">保存到相册</View>
                    </Button>
                </View>
            </View>
        )
    }
}
