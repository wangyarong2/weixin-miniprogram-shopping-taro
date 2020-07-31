import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./peopleListDialog.less";
import TextUtil from '../../../../utils/TextUtil'
import defaultImage from '../../../../assets/images/default/join_people_def.png'
import { message } from "taro-ui";

export default class peopleListDialog extends Taro.Component {
    static defaultProps = {
        groupInfo: {},

    };
    state = {
        intervalId: -1,
        peopleHeadList: [],
    }
    constructor() {
        super(...arguments);
    }

    componentWillReceiveProps() {
        const { peopleHeadList } = this.state
        if (peopleHeadList.length == 0) {
            const times = this.props.groupInfo.groupCount;
            for (let index = 0; index < times; index++) {
                peopleHeadList.push(null);
            }
            if (this.props.groupInfo.groupMemberList != null && this.props.groupInfo.groupMemberList.length > 0) {
                this.props.groupInfo.groupMemberList.forEach((element, index) => {
                    peopleHeadList[index] = element
                });
            }
            this.setState({
                peopleHeadList
            })
        }
    }


    render() {
        const { peopleHeadList } = this.state
        return (
            <View className="people-list-dialog" onClick={this.props.onPeopleListDialogClose}>
                <View className="dialog-content">
                    <View className="group-title">参与【{this.props.groupInfo.name}】发起的拼团</View>
                    <View className="need-people-num">仅剩{this.props.groupInfo.needCount}个名额，{TextUtil.getHours(this.props.groupInfo.remainingTime * 1000) + ":" + TextUtil.getMinutes(this.props.groupInfo.remainingTime * 1000) + ":" + TextUtil.getSeconds(this.props.groupInfo.remainingTime * 1000)}后结束</View>
                    <View className="head-layout">
                        {
                            peopleHeadList.map((headUrl, index) => {
                                return (
                                    <Image className="image" src={TextUtil.isEmpty(headUrl) ? defaultImage : headUrl}></Image>
                                )
                            })
                        }

                    </View>
                    <View className="join-btn" onClick={this.props.onJoinGroupClick}>加入拼团</View>
                </View>
            </View>
        )
    }
}
