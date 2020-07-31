import Taro from '@tarojs/taro';
import './ShareDialog.less';
import { View, Button } from '@tarojs/components';

import request from '@src/servers/http';

import shareFriend from '@images/product/icon_share_wechat.png';
import dowload from '@images/product/icon_share_download.png';
import topBg from '@images/product/icon_top_bg.png';
import meibaoPrice from '@images/product/icon_meibao_price.png';
import specialPrice from '@images/product/tag_special_price.png';
import bottomBg from '@images/product/icon_share_introduce.png';
import { AtIcon } from 'taro-ui';

export default class ShareDialog extends Taro.Component {
  static defaultProps = {
    price: '',
    productImage: '',
    productName: '',
    oldPrice: '',
    shopName: '',
    return: '',
    productType: 0,
    qrCodeImage: '',
  };

  constructor() {
    super(...arguments);
    this.state = {
      factor: 0,
      pixelRatio: 1,
      screenWidth: 0,
    };
  }

  componentDidMount() {
    const sysInfo = Taro.getSystemInfoSync();
    const screenWidth = sysInfo.screenWidth;
    this.setState({
      factor: screenWidth / 750,
      screenWidth,
    });
  }

  init() {
    const { productImage } = this.props;
    Taro.showLoading({
      title: '绘制中...',
    });

    if (productImage.startsWith('https')) {
      //不需要要转换
      this.beginDownloadRes(productImage);
    } else {
      this.imageUrlTransfer(productImage);
    }
  }

  /**
   * 兼容处理图片是http的址址，小程序无法下载图的问题（服务端将地址转换成https后，再给小程序）
   */

  imageUrlTransfer(httpImageUrl) {
    const requestData = {
      imageUrl: httpImageUrl,
    };
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request.post('/community-client/goods/image/transfer', requestData).then((res) => {
      Taro.hideLoading();
      this.beginDownloadRes(res);
    });
  }

