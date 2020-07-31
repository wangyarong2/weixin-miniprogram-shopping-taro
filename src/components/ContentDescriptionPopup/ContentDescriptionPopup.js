import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { AtIcon, AtFloatLayout } from "taro-ui";

import "./ContentDescriptionPopup.less";
import TextUtil from "../../utils/TextUtil";

export default class ContentDescriptionPopup extends Taro.Component {
  static defaultProps = {
    title: "",
    content: "",
    isOpened: false,
    onCloseClick: null,
  };
  onCloseClick() {
    if (this.props.onCloseClick) {
      this.props.onCloseClick();
    }
  }
  onConfirmClick() {
    this.onCloseClick();
  }
  render() {
    const { title, content, isOpened } = this.props;
    return (
      <AtFloatLayout isOpened={isOpened} onClose={this.onCloseClick.bind(this)}>
        <View className="popup_container">
          <View className="popup_title">
            {title}
            <View
              className="pupup_close"
              onClick={this.onCloseClick.bind(this)}
            >
              <AtIcon
                prefixClass="icon"
                value="shurukuang-qingchu"
                size="18"
                color="#CCCCCC"
              />
            </View>
          </View>

          <Text className="popup_content">{content}</Text>
          <View className="button" onClick={this.onConfirmClick.bind(this)}>
            我知道了
          </View>
        </View>
      </AtFloatLayout>
    );
  }
}
