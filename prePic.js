// prePic.js 用于预览图片的js 文件
const ieVersion =  Number(document.documentMode);

// 设置 style
function setStyle(element, styleName, value) {
    if (!element || !styleName) return;
    if (typeof styleName === 'object') {
        for (var prop in styleName) {
            setStyle(element, prop, styleName[prop]);
        }
    } else {
        if (styleName === 'opacity') {
            element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
        } else {
            element.style[styleName] = value;
        }
    }
}
// 新增 clsss
function addClass(el, cls) {
    if (!el) return;
    let curClass = el.className;
    let classes = (cls || '').split(' ');
    for (let i = 0; i < classes.length; i ++) {
        let clsName = classes[i];
        if (!clsName) continue;
        if (el.classList) {
            el.classList.add(clsName);
        } else if (!hasClass(el, clsName)) {
            curClass += ' ' + clsName;
        }
    }
    if (!el.classList) {
        el.className = curClass;
    }
}
// 判断 class
function hasClass(el, cls) {
    if (!el || !cls) return;
    if (el.classList) {
        return el.classList.contains(cls);
    } else {
        return el.className.split(' ').indexOf(cls) > -1;
    }
}
// 移除 class
/**
 * 
 * @param {Object} el element to remove classname
 * @param {String} cls className
 */
function removeClass(el, cls) {
    if (!el || !cls) return;
    let classes = cls.split(' ');
    let curClass = ' ' + className + ' ';
    for (let i = 0; i < classes.length; i ++) {
        let clsName = classes[i];
        if (!clsName) continue;
        if (el.classList) {
            el.classList.remove(clsName);
        } else if (hasClass(el, clsName)) {
            curClass = curClass.replace(' ' + clsName + ' ', ' ');
        }
    }
    if (!el.classList) {
        el.className = trim(curClass);
    }
}
// 切换 class
/**
 * 
 * @param {Object} el elelment to toggleClass
 * @param {String} cls className
 */
function toggleClass(el, cls) {
    if (!el || !cls) return;
    hasClass(el, cls) ? addClass(el, cls) : removeClass(el, cls);
}

// 添加监听函数
/**
 * @param {Object} element 需要监听的元素
 * @param {String} event 监听事件
 * @param {function} handler 监听回调函数
 */
const on = (function () {
    return function (element, event, handler, isBubble = false) {
        if (element, event, handler) {
            if (document.addEventListener) {
                element.addEventListener(event, handler, isBubble);
            } else {
                element.attachEvent('on' + event, handler);
            }
        }
    }
})();

// 获取到元素样式
const getStyle = ieVersion < 9 ? function(element, styleName) {
    if (!element || !styleName) return null;
    if (styleName === 'float') {
      styleName = 'styleFloat';
    }
    try {
      switch (styleName) {
        case 'opacity':
          try {
            return element.filters.item('alpha').opacity / 100;
          } catch (e) {
            return 1.0;
          }
        default:
          return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null);
      }
    } catch (e) {
      return element.style[styleName];
    }
  } : function(element, styleName) {
    if (!element || !styleName) return null;
    if (styleName === 'float') {
      styleName = 'cssFloat';
    }
    try {
      var computed = document.defaultView.getComputedStyle(element, '');
      return element.style[styleName] || computed ? computed[styleName] : null;
    } catch (e) {
      return element.style[styleName];
    }
  };

// 获取到元素位置
function getPagePos(el) {
    let curEle = el;
    let pageX = 0;
    let pageY = 0;
    while (curEle) {
        pageX += curEle.offsetLeft;
        pageY += curEle.offsetTop;
        curEle = curEle.offsetParent;
    }
    return {
        pageX, pageY
    }
}


