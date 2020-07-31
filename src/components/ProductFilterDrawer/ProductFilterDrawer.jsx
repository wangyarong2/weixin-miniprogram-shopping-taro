import { Image, Input, ScrollView, Text, View, Checkbox } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import request from '@src/servers/http';
import './ProductFilterDrawer.less';
import Taro from '@tarojs/taro';
import { AtDrawer, AtIcon } from 'taro-ui';
import PriceView from '../../components/PriceView/price';
import TextUtil from '@utils/TextUtil';
import PriceUtil from '../../utils/PriceUtil';
import SpecValue from '../SkuModel/item/SpecValue';

import cashPayIcon from '@src/assets/images/category/cash_pay.png';
import cashPaySelectedIcon from '@src/assets/images/category/cash_pay_selected.png';

import {
  FILTER_KEY_HIGH_PRICE,
  FILTER_KEY_LOW_PRICE,
  FILTER_KEY_CASH_DELIVERY,
  FILTER_KEY_ATTRIBUTE,
} from '@src/constants/filters';

const ITEM_MIN_COUNT = 6; //最少展示item数量
/**
 * 品牌、价格、风格选择  右侧栏
 */
export default class ProductFilterDrawer extends XPage {
  static defaultProps = {
    isShow: false,
    width: '580rpx',
    onFilterResultCallback: null,
    onDrawerCloseCallback: null,
    lastSelectedOriginData: null, //上一次选中结果
    generateReqParamsFunc: null,
    isNeedLoadAttribute: true, //是否需要加载非销售属性
  };
  state = {
    lowPrice: null,
    highPrice: null,
    isSupportCashPay: false, //是否支持现金支付
    attributeList: [],
    attributeSelected: {}, //选择结果key =id ,value =数组中选择的值
    attributeToggleStatus: [], //非销售属性展开状态列表
  };
  componentDidMount() {
    if (this.props.isNeedLoadAttribute) {
      this.requestAttribute();
    }
  }

  constructor(props) {
    super(props);
    const { lastSelectedOriginData } = props;
    if (null == lastSelectedOriginData) return;
    this.state = {
      ...lastSelectedOriginData,
    };
  }

  requestAttribute() {
    const { generateReqParamsFunc } = this.props;
    console.log();
    if (!generateReqParamsFunc) return;
    request
      .post('/community-client/filter/attribute', generateReqParamsFunc())
      .then((res) => {
        this.hideLoading();
        this.setState({
          attributeList: res,
        });
      })
      .catch((err) => {
        this.hideLoading();
      });
  }

  onClose() {
    if (this.props.onDrawerCloseCallback) {
      this.props.onDrawerCloseCallback();
    }
  }

  onLowPriceInputChange(value) {
    this.setState({ lowPrice: value.detail.value });
  }

  onHighPriceInputChange(value) {
    this.setState({ highPrice: value.detail.value });
  }

  onAttributeOnClick(id, attributeStr) {
    const { attributeSelected } = this.state;
    //实现反选操作
    attributeSelected[id] = attributeSelected[id] === attributeStr ? null : attributeStr;
    this.setState({
      attributeSelected,
    });
  }
  //重置状态,并重新加载数据
  reloadData() {}

  //点击重置状态，切换条件时
  onResetStateClick() {
    this.setState(
      {
        isOpenBrandDrawer: true,
        lowPrice: null,
        highPrice: null,
        isSupportCashPay: false,
        attributeSelected: {},
        attributeToggleStatus: [],
      },
      () => {
        this.onConfirmClick();
      }
    );
  }

  onConfirmClick() {
    const { onFilterResultCallback } = this.props;
    if (onFilterResultCallback) {
      const result = this.generateResult();
      onFilterResultCallback(result, this.state);
    }
  }
  onSupportCashPayClick() {
    this.setState({
      isSupportCashPay: !this.state.isSupportCashPay,
    });
  }
  onAttributeExtensionClick(index) {
    const { attributeToggleStatus } = this.state;
    attributeToggleStatus[index] = !attributeToggleStatus[index];
    this.setState({
      attributeToggleStatus,
    });
  }

  generateResult() {
    const result = [];
    const { lowPrice, highPrice, brandSelectedId, isSupportCashPay, attributeSelected } = this.state;
    if (lowPrice) {
      result.push({ filterType: FILTER_KEY_LOW_PRICE, filterKeyList: [lowPrice * 100] });
    }
    if (highPrice) {
      result.push({ filterType: FILTER_KEY_HIGH_PRICE, filterKeyList: [highPrice * 100] });
    }
    if (isSupportCashPay) {
      result.push({ filterType: FILTER_KEY_CASH_DELIVERY, filterKeyList: [isSupportCashPay ? 1 : 0] });
    }
    if (attributeSelected) {
      Object.entries(attributeSelected).map((item) => {
        //过滤value为空的数据
        if (item.length === 2 && item[1]) {
          result.push({ filterType: FILTER_KEY_ATTRIBUTE, filterKeyList: [item.join(',')] });
        }
      });
    }
    return result;
  }

  render() {
    const { isShow, width } = this.props;
    const {
      lowPrice,
      highPrice,
      brandSelectedId,
      isSupportCashPay,
      attributeList,
      attributeSelected,
      attributeToggleStatus,
    } = this.state;

    return (
      <AtDrawer width={width} show={isShow} mask right onClose={this.onClose.bind(this)}>
        <ScrollView scrollY scrollWithAnimation className="filter-layout">
          <View className="price-layout">
            <Text className="text">价格区间(元)</Text>
            <View className="input-layout">
              <Input
                className="price"
                onInput={this.onLowPriceInputChange}
                value={lowPrice}
                type="number"
                placeholder="最低价"
                placeholderClass="placeholder-input"
              />
              <View className="line" />
              <Input
                className="price"
                onInput={this.onHighPriceInputChange}
                value={highPrice}
                type="number"
                placeholder="最高价"
                placeholderClass="placeholder-input"
              />
            </View>
          </View>
          <View className="pay-type">
            <View>支付方式</View>
            <Image
              className="img"
              src={isSupportCashPay ? cashPaySelectedIcon : cashPayIcon}
              onClick={this.onSupportCashPayClick.bind(this)}
            />
            <Text className="text" onClick={this.onSupportCashPayClick.bind(this)}>
              支持货到付款
            </Text>
          </View>
          {attributeList &&
            attributeList.map((item, itemIndex) => {
              return (
                <View className="attr-layout">
                  <View className="title-layout">
                    <Text className="name">{item.name}</Text>
                    <View className="image" onClick={this.onAttributeExtensionClick.bind(this, itemIndex)}>
                      <AtIcon
                        prefixClass="icon"
                        size="9"
                        color="#87878C"
                        value={attributeToggleStatus[itemIndex] ? 'shangjiantou' : 'xiajiantou'}
                      />
                    </View>
                  </View>
                  {attributeToggleStatus[itemIndex] &&
                    item.values &&
                    item.values.map((value, attrIndex) => {
                      return (
                        <Text
                          key={'attr-item' + item.id + attrIndex}
                          className={`attr-item ${attributeSelected[item.id] === value ? 'selected' : ''}`}
                          onClick={this.onAttributeOnClick.bind(this, item.id, value)}
                        >
                          {value}
                        </Text>
                      );
                    })}
                </View>
              );
            })}
        </ScrollView>

        <View className="bottom-layout">
          <View className="reset" onClick={this.onResetStateClick.bind(this)}>
            重置
          </View>
          <View className="confirm" onClick={this.onConfirmClick.bind(this)}>
            确定
          </View>
        </View>
      </AtDrawer>
    );
  }
}
