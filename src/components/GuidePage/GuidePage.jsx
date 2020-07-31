import { View } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './GuidePage.less';

import loginImage from '../../assets/images/login/guide_login.png';
import noOrder from '../../assets/images/default/bg_no_order.png';
import cartEmptyImage from '../../assets/images/default/bg_no_cart.png';
import searchResultEmptyImage from '../../assets/images/default/bg_no_product.png';
import messageEmptyImage from '../../assets/images/default/bg_no_message.png';
import addressEmpty from '../../assets/images/default/bg_no_address.png';
import folderEmpty from '../../assets/images/default/bg_folder_empty.png';

class GuidePage extends XPage {
  config = {
    navigationBarTitleText: '',
  };

  static defaultProps = {
    type: 0,
    onTrigger: null,
  };

  state = {};

  onBottomViewClick() {
    if (this.props.onTrigger) {
      this.props.onTrigger();
    }
  }

  render() {
    const guideMap = {
      0: {
        textLine1: '您还没有登陆',
        textLine2: '登录后可购买商品或查看更多',
        buttonText: '登陆',
        image: loginImage,
      },
      1: {
        textLine1: '',
        textLine2: '您还没有相关订单',
        buttonText: '',
        image: noOrder,
      },
      2: {
        textLine1: '',
        textLine2: '购物车空空如也 快去逛逛吧',
        buttonText: '',
        image: cartEmptyImage,
      },
      3: {
        textLine1: '',
        textLine2: '未找到指定商品',
        buttonText: '',
        image: searchResultEmptyImage,
      },
      4: {
        textLine1: '',
        textLine2: '您还没有消息，快去聊聊吧',
        buttonText: '',
        image: messageEmptyImage,
      },
      5: {
        textLine1: '',
        textLine2: '您还没有添加地址',
        buttonText: '添加地址',
        image: addressEmpty,
      },
      6: {
        textLine1: '',
        textLine2: '您还未收藏过商品',
        buttonText: '',
        image: searchResultEmptyImage,
      },
      7: {
        textLine1: '',
        textLine2: '清单已被设计师删除',
        buttonText: '',
        image: folderEmpty,
      },
      8: {
        textLine1: '',
        textLine2: '您还未收藏过清单',
        buttonText: '',
        image: searchResultEmptyImage,
      },
      9: {
        //展示空白页，没有任何内容。用于搜索列表
      },
    };
    const currentMap = guideMap[this.props.type];
    return (
      <View className="root">
        <Image className="image" src={currentMap.image} />
        {currentMap.textLine1 && <View className="text-line-1">{currentMap.textLine1}</View>}
        {currentMap.textLine2 && <View className="text-line-2">{currentMap.textLine2}</View>}
        {currentMap.buttonText && (
          <View className="button" onClick={this.onBottomViewClick.bind(this)}>
            {currentMap.buttonText}
          </View>
        )}
      </View>
    );
  }
}
