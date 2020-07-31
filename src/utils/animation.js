import Taro from '@tarojs/taro';
let taroAnimation = function (options) {
    this.vm = Taro.createAnimation(this.handleOpt(options));
}

taroAnimation.prototype.handleOpt = function (options) {
    let opt;
    if (options instanceof Number || options) {
        opt = { duration: options || 400 }
    } else opt = options
    return opt
}

taroAnimation.prototype.end = function (){
    return this.vm.export()
}

//直线运动
taroAnimation.prototype.line = function (a,b,options) {
    this.vm.translateX(a).translateY(b).step(this.handleOpt(options));
    return this
}

//形状变化
taroAnimation.prototype.shape = function() {

}

//开始
taroAnimation.prototype.start = function(){
   return this
}
taroAnimation.prototype.step = function(options){
    this.vm.step(this.handleOpt(options))
    return this
}

/**
 * 原始方法
 */
taroAnimation.prototype.translateX=function(params){
    this.vm.translateX(params)
    return this
}
taroAnimation.prototype.translateY=function(params){
    this.vm.translateY(params)
    return this
}
taroAnimation.prototype.translateZ=function(params){
    this.vm.translateZ(params)
    return this
}
taroAnimation.prototype.rotateX=function(params){
    this.vm.rotateX(params)
    return this
}
taroAnimation.prototype.rotateY=function(params){
    this.vm.rotateY(params)
    return this
}
taroAnimation.prototype.rotateZ=function(params){
    this.vm.rotateZ(params)
    return this
}
taroAnimation.prototype.scaleX=function(params){
    this.vm.scaleX(params)
    return this
}
taroAnimation.prototype.scaleY=function(params){
    this.vm.scaleY(params)
    return this
}
taroAnimation.prototype.scaleZ=function(params){
    this.vm.scaleZ(params)
    return this
}
taroAnimation.prototype.skewX = function(params){
    this.vm.skewX(params)
    return this
}
taroAnimation.prototype.skewY = function(params){
    this.vm.skewY(params)
    return this
}
taroAnimation.prototype.skewZ = function(params){
    this.vm.skewZ(params)
    return this
}
taroAnimation.prototype.left = function(params){
    this.vm.left(params)
    return this
}
taroAnimation.prototype.right = function(params){
    this.vm.right(params)
    return this
}
taroAnimation.prototype.top = function(params){
    this.vm.top(params)
    return this
}
taroAnimation.prototype.bottom = function(params){
    this.vm.bottom(params)
    return this
}
taroAnimation.prototype.matrix = function(params){
    this.vm.matrix(params)
    return this
}
taroAnimation.prototype.matrix3d = function(params){
    this.vm.matrix3d(params)
    return this
}
taroAnimation.prototype.opacity=function(params){
    this.vm.opacity(params)
    return this
}
taroAnimation.prototype.backgroundColor = function(params){
    this.vm.backgroundColor(params)
    return this
}
taroAnimation.prototype.width = function(params){
    this.vm.width(params)
    return this
}
taroAnimation.prototype.height = function(params){
    this.vm.height(params)
    return this
}


