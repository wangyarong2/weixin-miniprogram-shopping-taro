import XPage from '@src/components/XPage/XPage';
import { View, Input, Picker, Switch, Textarea } from '@tarojs/components';
import Taro, { Component } from '@tarojs/taro';
import './addAddress.less';
import TextUtil from '../../../utils/TextUtil';
import request from '../../../servers/http';
import { AtIcon } from 'taro-ui';

class addAddress extends XPage {
  config = {
    navigationBarTitleText: '',
  };

  state = {
    name: '', // 姓名
    phone: '', // 电话
    detailAddress: '', // 详细地址
    province: '', // 省
    city: '', // 市
    code: '', // 地区编码
    district: '', // 区
    defFlag: false, // 是否默认
    buttonDisable: true, // 未填满数据按钮状态
    addressId: '', // 对应的数据库ID
    isXsMax: false,

    pickerCurrentUseData: [], //选择器当前展示的数据
    pickerCurrentSelectedData: [], //选择器当前选中的数据
    userRegion: [], //服务返回的区域信息
  };

  componentDidMount() {
    const that = this;
    Taro.getSystemInfo({
      success: function (res) {
        var model = res.model;
        console.log('model', model);
        if (model.search('iPhone XS Max') != -1) {
          that.setState({
            isXsMax: true,
          });
        }
      },
    });
    if (this.$router.params.addressId) {
      Taro.setNavigationBarTitle({
        title: '编辑收货地址',
      });
      this.setState(
        {
          addressId: this.$router.params.addressId,
          name: this.$router.params.name,
          phone: this.$router.params.phone,
          province: this.$router.params.province,
          city: this.$router.params.city,
          detailAddress: this.$router.params.detailAddress,
          district: this.$router.params.district,
          defFlag: this.$router.params.defFlag,
          code: this.$router.params.adcode,
        },
        () => {
          this.checkAllInfoComplete();
        }
      );
    } else {
      if (this.$router.params.name) {
        this.setState(
          {
            name: this.$router.params.name,
            phone: this.$router.params.phone,
            province: this.$router.params.province,
            city: this.$router.params.city,
            detailAddress: this.$router.params.detailAddress,
            district: this.$router.params.district,
            code: this.$router.params.adcode,
          },
          () => {
            this.checkAllInfoComplete();
          }
        );
      }
      Taro.setNavigationBarTitle({
        title: '新增收货地址',
      });
    }

    this.getUserRegion();
  }

  onNameChange(value) {
    console.log(value);
    this.setState(
      {
        name: value.detail.value,
      },
      () => {
        this.checkAllInfoComplete();
      }
    );
  }

  switch2Change(e) {
    this.setState({
      defFlag: e.detail.value + '',
    });
  }

  onPhoneChange(value) {
    this.setState(
      {
        phone: value.detail.value,
      },
      () => {
        this.checkAllInfoComplete();
      }
    );
  }

  //城市选择
  onHandelProviceChange(e) {
    this.setState(
      {
        province: e.detail.value[0],
        city: e.detail.value[1],
        district: e.detail.value[2],
        code: e.detail.code[2],
      },
      () => {
        this.checkAllInfoComplete();
      }
    );
  }

  onDetailAddressChange(value) {
    this.setState(
      {
        detailAddress: value.detail.value,
      },
      () => {
        this.checkAllInfoComplete();
      }
    );
  }

  //每次数据变化之后 对button状态进行更新
  checkAllInfoComplete() {
    const { name, phone, province, detailAddress } = this.state;
    this.setState({
      buttonDisable: !(name.length > 0 && phone.length > 0 && province.length > 0 && detailAddress.length > 0),
    });
  }

  //删除地址
  onHandleDeleteClick() {
    Taro.showModal({
      title: '提示',
      content: '确认删除该地址吗?',
    }).then((res) => {
      if (res.confirm) {
        request
          .post('/community-client/deleteAddress', {
            addressId: this.state.addressId,
          })
          .then((res) => {
            setTimeout(() => {
              Taro.showToast({
                title: '删除成功',
                mask: true,
              });
              this.goBack();
            }, 300);
          });
      }
    });
  }

  getUserRegion() {
    this.showLoading();
    request
      .post('/community-client/address/userRegion')
      .then((res) => {
        this.hideLoading();
        this.initAreaData(res);
      })
      .catch((err) => {
        this.hideLoading();
      });
  }

  initAreaData(userRegion) {
    if (userRegion == null || userRegion.length == 0) return;
    let pickerCurrentUseData = [userRegion, userRegion[0].children, userRegion[0].children[0].children];
    this.setState({ userRegion, pickerCurrentUseData });
  }

