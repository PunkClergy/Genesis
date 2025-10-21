/**
 * 授权类型
 */
var SCOPE_TYPE = {
    SCOPE_LOCATION: 'scope.userLocation',
    SCOPE_CAMERA: 'scope.camera',
    SCOPE_BLUETOOTH: 'scope.bluetooth'
};

/**
 * 显示吐司
 */
function showToast(msg) {
    uni.showToast({
        title: msg,
        icon: 'none'
    });
}

/**
 * 显示'success'图标的吐司
 */
function showSucessToast(msg) {
    uni.showToast({
        title: msg,
        icon: 'success'
    });
}

/**
 * 显示加载框
 */
function showLoading(msg) {
    uni.showLoading({
        title: msg,
        mask: true
    });
}

/**
 * 关闭加载框
 */
function hideLoading() {
    uni.hideLoading();
}

/**
 * 显示确定取消对话框
 */
function showModal(msg, showCancel, behavior) {
    uni.showModal({
        title: '提示',
        content: msg,
        showCancel: showCancel,
        success: function (res) {
            if (res.confirm) {
                behavior(true);
            } else if (res.cancel) {
                behavior(false);
            }
        }
    });
}

/**
 * 获取系统信息
 */
function getSystemInfo(systemInfo) {
    uni.getSystemInfo({
        success: function (res) {
            systemInfo(res);
        }
    });
}
function getSystemInfoComplete(systemInfo, complete) {
    uni.getSystemInfo({
        success: function (res) {
            systemInfo(res);
        },
        complete: function () {
            complete();
        }
    });
}

/**
 * 获取腾讯地图坐标
 */
function getWXLocation(location) {
    uni.getLocation({
        type: 'gcj02',
        //返回可以用于wx.openLocation的经纬度
        success: function (res) {
            location(res);
        },
        fail: function (res) {
            location(res);
        }
    });
}

/**
 * 是否授权
 */
function getAuthState(scope, auth) {
    uni.getSetting({
        success(res) {
            if (!res.authSetting[scope]) {
                //未授权
                auth(false);
            } else {
                //已授权
                auth(true);
            }
        }
    });
}

/**
 * 开始授权
 */
function authorize(scope, authorize) {
    uni.authorize({
        scope: scope,
        success() {
            //授权成功
            authorize(true);
        },
        fail() {
            //授权失败
            authorize(false);
        }
    });
}

/**
 * get请求
 */
function byGet(url, param, result) {
    var header = {};
    header['content-type'] = 'application/x-www-form-urlencoded';
    var userInfo = getApp().globalData.data.userInfo;
    console.log(getApp());
    if (!isEmpty(userInfo)) {
        header['username'] = userInfo.username;
        header['token'] = userInfo.token;
        header['timestamp'] = Date.parse(new Date());
    }
    printLog(url, param);
    param.version = getApp().globalData.data.version;
    return uni.request({
        url: url,
        data: param,
        header,
        success: function (res) {
            result(res);
            log(res.data);
        },
        fail: function (res) {
            result(res);
        }
    });
}
function printLog(url, param) {
    log(url);
    log(param);
}

/**
 * post请求
 */
function byPost(url, param, result) {
    //添加公共参数
    //param.version = getApp().data.version;
    var header = {};
    header['content-type'] = 'application/x-www-form-urlencoded';
    var userInfo = getApp().globalData.data.userInfo;
    console.log(getApp());
    if (!isEmpty(userInfo)) {
        header['username'] = userInfo.username;
        header['token'] = userInfo.token;
        header['timestamp'] = Date.parse(new Date());
    }
    printLog(url, param);
    return uni.request({
        timeout: 20000,
        url: url,
        //仅为示例，并非真实的接口地址
        data: param,
        header: header,
        method: 'POST',
        success: function (res) {
            result(res);
            log(res.data);
        },
        fail: function (res) {
            log(res);
            result(false);
        }
    });
}
function byPostJson(url, param, result) {
    //添加公共参数
    var header = {};
    header['content-type'] = 'application/json';
    var userInfo = getApp().globalData.data.userInfo;
    if (!isEmpty(userInfo)) {
        header['username'] = userInfo.username;
        header['token'] = userInfo.token;
        header['timestamp'] = Date.parse(new Date());
    }
    printLog(url, param);
    return uni.request({
        timeout: 20000,
        url: url,
        //仅为示例，并非真实的接口地址
        data: param,
        header: header,
        method: 'POST',
        success: function (res) {
            result(res);
            log(res.data);
        },
        fail: function (res) {
            log(res);
            result(false);
        }
    });
}

/**
 * 获取本地数据,异步
 */
function getStorage(key, data) {
    if (key) {
        uni.getStorage({
            key: key,
            success: function (res) {
                data(res.data);
            },
            fail: function (res) {
                data(false);
            }
        });
    } else {
        data('');
    }
}

/**
 * 保存本地数据,异步
 */
function setStorage(key, value, result) {
    uni.setStorage({
        key: key,
        data: value,
        success() {
            result(true);
        },
        fail() {
            result(false);
        }
    });
}

/**
 * 保存本地数据，同步
 */

/**
 * 清缓存
 */
function clearStorage() {
    uni.clearStorage();
}

/**
 * 获取网络状态
 */
function getNetworkType(getNetworkType) {
    uni.getNetworkType({
        success: function (res) {
            // 返回网络类型, 有效值：
            // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
            // var networkType = res.networkType
            getNetworkType(res.networkType != 'none');
        },
        fail: function (res) {
            getNetworkType(true);
        }
    });
}

