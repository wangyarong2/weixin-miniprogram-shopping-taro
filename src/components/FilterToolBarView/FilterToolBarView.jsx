import { Image, Input, Text, View, ScrollView } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './FilterToolBarView.less';
import Taro from '@tarojs/taro';
import { AtDrawer, AtIcon } from 'taro-ui';
import TextUtil from '@utils/TextUtil';
import PriceUtil from '../../utils/PriceUtil';
import ProductFilterDrawer from '../ProductFilterDrawer/ProductFilterDrawer';
import FilterGridView from './subComponents/FilterGridView';
import request from '@src/servers/http';

import categoryFilterIcon from '@src/assets/images/category/category_filter_icon.png';
import arrowUpIcon from '@src/assets/images/category/arrow_up.png';
import arrowDownIcon from '@src/assets/images/category/arrow_down.png';

import {
  FILTER_KEY_CATEGORY,
  FILTER_KEY_STYLE,
  FILTER_KEY_BRAND,
  FILTER_KEY_CLASSIFY,
  FILTER_KEY_APPLICABLE_SPACE,
} from '@src/constants/filters';

const SORT_TYPE_LIST = [
  { sortName: '按上架时间排序', orderKey: 'upper_time', sort: 'desc' },
  { sortName: '按价格从高到低排序', orderKey: 'price', sort: 'desc' },
  { sortName: '按价格从低到高排序', orderKey: 'price', sort: 'asc' },
];

/**
 * 风格  搜索页顶部工具栏
 */
export default class FilterToolBarView extends XPage {
  static defaultProps = {
    resultCallback: null, //回传用户选择的结果
    styleId: null, //风格id
    searchKey: null, //搜索关键字
    categoryId: null, //类目
    specId: null, //房间
    isShow: true,
    onDrawerShowCallback: null, //右侧抽屉展示状态回调
  };
  state = {
    isOpenCategoryDrawer: false,
    isOpenBrandDrawer: false,
    isOpenRightDrawer: false,
    currentSelectedSortType: SORT_TYPE_LIST[0], //当前选择的排序类型
    selectedCategoryInfo: {
      selectedFirstCategoryIndex: 0, //选中的一级类目 id
      selectedThirdCategoryId: '', //选中的三级类目 id
    }, //当前选中的类目
    currentSelectFilterS: null, //筛选列表  筛选选择结果  服务端要求的数据格式
    lastSelectedOriginData: null, //筛选列表  筛选选择结果  本地数据格式

    currentSelectedBrandId: -1,

    currentSelectedStyleId: -1, //选中的风格id
    currentSelectedClassifyId: -1, //选中的分类id

    shopId: '',
    categoryList: [],
    brandList: [],
    isShowClassifyView: false,
    styleList: [],
    firstFilterName: '全部商品',
    classifyList: [],
  };

  componentWillMount() {
    //为什么延迟 防止styleId还没有拿到
    setTimeout(() => {
      this.setState(
        {
          shopId: Taro.getStorageSync('currentShopId'),
        },
        () => {
          // this._requestData();
        }
      );
    }, 200);
  }

  _requestData() {
    this.requestBrandData();
    if (this.props.styleId) {
      //from 风格入口
      this.requestCategoryData();
    } else {
      this.requestStyleOrCategoryData();
    }
  }

  /**
   * 获取品牌的信息
   */
  requestBrandData() {
    request.post('/community-client/filter/brand', this.generateReqParams()).then((res) => {
      this.setState({
        brandList: [{ id: -1, name: '全部' }, ...(res || [])],
      });
    });
  }

  /**
   * 获取类目信息(树形结构)
   */
  requestCategoryData() {
    request.post('/community-client/filter/categoryTree', this.generateReqParams()).then((res) => {
      this.setState({
        categoryList: [
          {
            categoryId: -1,
            categoryName: '全部',
            childList: [
              { categoryId: -1, categoryName: '', childList: [{ categoryId: -1, categoryName: '全部商品' }] },
            ],
          },
          ...(res || []),
        ],
      });
    });
  }

  /**
   * 获取风格或者类目信息
   */
  requestStyleOrCategoryData() {
    request.post('/community-client/filter/styleOrClassify', this.generateReqParams()).then((res) => {
      // todo 这里需要根据type判断是风格还是类目
      if (res.type === 'style') {
        this.setState({
          styleList: [{ id: -1, name: '全部' }, ...(res.list || [])],
          isShowClassifyView: false,
          firstFilterName: '全部风格',
        });
      } else {
        this.setState({
          classifyList: [{ id: -1, name: '全部' }, ...(res.list || [])],
          isShowClassifyView: true,
          firstFilterName: '全部分类',
        });
      }
    });
  }

