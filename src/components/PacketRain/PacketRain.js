import { Block, View, Canvas } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';
import Taro from '@tarojs/taro';
import './PacketRain.scss';
const innerAudioContext = Taro.createInnerAudioContext();

const APP = Taro.getApp();
import redEnvelopeImg from '@src/assets/images/packet/red-packet-rain.png';
import openEnvelopeImg from '@src/assets/images/packet/red-packet-rain-open.png';

import request from '@src/servers/http';

const minWidth = 30; // 红包图片最小宽度
const maxWidth = 40; // 红包图片最大宽度
const showScoreShowTime = 300; //点击红包展示分数，该分类在屏幕上展示的时间
export default class PacketRain extends XPage {
  static defaultProps = {
    // 是否开始展示游戏
    visible: false,
    // 游戏时间
    packetRainDurationTime: 10,
    // 倒计时单位秒
    readyTimeCount: 4,
    //  速度
    createSpeed: 5,
    // 单个最小金额
    min: 1,
    // 单个最大金额
    max: 5,
    //红包数量
    packetCount: 12,
    resultCallback: null, //回调传参
    amount: 0,

    redPocketId: '',
    shareUserId: '',
  };

  state = {
    showTimeRemaining: 10, // 红包雨时间
    showStatus: 1, // 红包雨状态：1:准备倒计时，2:正在红包雨，3:红包雨结束
    windowWidth: 375,
    windowHeight: 555,
    rainResult: {},
    loading: false,
    showScore: 0,
    showChangeScore: 0,
    scoreStyle: '',

    readyTimer: null,
    rainTimer: null,
    packetList: [], //红包列表
    scoreList: [], //点中的红包分数列表：{score:1,x:11,y:111,clickTimeStamp:2323232}
    animation: null,
    progressAni: 0,
  };
  componentDidMount() {
    this.ready();
  }
  componentWillUnmount() {
    const { readyTimer, rainTimer, animation } = this.state;
    readyTimer && clearInterval(readyTimer);
    rainTimer && clearInterval(rainTimer);
    animation && this.cancelCustomAnimationFrame(animation);
  }

  ready() {
    const { readyTimer, rainTimer, animation } = this.state;
    // 重置
    clearTimeout(readyTimer);
    clearTimeout(rainTimer);
    this.cancelCustomAnimationFrame(animation);
    // 开始准备倒计时
    this.countdown();
    const systemInfo = Taro.getSystemInfoSync();

    this.setState({
      packetList: [],
      windowWidth: systemInfo.windowWidth,
      windowHeight: systemInfo.windowHeight,
    });
  }
  // 开始准备倒计时
  countdown() {
    let { readyTimeCount } = this.props;

    if (--readyTimeCount <= 0) {
      //停止回调
      clearInterval(readyTimer);
      // 显示红包雨
      this.showRain();
    }
    this.setState({
      readyTime: readyTimeCount,
    });

    let readyTimer = setInterval(() => {
      if (--readyTimeCount <= 0) {
        //停止回调
        clearInterval(readyTimer);
        // 显示红包雨
        this.showRain();
      }
      this.setState({
        readyTime: readyTimeCount,
      });
    }, 1000);

    this.setState({
      readyTimer,
    });
  }
  // 展示红包雨界面
  showRain() {
    const { animation } = this.state;
    // 显示红包雨
    this.setState(
      {
        showStatus: 2,
      },
      () => {
        // 初始化红包雨
        this.initRain();
        // 倒计时进度条
        this.initProgress();
        // 红包雨倒计时
        this.startPacketRain();
      }
    );
  }

  startPacketRain() {
    let showTimeRemaining = this.props.packetRainDurationTime;
    let rainTimer = setInterval(() => {
      if (--showTimeRemaining <= 0) {
        clearInterval(rainTimer);
        if (this.state.animation) {
          // 结束
          this.showRainResult();
          this.cancelCustomAnimationFrame(this.state.animation);
        }
      }
      this.setState({
        showTimeRemaining,
      });
    }, 1000);
    this.setState({
      rainTimer,
    });
  }

