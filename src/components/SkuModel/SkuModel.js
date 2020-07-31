import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { AtFloatLayout, AtIcon } from 'taro-ui';

import XPage from '@src/components/XPage/XPage';
import XInputNumber from '@src/components/XInputNumber/XInputNumber';
import PriceView from '@src/components/PriceView/price';
import AfterCouponPriceIcon from '@src/components/AfterCouponPrice/AfterCouponPrice';
import meiBaoPrice from '../../assets/images/product/icon_meibao_price.png';
import SpecValue from './item/SpecValue';
import TextUtil from '@utils/TextUtil';
import './SkuModel.less';
// import { classes } from '../../../../utils'

export default class SkuModel extends XPage {
  static defaultProps = {
    isOpened: false, // 控制是否出现在页面上
    onClose: null, // 元素被关闭时候触发的事件
    skuList: [], // sku 的数据
    specList: [], // 全部spec的数据
    currentSpecData: {}, // 当前选中的规格数据
    // currentSpecCount: 1, // 当前选中的规格数据的数量
    // onSkuNumberChange: null, // 当SKU加减变化的时候
    onAddCart: null, // 加入购物车事件
    noNumberChoose: false, // 是否显示数量加减框
    groupBuyMode: false,
    platformPrice: 0,
    productImageUrl: '',
    groupSkuList: [],
    productType: null, //0正常商品 1橙宝商品 2橙卡商品 4拼团
  };

  constructor() {
    super(...arguments);
    this.state = {
      currentSpecCount: 1,
      allCheckSpecArray: [], // 被选中的规格文字集合
      skuList: [], // sku 的数据
      specList: [], // 全部spec的数据
      currentSpecData: {
        platformPrice: 0,
        inventory: 0,
      }, // 当前规格数据
      allSpecText: '', // 拼装的显示的值
      defaultSpecData: {
        platformPrice: 0,
        inventory: 0,
        redeemPrice: -1,
        maxUnitPrice: -1,
        groupPrice: -1,
      },
      groupPriceData: {}, //团购价格
      clickInterval: 2000, // 点击限制间隔， 用于防止连续点击
      lastClickTime: 0,
      useCountLimit: false,
      maxCount: 1,
      mDeliveryType: null, // 发货类型：1自提，2快递 4.商家配送

      showSendWayOne: false,
      showSendWayTwo: false,
      showSendWayFour: false,
      showSendWayFive: false,
    };
  }

  // 初始化规格数据
  initWithDefaultData(skuList, specList) {
    this.state.skuList = this.mapSpuListWithValueMakeUp(skuList);
    this.state.specList = this.mapSpecListWithInventory(specList);
    this.showSendWay();
    this.setState(
      {
        skuList: this.state.skuList,
        specList: this.state.specList,
      },
      () => {
        this.calculateTheSkuMax();
      }
    );
  }

  initWithDefaultData2(skuList, specList, useCountLimit, maxCount) {
    this.setState(
      {
        useCountLimit: useCountLimit,
        maxCount: maxCount,
      },
      () => {
        this.initWithDefaultData(skuList, specList);
      }
    );
  }

  setDefaultDeliveryType(type) {
    const typeArr = type.toString().split('');
    if (typeArr.length < 2) {
      this.setState({ mDeliveryType: type == 3 ? null : type });
    }
  }
  setSkuNumber(skuNumber) {
    this.setState({
      currentSpecCount: skuNumber,
    });
  }

  initWithNewData2(skuList, specList, specValue, useCountLimit, maxCount) {
    this.setState(
      {
        useCountLimit: useCountLimit,
        maxCount: maxCount,
      },
      () => {
        this.initWithNewData(skuList, specList, specValue);
      }
    );
  }

