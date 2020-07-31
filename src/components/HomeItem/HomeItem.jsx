import { View } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './HomeItem.less';

import XAuthorize from '@src/components/XAuthorize/XAuthorize';

import MSwiper from '@src/components/CMS/MSwiper/MSwiper';
import MGrid from '@src/components/CMS/MGrid/MGrid';
import MChunk from '@src/components/CMS/MChunk/MChunk';
import MCommodity from '@src/components/CMS/MCommodity/MCommodity';
import HotspotChunk from '@src/components/CMS/HotspotChunk/HotspotChunk';
import Title from '@src/components/CMS/Title/Title';


import MMeibao from '@src/components/CMS/MMeibao/MMeibao';
import MRecommend from '@src/components/CMS/MRecommend/MRecommend';
import MGroupbuying from '@src/components/CMS/MGroupbuying/MGroupbuying';
import MSpecialSale from '@src/components/CMS/MSpecialSale/MSpecialSale';
import Taro from '@tarojs/taro';

/**

 * Author: jianglong
 * -----------------------------
 * 首页item
 */

class HomeItem extends XPage {
  static defaultProps = {
    cmsDataList: [],
    onLoginCallBack: null,
  };
  config = {
    navigationBarTitleText: '',
  };

  state = {};
  onLoginCallBack() {
    const { onLoginCallBack } = this.props;
    if (onLoginCallBack) {
      onLoginCallBack();
    }
  }

  onSwiperClick(data) {
    switch (data.radio) {
      case 1:
        if (data.activeId) {
          this.goActivePage(data.activeId);
        }
        break;
      case 2:
        if (data.goodsInfo) {
          this.goProductDetail(data.goodsInfo);
        }
        break;
      case 11:
        //类目商品列表
        this.onCategoryClick(data);
        break;
      case 12:
        //品牌商品列表
        if (data.brandInfo) {
          this.onBrandClick(data.brandInfo);
        }
        break;
    }
  }
  onImageClick(data) {
    switch (data.radio) {
      case 1:
        if (data.activeId) {
          this.goActivePage(data.activeId);
        }
        break;
      case 2:
        if (data.categoryIds) {
          this.goCategoryListById(data);
        }
        break;
      case 11:
        //类目商品列表
        this.onCategoryClick(data);
        break;
      case 12:
        //品牌商品列表
        if (data.brandInfo) {
          this.onBrandClick(data.brandInfo);
        }
        break;
    }
  }

  onItemClick(linkData) {
    console.log(linkData)
    switch (linkData.radio) {
      case 1:
        //活动页
        if (linkData.activeId) {
          this.goActivePage(linkData.activeId);
        }
        break;
      case 2:
        //详情详情
        if (linkData.goodsInfo) {
          this.goProductDetail(linkData.goodsInfo);
        }
        break;
      case 11:
        //类目商品列表
        this.onCategoryClick(linkData);
        break;
      case 12:
        //品牌商品列表
        if (linkData.brandInfo) {
          this.onBrandClick(linkData.brandInfo);
        }
        break;
    }
  }

  goActivePage(pageId) {
    this.goPage({
      url: 'home/activePage',
      params: { pageId },
    });
  }

  onCategoryClick(data) {
    this.goPage({
      url: 'product/category/goodsCategoryDetail',
      params: {
        parentCategoryId: data.parentCategoryId,
        categoryId: data.categoryId,
      },
    });
  }

  onBrandClick(brandInfo) {
    this.goPage({
      url: 'product/category/brandCategoryDetail',
      params: {
        categoryId: brandInfo.brandId,
        categoryName: brandInfo.brandName,
      },
    });
  }

  goProductDetail(data) {
    this.goPage({
      url: 'goodsDetail',
      params: {
        shopId: Taro.getStorageSync('currentShopId'),
        spuId: data.spuId,
      },
    });
  }

  onGridClick(data) {
    switch (data.radio) {
      case 1:
        if (data.categoryIds) {
          this.goCategoryListById(data);
        }
        break;
      case 2:
        this.goCategoryList();
        break;
      case 3:
        if (data.activeId) {
          this.goActivePage(data.activeId);
        }
        break;
      case 5:
        break;
      case 11:
        //类目商品列表
        this.onCategoryClick(data);
        break;
      case 12:
        //品牌商品列表
        if (data.brandInfo) {
          this.onBrandClick(data.brandInfo);
        }
        break;
    }
  }
  goCategoryList() {
    Taro.switchTab({
      url: '/pages/category/categorylist',
    });
  }
  goCategoryListById(data) {
    setGlobalData('currentCategoryData', data.siblingsCategoryKids);
    this.goPage({
      url: 'product/brandCategoryDetail',
      params: {
        kidsIndex: data.categoryIndex - 1,
      },
    });
  }

  render() {
    const { cmsDataList } = this.props;
    return (
      <View>
        {cmsDataList.map((item) => {
          if (item.type === 'carousel') {
            return (
              <XAuthorize logined={this.state.isLogin} isFullWith loginCallback={this.onLoginCallBack.bind(this)}>
                <MSwiper key={item.id} datas={item} handleClick={this.onSwiperClick.bind(this)} />
              </XAuthorize>
            );
          } else if (item.type === 'grid') {
            return (
              <XAuthorize logined={this.state.isLogin} isFullWith loginCallback={this.onLoginCallBack.bind(this)}>
                <MGrid key={item.id} datas={item} handleClick={this.onGridClick.bind(this)} />
              </XAuthorize>
            );
          } else if (item.type === 'banner' || item.type === 'chunk') {
            // 猜你喜欢 图片
            return (
              <XAuthorize logined={this.state.isLogin} isFullWith loginCallback={this.onLoginCallBack.bind(this)}>
                <MChunk key={item.id} datas={item} handleClick={this.onImageClick.bind(this)} />
              </XAuthorize>
            );
          } else if (item.type === 'hotspot') {
            // 热区图
            return (
              <XAuthorize logined={this.state.isLogin} isFullWith loginCallback={this.onLoginCallBack.bind(this)}>
                <HotspotChunk key={item.id} datas={item} handleClick={this.onItemClick.bind(this)} />
              </XAuthorize>
            );
          } else if (item.type === 'commodity') {
            // 爆款推荐(列表可有三种样式：1、  2:两列展示   3：一行展示 )
            return (
              <XAuthorize logined={this.state.isLogin} isFullWith loginCallback={this.onLoginCallBack.bind(this)}>
                <MCommodity key={item.id} datas={item} />
              </XAuthorize>
            );
          } else if (item.type === 'meibao') {
            return (
              <XAuthorize logined={this.state.isLogin} isFullWith loginCallback={this.onLoginCallBack.bind(this)}>
                <MMeibao key={item.id} datas={item} />
              </XAuthorize>
            );
          } else if (item.type === 'recommend') {
            return <MRecommend flag={this.state.cmsDataRefresh} key={item.id} datas={item} />;
          } else if (item.type === 'groupBuying') {
            return <MGroupbuying flag={this.state.cmsDataRefresh} key={item.id} datas={item} />;
          } else if (item.type === 'specialSale') {
            return <MSpecialSale flag={this.state.cmsDataRefresh} key={item.id} datas={item} />;
          } else if (item.type === 'title') {
            return <Title key={item.id} datas={item} />;
          }
        })}
      </View>
    );
  }
}

export default XPage.connectFields()(HomeItem);