  // 倒计时进度条
  initProgress() {
    const { packetRainDurationTime } = this.props;
    const animation = Taro.createAnimation({
      duration: packetRainDurationTime * 1000,
    });
    animation.translateX(-130).step();
    this.setState({
      progressAni: animation.export(),
    });
  }
  //分数动画
  animationOfScore(x, y, score) {
    const { scoreList } = this.state;
    //{score:1,x:11,y:111,clickTimeStamp:2323232}
    scoreList.push({
      score,
      x,
      y,
      clickTimeStamp: new Date().getTime(),
    });
    this.setState({
      scoreList,
    });
  }
  // 关闭
  handleClose() {
    const { showScore } = this.state;
    const { resultCallback } = this.props;
    if (resultCallback) {
      resultCallback(showScore);
    }
  }
  // 显示结果
  showRainResult() {
    const { animation } = this.state;
    // 结束动画
    this.cancelCustomAnimationFrame(animation);
    this.setState(
      {
        showStatus: 3,
        rainResult: {
          amount: 100,
        },
      },
      () => {
        this.requestRedPocket(this.state.showScore);
      }
    );
  }

  /**
   * 触发红包刷新定时，一秒60
   */
  customRequestAnimationFrame() {
    let timer = setTimeout(() => {
      this.doDrawRain(), clearTimeout(timer);
    }, 1000 / 60);
    return timer;
  }
  // 清除红包下落函数
  cancelCustomAnimationFrame(animation) {
    if (animation) {
      clearTimeout(animation);
      this.setState({
        animation: null,
      });
    }
  }

  /**
   * 控制红包下落
   */
  doDrawRain() {
    const { windowWidth, windowHeight, packetList, animation } = this.state;
    this.rainCanvas.clearRect(0, 0, windowWidth, windowHeight);
    //绘制红包列表
    packetList.forEach((packetInfo) => {
      const { x, y, vx, vy, width, height, open } = packetInfo;
      const img = open ? openEnvelopeImg : redEnvelopeImg;
      const imgWidth = open ? width + 20 : width;
      const imgHeight = open ? height + 25 : height;
      this.rainCanvas.drawImage(img, x, y, imgWidth, imgHeight);
      packetInfo.x += vx;
      packetInfo.y += vy;
      //当y超出屏幕高度时，重置红包状态（所以屏幕上红包数量是固定的）
      packetInfo.y >= windowHeight && ((packetInfo.y = 0), (packetInfo.open = false));
      //当x超出屏幕宽度时，重置红包状态。
      packetInfo.x + width <= 0 && ((packetInfo.x = windowWidth - width), (packetInfo.open = false));
    });
    //绘制分数
    this.drawScoreList();

    this.rainCanvas.draw();
    // 下落函数
    this.setState({
      animation: this.customRequestAnimationFrame(),
    });
  }

  drawScoreList() {
    const { scoreList } = this.state;
    const currentTimeStamp = new Date().getTime();
    const validScoreList = scoreList.filter((item) => {
      //点击时间+最长生命周期<当前时间=当前分数是否展示
      return item.clickTimeStamp + showScoreShowTime > currentTimeStamp;
    });
    validScoreList.forEach((scoreInfo) => {
      this.rainCanvas.fillStyle = 'white';
      this.rainCanvas.font = '32px sans-serif';
      this.rainCanvas.fillText('+' + scoreInfo.score, scoreInfo.x, scoreInfo.y);
    });
  }

  // 随机数
  randNum(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }
  // 准备红包雨下落
  initRainDrops() {
    const { max, min, createSpeed, packetCount } = this.props;
    const { windowWidth, windowHeight, packetList } = this.state;
    for (let n = 0; n < packetCount; n += 1) {
      const startX = Math.floor(Math.random() * windowWidth);
      const startY = Math.floor(Math.random() * -windowHeight);
      // 红包图片宽度大小30~40
      const width = this.randNum(minWidth, maxWidth);
      // 宽度为红包高度的百分之八十
      const height = Math.floor(width / 0.8);
      // 速度
      const vy = 1 * Math.random() + createSpeed;
      // 红包金额
      const score = this.randNum(min, max);
      packetList.push({
        x: startX,
        y: startY,
        vx: -1, // x轴速度
        vy, // y轴速度
        score,
        width,
        height,
        open: false,
      });
    }
    this.setState({
      redEnvelopes: packetList,
    });
    this.doDrawRain();
  }
  // 点击红包事件
  onRainClick(e) {
    const { packetList, showScore } = this.state;
    let touch = e.touches[0];
    let touchX = touch.x;
    let touchY = touch.y;
    for (let index = 0; index < packetList.length; index += 1) {
      let packetInfo = packetList[index],
        rainX = packetInfo.x,
        rainY = packetInfo.y,
        width = packetInfo.width,
        height = packetInfo.height,
        gapX = touchX - rainX,
        gapY = touchY - rainY;
      //根据事件的xy值判断点中的item
      if (gapX >= -20 && gapX <= width + 20 && gapY >= -20 && gapY <= height + 20) {
        //展示分数动画
        this.animationOfScore(touchX, touchY, packetInfo.score);
        innerAudioContext.play();
        packetInfo.open = true;
        this.setState({
          showScore: showScore + packetInfo.score,
          showChangeScore: packetInfo.score,
        });
        break;
      }
    }
  }
  // 初始化 canvas
  initRain() {
    this.rainCanvas = Taro.createCanvasContext('rain-canvas', this);
    // 初始化红包雨
    this.initRainDrops();
    // 音效
    this.audioOfClick();
  }

