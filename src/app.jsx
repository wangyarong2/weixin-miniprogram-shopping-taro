import '@tarojs/async-await';
import Taro, { Component } from '@tarojs/taro';
import { Provider } from '@tarojs/redux';

import Index from './pages/home/home';

import configStore from './store';
import 'taro-ui/dist/style/index.scss';
import './styles/common.less';
import './styles/iconfont.css';

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

const store = configStore();

class App extends Component {
  config = {
    pages: [
      'pages/home/home',
      'pages/category/categorylist', //店铺分类
      'pages/home/activePage/activePage',
      // 'pages/home/commondityList/commondityList', //二级分类
      // 'pages/home/recommendList/recommendList', // 店主推荐列表
      // 'pages/home/specialSaleList/specialSaleList', // 特价限购列表

      // "pages/home/memberCenter/memberCenter", // 橙卡橙店

      'pages/goodsDetail/goodsDetail', // 商品详情
      'pages/shopcart/shopcart', //购物车
      'pages/mine/mine', //我的
      'pages/meibao/searchProduct/searchProduct', //搜索橙宝商品
      // "pages/groupBuy/groupBuyList/groupBuyList", //团购列表
      // "pages/groupBuy/groupBuyProductDetail/groupBuyProductDetail", //团购商品详情
      // 'pages/limitBuyGoodsDetail/limitBuyGoodsDetail', //限购商品详情
      'pages/webPage/webPage', //加载 webpage
    ],
    permission: {
      'scope.userLocation': {
        desc: '您的位置信息将用于获取您所在地区城运商信息',
      },
    },
    subpackages: [
      {
        root: 'pages/product/',
        pages: [
          'searchProduct/searchProduct',
          'category/brandCategoryDetail/brandCategoryDetail',
          'category/goodsCategoryDetail/goodsCategoryDetail',
          'category/styleCategoryDetail/styleCategoryDetail',
          'category/spaceCategoryDetail/spaceCategoryDetail',

        ],
      },
      // {
      //   root: 'pages/memberCenter/',
      //   pages: [
      //     'shopSearch/shopSearch', // 搜索门店
      //     'cardIntro/cardIntro', // 橙卡介绍
      //     'cardDetail/cardDetail', // 橙卡详情
      //     'equityBusiness/equityBusiness', // 商家权益详情
      //     'myCard/myCard', // 我购买的卡
      //     // 'joinVip/joinVip',//开通橙卡会员
      //     'equityDetail/equityDetail', //权益详情
      //     'chooseCity/chooseCity', // 选择城市
      //     'getMCard/getMCard', // 领取橙宝卡
      //   ],
      // },
      {
        root: 'pages/order/',
        pages: [
          'confirmOrder/confirmOrder',
          'orderList/orderList',
          'searchOrder/searchOrder',
          'orderDetail/orderDetail',
          'searchResult/searchResult',
          'expressDetail/expressDetail',
          'applyRefound/applyRefound',
          'addressList/addressList',
          'addAddress/addAddress',
          'payResult/payResult',
        ],
      },
      {
        root: 'pages/coupon/',
        pages: [
          'recharge/recharge',
          'rule/rule',
          'couponBalance/couponBalance',
          'couponDetail/couponDetail',
          'meibaoDetail/meibaoDetail',
          'askCoupon/askCoupon',
          'askResult/askResult',
          'askDetail/askDetail',
          'chooseShop/chooseShop',
          'contactDetail/contactDetail',
          'balanceDetail/balanceDetail',
          'accountDetail/accountDetail',
          'settlement/settlement',
          'bindcard/bindcard',
          'withdrawal/withdrawal',
          'withdrawalResult/withdrawalResult',
        ],
      },
      {
        root: 'pages/couponModule/',
        pages: [
          'couponDetail/couponDetail', // 门店优惠券详情
          'getShopCoupon/getShopCoupon', // app分享优惠券进来领取
          'myCoupon/myCoupon', // 我的优惠券
          'couponCenter/couponCenter', // 领券中心
        ],
      },
      {
        root: 'pages/shop/',
        pages: [
          'shopListChooseCity/shopListChooseCity', //店铺城市选择
          'searchCity/searchCity', //店铺中城市选择
          'shopCategory/shopCategory', //店铺分类
          'searchShop/searchShop', //店铺搜索
          'shopDetail/shopDetail', // 橙店详情
          'shopList/shopList', //店铺列表
        ],
      },
      {
        root: 'pages/message/',
        pages: [
          'messageCenter/messageCenter', //消息中心
          'categoryMessageCenter/categoryMessageCenter', //门店消息中心
          'shopMessgeDetail/shopMessgeDetail', //门店消息详情
        ],
      },
      {
        root: 'pages/collect/',
        pages: [
          'collectList/collectList', //收藏商品
          'folderDetail/folderDetail', //推荐清单
        ],
      },

      {
        root: 'pages/active/',
        pages: [
          'redPacketRain/redPacketRain', //红包雨
        ],
      },
    ],
    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '',
      navigationBarTextStyle: 'black',
    },
    navigateToMiniProgramAppIdList: ['wx75c1e3c71c1796b4'],
    tabBar: {
      color: '#333333',
      selectedColor: '#ff6400',
      borderStyle: 'white',
      list: [
        {
          pagePath: 'pages/home/home',
          text: '首页',
          iconPath: 'assets/images/tab/tab_home_u.png',
          selectedIconPath: 'assets/images/tab/tab_home_s.png',
        },
        {
          pagePath: 'pages/category/categorylist',
          text: '分类',
          iconPath: 'assets/images/tab/tab_category_u.png',
          selectedIconPath: 'assets/images/tab/tab_category_s.png',
        },
        {
          pagePath: 'pages/shopcart/shopcart',
          text: '购物车',
          iconPath: 'assets/images/tab/tab_shopcart_u.png',
          selectedIconPath: 'assets/images/tab/tab_shopcart_s.png',
        },
        {
          pagePath: 'pages/mine/mine',
          text: '我的',
          iconPath: 'assets/images/tab/tab_mine_u.png',
          selectedIconPath: 'assets/images/tab/tab_mine_s.png',
        },
      ],
    },
    networkTimeout: {
      request: 15000, //超时15秒
    },
  };

  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
