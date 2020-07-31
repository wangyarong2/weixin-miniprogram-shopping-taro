import { View, Text } from '@tarojs/components'
import './ListTitle.less'

import titleLeftImage from "@images/shop/near_shop_title_left_icon.png";
import titleRightImage from "@images/shop/near_shop_title_right_icon.png";


/**
 * Date:  2020-02-25
 * Time:  12:14
 * Author: jianglong
 * -----------------------------
 * 列表顶部标题
 */
export default class ListTitle extends Taro.Component {

  static defaultProps = {
    title: "",
  }

  render() {
    const { title } = this.props
    return (
      <View className="root">
        <Image className="image" src={titleLeftImage}></Image>
        <View className="text">{title}</View>
        <Image className="image" src={titleRightImage}></Image>
      </View>
    )
  }
}

