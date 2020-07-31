import { View, Text } from '@tarojs/components'
import XPage from '../../XPage/XPage'
import './SpecValue.less'

export default class SpecValue extends XPage {

  static defaultProps = {
    isCheck: false, // 是否选中
    text: '', // 规格名称
    inventory: 0, // 库存
    onClick: () => { }
  }

  _onClick() {
    if (this.props.inventory) {
      this.props.onClick();
    }
  }

  render() {
    const { text, isCheck, inventory } = this.props
    const calcClassName = function () {
      if (inventory <= 0) {
        return 'spec disabled'
      } else if (isCheck) {
        return 'spec checked'
      } else {
        return 'spec'
      }
    }()
    return (
      <Text className={calcClassName} onClick={this._onClick}>{text}</Text>
    )
  }
}
