import { View, Image, Text } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './CollectFolderView.less';

/**

 * Author: jianglong
 * -----------------------------
 *清单列表
 */

class CollectFolderView extends XPage {
  static defaultProps = { productList: [] };
  config = {};

  onItemClick(productInfo) {
    this.goPage({
      url: 'collect/folderDetail',
      params: { folderId: productInfo.id },
    });
  }

  render() {
    const { productList } = this.props;
    return (
      <View className="listing-list">
        {productList.map((productInfo, index) => {
          return (
            <View className="item" onClick={this.onItemClick.bind(this, productInfo)}>
              <Image className="img" mode="scaleToFill" src={productInfo.imgUrl} />
              <Text className="name">{productInfo.name}分享的清单</Text>
              <Text className="count">{productInfo.productNumber}件商品</Text>
            </View>
          );
        })}
      </View>
    );
  }
}

export default XPage.connectFields()(CollectFolderView);