  async beginDownloadRes(productImage) {
    if (productImage && this.props.qrCodeImage) {
      const productImageFile = await this.downloadHttpImg(productImage);
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
    const canvasWidthFormatPx = this.toPx(610);
    const canvansHeightFormatPx = this.toPx(1058);
    const canvas = Taro.createCanvasContext('sharingCanvas', this.$scope);

    //背景色
    canvas.fillStyle = '#FF7600';
    canvas.fillRect(0, 0, canvasWidthFormatPx, this.toPx(777));

    //画白色块
    canvas.fillStyle = '#fff';
    // this.drawRoundRect(canvas, this.toPx(40), this.toPx(100),
    //     this.toPx(530), this.toPx(678), this.toPx(16), '#fff')
    canvas.fillRect(this.toPx(40), this.toPx(100), this.toPx(530), this.toPx(678));
    //画底部介绍图片
    canvas.drawImage(bottomBg, 0, this.toPx(776), this.toPx(610), this.toPx(281));
    //画顶部店铺名称
    canvas.setTextAlign('left');
    canvas.setFontSize(15);
    canvas.setFillStyle('#000000');
    let shopName = this.props.shopName;
    if (shopName != null && shopName.length > 10) {
      shopName = shopName.substring(0, 10) + '...';
    }

    this.drawTitle(canvas, canvasWidthFormatPx);

    //画产品图片
    canvas.drawImage(productImageFile, this.toPx(70), this.toPx(130), this.toPx(470), this.toPx(470));

    //画产品名称
    canvas.setTextAlign('left');
    canvas.setFontSize(15);
    canvas.setFillStyle('#242424');
    let productName = this.props.productName;
    if (productName.length > 10) {
      if (productName != null && productName.length > this.state.screenWidth > 375 ? 20 : 16) {
        productName = productName.substring(0, this.state.screenWidth > 375 ? 17 : 14) + '...';
      }
    }
    canvas.fillText(productName, this.toPx(70), this.toPx(650));
    //正常商品
    if (this.props.productType == 0 || this.props.productType == 5) {
      //画价格符号
      canvas.setTextAlign('left');
      canvas.setFontSize(12);
      canvas.setFillStyle('#EF0B0B');
      const symbolWidth = canvas.measureText('￥').width;
      canvas.fillText('￥', this.toPx(70), this.toPx(700));
      //画价格没有小数点
      canvas.setTextAlign('left');
      canvas.setFontSize(18);
      canvas.setFillStyle('#EF0B0B');
      const priceWidth = this.props.price.toString().length * 20;
      canvas.fillText(this.props.price, this.toPx(70 + symbolWidth + 10), this.toPx(700), priceWidth);
      // if (this.props.productType == 0) {
      //     // 券后价
      //     canvas.drawImage(afterPrice, this.toPx(70 + symbolWidth + 10 + priceWidth), this.toPx(700 - 28), this.toPx(74), this.toPx(28));
      // }
      if (this.props.productType == 5) {
        //特价
        canvas.drawImage(
          specialPrice,
          this.toPx(70 + symbolWidth + 20 + priceWidth),
          this.toPx(700 - 28),
          this.toPx(64),
          this.toPx(36)
        );
      }
    }
    //1橙宝商品
    if (this.props.productType == 1) {
      canvas.setTextAlign('left');
      canvas.setFontSize(18);
      canvas.setFillStyle('#EF0B0B');
      const priceWidth = this.props.price.toString().length * 20;
      canvas.fillText(this.props.price, this.toPx(70), this.toPx(700));
      //橙宝图片
      canvas.drawImage(meibaoPrice, this.toPx(70 + priceWidth + 10), this.toPx(700 - 28), this.toPx(58), this.toPx(28));

      canvas.setTextAlign('left');
      canvas.setFontSize(11);
      canvas.setFillStyle('#FFFFFF');
      const meibaoTextWidth = canvas.measureText('橙宝专区').width;

      //画橙宝专区
      canvas.fillStyle = '#EF0B0B';
      canvas.fillRect(this.toPx(70), this.toPx(720), meibaoTextWidth + 10, this.toPx(30));

      canvas.setFillStyle('#FFFFFF');
      canvas.fillText('橙宝专区', this.toPx(70) + 5, this.toPx(720) + 12);
    }
    //橙卡商品
    if (this.props.productType == 2) {
      canvas.setTextAlign('left');
      canvas.setFontSize(12);
      canvas.setFillStyle('#EF0B0B');
      const symbolWidth = canvas.measureText('￥').width;
      canvas.fillText('￥', this.toPx(70), this.toPx(700));
      //画价格没有小数点
      canvas.setTextAlign('left');
      canvas.setFontSize(18);
      canvas.setFillStyle('#EF0B0B');
      const priceWidth = this.props.price.toString().length * 20;
      canvas.fillText(this.props.price, this.toPx(70 + symbolWidth + 10), this.toPx(700), priceWidth);
    }
    if (this.props.productType != 1) {
      //划线价
      canvas.setTextAlign('left');
      canvas.setFontSize(11);
      canvas.setFillStyle('#999999');
      const oldPriceWidth = canvas.measureText(this.props.oldPrice).width;
      canvas.fillText(this.props.oldPrice, this.toPx(400), this.toPx(695));
      //画横线
      canvas.setStrokeStyle('#999999');
      canvas.moveTo(this.toPx(400), this.toPx(695) - 3);
      canvas.lineTo(this.toPx(400) + oldPriceWidth + 2, this.toPx(695) - 3);
      canvas.stroke();
    }

    //画二维码
    canvas.drawImage(qrCodeImageFile, this.toPx(370), this.toPx(800), this.toPx(186), this.toPx(186));

    // //画返利文字
    // canvas.setTextAlign('left');
    // canvas.setFontSize(11);
    // canvas.setFillStyle('#FFFFFF');
    // const returnPriceWidth = canvas.measureText(this.props.return).width

    // //画返利背景
    // canvas.fillStyle = "#FF9814";
    // canvas.fillRect(this.toPx(70), this.toPx(720), returnPriceWidth + 10, this.toPx(30));

    // canvas.setFillStyle('#FFFFFF');
    // canvas.fillText(this.props.return, this.toPx(70) + 5, this.toPx(720) + 12)

    canvas.draw(true);
  };

  /**该方法用来绘制一个有填充色的圆角矩形
   *@param cxt:canvas的上下文环境
   *@param x:左上角x轴坐标
   *@param y:左上角y轴坐标
   *@param width:矩形的宽度
   *@param height:矩形的高度
   *@param radius:圆的半径
   *@param fillColor:填充颜色
   **/
  drawRoundRect(cxt, x, y, width, height, radius, /*optional*/ fillColor) {
    //圆的直径必然要小于矩形的宽高
    if (2 * radius > width || 2 * radius > height) {
      return false;
    }

    cxt.save();
    cxt.translate(x, y);
    //绘制圆角矩形的各个边
    this.drawRoundRectPath(cxt, width, height, radius);
    cxt.fillStyle = fillColor || '#000'; //若是给定了值就用给定的值否则给予默认值
    cxt.fill();
    cxt.restore();
  }

  drawRoundRectPath(cxt, width, height, radius) {
    cxt.beginPath(0);
    //从右下角顺时针绘制，弧度从0到1/2PI
    cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

    //矩形下边线
    cxt.lineTo(radius, height);

    //左下角圆弧，弧度从1/2PI到PI
    cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

    //矩形左边线
    cxt.lineTo(0, radius);

    //左上角圆弧，弧度从PI到3/2PI
    cxt.arc(radius, radius, radius, Math.PI, (Math.PI * 3) / 2);

    //上边线
    cxt.lineTo(width - radius, 0);

    //右上角圆弧
    cxt.arc(width - radius, radius, radius, (Math.PI * 3) / 2, Math.PI * 2);

    //右边线
    cxt.lineTo(width, height - radius);
    cxt.closePath();
  }

  /**
   *
   * 标题绘制
   * */
  drawTitle(canvas, canvasWidthFormatPx) {
    const titleStr = '好橙家.orange';
    const titleWidth = canvas.measureText(titleStr).width;
    canvas.setFillStyle('#fff');
    canvas.setFontSize(20);
    const leftOffset = (canvasWidthFormatPx - titleWidth) / 2;
    canvas.fillText(titleStr, leftOffset, this.toPx(60));
  }

  downloadHttpImg(imageUrl) {
    return new Promise((resolve, reject) => {
      Taro.downloadFile({
        url: imageUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          } else {
            Taro.showToast({
              title: '图片下载失败！',
              icon: 'none',
              duration: 2000,
            });
          }
        },
        fail: (res) => {
          Taro.showToast({
            title: '图片下载失败！',
            icon: 'none',
            duration: 2000,
          });
        },
      });
    });
  }

  _onSaveClick() {
    let that = this.$scope;
    Taro.showLoading({
      title: '正在保存',
      mask: true,
    });
    setTimeout(() => {
      Taro.canvasToTempFilePath(
        {
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
                  success(res2) {},
                });
              },
              fail(res4) {
                Taro.showToast({
                  title: '图片保存失败',
                  icon: 'none',
                  duration: 2000,
                });
              },
            });
          },
          fail(err) {},
        },
        that
      );
    }, 1000);
  }

  toPx = (rpx, int, factor = this.state.factor) => {
    if (int) {
      return parseInt(rpx * factor * this.state.pixelRatio);
    }
    return rpx * factor * this.state.pixelRatio;
  };

  onShareAppMessage() {
    this.props.onShareAppMessage();
  }

  render() {
    const canvansStyle = `width: 610rpx; height:1058rpx;`;
    return (
      <View className="product-share-dialog">
        <View className="root" onClick={this.props.onCloseClick}>
          {/* <View className='close-layout'>
                        <AtIcon prefixClass='icon' value='guanbi' color='#FF6400' size='20' ></AtIcon>
                    </View> */}
          <View className="empey-view" onClick={this.props.onCloseClick}></View>
          <canvas canvasId="sharingCanvas" style={canvansStyle}></canvas>
          <View className="empey-view" onClick={this.props.onCloseClick}></View>
        </View>

        <View className="dialog-content">
          <Button className="share-friend" open-type="share">
            <Image className="image" src={shareFriend}></Image>
            <View className="text">分享给朋友</View>
          </Button>
          <Button className="download" onClick={this._onSaveClick}>
            <Image className="image" src={dowload}></Image>
            <View className="text">保存到相册</View>
          </Button>
        </View>
      </View>
    );
  }
}
