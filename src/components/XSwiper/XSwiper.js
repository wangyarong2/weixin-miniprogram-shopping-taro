import { Component } from '@tarojs/taro';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import './XSwiper.less';

export default class XSwiper extends Component {
  static defaultProps = {
    className: '',
    swiperList: [], // 数据列表
    key: '', // 显示图片字段的 key
    autoplay: true, // 自动播放
    onClick: null, // 点击触发事件
    height: 300, // 图片高度
  };
  constructor(props) {
    super(props);
    this.state = {
      current: 1,
    };
  }
  onChange(event) {
    const { swiperList } = this.state;
    this.setState({
      current: swiperList && swiperList.length > 0 ? event.target.current + 1 : 0,
    });
    console.log(event);
  }
  render() {
    const { swiperList, autoplay, height, key, className } = this.props;
    const { current } = this.state;
    return (
      <View className="root">
        <Swiper
          className={className}
          circular
          displayMultipleItems
          onChange={this.onChange}
          autoplay={autoplay}
          style={{ height: height + 'rpx' }}
        >
          {swiperList.map((item, index) => {
            return (
              <SwiperItem key={index}>
                {key ? (
                  <Image src={item[key]} style={{ height: '100%', width: '100%' }} />
                ) : (
                  <Image src={item} style={{ height: '100%', width: '100%' }} />
                )}
              </SwiperItem>
            );
          })}
        </Swiper>
        <View className="indicator">
          {current}/{swiperList.length}
        </View>
      </View>
    );
  }
}
