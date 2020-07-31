import { Image, View, Navigator } from '@tarojs/components';
import { AtIcon, AtFloatLayout } from 'taro-ui';
import XPage from '@src/components/XPage/XPage';
import './HotspotChunk.less';
import Taro from '@tarojs/taro';

/**

 * Author: jianglong
 * -----------------------------
 * 图片热区
 */

class HotspotChunk extends XPage {
  static defaultProps = {
    datas: {}, //渲染数据
    handleClick: null,
  };

  config = {
    navigationBarTitleText: '',
  };

  onHotClick(hotspotItem, event) {
    event.stopPropagation;
    const { handleClick } = this.props;
    if (handleClick) {
      handleClick(hotspotItem.link);
    }
  }
  getMarginTopValue(hotspotItem, hotspotImageItem) {
    return hotspotItem.realOffsetY / this.geRatio(hotspotImageItem) + 'rpx';
  }
  //获取宽的比例    (服务端下发图片的高 / view展示的宽)
  geRatio(hotspotImageItem) {
    return this.getDimensionWidth(hotspotImageItem) / 750;
  }

  getMarginLeftValue(hotspotItem, hotspotImageItem) {
    return hotspotItem.realOffsetX / this.geRatio(hotspotImageItem) + 'rpx';
  }

  /**
   * 获取服务端下发图片的  宽
   */
  getDimensionWidth(hotspotImageItem) {
    if (null == hotspotImageItem) return 750;
    if (hotspotImageItem.dimension == null || hotspotImageItem.dimension.length != 2) return 750;
    return hotspotImageItem.dimension[0];
  }

  /**
   * 获取服务端下发图片的  高
   */
  getDimensionHeight(hotspotImageItem) {
    if (null == hotspotImageItem) return 0;
    if (hotspotImageItem.dimension == null || hotspotImageItem.dimension.length != 2) return 0;
    return hotspotImageItem.dimension[1];
  }

  getHotspotView(hotspotImageItem) {
    return Object.values(hotspotImageItem.hotspot).map((hotspotItem, index) => {
      return (
        <View
          className="hot-area"
          style={{
            marginTop: this.getMarginTopValue(hotspotItem, hotspotImageItem),
            marginLeft: this.getMarginLeftValue(hotspotItem, hotspotImageItem),
            width: hotspotItem.width / this.geRatio(hotspotImageItem) + 'rpx',
            height: hotspotItem.height / this.geRatio(hotspotImageItem) + 'rpx',
          }}
          onClick={this.onHotClick.bind(this, hotspotItem)}
        />
      );
    });
  }
  getImgCollection() {
    const { datas } = this.props;
    if (null == datas) return [];
    if (datas.data == null) return [];
    if (datas.data.imgCollection == null) return null;
    return datas.data.imgCollection;
  }
  //按图片的宽高比，计算高
  getImgHeight(hotspotImageItem) {
    return this.getDimensionHeight(hotspotImageItem) / this.geRatio(hotspotImageItem);
  }

  render() {
    const { datas } = this.props;
    let hotspotImgList = this.getImgCollection();
    return (
      <View
        className="list"
        style={`padding-top: ${datas.style.margin.top}rpx; padding-bottom: ${datas.style.margin.bottom}rpx;`}
      >
        {hotspotImgList.map((hotspotImageItem, index) => {
          return (
            <View className="hot-area" style={{ height: this.getImgHeight(hotspotImageItem) }} key={'hotspot' + index}>
              <Image className="img" mode="widthFix" src={hotspotImageItem.url} />
              {this.getHotspotView(hotspotImageItem)}
            </View>
          );
        })}
      </View>
    );
  }
}

export default XPage.connectFields()(HotspotChunk);
