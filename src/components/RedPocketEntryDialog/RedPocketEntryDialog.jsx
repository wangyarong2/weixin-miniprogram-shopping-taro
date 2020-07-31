import { View, Image, Button } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import './RedPocketEntryDialog.less';

import redPocketIcon from '@src/assets/images/packet/red_packet.png';

import entryIconCanGet from '@src/assets/images/packet/red_packet_entry_can_get.png';
import entryIconIsNotGet from '@src/assets/images/packet/red_packet_entry_is_not_get.png';
import entryIconNotPermission from '@src/assets/images/packet/red_packet_entry_no_permission.png';

import closeIcon from '@src/assets/images/common/close_white.png';

import LoginUtil from '@utils/LoginUtil';
import XAuthorize from '@src/components/XAuthorize/XAuthorize';

import request from '@src/servers/http';
import Taro from '@tarojs/taro';

class RedPocketEntryDialog extends XPage {
  static defaultProps = {
    closeOnClick: null,
    redPocketId: null,
    shareUserId: null,
  };
  state = {
    animationData: null,
    entryImg: entryIconCanGet, //入口图片
    isValid: true,
  };

  componentDidMount() {
    this.addEntryAnimation();
    if (LoginUtil.checkLogin()) {
      this.requesRedPocketAlreadyGet();
    }
  }

  /**
   * 获取红包是否已经领取过了
   */
  requesRedPocketAlreadyGet() {
    const { redPocketId } = this.props;
    request
      .post('/community-client/redPocket/check', { redPocketId })
      .then((res) => {
        this.setState({
          isValid: res,
          entryImg: res ? entryIconCanGet : entryIconIsNotGet,
        });
      })
      .catch((err) => {
        this.setState({
          isValid: false,
          entryImg: err.resultCode == 'RP00003' ? entryIconNotPermission : entryIconIsNotGet,
        });
      });
  }

  addEntryAnimation() {
    const animation = Taro.createAnimation({});
    animation.scale(0).step({
      transformOrigin: '50% 50% 0',
      duration: 100,
    });
    animation.scale(1.2).opacity(1).step({
      transformOrigin: '50% 50% 0',
      duration: 300,
    });
    animation.scale(1).step({
      duration: 200,
    });
    this.setState({
      animationData: animation.export(),
    });
  }

  onCloseClick() {
    const { closeOnClick } = this.props;
    if (closeOnClick) {
      closeOnClick();
    }
  }

  onLoginSuccess() {
    this.requesRedPocketAlreadyGet();
    Taro.showLoading({
      title: '请稍后...',
      mask: true,
    });
    request
      .post('/community-client/mx/member/home')
      .then((res) => {
        Taro.setStorageSync('currentShopId', res.shop.shopId);
        Taro.setStorageSync('userHasLogin', true);
        Taro.hideLoading();
      })
      .catch((err) => {
        Taro.hideLoading();
      });
  }

  onStartGameClick() {
    const { isValid } = this.state;
    if (isValid) {
      //开始游戏
      this.jumpToRedPocketGame();
    }
  }

  jumpToRedPocketGame() {
    const { redPocketId, shareUserId } = this.props;
    //关闭弹窗
    this.onCloseClick();
    this.goPage({
      url: 'active/redPacketRain',
      params: {
        redPocketId,
        shareUserId,
      },
    });
  }

  render() {
    const { animationData, isValid, entryImg } = this.state;
    return (
      <View className="root">
        <View className="content" animation={animationData} style={{ opacity: 0 }}>
          <Image className="close" onClick={this.onCloseClick.bind(this)} src={closeIcon} />
          <XAuthorize loginCallback={this.onLoginSuccess.bind(this)}>
            <View className="valid">
              <Image className="bg-image" src={redPocketIcon} />
              <View className="entry-layout">
                <Image
                  className={isValid ? 'entry' : 'entry_no_animation'}
                  onClick={this.onStartGameClick.bind(this)}
                  src={entryImg}
                />
              </View>
            </View>
          </XAuthorize>
        </View>
      </View>
    );
  }
}

export default XPage.connectFields()(RedPocketEntryDialog);
