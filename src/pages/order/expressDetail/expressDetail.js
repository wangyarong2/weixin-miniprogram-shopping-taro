import XPage from '@src/components/XPage/XPage';
import { View, ScrollView } from '@tarojs/components';
import PriceView from '../../../components/PriceView/price';
import './expressDetail.less';

import request from '../../../servers/http';
import TextUtil from '../../../utils/TextUtil';

class expressDetail extends XPage {
  config = {
    navigationBarTitleText: '物流信息',
  };

  state = {
    orderInfo: {
      skuList: [],
      orderExpressList: [],
    },
    listIndex: 0,
    expressSingle: true, //是否是单个物流
    expressInfo: {
      fullTraceDetail: [],
    },
  };

  componentDidMount() {
    const { orderNo } = this.$router.params;
    this.getOrderDetail(orderNo);
  }

  getOrderDetail(orderNo) {
    request
      .post('/community-client/orderDetail', { orderNo })
      .then((res) => {
        this.hideLoading();
        const expressList = res.orderExpressList;
        const expressSingle = expressList && expressList.length === 1;
        this.setState(
          {
            orderInfo: res,
            expressSingle,
          },
          () => {
            this.getExpressDetail();
          }
        );
      })
      .catch((res) => {
        this.hideLoading();
      });
  }

  getExpressDetail() {
    const { orderInfo, listIndex } = this.state;
    const currentExpress = orderInfo.orderExpressList[listIndex];
    const requestParams = {
      mailNo: currentExpress.expressNo,
      cpCode: currentExpress.expressCompanyCode,
      platformId: 6,
    };
    request.post('/community-client/routeDetail', requestParams).then((res) => {
      console.log(res)
      if (res.fullTraceDetail != null && res.fullTraceDetail.length > 0) {
        res.fullTraceDetail.reverse();
      }
      this.setState({
        expressInfo: res,
      });
    });
  }

  switchExpress(i) {
    this.setState(
      {
        listIndex: i,
      },
      () => {
        this.getExpressDetail();
      }
    );
  }

  onCopyClick() {
    Taro.setClipboardData({ data: this.state.expressInfo.mailNo }).then({});
  }

  render() {
    const { expressInfo, orderInfo, expressSingle, listIndex } = this.state;
    return (
      <View className="express-detail-page">
        <View className="product-layout">
          {orderInfo.skuList &&
            orderInfo.skuList.map((sku, index) => {
              return (
                <View className="product-item">
                  <Image className="picture" src={sku.spuImage}></Image>
                  <Text className="item-total">X {sku.skuNumber}</Text>
                </View>
              );
            })}
        </View>

        {!expressSingle && (
          <View className="switch-express">
            <View className="title_text">包裹信息</View>
            <ScrollView scrollX scrollWithAnimation className="switch_scrollview">
              {orderInfo.orderExpressList.map((item, i) => {
                return (
                  <View
                    key={i}
                    className={`${listIndex === i ? 'item-tab selected' : 'item-tab'}`}
                    onClick={this.switchExpress.bind(this, i)}
                  >
                    包裹{i + 1}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View className="express-layout">
          <View className="express-num-layout flex-space-between">
            <View className="title">物流编号</View>
            <View className="flex-center">
              <View className="express-num">{expressInfo.mailNo || ''}</View>
              <View className="copy" onClick={this.onCopyClick}>
                复制
              </View>
            </View>
          </View>
          <View className="express-num-layout flex-space-between">
            <View className="title">发货时间</View>
            <View className="express-num">{TextUtil.formatDateWithYMDHMS(orderInfo.deliveryTime)}</View>
          </View>
          <View className="express-line"></View>
        </View>

        <View className="record-layout">
          <View className="express-company">{expressInfo.experssCompanyName || ''}快递</View>
          <View className="logistics-container">
            {expressInfo.fullTraceDetail.map((item, index) => {
              return (
                <View className="item-list" key={index}>
                  <View className="item-line-container">
                    <View className="item-line item-line-start"></View>
                    {index === 0 ? (
                      <View className="item-dotted-selected">
                        <View className="red"></View>
                      </View>
                    ) : (
                      <View className="item-dotted"></View>
                    )}
                    <View className="item-line item-line-end"></View>
                  </View>
                  <View className="item-content">
                    <View className="item-text" style={'color:' + (index == 0 ? '#333333' : '#999999')}>
                      {item.context}
                    </View>
                    <View className="item-time" style={'color:' + (index == 0 ? '#333333' : '#D8D8D8')}>
                      {item.time}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
}

export default XPage.connectFields()(expressDetail);