  // 保存地址
  onHandleSaveClick() {
    const { name, phone, detailAddress, province, city, district, code, addressId, defFlag } = this.state;
    if (TextUtil.isEmojiCharacter(name)) {
      Taro.showToast({
        title: '收货人姓名不能包含表情或特殊符号',
        mask: true,
        icon: 'none',
      });
      return false;
    }
    if (!TextUtil.isPoneAvailable(phone)) {
      Taro.showToast({
        title: '电话格式不正确，请重新输入',
        mask: true,
        icon: 'none',
      });
      return false;
    }
    if (TextUtil.isEmpty(province)) {
      Taro.showToast({
        title: '请选择省市区地址',
        mask: true,
        icon: 'none',
      });
      return false;
    }
    if (TextUtil.isEmojiCharacter(detailAddress)) {
      Taro.showToast({
        title: '详细地址不能包含表情或特殊符号',
        mask: true,
        icon: 'none',
      });
      return false;
    }
    this.showLoading();
    request
      .post('/community-client/saveAddress', {
        addressId: addressId.length > 0 ? addressId : 0,
        province,
        city,
        district,
        street: '',
        detailAddress,
        name,
        phone,
        defFlag: defFlag,
        adcode: code,
      })
      .then((res) => {
        this.hideLoading();
        Taro.showToast({
          title: '地址保存成功',
          mask: true,
        });
        setTimeout(() => {
          this.goBack();
        }, 500);
      });
  }
  //每一列滑动时回调
  bindMultiPickerColumnChange(e) {
    const { userRegion } = this.state;
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    console.log(userRegion);
    let pickerCurrentUseData = this.state.pickerCurrentUseData;

    if (e.detail.column === 0) {
      pickerCurrentUseData[1] = userRegion[e.detail.value].children;
      pickerCurrentUseData[2] = pickerCurrentUseData[1][0].children;
    } else if (e.detail.column === 1) {
      pickerCurrentUseData[2] = pickerCurrentUseData[1][e.detail.value].children;
    }

    this.setState({ pickerCurrentUseData });
  }
  //点击确认时回调
  bindMultiPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    const { pickerCurrentUseData } = this.state;
    if (pickerCurrentUseData.length == 0) return;

    let resultArr = e.detail.value;
    this.setState({
      province: pickerCurrentUseData[0][resultArr[0]].label,
      city: pickerCurrentUseData[1][resultArr[1]].label,
      district: pickerCurrentUseData[2][resultArr[2]].label,
      code: pickerCurrentUseData[2][resultArr[2]].value,
    });
  }

  render() {
    const { isXsMax, pickerCurrentUseData, pickerCurrentSelectedData } = this.state;

    console.log('isXsMax', isXsMax);
    return (
      <View className="root">
        <View className="add-address-page">
          <View className="item">
            <View className="title">收货人</View>
            <Input
              className="input"
              value={this.state.name}
              onInput={this.onNameChange}
              maxLength={10}
              placeholder="请输入收货人姓名"
              placeholderClass="placeholder"
            />
          </View>
          <View className="item">
            <View className="title">手机号</View>
            <Input
              className="input"
              onInput={this.onPhoneChange}
              value={this.state.phone}
              maxLength={11}
              type="number"
              placeholder="请输入手机号码"
              placeholderClass="placeholder"
            />
          </View>
          <View className="item">
            <View className="title">所在地区</View>
            <Picker
              mode="multiSelector"
              className="picker"
              onChange={this.bindMultiPickerChange.bind(this)}
              onColumnChange={this.bindMultiPickerColumnChange.bind(this)}
              value={pickerCurrentSelectedData}
              range-key="label"
              range={pickerCurrentUseData}
            >
              <View className="flex-row">
                <Input
                  disabled
                  className="input"
                  value={
                    this.state.province.length > 0
                      ? this.state.province + ' / ' + this.state.city + ' / ' + this.state.district
                      : null
                  }
                  placeholderClass="placeholder"
                  placeholder="选择省 / 市 / 区"
                />
                <AtIcon prefixClass="icon" value="youjiantou" size="13" color="#909090" />
              </View>
            </Picker>
          </View>

          <View className="item" style={{ alignItems: 'flex-start', marginTop: '5px' }}>
            <View className="title" style={{ marginTop: isXsMax ? '10px' : '8px' }}>
              详细地址
            </View>
            <Textarea
              style={{ paddingTop: isXsMax ? '4px' : '10px' }}
              className="textarea-input"
              placeholderClass="placeholder"
              onInput={this.onDetailAddressChange}
              value={this.state.detailAddress}
              placeholder="如道路、门牌号、小区、楼栋号、单元室等"
            />
          </View>
          <View style={'height:12px;background:#fafafc'} />
          <View className="item" style={'justify-content:space-between'}>
            <View className="title">设置为默认地址</View>
            <Switch onChange={this.switch2Change} checked={this.state.defFlag === 'true'} color="#FF6400" />
          </View>
        </View>
        <Text className="confirm" onClick={this.onHandleSaveClick.bind(this)}>
          保存
        </Text>
        {this.$router.params.addressId && (
          <Text className="delete" onClick={this.onHandleDeleteClick}>
            删除
          </Text>
        )}
      </View>
    );
  }
}

export default XPage.connectFields()(addAddress);
