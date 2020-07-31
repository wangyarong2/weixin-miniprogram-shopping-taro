import { View } from '@tarojs/components'
import XPage from '@src/components/XPage/XPage'

class LoadingView extends XPage {
  config = {
    navigationBarTitleText: ''
  }

  state = {}

  render() {
    return (
      <View></View>
    )
  }
}

export default XPage.connectFields()(LoadingView)
