import XPage from '@src/components/XPage/XPage'
import { View, Input } from '@tarojs/components'
import './searchCity.less'
import { AtIcon } from 'taro-ui'
import request from '../../../servers/http'
import EmptyView from '../../../components/EmptyView/EmptyView'
import LoginUtil from '../../../utils/LoginUtil'
import { set as setGlobalData } from '@utils/globalData';


class searchCity extends XPage {
    config = {
        navigationBarTitleText: '搜索',
        enablePullDownRefresh: false
    }

    state = {
        pageShowResult: false,
        searchKey: '',
        cityList: [],
    }

    // componentDidMount() {
    //     if (LoginUtil.checkLogin()) {
    //         this.getHistorySearch();
    //     }
    // }

    onSearchIntputChange(value) {
        this.setState({ searchKey: value.detail.value });
    }

    onCancelClick() {
        this.setState({
            searchKey: '',
            pageShowResult: false,
            lastIndex: null,
        })
    }

    onSearchClick(refresh) {
        let { searchKey } = this.state
        if (searchKey == null || searchKey.length == 0) {
            Taro.showToast({
                title: '请输入搜索关键字',
                icon: 'none',
                duration: 2000
            })
            return
        }

        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })

        const requestData = { keywords: searchKey }
        request.post('/community-client/community/searchArea', requestData).then(res => {
            Taro.hideLoading();
            this.setState({
                cityList: res.data,
                pageShowResult: true
            })
        })

    }


    getHistorySearch() {
        request.post('/community-client/history/search', { searchType: 1 }).then(res => {
            this.setState({
                historyList: res.data
            })
        })
    }
    onCityItemClick(cityInfo) {
        if (cityInfo
            && cityInfo.name
            && cityInfo.code) {
            setGlobalData('searchCityPageSelectCity', cityInfo)
            this.goBack();
        }
    }


    render() {
        const { searchKey, pageShowResult, cityList } = this.state
        return (
            <View className="search-page">
                <View className="search-root">
                    <View className="search-layout">
                        <AtIcon prefixClass='icon' value='sousuo' size='16' color='#666666'></AtIcon>
                        <Input className="search-input" onInput={this.onSearchIntputChange} value={searchKey} onConfirm={this.onSearchClick.bind(this, true)} placeholder="请输入城市名称" placeholderClass="placeholder-input" confirmType="搜索"></Input>
                    </View>
                    {
                        pageShowResult ?
                            <View className="search-text" onClick={this.onCancelClick}>取消</View>
                            :
                            <View className="search-text" onClick={this.onSearchClick.bind(this, true)}>搜索</View>
                    }
                </View>

                {
                    cityList == null || cityList.length == 0
                    &&
                    <EmptyView type={9}></EmptyView>
                }




                {
                    cityList.map((item, index) => {
                        return (<View className="city-item" onClick={this.onCityItemClick.bind(this, item)}>{item.name}</View>);
                    })
                }
            </View >


        )
    }
}

export default XPage.connectFields()(searchCity)
