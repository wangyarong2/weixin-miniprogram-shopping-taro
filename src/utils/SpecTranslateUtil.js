import Taro from '@tarojs/taro'

class SpecTranslateUtil {
    static translateSpecToText(skuSpecDesc) {
        if (skuSpecDesc instanceof Array) {
            let text = "";
            if (typeof skuSpecDesc != 'undefined' && skuSpecDesc.length > 0) {
                for (let index = 0; index < skuSpecDesc.length; index++) {
                    const element = skuSpecDesc[index];
                    text += (element.specName + ':' + element.specValue + (index == skuSpecDesc.length - 1 ? "" : ";"))
                }
                return text;
            }
        } else {
            return skuSpecDesc;
        }
    }
}

export default SpecTranslateUtil