  initWithNewData(skuList, specList, specValue) {
    this.state.skuList = this.mapSpuListWithValueMakeUp(skuList);
    this.state.specList = this.mapSpecListWithInventory(specList);

    this.showSendWay();

    this.state.specList.forEach((item) => {
      item.specValueList.forEach((spec) => {
        if (spec.inventory) {
          const isCheck = specValue.includes(spec.value);
          spec.isCheck = isCheck;
        }
      });
    });

    // 获取已选中规格对应的 sku
    const currentCheckValue = this.getCurrentCheckValue();
    const currentSpecData = this.state.skuList.filter((item) => item.allSpecValue === currentCheckValue.join(';'));
    if (currentSpecData.length) {
      this.state.currentSpecData = currentSpecData[0];
    }
    const allSpecText = this.getAllSpecText();

    this.setState(
      {
        allSpecText: allSpecText.join(';'),
        allCheckSpecArray: currentCheckValue,
        skuList: this.state.skuList,
        specList: this.state.specList,
        currentSpecData: this.state.currentSpecData,
      },
      () => {
        this.getGroupPriceBySkuId();
      }
    );
  }

  // 配送方式显示的逻辑
  showSendWay() {
    let deliveryType = this.props.deliveryType.toString().split('');
    let hasOne = false,
      hasTwo = false,
      hasFour = false,
      hasFive = false;
    if (deliveryType.includes('3')) {
      hasOne = true;
      hasTwo = true;
    } else {
      hasOne = deliveryType.includes('1');
      hasTwo = deliveryType.includes('2');
    }
    hasFour = deliveryType.includes('4');
    hasFive = deliveryType.includes('5');

    this.setState({
      showSendWayOne: hasOne,
      showSendWayTwo: hasTwo,
      showSendWayFour: hasFour,
      showSendWayFive: hasFive,
    });
  }

  // 遍历 skuList 的 item 将组合提取到 skuitem 里 少遍历一次
  mapSpuListWithValueMakeUp(skuList) {
    if (typeof skuList != 'undefined' && skuList.length > 0) {
      skuList.forEach((item) => {
        let allSpecValue = '';
        item.specList.forEach((spec, index) => {
          allSpecValue += index === 0 ? spec.specValue : ';' + spec.specValue;
        });
        item.allSpecValue = allSpecValue;
      });
      return skuList;
    }
  }

  // 遍历 specList
  mapSpecListWithInventory(specList) {
    if (typeof specList != 'undefined' && specList.length > 0) {
      specList.forEach((item) => {
        const specValueList = [];
        item.specValueList.forEach((value) => {
          specValueList.push({
            value,
            inventory: this.checkSpecIsInSkuList(value),
            isCheck: false,
          });
        });
        item.specValueList = specValueList;
      });
      return specList;
    }
  }

  // 默认显示最大的
  calculateTheSkuMax() {
    const { skuList } = this.state;
    if (typeof skuList != 'undefined' && skuList.length > 0) {
      const max = skuList.sort((element1, element2) => {
        if (element1.platformPrice > element2.platformPrice) return -1;
        if (element1.platformPrice < element2.platformPrice) return 1;
      })[0];
      const min = skuList.sort((element1, element2) => {
        if (element1.platformPrice > element2.platformPrice) return 1;
        if (element1.platformPrice < element2.platformPrice) return -1;
      })[0];
      const maxInventory = skuList.sort((element1, element2) => {
        if (element1.inventory > element2.inventory) return -1;
        if (element1.inventory < element2.inventory) return 1;
      })[0];
      const maxGroup = skuList.sort((element1, element2) => {
        if (element1.activePrice > element2.activePrice) return -1;
        if (element1.activePrice < element2.activePrice) return 1;
      })[0];
      const minGroup = skuList.sort((element1, element2) => {
        if (element1.activePrice > element2.activePrice) return 1;
        if (element1.activePrice < element2.activePrice) return -1;
      })[0];
      const { currentSpecData } = this.state;
      currentSpecData.inventory = maxInventory.inventory;
      currentSpecData.platformPrice = min.platformPrice;
      currentSpecData.maxPlatformPrice = max.platformPrice;
      currentSpecData.redeemPrice = max.redeemPrice;
      currentSpecData.activePrice = maxGroup.activePrice;
      currentSpecData.minActivePrice = minGroup.activePrice;
      currentSpecData.isDefault = 'true';
      this.setState(
        {
          currentSpecData: currentSpecData,
          defaultSpecData: currentSpecData,
        },
        () => {
          // this.getGroupPriceBySkuId();
        }
      );
    } else {
      const { currentSpecData } = this.state;
      currentSpecData.platformPrice = this.props.platformPrice;
      this.setState(
        {
          currentSpecData: currentSpecData,
        },
        () => {
          // this.getGroupPriceBySkuId();
        }
      );
    }
  }

