import XPage from '@src/components/XPage/XPage'
import { View, ScrollView } from '@tarojs/components'
import './shopListChooseCity.less'
import request from '../../../servers/http'
import { AtIcon } from "taro-ui";
import TextUtil from '../../../utils/TextUtil'
import taro from '../../../../dist/npm/@tarojs/taro';
import { set as setGlobalData, get as getGlobalData } from '@utils/globalData';



class shopListChooseCity extends XPage {
    config = {
        navigationBarTitleText: '定位'
    }

    constructor(props) {
        super(props)
        this.state = {
            scrollIndex: 'id10000',
            currentCityInfo: {},
            word: [
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
            ],
            //产品和服务端的意见 要求客户端写死
            hotCity: [
                { "name": "北京市", "code": '110100' },
                { "name": "上海市", "code": '310100' },
                { "name": "广州市", "code": '440100' },
                { "name": "深圳市", "code": '440300' },
                { "name": "杭州市", "code": '330100' },
                { "name": "南京市", "code": '320100' },
                { "name": "苏州市", "code": '320500' },
                { "name": "武汉市", "code": '420100' },
                { "name": "长沙市", "code": '430100' },
                { "name": "西安市", "code": '610100' },
                { "name": "重庆市", "code": '500100' }],

            cityList: [],
            latelySelectedCitys: [],
            districtList: [],//当前市里所有区
            isShowDistrictView: false,
            shopListLocationCityInfo: {},
            screenHeight: 0,
        }

    }

    componentDidMount() {
        const { name, code, districtName, districtCode } = this.$router.params;
        const sysInfo = Taro.getSystemInfoSync();
        const screenHeight = sysInfo.screenHeight;
        this.setState({
            currentCityInfo: {
                name: name,
                code: code,
                districtCode: districtCode,
                districtName: districtName,
            },
            screenHeight: screenHeight,
            latelySelectedCitys: this.getSearchHistoryFromLocal(),
            shopListLocationCityInfo: this._getShopListLocationCiryInfo(),
        })

        this.getCityList(code);
    }
    _getShopListLocationCiryInfo() {
        let locationCityStr = Taro.getStorageSync('shopListLocationCityInfo');
        if (locationCityStr) {
            return JSON.parse(locationCityStr); ``
        } else {
            return "";
        }
    }

    componentDidShow() {
        var cityInfo = getGlobalData("searchCityPageSelectCity");
        if (cityInfo) {
            //清除global中的数据
            setGlobalData("searchCityPageSelectCity", "");
            this.selectCityAction(cityInfo);
        }
    }


    getCityList(code) {
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        const requestData = { "code": code }
        request.post('/community-client/community/areaList', requestData).then(res => {
            this.setState({
                cityList: res.data.cityAreaList,
                districtList: res.data.districtList,
            })
            Taro.hideLoading();

        }).catch(res => {
            Taro.hideLoading();
        })
    }
    _getWrapperDistrictList(resDistrictList) {
        if (!resDistrictList && !resDistrictList.length) {
            return [];
        } else {
            resDistrictList.unshift({ name: "全城", "code": this.state.currentCityInfo.code });
            return resDistrictList;
        }
    }


    onWordClick(wordIndex) {
        // console.log("wordIndex====" + wordIndex);
        this.setState({
            scrollIndex: 'id' + wordIndex
        }, () => {
            console.log(this.state.scrollIndex)
        })
    }

    onSearchCity() {
        this.goPage({
            url: 'shop/searchCity',
        })

    };
    selectCityAction(cityInfo) {
        if (cityInfo && cityInfo.code && cityInfo.name) {
            //清除区的选择
            cityInfo.districtName = "";
            cityInfo.districtCode = "";
            this._saveCityInfoAndGoBack(cityInfo);
        }
    }

    _saveCityInfoAndGoBack(cityInfo) {
        //保存当前选中城市信息
        Taro.setStorageSync('shopSelectedCityInfo', cityInfo);
        //更新更改历史记录
        this.saveSearchHistory(cityInfo);
        //老代码用 
        Taro.setStorageSync('userHasChooseCity', true)
        this.goBack();
    }

    //保存本次选中的城市(最多两个)
    saveSearchHistory(item) {
        let latelySelectedCitys = this.state.latelySelectedCitys;
        //添加到队首
        latelySelectedCitys.unshift(item);

        latelySelectedCitys = this._deleteSameItem(latelySelectedCitys);

        if (latelySelectedCitys.length > 3) {
            latelySelectedCitys.splice(3)
        }
        Taro.setStorageSync("shopListChooseCity_SearchCity", JSON.stringify(latelySelectedCitys));
    }

    _deleteSameItem(itemList) {
        if (!itemList) return itemList;
        let obj = {};
        itemList = itemList.reduce((item, next) => {
            if (!obj[next.name]) {
                item.push(next);
                obj[next.name] = true;
            }
            return item;
        }, []);
        return itemList;

    }

