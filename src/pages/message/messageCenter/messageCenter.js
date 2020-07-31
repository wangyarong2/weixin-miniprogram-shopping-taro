import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'
import './messageCenter.less'
import { AtIcon, AtBadge } from 'taro-ui'

import messageImg from '../../../assets/images/message/m_message.png'
import express from '../../../assets/images/message/m_express.png'
import order from '../../../assets/images/message/m_order.png'
import service from '../../../assets/images/message/m_service.png'
import shop from '../../../assets/images/message/m_shop.png'

import EmptyView from '../../../components/EmptyView/EmptyView'
import request from '../../../servers/http'

class messageCenter extends XPage {
    config = {
        navigationBarTitleText: '消息通知',
        enablePullDownRefresh: true
    }

    state = {
        //由于服务端是跟app通用的接口，返回消息类型很多，而小程序只需要两类消息，所以这里写死了
        msgList: [{ msgType: "14", title: "客服消息" }]
    }

    componentDidMount() {
        this.getMessageList();
    }

    onMessageClick(messageItem) {
        if (!this.isWxMsgService(messageItem)) {
            const params = {
                msgType: messageItem.msgType,
                msgCategoryName: messageItem.title,
            }
            this.goPage({ url: 'message/categoryMessageCenter', params })
        }
    }

    isWxMsgService(messageItem) {
        return messageItem.msgType == "14";
    }

    onPullDownRefresh() {
        this.setState({
        }, () => {
            this.getMessageList()
        })
    }


    getMessageList() {
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/community/messagePush/list').then((res) => {
            Taro.hideLoading();
            Taro.stopPullDownRefresh();
            this.setState({
                list: this.appendMsgCount(res),
            })
        })
    }
    appendMsgCount(netRes) {
        const { msgList } = this.state;
        if (netRes == null) return msgList;
        netRes.forEach(item => {
            if (item.msgType == "F") {
                msgList.count = item.count;
            }
        })
        return msgList;

    }
    getMessageIcon(messageInfo) {
        //11-订单 12-物流 13-服务 14-客服 B-订单 C-物流 D-服务 E-客服 F-会员
        switch (messageInfo.msgType) {
            case "11":
                return order;
            case "12":
                return express;
            case "13":
                return service;
            case "14":
                return messageImg;
            case "F":
                return shop;
        }
    }

    render() {
        const { msgList } = this.state
        return (
            <View className="message-center-page">
                {
                    msgList.length == 0 &&
                    <EmptyView type={3}></EmptyView>
                }
                {
                    msgList.map((item, index) => {
                        return (
                            <View className="item-layout" onClick={this.onMessageClick.bind(this, item)}>
                                <View className="left-container">
                                    <Image className="image" src={this.getMessageIcon(item)} />
                                    <View className="msg-count" style={{ display: item.count ? "block" : "none" }}>{item.count || ""}</View>
                                </View>

                                <View className="center-container">
                                    <View className="row">
                                        <View className="msg-type-name">{item.title || ""}</View>
                                        <View className="time">{item.createTime || ""}</View>
                                    </View>
                                    <View className="msg-content" >{item.subTitle || ""}</View>
                                </View>
                                <AtIcon prefixClass='icon' value='youjiantou' color='#999999' size='10' ></AtIcon>
                                {
                                    this.isWxMsgService(item)
                                    && <Button openType="contact" sessionFrom={'7moor|' + Taro.getStorageSync('userinfo').nickName + '|' + Taro.getStorageSync('userinfo').avatarUrl} className="cover-button"> </Button>
                                }
                            </View>
                        )
                    })
                }

            </View >
        )
    }
}

export default XPage.connectFields()(messageCenter)
