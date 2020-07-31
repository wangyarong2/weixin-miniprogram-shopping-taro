import { View, Image, Button } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './NewShopMessageDialog.less';
import PropTypes from 'prop-types';
class NewShopMessageDialog extends XPage {
  config = {
    navigationBarTitleText: '',
  };

  static defaultProps = {
    messageInfo: PropTypes.object,
    closeOnClick: PropTypes.func,
  };

  goToMsgDetail() {
    this.goPage({ url: 'message/shopMessgeDetail', params: { msgId: this.props.messageInfo.id } });
    this.props.closeOnClick();
  }

  render() {
    const { messageInfo } = this.props;
    return (
      <View className="root">
        <View className="content">
          <View className="title">你有新门店消息</View>

          <View className="msg-container">
            <View className="msg-title">{messageInfo.shopName || ''}</View>
            <View className="msg-content">{messageInfo.content || ''}</View>
            <Image className="img" mode="aspectFill" src={messageInfo.image}></Image>
          </View>

          <View className="bottom-container">
            <View className="close" onClick={this.props.closeOnClick}>
              关闭
            </View>
            <View className="jump" onClick={this.goToMsgDetail}>
              去查看
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default XPage.connectFields()(NewShopMessageDialog);
