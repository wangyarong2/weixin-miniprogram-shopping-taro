import Taro from '@tarojs/taro'
import './ShareCardDialog.less'
import { View, Button } from '@tarojs/components'

import shareFriend from '@images/product/icon_share_wechat.png'
import dowload from '@images/product/icon_share_download.png'
import bottomImg from '@images/product/card_share_bottpm.png'

export default class ShareCardDialog extends Taro.Component {

    static defaultProps = {
        meicardImg: '',
        qrCodeImage: '',
        totalPrice: '',
        price: '',
        name: ''
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
        if (this.props.meicardImg && this.props.qrCodeImage) {
            const meicardImageFile = await this.downloadHttpImg(this.props.meicardImg);
            const qrCodeImageFile = await this.downloadHttpImg(this.props.qrCodeImage);
            this.checkAllRescouseHasDownload(meicardImageFile, qrCodeImageFile);
        }
    }

    // 检查所有资源文件是否完整
    checkAllRescouseHasDownload(meiCardImageFile, qrCodeImageFile) {
        if (meiCardImageFile && qrCodeImageFile) {
            this.drawPoster(meiCardImageFile, qrCodeImageFile);
            Taro.hideLoading();
        }
    }

    drawPoster = (meiCardImageFile, qrCodeImageFile) => {
        const canvasWidth = this.toPx(640);
        const canvansHeight = this.toPx(556);
        const canvas = Taro.createCanvasContext('sharingCanvas', this.$scope);
        canvas.fillStyle = "#ffffff";
        canvas.fillRect(0, 0, canvasWidth, canvansHeight);

        canvas.font = 'normal bold 15px sans-serif';

        if (this.props.name.length <= 10) {
            //画橙卡名称
            canvas.setTextAlign('left');
            canvas.setFontSize(15);
            canvas.setFillStyle('#333333');
            canvas.fillText(this.props.name, this.toPx(24), this.toPx(265));
        } else {
            canvas.setTextAlign('left');
            canvas.setFontSize(15);
            canvas.setFillStyle('#333333');
            canvas.fillText(this.props.name.substring(0, 11), this.toPx(24), this.toPx(240));
            let text = this.props.name.substring(11, this.props.name.length)
            if (text.length > 10) {
                text = text.substring(0, 10) + '...'
            }
            canvas.fillText(text, this.toPx(24), this.toPx(275));
        }


        //画总权益
        canvas.setTextAlign('left');
        canvas.setFontSize(12);
        canvas.setFillStyle('#FF9814');
        canvas.fillText('权益总价值￥' + (this.props.totalPrice), this.toPx(24), this.toPx(this.props.name.length <= 10 ? 300 : 318));

        //价格符号
        canvas.setTextAlign('left');
        canvas.setFontSize(12);
        canvas.setFillStyle('#EF0B0B');
        const symbolWidth = canvas.measureText('￥').width;
        canvas.fillText('￥', this.toPx(24), this.toPx(410));
        //画价格没有小数点
        canvas.setTextAlign('left');
        canvas.setFontSize(18);
        canvas.setFillStyle('#EF0B0B');
        const priceWidth = this.props.price.toString().length * 20;
        canvas.fillText(this.props.price, this.toPx(24 + symbolWidth + 10), this.toPx(410), priceWidth);

        //画二维码
        canvas.drawImage(qrCodeImageFile, this.toPx(376), this.toPx(210), this.toPx(240), this.toPx(240))

        //底部标语
        canvas.drawImage(bottomImg, 0, this.toPx(482), canvasWidth, this.toPx(74))

        canvas.save();
        this.buildMeiCardImage(canvas, this.toPx(24), this.toPx(32), this.toPx(592), this.toPx(154), 10);
        canvas.clip();
        //橙卡图片
        canvas.drawImage(meiCardImageFile, this.toPx(24), this.toPx(32), this.toPx(592), this.toPx(154));

        canvas.draw(true)
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

    buildMeiCardImage(ctx, x, y, w, h, r) {
        // 开始绘制
        ctx.beginPath()
        ctx.setFillStyle('white')
        // 左上角
        ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
        // border-top
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.lineTo(x + w, y + r)
        // 右上角
        ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
        // border-right
        ctx.lineTo(x + w, y + h - r)
        ctx.lineTo(x + w - r, y + h)
        // 右下角
        ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
        // border-bottom
        ctx.lineTo(x + r, y + h)
        ctx.lineTo(x, y + h - r)
        // 左下角
        ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
        // border-left
        ctx.lineTo(x, y + r)
        ctx.lineTo(x + r, y)
        // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
        ctx.fill()
        ctx.closePath()
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
        const canvansStyle = `width: 640rpx; height:556rpx;`
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
