import { Image, View, Text } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import { AtSwipeAction } from 'taro-ui';
import PriceView from '../../../../../components/PriceView/price';
import PriceUtil from '../../../../../utils/PriceUtil';

import request from '@src/servers/http';

import './CollectGoodsView.less';
import Taro from '@tarojs/taro';

/**

 * Author: jianglong
 * -----------------------------
 * 收藏商品item
 */

class CollectGoodsView extends XPage {
  static defaultProps = {
    productList: [],
  };
  config = {
    navigationBarTitleText: '',
  };

  state = {};

  handleStatusClick(productIndex) {
    this.state.productList[productIndex].isOpened = !this.state.productList[productIndex].isOpened;
    this.setState({
      productList: this.state.productList,
    });
  }

  handleStatusOpened(index) {
    this.updateSelectedStatus(index);
    this.setState({
      productList: this.state.productList,
    });
  }
  updateSelectedStatus(currentSelectedIndex) {
    const { productList } = this.state;
    productList.forEach((produceInfo, index) => {
      produceInfo.isOpened = currentSelectedIndex === index;
    });
  }

  handleStatusClosed(productIndex) {
    this.state.productList[productIndex].isOpened = false;
    this.setState({
      productList: this.state.productList,
    });
  }
  onBuyNowClick(product) {
    if (product.status == 0) {
      this.showToast({title:'商品已下架'})
      return;
    }
    this.goPage({
      url: 'goodsDetail',
      params: {
        spuId: product.spuId,
        shopId: Taro.getStorageSync('currentShopId'),
      },
    });
  }
  // 菜单点击操作 取消收藏
  onHandleMenuCollect(productIndex, options) {
    console.log('onHandleMenuCollect', productIndex, options);
    switch (options.position) {
      case 0:
        this.cancelCollectOfCurrentProduct(productIndex);
        break;
    }
  }

  //取消关注商品
  cancelCollectOfCurrentProduct(productIndex) {
    Taro.showModal({
      title: '提示',
      content: '确认取消关注该商品吗？',
    }).then((res) => {
      if (res.confirm) {
        request
          .post('/community-client/good/follow', {
            shopId: this.state.productList[productIndex].shopId,
            spuId: this.state.productList[productIndex].spuId,
          })
          .then((res) => {
            this.state.productList.splice(productIndex, 1);
            Taro.showToast({
              title: '取消关注成功',
              mask: true,
            });
            this.setState({
              productList: this.state.productList,
            });
          });
        this.handleStatusClosed(productIndex);
      }
    });
  }

  render() {
    const { productList } = this.props;
    return (
      <View className="goods-list">
        {productList.map((item, index) => {
          return (
            <AtSwipeAction
              autoClose
              isOpened={item.isOpened}
              onOpened={this.handleStatusOpened.bind(this, index)}
              onClosed={this.handleStatusClosed.bind(this, index)}
              onClick={this.onHandleMenuCollect.bind(this, index)}
              options={[
                {
                  text: '取消收藏',
                  style: {
                    backgroundColor: '#FF9814',
                    borderTopRightRadius: '16rpx',
                    borderBottomRightRadius: '16rpx',
                  },
                  position: 0,
                },
              ]}
            >
              <View style={{ opacity: item.status === 0 ? 0.7 : 1 }} onClick={this.onBuyNowClick.bind(this, item)}>
                <View className="content">
                  <Image className="image" src={item.imgUrl} />
                  {item.status === 0 && <Text className="invalid">失效</Text>}

                  <View className="right-content">
                    <View className="product-name">{item.name}</View>
                    <View className="right-bottom-content">
                      <View>
                        <PriceView price={item.lowShowPrice / 100} size={32} hasSymbol="￥" />
                      </View>

                      <View className="market-price">￥{PriceUtil.convertToFormatYuan(item.lowOriginPrice)}</View>
                      <View className="buy"> 立即购买</View>
                    </View>
                  </View>
                </View>
              </View>
            </AtSwipeAction>
          );
        })}
      </View>
    );
  }
}

export default XPage.connectFields()(CollectGoodsView);