  handleScrollTouch() {}

  audioOfClick() {
    innerAudioContext.autoplay = false;
    innerAudioContext.src = 'https://imgs.solui.cn/weapp/dianji.mp3';
    innerAudioContext.onPlay(() => {});
    innerAudioContext.onError((res) => {});
  }

  requestRedPocket(showScore) {
    this.showLoading({ title: '红包加载中...' });
    const { redPocketId, shareUserId } = this.props;
    request
      .post('/community-client/redPocket/get', { redPocketId, shareUserId, score: showScore })
      .then((res) => {
        this.setState({
          amount: res.amount / 100,
          showStatus: 4,
        });
        this.hideLoading();
      })
      .catch((err) => {
        this.hideLoading();
        //领取失败，关闭页面
        this.goBack();
      });
  }
  render() {
    const { visible, readyTimeCount } = this.props;
    const {
      readyTime,
      showScore,
      showStatus,
      showChangeScore,
      progressAni,
      scoreAni,
      showTimeRemaining,
      amount,
    } = this.state;
    return (
      visible && (
        <View className="red-envelope-popup">
          <View className="flex-center">
            <View onTouchmove={this.handleScrollTouch} className="close-bg" />
            <Block>
              {showStatus === 1 && (
                <Block>
                  <View className="reminder-wrapper flex-column-center">
                    <View className="title">一大波红包即将来袭</View>
                    <View className="time">{readyTime || readyTimeCount}</View>
                  </View>
                </Block>
              )}
              {showStatus === 2 && (
                <Block>
                  <View className="rain-wrapper flex-column">
                    <View className="time-info">
                      <View className="flex-row">
                        <View className="tip">剩余时间</View>
                        <View className="progress-wrapper">
                          <View className="progress" animation={progressAni} />
                        </View>
                        <View className="time">{showTimeRemaining + ' s'}</View>
                      </View>
                      <View className="flex-row">
                        <View className="total-score">{'金币：' + showScore}</View>
                      </View>
                    </View>
                    <View className="canvas-wrapper">
                      <View className="score-change" animation={scoreAni}>
                        {'+' + showChangeScore}
                      </View>
                      <Canvas
                        disableScroll
                        onTouchStart={this.onRainClick}
                        canvasId="rain-canvas"
                        style="width: 100vw; height: 100vh;z-index: 9999999"
                      />
                    </View>
                  </View>
                </Block>
              )}

              {showStatus === 3 && (
                <Block>
                  <View className="rain-wrapper flex-column"></View>
                </Block>
              )}

              {showStatus === 4 && (
                <Block>
                  <View className="result-wrapper flex-column-center">
                    <Block>
                      <View className="group-content flex-column-center">
                        <View className="result-title">恭喜您获得</View>
                        <View className="ready-wrapper flex-column-center">
                          <View className="money-wrapper flex-row">
                            <View className="money">{amount}</View>
                            <View className="unit">元</View>
                          </View>
                          <View className="result-btn" onClick={this.handleClose}>
                            我知道了
                          </View>
                          <Text class="desc">已存入微信零钱，可直接消费！</Text>
                        </View>
                      </View>
                    </Block>
                  </View>
                </Block>
              )}
            </Block>
          </View>
        </View>
      )
    );
  }
}