  // 检查spec是否在所有的spec组合中
  checkSpecIsInSkuList(spec) {
    const { skuList } = this.state;
    let isIn = false;
    if (skuList != null && skuList.length > 0) {
      isIn = skuList.some((item) => {
        return item.allSpecValue.includes(spec);
      });
    }
    return isIn;
  }

  // 获取已选择sku的值（规格值）
  getCurrentCheckValue() {
    let currentCheckValue = [];
    this.state.specList.forEach((list) => {
      const checkValue = list.specValueList.filter((item) => item.isCheck)[0];
      checkValue && currentCheckValue.push(checkValue.value);
    });
    return currentCheckValue;
  }

  // 获取已选择sku的值（规格名 + 规格值）
  getAllSpecText() {
    let currentCheckValue = [];
    this.state.specList.forEach((list) => {
      const checkValue = list.specValueList.filter((item) => item.isCheck)[0];
      // const specText = `${list.specName}:${checkValue.value}`
      checkValue && currentCheckValue.push(`${list.specName}:${checkValue.value}`);
    });
    return currentCheckValue;
  }

  // 切换发货方式
  changeDeliveryType(num) {
    this.setState({ mDeliveryType: num });
  }

  // 点击规格值的一系列操作。。。
  onSpecClick(specParentIndex, specIndex, specValue) {
    const { specList, skuList } = this.state;

    // 改变规格的选中状态
    let currentCheck = false;
    specList[specParentIndex].specValueList.forEach((item, index) => {
      if (specIndex === index) {
        currentCheck = !item.isCheck;
        item.isCheck = currentCheck;
      } else {
        item.isCheck = false;
      }
      // item.isCheck = specIndex === index ? !item.isCheck : false
    });
    // console.log(`currentCheck:${currentCheck ? 'check' : 'cancel'}`)

    const currentCheckValue = this.getCurrentCheckValue();

    specList.forEach((item, index) => {
      if (specParentIndex !== index) {
        item.specValueList.forEach((spec) => {
          const currentSpec = [specValue, spec.value];
          const isContain = skuList.some((skuItem) => {
            const skuItemArr = skuItem.allSpecValue.split(';');
            return this.getArrRepeat(currentSpec, skuItemArr).length === currentSpec.length;
          });
          spec.inventory = isContain;
        });
      }
    });

    // 获取已选中规格对应的 sku
    const currentSpecData = skuList.filter((item) => item.allSpecValue === currentCheckValue.join(';'));
    if (currentSpecData.length) {
      this.state.currentSpecData = currentSpecData[0];
    }
    const allSpecText = this.getAllSpecText();

    this.setState(
      {
        specList: this.state.specList,
        currentSpecData: this.state.currentSpecData,
        allSpecText: allSpecText.join(';'),
        allCheckSpecArray: currentCheckValue,
      },
      () => {
        // this.getGroupPriceBySkuId();
      }
    );
  }

  getGroupPriceBySkuId() {
    // console.log('xxxxgetGroupPriceBySkuId',this.props.groupBuyMode)
    //团购
    if (this.props.groupBuyMode) {
      if (this.props.groupSkuList) {
        const groupPriceData = this.props.groupSkuList.filter(
          (item) => item.skuId + '' == this.state.currentSpecData.skuId + ''
        );
        if (groupPriceData.length > 0) {
          this.setState(
            {
              groupPriceData: {
                groupPrice: groupPriceData[0].groupPrice / 100,
                inventory: groupPriceData[0].inventory,
              },
            },
            () => {}
          );
        } else {
          const max = this.props.groupSkuList.sort((element1, element2) => {
            if (element1.groupPrice > element2.groupPrice) return -1;
            if (element1.groupPrice < element2.groupPrice) return 1;
          })[0];
          const min = this.props.groupSkuList.sort((element1, element2) => {
            if (element1.groupPrice > element2.groupPrice) return 1;
            if (element1.groupPrice < element2.groupPrice) return -1;
          })[0];
          const groupPriceData = {
            groupPrice: TextUtil.formateMoney(min.groupPrice, max.groupPrice),
            inventory: min.inventory + '~' + max.inventory,
          };
          this.setState({
            groupPriceData: groupPriceData,
          });
        }
      }
    } else {
      //不做任何操作
    }
  }

