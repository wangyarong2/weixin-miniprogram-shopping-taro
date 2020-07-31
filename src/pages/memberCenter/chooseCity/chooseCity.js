import XPage from '@src/components/XPage/XPage'
import { View, ScrollView } from '@tarojs/components'
import './chooseCity.less'
import request from '../../../servers/http'

class chooseCity extends XPage {
    config = {
        navigationBarTitleText: '选择地区'
    }

    state = {
        scrollIndex: 'id10000',
        cityList: [],
        currentCityInfo: {},
        word: [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ]
    }

    componentDidMount() {
        this.setState({
            currentCityInfo: Taro.getStorageSync('userChooseCity')
        })
        this.getCityList();
    }

    getCityList() {
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/promotion/areaList', { myCardList: this.params.from === 'myCard' ? true : false }).then(res => {
            this.setState({
                cityList: res.data
            })
            Taro.hideLoading();

        }).catch(res => {
            Taro.hideLoading();
        })
    }

    onWordClick(wordIndex) {
        this.setState({
            scrollIndex: 'id' + wordIndex
        })
    }
    onCurrentClick() {
        const defaultCity = Taro.getStorageSync('userChooseCity');
        const city = { name: defaultCity.name, code: defaultCity.code.substring(0, 4) + '00' }

        Taro.setStorageSync('userChooseCity', city)
        Taro.setStorageSync('userHasChooseCity', true)
        this.goBack();
    }

    onCityClick(city) {
        Taro.setStorageSync('userChooseCity', city)
        Taro.setStorageSync('userHasChooseCity', true)
        this.goBack();
    }

    render() {
        const { cityList, word, scrollIndex, currentCityInfo } = this.state
        return (
            <View className="choose-city-page">
                <ScrollView
                    scrollIntoView={scrollIndex}
                    scrollY
                    scrollWithAnimation
                    className="city-left">
                    <View className="head">当前定位</View>
                    <View className="current-city-layout" onClick={this.onCurrentClick}>
                        <View className="current-city">{currentCityInfo.name}</View>
                        <View className="gps-text">GPS定位</View>
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
                                                <View className="city-layout" onClick={this.onCityClick.bind(this, city)}>
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
                <View className='city-right'>
                    {
                        word.map((item, wordIndex) => {
                            return (
                                <View className="word" onClick={this.onWordClick.bind(this, wordIndex)}>{item}</View>
                            )
                        })
                    }
                </View>
            </View>
        )
    }
}

export default XPage.connectFields()(chooseCity)
