import Taro from "@tarojs/taro";
class PermissionUtil {

  //用户是否拒绝了授权
  static getWXPermissionIsRejectByUser(wxPermissionName) {
    /**
     * {"errMsg":"getSetting:ok","authSetting":{"scope.userLocation":false,"scope.userInfo":true}}
     */
    return new Promise((resolve, reject) => {
      //获取小程序获取了那些授权
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting.hasOwnProperty(wxPermissionName)) {
            //不存在该属性，说明用户未拒绝该权限授权
            resolve(false);
          } else {
            resolve(!res.authSetting[wxPermissionName]);
          }
        },
        fail: (err) => {
          reject();
        },
      });
    });
  }
}

export default PermissionUtil;