class Pp {
    constructor (dom, innerSegConfig) {
        const defaultInnerSegConfig = {
            width: 200,
            height: 200,
            backgroundColor: "red",
            position: "fixed",
            opacity: "50%"
        };
        this.dom = dom;
        this.originPicture = this.dom.getElementsByTagName("img")[0];
        this.originPicSrc = this.originPicture.getAttribute("src");
        this.mouseMoveY = 0;
        this.mouseMoveX = 0;
        this.innerSeg = null;
        this.ppContent = null;
        this.ppPicture = null;
        this.innerSegConfig = Object.assign(defaultInnerSegConfig, innerSegConfig);
        this.zoomRatioX = 0; // x 方向的放大系数
        this.zoomRatioY = 0; // y 方向的放大系数
        this.domPos = {
            pageX: 0,
            pageY: 0
        };
        this.domSty = {};
    }
    init (){
        this.listenMouseMove();
        this.initStyle();
    }
    // 初始元素样式
    initStyle() {
        setStyle(this.dom, 'cursor', 'all-scroll');
        this.domPos.pageX = getPagePos(this.dom).pageX;
        this.domPos.pageY = getPagePos(this.dom).pageY;
        this.domSty.width = getStyle(this.dom, "width");
        this.domSty.height = getStyle(this.dom, "height");
    }
    // 计算放大图像比例
    getZoomRadio() {
        const preImg = document.getElementsByClassName("pp-preview-picture")[0];
        this.zoomRatioX = parseInt(getStyle(this.ppPicture, "width")) / this.innerSegConfig.width;
        this.zoomRatioY = parseInt(getStyle(this.ppPicture, "height")) / this.innerSegConfig.height;
    }
    // 添加预览图dom元素
    addBoxDom() {
        const that = this;
        this.innerSeg = document.createElement("div");
        const previewContent = document.createElement("div");
        const preImgCon = document.createElement("div");
        const preImg = document.createElement("img");
        addClass(this.innerSeg, "innerSegBox");
        for (let sty in this.innerSegConfig) {
            if (["width", "height"].includes(sty)) {
                setStyle(this.innerSeg, sty, this.innerSegConfig[sty] + 'px');
            } else {
                setStyle(this.innerSeg, sty, this.innerSegConfig[sty]);
            }
        }
        setStyle(previewContent, "width", this.domSty.width);
        setStyle(previewContent, "height", this.domSty.height);
        setStyle(previewContent, "left", (this.domPos.pageX + parseInt(this.domSty.width)) + "px");
        setStyle(previewContent, "top", (this.domPos.pageY) + "px");
        addClass(preImgCon, "pp-preview-content");
        addClass(previewContent, "pp-preview-wrapper");
        addClass(preImg, "pp-preview-picture");
        preImg.setAttribute("src", this.originPicSrc);
        this.dom.appendChild(this.innerSeg);
        // preImgCon.appendChild(preImg);
        previewContent.appendChild(preImgCon);
        document.body.appendChild(previewContent);
        this.ppContent = previewContent;
        this.ppPicture = preImgCon;
        this.getZoomRadio();
        // 鼠标移出内部块时隐藏 
        on(this.innerSeg, "mouseout", function () {
            that.togBlockShow(false);
        });
    }
    // 切换显示块状态
    togBlockShow (isShow) {
        if (typeof isShow !== "boolean") {
            return;
        }
        if (this.innerSeg && this.ppContent) {
            const displayStyle = isShow ? "block" : "none";
            setStyle(this.innerSeg, "display", displayStyle);
        } else {
            this.addBoxDom();
        }
    }
    // 监听鼠标移动
    listenMouseMove() {
        const that = this;
        const { pageX: domPageX, pageY: domPageY } = this.domPos;
        const getMouseSite = (e) => {
            const event = e || window.e;
            const mouseDomDistanceY = event.clientY - domPageY - (this.innerSegConfig.height / 2);
            const mouseDomDistanceX = event.clientX - domPageX - (this.innerSegConfig.width / 2);
            const isXOverflowRig = event.clientX + (this.innerSegConfig.width / 2) > domPageX + parseInt(this.domSty.width);
            const isYOverflowTop = event.clientY - (this.innerSegConfig.height / 2) < domPageY;
            const isYOverflowBot = event.clientY + (this.innerSegConfig.height / 2) > domPageY + parseInt(this.domSty.height);
            const innerSegMaxLeft = domPageX + parseInt(this.domSty.width) - this.innerSegConfig.width;
            const innerSegMinLeft = domPageX;
            const innerSegMinTop =  domPageY;
            const innerSegMaxTop =  domPageY + (parseInt(this.domSty.height) - this.innerSegConfig.height);
            const isXOverflowLef = event.clientX - this.innerSegConfig.width / 2 < domPageX;
            const isYOverflow = mouseDomDistanceY + this.innerSeg.offsetHeight - this.dom.offsetHeight > 0;
            const previewPic = document.getElementsByClassName("pp-preview-picture")[0];
            // 限制移动范围
            if (isXOverflowRig) {
                setStyle(this.innerSeg, "left", innerSegMaxLeft  + "px");
                return;
            }
            if (isXOverflowLef) {
                setStyle(this.innerSeg, "left", innerSegMinLeft + "px");
                return;
            }
            if (isYOverflowTop) {
                setStyle(this.innerSeg, "top", innerSegMinTop + "px");
                return;
            }
            if (isYOverflowBot) {
                setStyle(this.innerSeg, "top", innerSegMaxTop + "px");
                return;
            }
            setStyle(this.ppPicture, "backgroundPositionY", `${-mouseDomDistanceY * this.zoomRatioY}px`);
            setStyle(this.ppPicture, "backgroundPositionX", `${-mouseDomDistanceX * this.zoomRatioX}px`);
            setStyle(this.innerSeg, "left", event.clientX - this.innerSegConfig.width / 2 + 'px');
            setStyle(this.innerSeg, 'top', event.clientY - this.innerSegConfig.height / 2 + 'px');
            
        };
        on(this.dom, 'mousemove', getMouseSite);
        on(this.dom, 'mouseenter', function () { that.togBlockShow(true); });
    }
}