    //获取上次选中的城市(最多两个 )
    getSearchHistoryFromLocal() {
        const historyStr = Taro.getStorageSync("shopListChooseCity_SearchCity")
        if (TextUtil.isEmpty(historyStr)) {
            return [];
        } else {
            return JSON.parse(historyStr); ``
        }
    }
    //点击区 
    selectDistrictCodeAction(districtInfo) {
        if (districtInfo && districtInfo.name && districtInfo.code) {
            const cityInfo = {
                name: this.state.currentCityInfo.name,
                code: this.state.currentCityInfo.code,
                districtName: districtInfo.name,
                districtCode: districtInfo.code,
            }
            this._saveCityInfoAndGoBack(cityInfo);
        }
    }
    //点击区域展示开关
    onClickDistrictToggle() {
        this.setState({
            isShowDistrictView: !this.state.isShowDistrictView,
        })

    }

    _getItemSelectedStatus(districtItem) {
        const { currentCityInfo } = this.state;
        let currentSelectedAreaCode = currentCityInfo.districtCode ? currentCityInfo.districtCode : currentCityInfo.code.substring(0, 4) + "01";
        return districtItem.code == currentSelectedAreaCode;
    }

    render() {
        const { cityList, word, scrollIndex, currentCityInfo, isShowDistrictView, districtList, shopListLocationCityInfo } = this.state
        return (
            <View className="choose-city-page">
                <ScrollView
                    scrollIntoView={scrollIndex}
                    style={{ height: this.state.screenHeight + "px" }}
                    scrollY
                    scrollWithAnimation
                    className="city-left">
                    <View className="search-layout">
                        <View className="search-bg" onClick={this.onSearchCity}>
                            <AtIcon prefixClass='icon' value='sousuo' size='16' color='#666666'></AtIcon>
                            <Input className="search-text" disabled="true" placeholder="搜索城市" placeholderClass="placeholder-input" ></Input>
                        </View>
                    </View>

                    <View className="current-city-container">
                        <View className="current-city-name">当前: {currentCityInfo.name}</View>
                        <View className="change-area-container" onClick={this.onClickDistrictToggle.bind(this)}>
                            <View className="text">切换区县</View>
                            <View className="icon">
                                <AtIcon prefixClass='icon' value={isShowDistrictView ? 'shangjiantou' : 'xiajiantou'} size='6' color='#999'></AtIcon>
                            </View>
                        </View>
                    </View>

                    <View className="select-area-container" style={{ display: isShowDistrictView ? "flex" : "none" }}>
                        {
                            districtList.map(item => {
                                return (<View className={`normal ${this._getItemSelectedStatus(item) ? "selected" : null}`} onClick={this.selectDistrictCodeAction.bind(this, item)} >{item.name}</View>);
                            })
                        }
                    </View>

                    <View className="lately_selected" style={{ display: (this.state.latelySelectedCitys.length === 0) ? "none" : "block" }}>
                        <View className="tip-name">定位/最近访问</View>
                        <View className="city-container">
                            {
                                this.state.latelySelectedCitys.map(item => {
                                    return (
                                        <View className="item-view" onClick={this.selectCityAction.bind(this, item)}>
                                            <View style={{ display: (shopListLocationCityInfo.name === item.name ? "block" : "none") }}>
                                                <AtIcon prefixClass='icon' value='address' size='16' color='#666666'></AtIcon>
                                            </View>
                                            <View className="text">{item.name} </View>
                                        </View>)
                                })
                            }
                        </View>
                    </View>

                    <View className="hot-city">
                        <View className="tip-name">热门城市</View>
                        <View className="hot-city-container">
                            {
                                this.state.hotCity.map(item => {
                                    return (<View className="item-view" onClick={this.selectCityAction.bind(this, item)}> {item.name} </View>);
                                })
                            }
                        </View>
                    </View>


                    {
                        cityList.map((item, cityIndex) => {
                            return (
                                <View
                                    id={"id" + cityIndex}
                                    key={cityIndex}
                                    className="head-layout">
                                    <View className="head">
                                        {item.firstWord}
                                    </View>
                                    {
                                        item.respCityArea.map((city, index) => {
                                            return (
                                                <View className="city-layout" onClick={this.selectCityAction.bind(this, city)}>
                                                    <View className="city-name">
                                                        {
                                                            city.name
                                                        }
                                                    </View>
                                                    {index != item.respCityArea.length - 1 &&
                                                        <View className="line"></View>
                                                    }

                                                </View>
                                            )
                                        })
                                    }
                                </View>
                            )
                        })
                    }
                </ScrollView>
                <View className='city-right' >
                    <View className="word">区县</View>
                    <View className="word">定位</View>
                    <View className="word">热门</View>
                    {
                        word.map((item, wordIndex) => {
                            return (
                                <View className="word" onClick={this.onWordClick.bind(this, wordIndex)}>{item}</View>
                            )
                        })
                    }
                </View>
            </View >
        )
    }
}

export default XPage.connectFields()(shopListChooseCity)
