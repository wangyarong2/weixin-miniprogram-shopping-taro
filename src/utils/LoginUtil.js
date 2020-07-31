import Taro from '@tarojs/taro'

/**
 * 调用说明
 * import LoginUtil from '@/utils/LoginUtil'
 * LoginUtil.checkLogin() 判断是否登录
 */
class LoginUtil {
  /**
   * [checkLogin 检查用户是否登录成功]
   * @return {[type]} [description]
   */
  static checkLogin() {
    const user = Taro.getStorageSync('userData')
    if (user) {
      return !LoginUtil.isTokenExpired()
    }
    return false
  }

  /**
   * [isTokenExpired 如果有登录过，即用登录token信息，判断token是否将要过期]
   * @return {Boolean} [false 不过期， true 过期]
   */
  static isTokenExpired() {
    const jsonUser = Taro.getStorageSync('userData')
    const endTime = parseInt(jsonUser.time, 10) + parseInt(jsonUser.expires_in, 10)
    const nowTime = parseInt(((new Date()).getTime() / 1000), 10)
    if ((endTime - nowTime) < 0) return true
    if ((endTime - nowTime) > 0) return false
    if ((endTime - nowTime) === 0) return true
  }

  static getWXCode() {
    return new Promise((reslove) => {
      wx.login({
        success(log) { reslove(log.code) }
      })
    })
  }

  static getLoginCode() {
    wx.login({
      success(log) {
        Taro.setStorageSync('USER_AUTH_CODE', log.code)
      },
      fail(res) {
        console.log('----获取code失败', res)
      },
    })
  }

}
export default LoginUtil