/**
 * 监听网络状态变化
 */
function onNetworkStatusChange(onNetworkStatusChange) {
    uni.onNetworkStatusChange(function (res) {
        // console.log(res.isConnected);
        // console.log(res.networkType);
        onNetworkStatusChange(res);
    });
}

/**
 * 打开地图导航
 */
function openLocation(latitude, longitude, scale) {
    uni.openLocation({
        latitude: latitude,
        longitude: longitude,
        scale: scale ? scale : 18
    });
}
function isEmpty(obj) {
    if (typeof obj == 'undefined' || obj == null || obj == '' || !obj) {
        return true;
    } else {
        return false;
    }
}
function isNumber(obj) {
    var zz = /^[0-9]*$/;
    if (!zz.test(obj)) {
        return false;
    } else {
        return true;
    }
}

/**
 * 路由，跳转下一页面
 */
function navigateTo(url) {
    if (!isEmpty(url)) {
        uni.navigateTo({
            url: url
        });
    }
}

/**
 * 上传类型
 */
var SHOW_TYPE = {
    IDCARD_TYPE: 1,
    //只上传身份证
    DRIVINGCARD_TYPE: 2,
    //只上传驾驶证
    ALL_TYPE: 3 //全部都上传
};

/**
 * 选择照片
 */
function chooseImageDefault(result) {
    uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
            result(res);
        },
        fail(res) {
            result(false);
        }
    });
}

/**
 * 获取图片信息
 */
function getImageInfo(src, result) {
    uni.getImageInfo({
        src: src,
        success: function (res) {
            result(res);
        },
        fail: function () {
            result(false);
        }
    });
}

/**
 * 拍照
 */
function takePhoto(ctx, result) {
    ctx.takePhoto({
        quality: 'high',
        success: function (res) {
            result(res);
        },
        fail: function () {
            result(false);
        }
    });
}

/**
 * 上传文件
 * url：上传文件的url
 * path:文件的路径
 * name:文件对应的 key
 * param:参数
 */
function uploadFile(url, path, param, result) {
    printLog(url, param);
    return uni.uploadFile({
        url: url,
        filePath: path,
        name: 'Filedata',
        header: {
            'content-type': 'multipart/form-data'
        },
        formData: param,
        success(res) {
            log(res);
            result(res);
        },
        fail: function () {
            result(false);
        }
    });
}
function uploadFile2(url, fileName, path, param, result) {
    if (isEmpty(path)) {
        byPost(url, param, result);
    } else {
        var header = {};
        header['content-type'] = 'multipart/form-data';
        var userInfo = getApp().globalData.data.userInfo;
        if (!isEmpty(userInfo)) {
            header['username'] = userInfo.username;
            header['token'] = userInfo.token;
            header['timestamp'] = Date.parse(new Date());
        }
        printLog(url, param);
        return uni.uploadFile({
            url: url,
            filePath: path,
            name: fileName,
            header: header,
            formData: param,
            success(res) {
                log(res);
                result(res);
            },
            fail: function () {
                result(false);
                console.log('上传发生错误');
            }
        });
    }
}
function jsDateFormatter(date) {
    var seperator1 = '-';
    var seperator2 = ':';
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = '0' + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + ' ' + date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
    return currentdate;
}

/**
 * 打印日志
 */
function log(obj) {
    if (getApp().globalData.data.isDebug) {
        console.log(obj);
    }
}

/**
 * 是否已登录
 */
function isLogin() {
    var userInfo = getApp().globalData.data.userInfo;
    if (isEmpty(userInfo)) {
        return false;
    } else {
        return true;
    }
}
function byPostFormData(url, contentType, data, result) {
    //添加公共参数
    var header = {};
    header['content-type'] = contentType;
    var userInfo = getApp().globalData.data.userInfo;
    if (!isEmpty(userInfo)) {
        header['username'] = userInfo.username;
        header['token'] = userInfo.token;
        header['timestamp'] = Date.parse(new Date());
    }
    printLog(url, data);
    return uni.request({
        timeout: 20000,
        url: url,
        //仅为示例，并非真实的接口地址
        data: data,
        header: header,
        method: 'POST',
        success: function (res) {
            result(res);
            log(res.data);
        },
        fail: function (res) {
            log(res);
            result(false);
        }
    });
}
export default{
    byPostFormData,
    showToast: showToast,
    showLoading: showLoading,
    hideLoading: hideLoading,
    showSucessToast: showSucessToast,
    showModal: showModal,
    getSystemInfo: getSystemInfo,
    getSystemInfoComplete: getSystemInfoComplete,
    getWXLocation: getWXLocation,
    byGet: byGet,
    byPost: byPost,
    byPostJson: byPostJson,
    SCOPE_TYPE: SCOPE_TYPE,
    getAuthState: getAuthState,
    authorize: authorize,
    getStorage: getStorage,
    setStorage: setStorage,
    clearStorage: clearStorage,
    getNetworkType: getNetworkType,
    onNetworkStatusChange: onNetworkStatusChange,
    openLocation: openLocation,
    isEmpty: isEmpty,
    isNumber: isNumber,
    navigateTo: navigateTo,
    SHOW_TYPE: SHOW_TYPE,
    chooseImageDefault: chooseImageDefault,
    takePhoto: takePhoto,
    getImageInfo: getImageInfo,
    uploadFile: uploadFile,
    uploadFile2: uploadFile2,
    jsDateFormatter: jsDateFormatter,
    log: log,
    isLogin: isLogin
};