  generateReqParams() {
    const { searchKey, categoryId, styleId, specId } = this.props;
    const { selectedCategoryInfo } = this.state;
    const params = {};
    const filters = [];

    if (searchKey) {
      params.searchKey = searchKey;
    }
    if (categoryId) {
      filters.push({ filterType: FILTER_KEY_CATEGORY, filterKeyList: [categoryId] });
    }
    if (styleId) {
      filters.push({ filterType: FILTER_KEY_STYLE, filterKeyList: [styleId] });
    }
    if (specId) {
      filters.push({ filterType: FILTER_KEY_APPLICABLE_SPACE, filterKeyList: [specId] });
    }

    //添加用户选择的类目条件
    if (
      selectedCategoryInfo &&
      selectedCategoryInfo.selectedThirdCategoryId &&
      selectedCategoryInfo.selectedThirdCategoryId !== -1
    ) {
      filters.push({ filterType: FILTER_KEY_CATEGORY, filterKeyList: [selectedCategoryInfo.selectedThirdCategoryId] });
    }

    return { filters, ...params };
  }

  categoryFilterClick() {
    this.setState({
      isOpenCategoryDrawer: !this.state.isOpenCategoryDrawer,
      isOpenBrandDrawer: false,
    });
  }
  sortFilterClick() {
    this.setState({
      isOpenBrandDrawer: !this.state.isOpenBrandDrawer,
      isOpenCategoryDrawer: false,
    });
  }
  onFilterClick() {
    this.setState(
      {
        isOpenRightDrawer: !this.state.isOpenRightDrawer,
      },
      () => {
        if (this.props.onDrawerShowCallback) {
          this.props.onDrawerShowCallback(this.state.isOpenRightDrawer);
        }
      }
    );
  }
  onDrawerCloseCallback() {
    this.setState(
      {
        isOpenRightDrawer: !this.state.isOpenRightDrawer,
        isOpenBrandDrawer: false,
        isOpenCategoryDrawer: false,
      },
      () => {
        if (this.props.onDrawerShowCallback) {
          this.props.onDrawerShowCallback(this.state.isOpenRightDrawer);
        }
      }
    );
  }
  onFilterResultCallback(currentSelectFilterS, lastSelectedOriginData) {
    this.setState(
      {
        currentSelectFilterS,
        lastSelectedOriginData,
        isOpenRightDrawer: false,
        isOpenBrandDrawer: false,
        isOpenCategoryDrawer: false,
      },
      () => {
        this.setResult();
      }
    );
  }

  //回传筛选结果    触发条件有三：1、全部商品的点击确定  2、综合排序的选择  3、条件选择的确认
  setResult() {
    const {
      currentSelectFilterS,
      currentSelectedSortType,
      selectedCategoryInfo,
      currentSelectedBrandId,
      currentSelectedStyleId,
      currentSelectedClassifyId,
    } = this.state;

    const { resultCallback, styleId, categoryId } = this.props;
    let filters = [];
    const orders = [];
    //添加筛选条件
    if (null != currentSelectFilterS) {
      filters = filters.concat(currentSelectFilterS);
    }
    //添加类目条件  用户选择
    if (
      selectedCategoryInfo &&
      selectedCategoryInfo.selectedThirdCategoryId &&
      selectedCategoryInfo.selectedThirdCategoryId !== -1
    ) {
      filters.push({ filterType: FILTER_KEY_CATEGORY, filterKeyList: [selectedCategoryInfo.selectedThirdCategoryId] });
    }

    //添加类目条件 外部传入
    if (categoryId) {
      filters.push({ filterType: FILTER_KEY_CATEGORY, filterKeyList: [categoryId] });
    }
    //添加风格(为什么要主动添加，因为风格筛选时，不会有风格数据)
    if (styleId) {
      filters.push({ filterType: FILTER_KEY_STYLE, filterKeyList: [styleId] });
    }

    //添加品牌数据(-1表示选择全部)
    if (currentSelectedBrandId && currentSelectedBrandId !== -1) {
      filters.push({ filterType: FILTER_KEY_BRAND, filterKeyList: [currentSelectedBrandId] });
    }

    //添加选择的风格数据
    if (currentSelectedStyleId && currentSelectedStyleId !== -1) {
      filters.push({ filterType: FILTER_KEY_STYLE, filterKeyList: [currentSelectedStyleId] });
    }
    //添加分类数据
    if (currentSelectedClassifyId && currentSelectedClassifyId !== -1) {
      filters.push({ filterType: FILTER_KEY_CLASSIFY, filterKeyList: [currentSelectedClassifyId] });
    }

    if (resultCallback) {
      resultCallback({ filters, orders });
    }
  }

