import Taro from '@tarojs/taro';
import { View, ScrollView, Text, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';
import XPage from '@src/components/XPage/XPage';
import request from '@src/servers/http';
import { set as setGlobalData } from '@utils/globalData';
import XAuthorize from '@src/components/XAuthorize/XAuthorize';
import GuidePage from '@src/components/GuidePage/GuidePage';

import LoginUtil from '../../utils/LoginUtil';

import ImgClassifyDefault from '@src/assets/images/default/classify-default.png';
import './categorylist.less';

const CATEGORY_TYPE_COMMON = 1; //通用商品
const CATEGORY_TYPE_BRAND = CATEGORY_TYPE_COMMON + 1; //品牌
const CATEGORY_TYPE_STYLE = CATEGORY_TYPE_BRAND + 1; //风格

class Categorylist extends XPage {
  config = {
    navigationBarTitleText: '分类',
  };

  constructor(props) {
    super(props);
  }

  state = {
    categoryList: [],
    spaceList: [],
    currentIndex: 0,
    shopId: '',
  };

  componentWillMount() {
    this.getSystemInfo();
    this.setState({
      shopId: Taro.getStorageSync('currentShopId'),
    });
  }

  componentDidShow() {
    if (!this.state.shopId) {
      this.setState(
        {
          shopId: Taro.getStorageSync('currentShopId'),
        },
        () => {
          this.getCategoryList();
        }
      );
    } else {
      this.getCategoryList();
    }
  }

  onLoginSuccess() {
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request
      .post('/community-client/mx/member/home', {})
      .then((res) => {
        Taro.setStorageSync('currentShopId', res.shop.shopId);
        Taro.setStorageSync('userHasLogin', true);
        Taro.hideLoading();
        this.setState(
          {
            shopId: res.shop.shopId,
          },
          () => {
            this.getCategoryList();
          }
        );
      })
      .catch((err) => {
        Taro.hideLoading();
      });
  }

  getCategoryList() {
    if (!this.state.shopId) return;
    if (this.state.categoryList && this.state.categoryList.length > 0) return;

    this.setState(
      {
        categoryList: [],
      },
      () => {
        this.getSpaceList();
        this._getCategoryList('/community-client/category/front/list', CATEGORY_TYPE_COMMON, () => {
          this._getBrandAndStyleList('/community-client/brand/all', CATEGORY_TYPE_BRAND, '超级品牌', () => {
            this._getBrandAndStyleList('/community-client/style/all', CATEGORY_TYPE_STYLE, '热门风格', () => {});
          });
        });
      }
    );
  }

  getSpaceList() {
    request.post('/community-client/applicableSpace/list').then((result) => {
      this.setState({
        spaceList: result,
      });
    });
  }

  _getBrandAndStyleList(url, categoryType, categoryName, resultCallback) {
    const { categoryList } = this.state;
    request
      .post(url, {
        shopId: this.state.shopId + '',
        showType: '2',
      })
      .then((result) => {
        Taro.hideLoading();

        //添加category type
        categoryList.push({ categoryType: categoryType, categoryName: categoryName, customList: result.data });
        this.setState({
          categoryList,
        });
        resultCallback();
      })
      .catch((e) => {
        Taro.hideLoading();
        resultCallback();
      });
  }

  _getCategoryList(url, categoryType, resultCallback) {
    const { categoryList } = this.state;
    request
      .post(url, {
        shopId: this.state.shopId + '',
        showType: '2',
      })
      .then((data) => {
        Taro.hideLoading();
        //添加category type
        data.forEach((categoryInfo) => {
          categoryInfo.categoryType = categoryType;
          categoryList.push(categoryInfo);
        });

        this.setState({
          categoryList,
        });
        resultCallback();
      })
      .catch((e) => {
        Taro.hideLoading();
        resultCallback();
      });
  }

  changeCategory(currentIndex) {
    this.setState({ currentIndex });
  }

  onScroll(e, bool) {
    this.state.categoryList.map((item) => {
      if (item.categoryKids.length > 0) {
        const query = Taro.createSelectorQuery();
        query
          .select('.list' + item.categoryId)
          .boundingClientRect((reft) => {
            if (0 > reft.top && reft.top > reft.height * -1) {
              this.setState({ activeClassifyId: item.categoryId });
            }
          })
          .exec();
      }
    });
  }

  handleCategoryClick(parentCategoryId, selectCategoryId) {
    this.goPage({
      url: 'product/category/goodsCategoryDetail',
      params: {
        parentCategoryId: parentCategoryId,
        categoryId: selectCategoryId,
      },
    });
  }

  handleBrandClick(brandInfo) {
    this.goPage({
      url: 'product/category/brandCategoryDetail',
      params: {
        categoryId: brandInfo.brandId,
        categoryName: brandInfo.brandName,
      },
    });
  }

  handleStyleClick(styleItem) {
    this.goPage({
      url: 'product/category/styleCategoryDetail',
      params: {
        categoryId: styleItem.styleId,
        categoryName: styleItem.styleName,
      },
    });
  }

  searchProduct() {
    this.goPage({
      url: 'product/searchProduct',
    });
  }

  getLoginView() {
    // return <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
    //   <View>登陆登陆登陆登陆登陆</View>
    // </XAuthorize>
    return (
      <View className="category-container">
        <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
          <GuidePage type={0}></GuidePage>
        </XAuthorize>
      </View>
    );
  }

  onSpaceClick(spaceItem) {
    this.goPage({
      url: 'product/category/spaceCategoryDetail',
      params: {
        spaceId: spaceItem.id,
        spaceName: spaceItem.name,
      },
    });
  }

  getCategoryListView(height, categoryList) {
    const { currentIndex, spaceList } = this.state;
    return (
      <View className="category-container">
        <View className="search-box">
          <View className="search-content" onClick={this.searchProduct}>
            <AtIcon prefixClass="icon" value="sousuo" color="#666666" size="14" />
            <Text className="text">搜索全部商品</Text>
          </View>
        </View>
        {spaceList && spaceList.length > 0 && (
          <View className="space-list">
            {spaceList.map((item, index) => {
              return (
                <View className="item" onClick={this.onSpaceClick.bind(this, item)}>
                  <Image mode="aspectFit" className="image" src={item.url} />
                  <Text className="text">{item.name}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View className="category-content">
          <ScrollView scrollY scrollWithAnimation className="category-leftbox" style={{ height: height + 'px' }}>
            {categoryList.map((item, index) => {
              return (
                <View
                  className={currentIndex === index ? 'list-item selected' : 'list-item'}
                  onClick={this.changeCategory.bind(this, index)}
                >
                  {currentIndex == index && <View className="category-selected" />}
                  <View className="category-text">{item.categoryName}</View>
                </View>
              );
            })}
          </ScrollView>
          <ScrollView scrollY scrollWithAnimation className="category-rightbox" style={{ height: height + 'px' }}>
            {/*通用类别 */}
            {categoryList[currentIndex].categoryType === CATEGORY_TYPE_COMMON &&
              categoryList[currentIndex].categoryKids.map((item, index) => {
                return (
                  <View
                    className="content-box"
                    // onClick={this.handleCategoryClick.bind(this, item.categoryId, -1)}
                    id={`item${item.categoryId}`}
                  >
                    <View className="box-title">{item.categoryName}</View>
                    <View className="box-list">
                      {item.categoryKids.map((kids, kidsIndex) => {
                        return (
                          <View
                            className="item-category"
                            onClick={this.handleCategoryClick.bind(this, item.categoryId, kids.categoryId)}
                          >
                            <Image
                              mode="aspectFit"
                              className="item-image"
                              src={kids.frontCateImg || ImgClassifyDefault}
                            />
                            <View className="item-title">{kids.categoryName}</View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            {/*超级品牌*/}
            {categoryList[currentIndex].categoryType === CATEGORY_TYPE_BRAND &&
              categoryList[currentIndex].customList.map((brandItem, brandIndex) => {
                return (
                  <View className="content-box" id={`item${brandItem.categoryId}`}>
                    <View className="box-title">{brandItem.categoryName}</View>
                    <View className="box-list">
                      {brandItem.brandList.map((brandItem, brandIndex) => {
                        return (
                          <View className="item-category" onClick={this.handleBrandClick.bind(this, brandItem)}>
                            <Image
                              mode="aspectFit"
                              className="item-image"
                              src={brandItem.brandImage || ImgClassifyDefault}
                            />
                            <View className="item-title">{brandItem.brandName}</View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            {/*热门风格*/}
            {categoryList[currentIndex].categoryType === CATEGORY_TYPE_STYLE &&
              categoryList[currentIndex].customList.map((styleItem, styleIndex) => {
                return (
                  <View
                    className="style-layout"
                    onClick={this.handleStyleClick.bind(this, styleItem)}
                    id={`item${styleItem.styleId}`}
                  >
                    <Image className="image" mode="scaleToFill" src={styleItem.styleImage || ImgClassifyDefault} />
                    <Text className="text">{styleItem.styleName}</Text>
                  </View>
                );
              })}
          </ScrollView>
        </View>
      </View>
    );
  }

  render() {
    const height = this.systemInfo.windowHeight - 50 - 106;
    const { activeClassifyId, categoryList, shopId } = this.state;

    const contentView = shopId ? this.getCategoryListView(height, categoryList) : this.getLoginView();
    return <View>{contentView}</View>;
  }
}

export default XPage.connectFields()(Categorylist);
