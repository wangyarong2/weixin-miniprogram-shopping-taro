import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import request from "@src/servers/http";

import "./MChunk.less";

export default class MChunk extends Taro.Component {
  static externalClasses = ["class-wrapper"];

  static defaultProps = {
    data: [], //渲染数据
    styles: {}, //样式
    onClick: () => null, // 点击事件
  };

  handleClick = (item) => {
    this.props.handleClick && this.props.handleClick(item);
  };

  onLoginCallBack() {
    request.post("/community-client/mx/member/home", {}).then((res) => {
      Taro.setStorageSync("currentShopId", res.shop.shopId);
      Taro.setStorageSync("userHasLogin", true);
    });
  }

  render() {
    const { datas } = this.props;
    return (
      <View className="chunk">
        <View
          className={`img-warrp ${
            datas.data.imgCollection.length !== 1 ? "img-collection" : ""
          }`}
          style={`padding-top: ${datas.style.margin.top}px; padding-bottom: ${datas.style.margin.bottom}px;`}
        >
          {/*三张图时分两列展示,第二列展示两个入口*/}
          {datas.data.imgCollection.length === 3 && (
            <View className="three-pic-content">
              <Image
                key={datas.data.imgCollection[0].id}
                style={`border-top-left-radius: ${datas.style.radius.left}px;border-top-right-radius: ${datas.style.radius.top}px;border-bottom-left-radius: ${datas.style.radius.bottom}px;border-bottom-right-radius: ${datas.style.radius.right}px;`}
                className="first-image"
                mode="widthFix"
                src={datas.data.imgCollection[0].url}
                onClick={this.handleClick.bind(
                  this,
                  datas.data.imgCollection[0]
                )}
              />
              <View className="right-content">
                <Image
                  key={datas.data.imgCollection[1].id}
                  style={`border-top-left-radius: ${datas.style.radius.left}px;border-top-right-radius: ${datas.style.radius.top}px;border-bottom-left-radius: ${datas.style.radius.bottom}px;border-bottom-right-radius: ${datas.style.radius.right}px;`}
                  className="img"
                  mode="widthFix"
                  src={datas.data.imgCollection[1].url}
                  onClick={this.handleClick.bind(
                    this,
                    datas.data.imgCollection[1]
                  )}
                />
                <Image
                  key={datas.data.imgCollection[2].id}
                  style={`border-top-left-radius: ${datas.style.radius.left}px;border-top-right-radius: ${datas.style.radius.top}px;border-bottom-left-radius: ${datas.style.radius.bottom}px;border-bottom-right-radius: ${datas.style.radius.right}px;`}
                  className="img"
                  mode="widthFix"
                  src={datas.data.imgCollection[2].url}
                  onClick={this.handleClick.bind(
                    this,
                    datas.data.imgCollection[2]
                  )}
                />
              </View>
            </View>
          )}
          {/*两张图*/}
          {datas.data.imgCollection.length === 2 &&
            datas.data.imgCollection.map((item) => {
              return (
                <Image
                  key={item.id}
                  style={`border-top-left-radius: ${datas.style.radius.left}px;border-top-right-radius: ${datas.style.radius.top}px;border-bottom-left-radius: ${datas.style.radius.bottom}px;border-bottom-right-radius: ${datas.style.radius.right}px; width:339rpx`}
                  className="img"
                  mode="widthFix"
                  src={item.url}
                  onClick={this.handleClick.bind(this, item)}
                />
              );
            })}
           {/*一张图*/}
          {datas.data.imgCollection.length === 1 &&
            datas.data.imgCollection.map((item) => {
              return (
                <Image
                  key={item.id}
                  style={`border-top-left-radius: ${datas.style.radius.left}px;border-top-right-radius: ${datas.style.radius.top}px;border-bottom-left-radius: ${datas.style.radius.bottom}px;border-bottom-right-radius: ${datas.style.radius.right}px;`}
                  className="img"
                  mode="widthFix"
                  src={item.url}
                  onClick={this.handleClick.bind(this, item)}
                />
              );
            })}
        </View>
      </View>
    );
  }
}
