import XPage from '@src/components/XPage/XPage'
import { View } from '@tarojs/components'

import request from '../../../servers/http'
import TextUtil from '@utils/TextUtil'

import './equityDetail.less'

class equityDetail extends XPage {
    config = {
        navigationBarTitleText: '会员权益'
    }

    state = {
        equityId: null,
        detailData: {},
        isDialogOpen: false,
        confirmDialogOpen: false,
        currentEquityDetail: {},
        memberCardId: null,
        cityCode: null,
    }

    componentDidShow() {
        const { equityId, cityCode } = this.$router.params
        this.setState({
            equityId,
            cityCode
        }, () => {
            this.getEquityDetail(equityId, cityCode);
        })

    }

    getEquityDetail(equityId, cityCode) {
        // Taro.showLoading({
        //     title: '请稍后...',
        //     mask: true
        // })
        request.post('/community-client/community/equity/detail', { equityId, areaNo: cityCode, cardId: this.params.cardId, }).then(res => {
            // Taro.hideLoading();
            this.setState({
              detailData: res,
            })
        }).catch(res => {
            // Taro.hideLoading();
        })
    }

    onSureClick() {
      const { detailData } = this.state
      if (detailData.needVerify) {
        if (detailData.verifyTimes <= 0) {
          Taro.showToast({
            title: '当前权益次数已使用完毕',
            icon: 'none'
          })
        } else {
          this.setState({ isDialogOpen: true })
        }
      } else {
        Taro.showToast({
          title: '您还未购买本卡，请先前往购买',
          icon: 'none'
        })
        if (this.params.from === 'shop') {
          setTimeout(() => {
            this.goPage({
              url: 'memberCenter/cardDetail',
              params: {
                id: this.params.cardId
              }
            })
          }, 2000)
        } else {
          setTimeout(() => {
            Taro.navigateBack()
          }, 2000)
        }
      }
    }

    onCancelClick() {
      this.setState({ isDialogOpen: false })
    }

    hideConfirm() {
      this.setState({
        isDialogOpen: true,
        confirmDialogOpen: false
      })
    }

    onDialogConfirmClick(e) {
      e.stopPropagation()
      this.setState({
        isDialogOpen: false,
        confirmDialogOpen: true
      })
    }

    onPostVerify() {
      const { equityId, cityCode, detailData } = this.state
        // if (currentEquityDetail.verifyTimes >= currentEquityDetail.quantity) {
        //     this.showToast({ title: '已到达最大核销次数' })
        //     return
        // }
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/member/equityCard/verify', { equityId:detailData.equityId, memberCardId: detailData.memberCardId }).then(res => {
            Taro.hideLoading();
            this.setState({
                isDialogOpen: false,
                confirmDialogOpen: false
            }, () => {
              Taro.showToast({
                title: '核销成功'
              })
              this.getEquityDetail(equityId, cityCode);
            })
        }).catch(res => {
            Taro.hideLoading();
        })
    }

    render() {
        const { detailData, isDialogOpen, confirmDialogOpen } = this.state
        return (
            <View className="equity-page">
                {
                    isDialogOpen &&
                    <View className="dialog" onClick={this.onCancelClick}>
                      <View className="content-container content-main">
                        <View className="title">{detailData.verifyTimes}/{detailData.quantity}</View>
                        <View className="content">{detailData.description}</View>
                        <View className="btn" onClick={this.onDialogConfirmClick}>店主点击核销</View>
                      </View>
                    </View>
                }

                { confirmDialogOpen &&
                  <View className="dialog dialog-confirm" onClick={this.hideConfirm}>
                    <View className="content-container confirm-main">
                      <View className="content-tip">请确认为店主点击，点击后进行核销将扣除本次权益</View>
                      <View className="btn-container flex-center">
                        <View className="confrim-btn btn-cancel flex-center" onClick={this.hideConfirm}>取消</View>
                        <View className="confrim-btn btn-confirm flex-center" onClick={this.onPostVerify}>确定</View>
                      </View>
                    </View>
                  </View>
                }
                <View className="list-item">
                  <View className="flex-space-between" style={{ marginBottom: '22rpx' }}>
                    <View className="item-name">1、{detailData.equityName}</View>
                    { detailData.quantity > 0 &&
                      <View className="item-num">{detailData.verifyTimes}/{detailData.quantity}</View>
                    }
                  </View>
                  { detailData.endTime ?
                    <View className="small-text">有效期 {TextUtil.formatDateWithYMD(detailData.startTime)} ～ {TextUtil.formatDateWithYMD(detailData.endTime)}</View>
                    :
                    <View className="small-text">有效期 不限</View>
                  }
                  <View class="small-text" style={{ marginTop: '8rpx' }}>详情：{detailData.description}</View>
                  <Image class="item-image" src={detailData.imageUrl} />
                  { detailData.quantity > 0 &&
                    <View class="item-btn flex-center" onClick={this.onSureClick.bind(this)}>核销</View>
                  }
                </View>

            </View>
        )
    }
}

export default XPage.connectFields()(equityDetail)
