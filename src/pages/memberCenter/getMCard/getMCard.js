import { View } from '@tarojs/components'
import XPage from '@src/components/XPage/XPage'

class getMCard extends XPage {
  config = {
    navigationBarTitleText: '领取橙宝'
  }

  state = {
    sceneData: ''
  }

  componentDidMount() {
    if (this.$router.params.scene) {
      const sceneData = decodeURIComponent(this.$router.params.scene)
      console.log('sceneData', sceneData)
      this.setState({ sceneData: sceneData })
    }
  }

  render() {
    return (
    <View>{this.state.sceneData}</View>
    )
  }
}

export default XPage.connectFields()(getMCard)