  sortTypeClick(item, e) {
    e.stopPropagation();
    this.setState(
      {
        currentSelectedSortType: item,
        isOpenBrandDrawer: false,
      },
      () => {
        this.setResult();
      }
    );
  }

  onSortListDismissClick() {
    this.setState({
      isOpenBrandDrawer: false,
    });
  }
  onCategoryListDismissClick() {
    this.setState({
      isOpenCategoryDrawer: false,
      isOpenBrandDrawer: false,
    });
  }
  onBrandClick(brandId) {
    this.setState(
      {
        currentSelectedBrandId: brandId,
        isOpenBrandDrawer: false,
      },
      () => {
        this.setResult();
      }
    );
  }
  getBrandListView() {
    const { brandList, currentSelectedBrandId } = this.state;
    return (
      <View className="select-layout">
        <View className="content">
          <View className="list">
            <FilterGridView
              dataList={brandList}
              selectedId={currentSelectedBrandId}
              itemClickCallback={this.onBrandClick.bind(this)}
            />
          </View>
        </View>
        <View className="mask" onClick={this.onCategoryListDismissClick.bind(this)} />
      </View>
    );
  }
  onClassifyClick(id) {
    this.setState(
      {
        isOpenCategoryDrawer: false,
        isOpenBrandDrawer: false,
        isOpenRightDrawer: false,
        currentSelectedClassifyId: id,
      },
      () => {
        this.setResult();
      }
    );
  }

  getClassifyView() {
    const { classifyList, currentSelectedClassifyId } = this.state;
    return (
      <View className="select-layout">
        <View className="content">
          <View className="list">
            <FilterGridView
              dataList={classifyList}
              selectedId={currentSelectedClassifyId}
              itemClickCallback={this.onClassifyClick.bind(this)}
            />
          </View>
        </View>
        <View className="mask" onClick={this.onCategoryListDismissClick.bind(this)} />
      </View>
    );
  }

  getStyleView() {
    const { styleList, currentSelectedStyleId } = this.state;
    return (
      <View className="select-layout">
        <View className="content">
          <View className="list">
            <FilterGridView
              dataList={styleList}
              selectedId={currentSelectedStyleId}
              itemClickCallback={this.onStyleClick.bind(this)}
            />
          </View>
        </View>
        <View className="mask" onClick={this.onCategoryListDismissClick.bind(this)} />
      </View>
    );
  }

  onStyleClick(id) {
    this.setState(
      {
        isOpenCategoryDrawer: false,
        isOpenBrandDrawer: false,
        isOpenRightDrawer: false,
        currentSelectedStyleId: id,
      },
      () => {
        this.setResult();
      }
    );
  }

  /**
   * 用于切换分类
   */
  resetViewStatus() {
    const { selectedCategoryInfo } = this.state;
    this.setState(
      {
        isOpenCategoryDrawer: false,
        isOpenBrandDrawer: false,
        isOpenRightDrawer: false,

        currentSelectedBrandId: -1, //清除品牌数据
        currentSelectedClassifyId: -1, //清除分类
        currentSelectedStyleId: -1, //清除风格
        currentSelectFilterS: null, //清除选中的右侧栏数据
        lastSelectedOriginData: null, //清除选中的右侧栏数据
      },
      () => {
        this._requestData();
        //3、回传重置结果
        this.setResult();
      }
    );
  }
  onCategoryClick(id) {
    const { selectedCategoryInfo } = this.state;
    selectedCategoryInfo.selectedThirdCategoryId = id;
    this.setState(
      {
        isOpenCategoryDrawer: false,
        isOpenBrandDrawer: false,
        isOpenRightDrawer: false,
        selectedCategoryInfo,
        currentSelectedBrandId: -1, //清除品牌数据
        currentSelectFilterS: null, //清除选中的右侧栏数据
        lastSelectedOriginData: null, //清除选中的右侧栏数据
      },
      () => {
        //只需要重新加载  品牌数据
        this.requestBrandData();
        //3、重新加载列表数据
        this.setResult();
      }
    );
  }

  changeFirstCategory(index) {
    const { selectedCategoryInfo, categoryList } = this.state;
    console.log(categoryList[index]);
    selectedCategoryInfo.selectedFirstCategoryIndex = index;

    this.setState({
      selectedCategoryInfo,
    });
  }