//预设置效果
taroAnimation.prototype.pulse = function (a, b, c) {
    if (!a) { a = 1.2 };
    if (!b && !c) { b = c = a };
    this.vm.scale3d(a, b, c).step({ duration: 400 });
    this.vm.scale3d(1, 1, 1).step();
    return this.vm.export();
}
    taroAnimation.prototype.flash = function () {
        this.vm.opacity(0).step({ duration: 100 });
        this.vm.opacity(1).step({ duration: 100 });
        this.vm.opacity(0.1).step({ duration: 100 });
        this.vm.opacity(1).step({ duration: 100 });
        return this.vm.export();
    }
    taroAnimation.prototype.shake = function () {
        this.vm.translate3d(-10, 0, 0).step({ duration: 50 });
        this.vm.translate3d(0, 0, 0).step({ duration: 50 });
        this.vm.translate3d(10, 0, 0).step({ duration: 50 });
        this.vm.translate3d(0, 0, 0).step({ duration: 50 });
        this.vm.translate3d(-10, 0, 0).step({ duration: 50 });
        this.vm.translate3d(0, 0, 0).step({ duration: 50 });
        this.vm.translate3d(10, 0, 0).step({ duration: 50 });
        this.vm.translate3d(0, 0, 0).step({ duration: 50 });
        this.vm.translate3d(-10, 0, 0).step({ duration: 50 });
        this.vm.translate3d(0, 0, 0).step({ duration: 50 });
        this.vm.translate3d(10, 0, 0).step({ duration: 50 });
        this.vm.translate3d(0, 0, 0).step({ duration: 50 });
        return this.vm.export();
    }
    taroAnimation.prototype.rubberBand = function () {
        this.vm.scale3d(1.25, 0.75, 1).step({ duration: 70 });
        this.vm.scale3d(0.75, 1.25, 1).step({ duration: 70 });
        this.vm.scale3d(1.15, 0.85, 1).step({ duration: 70 });
        this.vm.scale3d(0.95, 1.05, 1).step({ duration: 70 });
        this.vm.scale3d(1.05, 0.95, 1).step({ duration: 70 });
        this.vm.scale3d(1, 1, 1).step({ duration: 70 });
        return this.vm.export();
    }
    taroAnimation.prototype.swing = function () {
        this.vm.rotate3d(0, 0, 1, 15).step({ duration: 300, transformOrigin: "50% 0 0" });
        this.vm.rotate3d(0, 0, 1, -10).step({ duration: 300, transformOrigin: "50% 0 0" });
        this.vm.rotate3d(0, 0, 1, 5).step({ duration: 300, transformOrigin: "50% 0 0" });
        this.vm.rotate3d(0, 0, 1, -5).step({ duration: 300, transformOrigin: "50% 0 0" });
        this.vm.rotate3d(0, 0, 1, 0).step({ duration: 300, transformOrigin: "50% 0 0" });
        return this.vm.export();
    }
    taroAnimation.prototype.toda = function () {
        this.vm.scale3d(0.9, 0.9, 0.9).rotate3d(0, 0, 1, -3).step({ duration: 100 });
        this.vm.scale3d(1.1, 1.1, 1.1).rotate3d(0, 0, 1, 3).step({ duration: 100 });
        this.vm.scale3d(1.1, 1.1, 1.1).rotate3d(0, 0, 1, -3).step({ duration: 100 });
        this.vm.scale3d(1, 1, 1).rotate3d(0, 0, 0, 0).step({ duration: 100 });
        return this.vm.export();
    }
    taroAnimation.prototype.wobble = function () {
        this.vm.translate3d(-25, 0, 0).rotate3d(0, 0, 1, -5).step({ duration: 100 });
        this.vm.translate3d(20, 0, 0).rotate3d(0, 0, 1, 3).step({ duration: 100 });
        this.vm.translate3d(-15, 0, 0).rotate3d(0, 0, 1, -3).step({ duration: 100 });
        this.vm.translate3d(10, 0, 0).rotate3d(0, 0, 1, 2).step({ duration: 100 });
        this.vm.translate3d(-5, 0, 0).rotate3d(0, 0, 1, -1).step({ duration: 100 });
        this.vm.translate3d(0, 0, 0).rotate3d(0, 0, 0, 0).step({ duration: 100 });
        return this.vm.export();
    }
    taroAnimation.prototype.jello = function () {
        this.vm.skewX(-12.5).skewY(12.5).step({ duration: 50 });
        this.vm.skewX(6.25).skewY(6.25).step({ duration: 50 });
        this.vm.skewX(-3.12).skewY(-3.12).step({ duration: 50 });
        this.vm.skewX(1.56).skewY(1.56).step({ duration: 50 });
        this.vm.skewX(-0.78).skewY(-0.78).step({ duration: 50 });
        this.vm.skewX(0.39).skewY(0.39).step({ duration: 50 });
        this.vm.skewX(-0.19).skewY(-0.19).step({ duration: 50 });
        this.vm.skewX(0).skewY(0);
        return this.vm.export();
    }
    taroAnimation.prototype.heartBeat = function () {
        this.vm.scale(1.3).step({ duration: 200 });
        this.vm.scale(1).step({ duration: 200 });
        this.vm.scale(1.3).step({ duration: 200 });
        this.vm.scale(1).step({ duration: 200 });
        return this.vm.export()
    }
    taroAnimation.prototype.bounceIn = function () {
        this.vm.opacity(0).scale3d(0.3, 0.3, 0.3).step({ duration: 100 });
        this.vm.opacity(1).scale3d(1, 1, 1).step({ duration: 50 });
        this.vm.scale3d(1.4, 1.4, 1.4).step({ duration: 50 });
        this.vm.scale3d(1, 1, 1).step({ duration: 50 });
        this.vm.scale3d(0.6, 0.6, 0.6).step({ duration: 50 });
        this.vm.scale3d(1.2, 1.2, 1.2).step({ duration: 50 });
        this.vm.scale3d(1, 1, 1).step({ duration: 50 });
        this.vm.scale3d(0.8, 0.8, 0.8).step({ duration: 50 });
        this.vm.scale3d(1, 1, 1).step({ duration: 50 });
        this.vm.scale3d(1.2, 1.2, 1.2).step({ duration: 50 });
        this.vm.scale3d(1, 1, 1).step({ duration: 50 });
        return this.vm.export()
    }
    taroAnimation.prototype.bounceInLeft = function () {
        this.vm.opacity(0).translate3d(-3000, 0, 0).step({ duration: 50, timingFunction: "step-start" });
        this.vm.opacity(1).translate3d(0, 0, 0).step({ duration: 100 });
        this.vm.opacity(1).translate3d(25, 0, 0).step({ duration: 100 });
        this.vm.opacity(1).translate3d(0, 0, 0).step({ duration: 100 });
        this.vm.opacity(1).translate3d(-10, 0, 0).step({ duration: 100 });
        this.vm.opacity(1).translate3d(0, 0, 0).step({ duration: 100 });
        this.vm.opacity(1).translate3d(5, 0, 0).step({ duration: 100 });
        this.vm.opacity(1).translate3d(0, 0, 0).step({ duration: 100 });
        return this.vm.export()
    }
    taroAnimation.prototype.fadeIn = function () {
        this.vm.opacity(0).step({ duration: 200, timingFunction: "step-start" });
        this.vm.opacity(1).step({ duration: 200 })
        return this.vm.export()
    }
    taroAnimation.prototype.fadeOut = function () {
        this.vm.opacity(1).step({ duration: 200, timingFunction: "step-start" });
        this.vm.opacity(0).step({ duration: 200})
        return this.vm.export()
    }
export default taroAnimation;
