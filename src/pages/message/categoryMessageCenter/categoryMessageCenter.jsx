import { View } from "@tarojs/components";
import XPage from "@src/components/XPage/XPage";
import { AtIcon } from "taro-ui";
import request from "../../../servers/http";

import GuidePage from "../../../components/GuidePage/GuidePage";
import TextUtil from "../../../utils/TextUtil";

import "./categoryMessageCenter.less";

class categoryMessageCenter extends XPage {
  config = {
    navigationBarTitleText: "",
  };

  state = {
    list: [],
  };

  static defaultProps = {
    msgCategoryName: "",
    msgType: "", //B-订单 C-物流 D-服务 E-客服
  };

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: this.$router.params.msgCategoryName,
    });

    this.getMessageList();
  }

  onMessageClick(messageItem) {
    this.goPage({
      url: "message/shopMessgeDetail",
      params: { msgId: messageItem.id },
    });
  }

  onPullDownRefresh() {
    this.setState(
      {
        list: [],
      },
      () => {
        this.getMessageList();
      }
    );
  }

  getMessageList() {
    Taro.showLoading({
      title: "请稍后...",
      mask: true,
    });
    request
      .post("/community-client/community/messageType/list", {
        msgType: this.$router.params.msgType,
      })
      .then((res) => {
        Taro.hideLoading();
        Taro.stopPullDownRefresh();
        this.setState({
          list: res.list ? res.list : [],
        });
      });
  }

  render() {
    const { list } = this.state;
    return (
      <View className="message-center-page">
        {list.length === 0 && <GuidePage type={4} />}
        {list.map((item, index) => {
          return (
            <View
              className="item-layout"
              onClick={this.onMessageClick.bind(this, item)}
            >
              <View className="left-container">
                <Image className="image" src={item.logoImage} />
                <View
                  className="msg-count"
                  style={{ display: item.count ? "block" : "none" }}
                >
                  {item.count || ""}
                </View>
              </View>

              <View className="center-container">
                <View className="name">{item.fromUserName || ""}</View>
                <View className="time">
                  {TextUtil.formatDateWithYMDHMS(item.createTime)}
                </View>
              </View>
              <AtIcon
                prefixClass="icon"
                value="youjiantou"
                color="#999999"
                size="10"
              />
            </View>
          );
        })}
      </View>
    );
  }
}

export default XPage.connectFields()(categoryMessageCenter);