  getCategoryListView() {
    const { selectedCategoryInfo, categoryList } = this.state;
    return (
      <View className="select-layout">
        <View className="content">
          <View className="list">
            <ScrollView scrollY scrollWithAnimation className="left" style={{ borderBottomLeftRadius: '20rpx' }}>
              {categoryList.map((item, index) => {
                return (
                  <View
                    className={`item ${selectedCategoryInfo.selectedFirstCategoryIndex === index ? 'selected' : ''}`}
                    onClick={this.changeFirstCategory.bind(this, index)}
                  >
                    {item.categoryName}
                  </View>
                );
              })}
            </ScrollView>

            <ScrollView
              scrollY
              scrollWithAnimation
              className="right"
              style={{ borderBottomRightRadius: '20rpx', borderBottomLeftRadius: 0 }}
            >
              {categoryList[selectedCategoryInfo.selectedFirstCategoryIndex].childList.map((item, index) => {
                return (
                  <View id={`item${item.categoryId}`}>
                    {/*二级类目*/}
                    {item.categoryName && <View className="name">{item.categoryName}</View>}
                    <View className="grid-layout">
                      {item.childList.map((item, index) => {
                        return (
                          <View
                            className={`grid-item ${
                              selectedCategoryInfo.selectedThirdCategoryId === item.categoryId ? ' selected' : ''
                            }`}
                            onClick={this.onCategoryClick.bind(this, item.categoryId)}
                          >
                            {item.categoryName}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
        <View className="mask" onClick={this.onCategoryListDismissClick.bind(this)} />
      </View>
    );
  }

  /**
   * 是否是风格详情页
   */
  isStylePage() {
    return this.props.styleId != null;
  }

  isShowStyleView() {
    const { isOpenCategoryDrawer, isShowClassifyView } = this.state;
    return isOpenCategoryDrawer && !this.isStylePage() && !isShowClassifyView;
  }

  isShowClassifyView() {
    const { isOpenCategoryDrawer, isShowClassifyView } = this.state;
    return isOpenCategoryDrawer && !this.isStylePage() && isShowClassifyView;
  }

  isShowCategoryView() {
    const { isOpenCategoryDrawer } = this.state;
    return isOpenCategoryDrawer && this.isStylePage();
  }
  filterDrawerRef = (node) => {
    this.filterDrawerView = node;
  };

  isNeedLoadAttribute() {
    const { searchKey, categoryId, styleId, specId } = this.props;
    const { selectedCategoryInfo } = this.state;
    if (categoryId) return true;
    if (
      selectedCategoryInfo &&
      selectedCategoryInfo.selectedThirdCategoryId &&
      selectedCategoryInfo.selectedThirdCategoryId !== -1
    ) {
      return true;
    }
    return false;
  }

  render() {
    const {
      isOpenCategoryDrawer,
      isOpenBrandDrawer,
      isOpenRightDrawer,
      currentSelectedSortType,
      categoryList,
      lastSelectedOriginData,
      isShowClassifyView,
      firstFilterName,
    } = this.state;
    const { isShow } = this.props;

    return (
      <View className="root" style={{ display: isShow ? 'flex' : 'none' }}>
        <View className="tool-layout">
          <View
            className={`item ${isOpenCategoryDrawer ? 'selected' : ''}`}
            onClick={this.categoryFilterClick.bind(this)}
          >
            <Text className="text">{firstFilterName}</Text>
            <Image className="arrow-icon" src={isOpenCategoryDrawer ? arrowUpIcon : arrowDownIcon} />
          </View>

          <View className={`item ${isOpenBrandDrawer ? 'selected' : ''}`} onClick={this.sortFilterClick.bind(this)}>
            <Text className="text">全部品牌</Text>
            <Image className="arrow-icon" src={isOpenBrandDrawer ? arrowUpIcon : arrowDownIcon} />
          </View>
          <View className="item" onClick={this.onFilterClick.bind(this)}>
            <Text className="text">筛选</Text>
            <Image className="filter" src={categoryFilterIcon} />
          </View>

          {/*从风格点击到详情时，需要展示类目*/}
          {this.isShowCategoryView() && this.getCategoryListView()}
          {/*以网格的形式展示分类*/}
          {this.isShowClassifyView() && this.getClassifyView()}
          {/*以网格的形式展示风格*/}
          {this.isShowStyleView() && this.getStyleView()}

          {isOpenBrandDrawer && this.getBrandListView()}

          {isOpenRightDrawer && (
            <ProductFilterDrawer
              ref={this.filterDrawerRef}
              isShow={isOpenRightDrawer}
              isNeedLoadAttribute={this.isNeedLoadAttribute()}
              generateReqParamsFunc={this.generateReqParams.bind(this)}
              lastSelectedOriginData={lastSelectedOriginData}
              onDrawerCloseCallback={this.onDrawerCloseCallback.bind(this)}
              onFilterResultCallback={this.onFilterResultCallback.bind(this)}
            />
          )}
        </View>
      </View>
    );
  }
}