  getArrRepeat(arr1, arr2) {
    return arr1.filter((item) => arr2.includes(item));
  }

  _onConfirmClick() {
    let { clickInterval, lastClickTime } = this.state;
    const now = Date.now();
    if (now - lastClickTime < clickInterval) {
      return;
    }
    lastClickTime = now;
    this.setState({
      clickInterval,
      lastClickTime,
    });
    if (this.state.mDeliveryType == null) {
      Taro.showToast({
        title: '请选择收货方式',
        icon: 'none',
      });
      return;
    }
    if (this.state.allCheckSpecArray.length < this.state.specList.length) {
      Taro.showToast({
        title: '请选择商品规格',
        icon: 'none',
      });
      return;
    }
    const _data = {
      currentSpecData: this.state.currentSpecData,
      allSpecText: this.state.allSpecText,
      currentSpecCount: this.state.currentSpecCount,
      deliveryType: this.state.mDeliveryType,
    };

    this.props.onAddCart(_data);
  }

  // 加减 sku
  onSkuNumberChange(val) {
    this.setState({ currentSpecCount: parseInt(val) });
  }

  onPreviewImage(url) {
    Taro.previewImage({
      urls: [url],
    });
  }

  render() {
    const { isOpened, onClose, groupBuyMode, noNumberChoose } = this.props;
    const {
      specList,
      currentSpecData,
      currentSpecCount,
      defaultSpecData,
      groupPriceData,
      allSpecText,
      showSendWayOne,
      showSendWayTwo,
      showSendWayFour,
      showSendWayFive,
    } = this.state;
    return (
      <AtFloatLayout isOpened={isOpened} onClose={onClose}>
        <View className="skumodal-container">
          <View className="sku-close" onClick={onClose}>
            {/* <XIcon type="iconclose" size={20}></XIcon> */}
            <AtIcon prefixClass="icon" value="guanbi" size="18" color="#D8D8D8"></AtIcon>
          </View>
          <View className="goods-info">
            <Image
              className="sku-image"
              src={TextUtil.isEmpty(currentSpecData.skuImage) ? this.props.productImageUrl : currentSpecData.skuImage}
              onClick={this.onPreviewImage.bind(this, currentSpecData.skuImage)}
            />
            <View className="goods-info-right">
              {/* <View className='goods-title'>{currentSpecData.title}</View> */}
              {/* <View className='price-price'>
                <Text className='price-text'>¥{groupBuyMode ? groupPriceData.groupPrice : allSpecText.length == 0 ? (defaultSpecData.maxUnitPrice == -1 ? defaultSpecData.unitPrice / 100 : TextUtil.formateMoney(defaultSpecData.unitPrice, defaultSpecData.maxUnitPrice)) : currentSpecData.unitPrice / 100}</Text>
              </View> */}
              <View style={{ display: 'flex', alignItems: 'center' }}>
                {(this.props.productType == 0 || this.props.productType == 2 || this.props.productType == 5) && (
                  <View>
                    {TextUtil.isEmpty(currentSpecData.isDefault) && (
                      <PriceView price={currentSpecData.platformPrice / 100} size={48} hasSymbol="￥" />
                    )}
                    {currentSpecData.isDefault == 'true' && (
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <PriceView price={defaultSpecData.platformPrice / 100} size={48} hasSymbol="￥" />
                        {defaultSpecData.platformPrice !== defaultSpecData.maxPlatformPrice && (
                          <View style={{ fontSize: '28rpx', color: '#FF6400', fontWeight: 'bold' }}>~</View>
                        )}
                        {defaultSpecData.platformPrice !== defaultSpecData.maxPlatformPrice && (
                          <PriceView price={defaultSpecData.maxPlatformPrice / 100} size={48} />
                        )}
                      </View>
                    )}
                  </View>
                )}
                {this.props.productType == 4 && (
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    {TextUtil.isEmpty(currentSpecData.isDefault) && (
                      <PriceView price={currentSpecData.activePrice / 100} size={48} hasSymbol="￥" />
                    )}
                    {currentSpecData.isDefault == 'true' && (
                      <View style={{ display: 'flex', whiteSpace: 'nowrap', alignItems: 'center' }}>
                        <PriceView price={defaultSpecData.minActivePrice / 100} size={48} hasSymbol="￥" />
                        <View style={{ fontSize: '28rpx', color: '#FF6400', fontWeight: 'bold' }}>~</View>
                        <PriceView price={defaultSpecData.activePrice / 100} size={48} />
                      </View>
                    )}
                  </View>
                )}
                {this.props.productType == 1 && (
                  <View className="bao-price">
                    {allSpecText.length == 0
                      ? defaultSpecData.redeemPrice == -1
                        ? this.props.redeemPrice / 100
                        : defaultSpecData.redeemPrice / 100
                      : currentSpecData.redeemPrice / 100}
                  </View>
                )}

                {this.props.productType == 0 && <AfterCouponPriceIcon />}
                {
                  //特购
                  this.props.productType == 5 && <View className="sepcial-price">特价</View>
                }
                {this.props.productType == 1 && <Image className="meibao-price" src={meiBaoPrice}></Image>}
              </View>
              <View className="spec-stock">
                剩余{allSpecText.length == 0 ? defaultSpecData.inventory : currentSpecData.inventory}件
              </View>
              <View className="spec-text text-clip">{allSpecText.length == 0 ? '请选择商品规格' : allSpecText}</View>
            </View>
          </View>

          <ScrollView scrollY scrollWithAnimation className="scroll-container">
            <View className="spec-wrapper-container">
              <View className="spec-wrapper">
                <View className="spec-title">收货方式</View>
                {showSendWayOne && (
                  <Text
                    className={this.state.mDeliveryType === 1 ? 'spec checked' : 'spec'}
                    onClick={this.changeDeliveryType.bind(this, 1)}
                  >
                    到店自提
                  </Text>
                )}
                {showSendWayFour && (
                  <Text
                    className={this.state.mDeliveryType === 4 ? 'spec' + ' checked' : 'spec'}
                    onClick={this.changeDeliveryType.bind(this, 4)}
                  >
                    商家配送
                  </Text>
                )}

                {showSendWayFive && (
                  <Text
                    className={this.state.mDeliveryType === 5 ? 'spec' + ' checked' : 'spec'}
                    onClick={this.changeDeliveryType.bind(this, 5)}
                  >
                    配送入户
                  </Text>
                )}
                {showSendWayTwo && (
                  <Text
                    className={this.state.mDeliveryType === 2 ? 'spec checked' : 'spec'}
                    onClick={this.changeDeliveryType.bind(this, 2)}
                  >
                    配送入户
                  </Text>
                )}
              </View>
              {specList.map((spec, specIndex) => {
                return (
                  <View className="spec-wrapper" key={specIndex}>
                    <View className="spec-title">{spec.specName}</View>

                    {spec.specValueList.map((item, index) => {
                      return (
                        <SpecValue
                          isCheck={item.isCheck}
                          text={item.value}
                          inventory={item.inventory}
                          key={index}
                          onClick={this.onSpecClick.bind(this, specIndex, index, item.value)}
                        />
                      );
                    })}
                  </View>
                );
              })}
            </View>
            {!noNumberChoose && (
              <View className="flex-space-between">
                <View className="">购买数量</View>
                <View className="flex-space-between">
                  <View className=""></View>
                  <XInputNumber
                    disabled={this.props.productType == 2}
                    min={1}
                    max={
                      this.state.useCountLimit
                        ? this.state.maxCount > currentSpecData.inventory
                          ? currentSpecData.inventory
                          : this.state.maxCount
                        : currentSpecData.inventory
                    }
                    value={currentSpecCount}
                    onChange={this.onSkuNumberChange.bind(this)}
                  />
                  {/* <AtInputNumber
                    max={currentSpecData.inventory}
                    value={currentSpecCount}
                    onChange={this.onSkuNumberChange.bind(this)}/> */}
                </View>
              </View>
            )}
          </ScrollView>

          <View className="bottom-wrap">
            {/* <View className='sku-btn disabled'>加入购物车</View> */}
            <View className="sku-btn" onClick={this._onConfirmClick.bind(this)}>
              确定
            </View>
          </View>
        </View>
      </AtFloatLayout>
    );
  }
}
