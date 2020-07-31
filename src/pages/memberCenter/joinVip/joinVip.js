import XPage from '@src/components/XPage/XPage'
import { View, Swiper, SwiperItem } from '@tarojs/components'
import './joinVip.less'
import enjoy from '../../../assets/images/member/icon_member_enjoy.png'
import canEnjoy from '../../../assets/images/member/icon_member_can_enjoy.png'
import vip from '../../../assets/images/member/icon_member_vip.png'
import request from '../../../servers/http'
import dayjs from 'dayjs'
import TextUtil from '../../../utils/TextUtil'
import LoginUtil from '../../../utils/LoginUtil'


class joinVip extends XPage {
    config = {
        navigationBarTitleText: ''
    }

    state = {
        equityList: [],
        cardName: '',
        cityCode: null,
        cityName: null,
        allPrice: 0,
    }

    componentDidMount() {
        const { cityName, cityCode } = this.$router.params
        Taro.setNavigationBarTitle({
            title: '加入会员'
        });
        this.setState({
            cityName,
            cityCode,
        }, () => {
            this.getMeiCardProduct();
            this.getEquityList();
            this.getCardDetail();
        })

    }

    componentDidShow() {

    }

    onEquityDetailClick(equity) {
        console.log('----', equity);
        this.goPage({ url: 'memberCenter/equityDetail', params: { cityCode: this.state.cityCode, equityId: equity.equityId == null ? equity.detail[0].equityId : equity.equityId } })
    }

    getCardDetail() {
        request.post('/community-client/member/equityCard/detail', { areaNo: this.state.cityCode }).then(res => {
            this.setState({
                cardName: res.title,
            })
        })
    }

    //获取橙宝商品
    getMeiCardProduct() {
        Taro.showLoading({
            title: '请稍后...',
            mask: true
        })
        request.post('/community-client/promotion/product/list', { promotionType: 1, pageNo: 1, pageSize: 10 }).then(res => {
            Taro.hideLoading();
            this.setState({
                productList: res.data.list
            })
        }).catch(res => {
            Taro.hideLoading();
        })
    }

    //获取权益列表
    getEquityList() {
        request.post('/community-client/community/equityCard/list', { areaNo: this.state.cityCode }).then(res => {
            this.setState({
                allPrice: res.data.cost,
                equityList: res.data.communityList
            })
        }).catch(res => {

        })
    }

    render() {
        const { allPrice, equityList, cardName } = this.state
        console.log('length', equityList.length, equityList.length * 140)
        return (
            <View className='join-vip-page'>
                <View className="card-layout">
                    <View className="card-name-layout">
                        <View className="name-layout">
                            <View className="card-name">好橙家超级VIP卡</View>
                        </View>
                        <Image className="vip-img" src={vip}></Image>
                    </View>
                    <View className="time-layout">
                        <View className="end-text">商品礼包+商家30项权益</View>
                    </View>
                    <View className="all-price-layout">
                        <View className="all-text">总价值 ¥</View>
                        <View className="all-price">{allPrice}</View>
                    </View>
                </View>

                <Image className="can-enjoy-img" src={canEnjoy}></Image>
                <View className="white-bg">
                    {
                        equityList.map(item => {
                            return (
                                <View className="equity-content">
                                    <View className="equity-item">
                                        <Image className="equity-img" src={item.logoImage}></Image>
                                        <View className="equity-layout">
                                            <View className="equity-name">{item.title}</View>
                                            <View className="equity-introduce">{item.description}</View>
                                        </View>
                                        <View className="detail" onClick={this.onEquityDetailClick.bind(this, item)}>详情</View>
                                    </View>
                                    <View className="equity-list">
                                        {
                                            (!TextUtil.isEmpty(item.shopId + '')) &&
                                            <View className="address">电话：{TextUtil.formateStringIfEmpty(item.mobilePhone)}</View>
                                        }
                                        {
                                            (!TextUtil.isEmpty(item.shopId + '')) &&
                                            <View className="address">地址：{TextUtil.formateStringIfEmpty(item.address)}</View>
                                        }
                                        {
                                            item.detail.map((detail, index) => {
                                                return (
                                                    <View className="equity-detail">
                                                        <View className="equity-detail-text">{detail.description}</View>
                                                        <View className="equity-detail-price-layout">
                                                            <View className="equity-detail-price-text">￥ </View>
                                                            <View className="equity-detail-price">{detail.cost}元</View>
                                                        </View>
                                                    </View>
                                                )
                                            })
                                        }

                                    </View>
                                </View>
                            )
                        })
                    }
                </View>


            </View>
        )
    }
}

export default XPage.connectFields()(joinVip)
