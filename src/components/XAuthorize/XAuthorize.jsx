import XPage from '@src/components/XPage/XPage'
import LoginUtil from '../../utils/LoginUtil'
import request from '@src/servers/http'

import './XAuthorize.less'
import { AtIcon } from 'taro-ui'
import { View } from '@tarojs/components'
import { getMebmerInfo } from '@src/servers/servers'
import { get as getGlobalData, set as setGlobalData } from '@utils/globalData.js'
import TextUtil from '../../utils/TextUtil'

export default class XAuthorize extends XPage {
  static defaultProps = {
    logined: false
  }
  state = {
    isLogin: false,
    isBindPhone: false,
    showBindPhone: false,
    inviteShopId: '',
    e: null,
  }

  componentDidMount() {
    this.initState()
  }

  componentDidShow() {
    this.initState()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.logined !== nextProps.logined) {
      this.initState()
    }
  }

  initState() {
    const userData = Taro.getStorageSync('userData')
    this.setState({
      isLogin: LoginUtil.checkLogin(),
      isBindPhone: userData ? Boolean(userData.phone) : false,
    }, () => {
    })
    wx.login({
      success(log) { }
    })
  }

  onLoginClick(e) {
    Taro.showLoading({
      title: '请稍后...',
      mask: true
    })
    this.onGetUserInfo(e).then(res => {
      const userData = Taro.getStorageSync('userData')
      //登录之后检查该用户的基本信息
      request.post('/community-client/member/queryBindShops', { pageNo: 1, pageSize: 100 }).then(res => {
        console.log('登录获取得店铺信息', res)
        if (res != null && res.list != null && res.list.length > 0) {
          const inviteShopId = getGlobalData('shareUserId')
          //本地有邀请的店铺信息 绑定店铺
          if (typeof inviteShopId != 'undefined' && inviteShopId != null && inviteShopId.length > 0) {
            this.setState({
              inviteShopId
            }, () => {
              this.onBindInviteCode();
            })
          } else {
            //没有分享信息 直接登录成功
            Taro.hideLoading();
            this.setState({
              isLogin: true,
              isBindPhone: true,
              showBindPhone: false,
            });
            Taro.showToast({
              title: '登录成功',
              icon: 'none',
              duration: 2000
            })
            Taro.setStorageSync('HomePageRefreshShopList', true);
            this.props.loginCallback && this.props.loginCallback()
          }
        } else {
          if (userData.phone) {
            console.log('绑定了手机号')
            //该用户已经绑定过手机号 说明该用户绑定手机号到下一步绑定邀请码的流程退出了 下次进入 走绑定邀请码
            Taro.hideLoading();
            this.setState({
              isLogin: true,
              isBindPhone: true,
              showBindPhone: false,
            }, () => {
              const inviteShopId = getGlobalData('shareUserId')
              //有邀请信息
              if (typeof inviteShopId != 'undefined' && inviteShopId != null && inviteShopId.length > 0) {
                console.log('从首页存的InviteShopId', inviteShopId)
                this.setState({
                  inviteShopId
                }, () => {
                  this.onBindInviteCode();
                })
              } else {
                //无邀请信息 绑定默认门店
                this.setState({
                  inviteShopId: null
                }, () => {
                  this.onBindInviteCode();
                })
              }
            })
          } else {
            console.log('未绑定手机号')
            //该用户未绑定手机号 进入弹出绑定手机号
            Taro.hideLoading();
            this.setState({
              isLogin: true,
              isBindPhone: false,
              showBindPhone: true,
            }, () => {
              wx.hideTabBar();
            })
          }
        }
      })
    }).catch(e => {
      Taro.hideLoading();
      Taro.showToast({
        title: '获取用户信息失败',
        icon: 'none',
        duration: 2000
      })
    })
  }

  showBindPhonePopup() {
    this.setState({ showBindPhone: true }, () => {
      wx.hideTabBar();
    })
  }

  hideBindPhonePopup() {
    this.setState({ showBindPhone: false }, () => {
      wx.showTabBar();
    })
  }

  // showInvitePopup() {
  //   this.setState({ showInviteCode: true }, () => {
  //     wx.hideTabBar();
  //   })
  // }

  // hideInvitePopup() {
  //   this.setState({ showInviteCode: false }, () => {
  //     wx.showTabBar();
  //   })
  // }

  // onInviteCodeInput(e) {
  //   console.log('------onInviteCodeInput', e.detail.value)
  //   this.setState({ inviteCode: e.detail.value })
  // }

  // onInviteCodeEmpty() {
  //   Taro.showToast({
  //     title: '请输入邀请码',
  //     icon: 'none'
  //   })
  // }

  // 获取手机号
  onGetPhoneNumber = async (e) => {
    const that = this;
    console.log('----e', e)
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      const wxCode = await LoginUtil.getWXCode()
      const postData = {
        loginWay: 0,
        code: wxCode,
        encryptedData: e.target.encryptedData,
        iv: e.target.iv,
      }
      console.log('postData', postData)
      request.post('/wx-agent/user/phone/bind', postData).then(res => {
        console.log('结果', res)
        //旧用户
        if (!TextUtil.isEmpty(res.oldReplace + '')) {
          Taro.showLoading({
            title: '请稍后...',
            mask: true
          })
          console.log('------', '旧用户')
          wx.getSetting({
            success(res) {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                wx.login({
                  success(res) {
                    wx.getUserInfo({
                      withCredentials: true,
                      success(eee) {
                        const data = { detail: eee }
                        that.onGetUserInfo(data).then(res => {
                          Taro.hideLoading();
                          const userData = Taro.getStorageSync('userData')
                          Taro.setStorageSync('userData', userData);
                          Taro.showToast({
                            title: '登录成功',
                            icon: 'none',
                            duration: 2000
                          })
                          that.setState({
                            isBindPhone: true,
                            isLogin: true,
                            showBindPhone: false,
                          }, () => {
                            wx.showTabBar();
                            that.props.loginCallback && that.props.loginCallback()
                          })
                        })
                      }
                    })
                  }
                })
              }
            }
          })

        } else {
          if (res.phone) {
            const _userData = Taro.getStorageSync('userData')
            _userData.phone = res.phone
            Taro.setStorageSync('userData', _userData)
          }
          const inviteShopId = getGlobalData('shareUserId');
          if (typeof inviteShopId != 'undefined' && inviteShopId != null && inviteShopId.length > 0) {
            console.log('从首页存的InviteShopId', inviteShopId)
            this.setState({
              inviteShopId
            }, () => {
              this.onBindInviteCode();
            })
          } else {
            this.setState({
              isBindPhone: true,
              isLogin: true,
              showBindPhone: false,
              inviteShopId: null,
            }, () => {
              this.onBindInviteCode();
            })
          }
        }

      }).catch(res => {
        wx.login({
          success(log) { }
        })
        console.log('错误', res)
      })
    }
  }

  onBindInviteCode() {
    let requestData = {};
    if (this.state.inviteShopId != null && this.state.inviteShopId.length > 0) {
      requestData = { shareUserId: this.state.inviteShopId }
    }
    request.post('/community-client/member/bind', requestData).then(res => {
      if (res.suc) {
        this.setState({
          isBindPhone: true,
          isLogin: true,
          showBindPhone: false,
        }, () => {
          getMebmerInfo().then(mebmerInfo => {
            Taro.setStorageSync('member_info', mebmerInfo);
            // setGlobalData('shareUserId', null)
            wx.showTabBar();
            Taro.showToast({
              title: '登录成功',
              icon: 'none',
              duration: 2000
            })
            Taro.setStorageSync('HomePageRefreshShopList', true);
            this.props.loginCallback && this.props.loginCallback();
          }).catch(e => {
            wx.showTabBar();
          })
        })
      } else {
        Taro.showToast({
          title: res.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  }

  emptyClik(e) {
    e.stopPropagation()
  }

  render() {
    return (
      <View
        className="box-container"
        onClick={this.emptyClik.bind(this)}
        style={{ width: this.props.isFullWith ? '100%' : 'auto', height: this.props.isFullHeight ? '100%' : 'auto' }}
      >
        {/* 授权按钮 */}
        {!this.state.isLogin &&
          <Button
            openType="getUserInfo"
            lang="zh_CN"
            className='btn-transparent'
            onGetUserInfo={this.onLoginClick}
          />
        }
        {/* 弹出绑定手机号弹框的按钮 */}
        {this.state.isLogin && !this.state.isBindPhone &&
          <View className='btn-transparent' onClick={this.showBindPhonePopup.bind(this)}></View>
        }
        {/* 弹出绑定邀请码弹框的按钮 */}
        {/* {this.state.isLogin && this.state.isBindPhone && !this.state.isBindInviteCode &&
          <View className='btn-transparent' onClick={this.showInvitePopup.bind(this)}></View>
        } */}
        {/* 绑定手机号弹窗 */}
        {
          this.state.showBindPhone &&
          <View className="balance-not-enough-dialog">
            <View className="dialog-content">
              <View className="close-layout">
                <AtIcon prefixClass='icon' onClick={this.hideBindPhonePopup.bind(this)} value='guanbi' size='13' color='#909090'></AtIcon>
              </View>
              <View className="content-layout">
                <View className="notice">为了保证您的账户和资金安全,请验证您的手机号</View>
                <View className='confirm'>
                  确认
                    <Button
                    openType="getPhoneNumber"
                    className='btn-transparent'
                    onGetPhoneNumber={this.onGetPhoneNumber}
                  />
                </View>
              </View>
            </View>
          </View>
        }
        {/* 邀请码弹框 */}
        {/* {this.state.showInviteCode &&
          <View className="balance-not-enough-dialog">
            <View className="dialog-content">
              <View className="close-layout">
                <AtIcon prefixClass='icon' onClick={this.hideInvitePopup.bind(this)} value='guanbi' size='13' color='#909090'></AtIcon>
              </View>
              <View className="content-layout">
                <Input
                  className="input"
                  type="text"
                  maxLength='10'
                  placeholder="请输入邀请码"
                  placeholderStyle='color:#C0C0C0'
                  value={this.state.inviteCode}
                  onInput={this.onInviteCodeInput}
                />
                <View className="confirm" onClick={this.onBindInviteCode}>确认</View>
              </View>
            </View>
          </View>
        } */}
        {this.props.children}
      </ View>
    )
  }
}
