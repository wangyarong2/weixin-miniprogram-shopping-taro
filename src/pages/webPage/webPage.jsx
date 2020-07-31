import { View, WebView } from '@tarojs/components';
import XPage from '@src/components/XPage/XPage';

class webPage extends XPage {
  static defaultProps = {
    url: '',
  };

  state = {};
  handleMessage() {}

  render() {
    const { url } = this.$router.params;
    return <WebView src={url} onMessage={this.handleMessage.bind(this)} />;
  }
}

export default XPage.connectFields()(webPage);
