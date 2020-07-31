import XPage from '@src/components/XPage/XPage';
import { Block, View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro/types';
import PacketRain from '@src/components/PacketRain/PacketRain';
import './redPacketRain.scss';
/**

 * Author: jianglong
 * -----------------------------
 * 必要参数：redPocketId,shareUserId
 */

class redPacketRain extends XPage {
  static defaultProps = {};
  config = {
    navigationBarTitleText: '好橙家红包雨',
  };

  state = {
    visible: true,
    createSpeed: 5, // 速度
    packetRainDurationTime: 10, // 游戏时间
    readyTime: 3, // 准备时间
    min: 1, // 金币最小是0
    max: 5, // 金币最大是5
  };
  componentDidMount() {}

  success() {
    this.setState({
      visible: false, //  隐藏界面
    });
  }
  onResultCallback(score) {
    console.log('score====', score);
    //跳转到首页
    this.goPage({
      url: 'home',
      type: 'switchTab',
    });
  }

  render() {
    const { visible, createSpeed, packetRainDurationTime, readyTime, min, max } = this.state;
    const { redPocketId, shareUserId } = this.$router.params;
    return (
      <Block>
        <View className="container"></View>
        <PacketRain
          visible={true}
          createSpeed={createSpeed}
          packetRainDurationTime={packetRainDurationTime}
          readyTime={readyTime}
          min={min}
          amount={this.$router.params.amount}
          max={max}
          onFinish={this.success}
          resultCallback={this.onResultCallback.bind(this)}
          redPocketId={redPocketId}
          shareUserId={shareUserId}
        />
      </Block>
    );
  }
}

export default XPage.connectFields()(redPacketRain);
