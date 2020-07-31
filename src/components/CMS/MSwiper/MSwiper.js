import Taro from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem } from '@tarojs/components'
import './MSwiper.less'

export default class MSwiper extends Taro.Component {

	static externalClasses = ['class-wrapper']

	static defaultProps = {
	}

	handleClick = (item) => {
		this.props.handleClick && this.props.handleClick(item)
	}

	render() {
    const datas = this.props.datas
    // console.log(datas)
		return (
        <View
          className="swiper-container"
          style={`padding-top: ${datas.style.margin.top}px;padding-bottom: ${datas.style.margin.bottom}px`}
        >
					<Swiper
						className='swiper'
						indicatorColor='#999'
						indicatorActiveColor='#fff'
						circular
						indicatorDots
						autoplay>
						{
							datas.data.imgCollection.map((item) => (
								<SwiperItem key={item.id} onClick={this.handleClick.bind(this, item)}>
									<Image className="swiperimg" src={item.url} />
								</SwiperItem>
							))
						}
					</Swiper>
				</View>
		)
	}

}
