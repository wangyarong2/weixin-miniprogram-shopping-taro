import { View, Image, Textarea } from '@tarojs/components'
import XPage from '@src/components/XPage/XPage'
import './shopMessgeDetail.less'
import TextUtil from '../../../utils/TextUtil'
import request from '../../../servers/http'



class shopMessgeDetail extends XPage {
  config = {
    navigationBarTitleText: '消息详情'
  }

  state = {
    messageInfo: {},
    addLeaveMessageContent: "",//留言内容
    historyLeaveMessageList: [],
  }

  componentDidMount() {
    this.getMessageDetail();
  }

  getMessageDetail() {
    this.showLoading();
    const { msgId } = this.$router.params;
    request.post('/community-client/community/memberMsg', { id: msgId }).then((res) => {
      this.hideLoading();
      this.setState({
        messageInfo: res || {},
        historyLeaveMessageList: res.memberMsgDetailDtoList || [],
      })
    }).catch(e => {
      this.hideLoading();
    })
  }


  onInput(value) {
    this.setState({
      addLeaveMessageContent: value.detail.value,
    })
  }

  isShortName(shopName) {
    if (TextUtil.isEmpty(shopName)) {
      return true;
    } else {
      return shopName.length <= 6;
    }
  }
  commitMessage() {
    const { addLeaveMessageContent } = this.state;
    if (TextUtil.isEmpty(addLeaveMessageContent)) {
      this.showToast({ title: "请输入留言内容" })
      return
    }
    this._commitMessage(addLeaveMessageContent);
  }

  _commitMessage(messageContent) {
    this.showLoading();
    const params = {
      memberMsgId: this.state.messageInfo.id,
      fromUserId: Taro.getStorageSync('member_info').userId,
      receiveUserId: this.state.messageInfo.fromUserId,
      content: messageContent,
    }
    request.post('/community-client/community/memberMsgDetail/save', params).then((res) => {
      this.hideLoading();
      this.showToast({ title: "添加留言成功！" })
      this.getMessageDetail();
      this.setState({
        addLeaveMessageContent: "",
      })
    }).catch(e => {
      this.hideLoading();
    })
  }
  convertMsgReceiveIdToName(leaveMsgInfo) {
    if (leaveMsgInfo.receiveUserId == Taro.getStorageSync('member_info').userId) {
      //接收者是自己，说明是门店发来的消息，取门店名
      return this.state.messageInfo.shopName;
    } else {
      //接收者不是自己，说明是自己发的消息
      return "我";
    }

  }

  render() {
    const leaveMessageCount = 200;//留言字数限制 
    const { messageInfo, addLeaveMessageContent, historyLeaveMessageList } = this.state;
    return (
      <View className="root">
        <View className="shop-info-container">
          <View className="shop-icon">
            <Image className="image" mode="aspectFill"  src={messageInfo.logoImage}></Image>
          </View>
          <View className="shop-info">
            <View className="name">{messageInfo.shopName || ""}</View>
            <View className="time">{TextUtil.formatDateWithYMDHMS(messageInfo.createTime)}</View>
          </View>
        </View>

        <View className="message-content">
          <View className="line"></View>
          <View className="title">消息内容</View>
          <View className="content">{messageInfo.content || ""}</View>
          <Image className="content-image" mode="aspectFill" src={messageInfo.image || ""}></Image>
        </View>

        <View className="add-leave-title">
          <View className="title">写留言</View>
          <View className="count">{addLeaveMessageContent.length}</View>
          <View className="total">/{leaveMessageCount}</View>

        </View>

        <Textarea
          maxlength={leaveMessageCount}
          autoHeight
          className="search-input"
          onInput={this.onInput.bind(this)}
          value={addLeaveMessageContent}
          placeholder="请输入消息内容（200字以内）"
          placeholderClass="placeholder-input" ></Textarea>

        <View className="commit" onClick={this.commitMessage.bind(this)}>提交</View>

        {
          historyLeaveMessageList && historyLeaveMessageList.length > 0
          &&
          <View style={{ color: "#333", fontSize: "28rpx", margin: "64rpx 0rpx 0rpx 24rpx", fontWeight: "500" }}>留言板</View>
        }

        {
          historyLeaveMessageList && historyLeaveMessageList.length > 0
          &&
          <View className="leave-list-container">
            {
              historyLeaveMessageList.map((item, index) => {
                return (
                  <View className={this.isShortName(messageInfo.shopName) ? "item-row" : "item-column"}>
                    <View className={this.isShortName(messageInfo.shopName) ? "name-row" : "name-column"}>{this.convertMsgReceiveIdToName(item)}</View>
                    <View className={this.isShortName(messageInfo.shopName) ? "content-row" : "content-column"}>{item.content || ""}</View>
                    <View className="line"></View>
                  </View>
                )

              })
            }
          </View>
        }
      </View >
    )
  }
}

export default XPage.connectFields()(shopMessgeDetail)
