import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';

import PriceView from '@src/components/PriceView/price';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';

import request from '@src/servers/http';
import { set as setGlobalData } from '@utils/globalData';

import './MCommodity.less';

export default class MCommodity extends Taro.Component {
  static externalClasses = ['class-wrapper'];

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      winHeight: 0,
      winWidth: 0,
      columnNumber: 2,
      commondityList: [],
      page: {
        switch: false,
        pageSize: 10,
        pageNo: 1,
        totalSize: 0,
      },
    };
  }

  componentWillMount() {
    Taro.getSystemInfo({
      success: (res) => {
        this.setState({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth,
        });
      },
    });
  }

  componentDidMount() {
    if (this.props.showLoading) {
      Taro.showLoading({ title: '加载中...' });
    }
    const datas = this.props.datas;
    const imgCollection = datas.data.imgCollection;
    if (datas && imgCollection.length) {
      let querySpuList = imgCollection;
      if (datas.factor.adImage) {
        querySpuList = imgCollection.filter((item, index) => index < 3);
      }
      const queryParams = {
        projectId: 'siji',
        spuList: querySpuList,
      };

      request
        .cmsPost({
          url: '/spu/query',
          data: queryParams,
        })
        .then((res) => {
          if (this.props.showLoading) {
            Taro.hideLoading();
          }
          if (res) {
            this.setState({
              commondityList: res,
              columnNumber: this.props.datas.number,
            });
          }
        });
    }
  }

  goProductDetail(data) {
    Taro.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?shopId=${Taro.getStorageSync('currentShopId')}&spuId=${data.spuId}`,
    });
  }

  goAllComodityList() {
    setGlobalData('cmsCurrentSpuListData', this.props.datas);
    Taro.navigateTo({
      url: '/pages/home/commondityList/commondityList',
    });
  }

  getMarketPriceStr(item) {
    if (item.highOriginPrice) {
      return '￥' + item.highOriginPrice / 100;
    } else {
      return '';
    }
  }

  render() {
    const { winWidth, columnNumber } = this.state;
    const { datas } = this.props;
    return datas && datas.data.imgCollection.length > 0 ? (
      <View
        className="commondity-container"
        style={`padding-top: ${datas.style.margin.top}px; padding-bottom: ${datas.style.margin.bottom}px;`}
      >
        {datas && datas.factor.adImage && (
          <View className="title-box">
            <Image className="ad-image" mode="widthFix" src={datas.factor.adImage} onClick={this.goAllComodityList} />
          </View>
        )}
        <View className={`spu-list spu-list${columnNumber}`}>
          {this.state.commondityList.map((item) => (
            <View className="item" key={item.id} onClick={this.goProductDetail.bind(this, item)}>
              <View className="image-container">
                {columnNumber === 1 ? (
                  <Image className="image" src={item.imageUrl} />
                ) : (
                  <Image
                    className="image"
                    src={item.imageUrl}
                    style={`width: ${(winWidth - 36) / columnNumber}px; height: ${(winWidth - 36) / columnNumber}px`}
                  />
                )}
              </View>
              <View className="info-layout">
                <View className="title">{item.name}</View>
                {columnNumber > 2 ? (
                  <View className="price-layout">
                    <View className="left-layout">
                      <PriceView price={item.lowShowPrice / 100} size={36} _afterSize={28} hasSymbol="￥" />
                      {/* <View className="coupon-text">券</View> */}
                    </View>
                  </View>
                ) : (
                  <View className="price-layout">
                    <View className="left-layout">
                      <PriceView price={item.lowShowPrice / 100} size={36} _afterSize={28} hasSymbol="￥" />
                      <AfterCouponPriceIcon />
                    </View>
                    <View className="market-price">{this.getMarketPriceStr(item)}</View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    ) : null;
  }
}
