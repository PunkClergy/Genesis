"use strict";
const common_vendor = require("../common/vendor.js");
var SCOPE_TYPE = {
  SCOPE_LOCATION: "scope.userLocation",
  SCOPE_CAMERA: "scope.camera",
  SCOPE_BLUETOOTH: "scope.bluetooth"
};
function showToast(msg) {
  common_vendor.index.showToast({
    title: msg,
    icon: "none"
  });
}
function showSucessToast(msg) {
  common_vendor.index.showToast({
    title: msg,
    icon: "success"
  });
}
function showLoading(msg) {
  common_vendor.index.showLoading({
    title: msg,
    mask: true
  });
}
function hideLoading() {
  common_vendor.index.hideLoading();
}
function showModal(msg, showCancel, behavior) {
  common_vendor.index.showModal({
    title: "提示",
    content: msg,
    showCancel,
    success: function(res) {
      if (res.confirm) {
        behavior(true);
      } else if (res.cancel) {
        behavior(false);
      }
    }
  });
}
function getSystemInfo(systemInfo) {
  common_vendor.index.getSystemInfo({
    success: function(res) {
      systemInfo(res);
    }
  });
}
function getSystemInfoComplete(systemInfo, complete) {
  common_vendor.index.getSystemInfo({
    success: function(res) {
      systemInfo(res);
    },
    complete: function() {
      complete();
    }
  });
}
function getWXLocation(location) {
  common_vendor.index.getLocation({
    type: "gcj02",
    //返回可以用于wx.openLocation的经纬度
    success: function(res) {
      location(res);
    },
    fail: function(res) {
      location(res);
    }
  });
}
function getAuthState(scope, auth) {
  common_vendor.index.getSetting({
    success(res) {
      if (!res.authSetting[scope]) {
        auth(false);
      } else {
        auth(true);
      }
    }
  });
}
function authorize(scope, authorize2) {
  common_vendor.index.authorize({
    scope,
    success() {
      authorize2(true);
    },
    fail() {
      authorize2(false);
    }
  });
}
function byGet(url, param, result) {
  var header = {};
  header["content-type"] = "application/x-www-form-urlencoded";
  var userInfo = getApp().globalData.data.userInfo;
  common_vendor.index.__f__("log", "at utils/app-util.js:143", getApp());
  if (!isEmpty(userInfo)) {
    header["username"] = userInfo.username;
    header["token"] = userInfo.token;
    header["timestamp"] = Date.parse(/* @__PURE__ */ new Date());
  }
  printLog(url, param);
  param.version = getApp().globalData.data.version;
  return common_vendor.index.request({
    url,
    data: param,
    header,
    success: function(res) {
      result(res);
      log(res.data);
    },
    fail: function(res) {
      result(res);
    }
  });
}
function printLog(url, param) {
  log(url);
  log(param);
}
function byPost(url, param, result) {
  var header = {};
  header["content-type"] = "application/x-www-form-urlencoded";
  var userInfo = getApp().globalData.data.userInfo;
  common_vendor.index.__f__("log", "at utils/app-util.js:178", getApp());
  if (!isEmpty(userInfo)) {
    header["username"] = userInfo.username;
    header["token"] = userInfo.token;
    header["timestamp"] = Date.parse(/* @__PURE__ */ new Date());
  }
  printLog(url, param);
  return common_vendor.index.request({
    timeout: 2e4,
    url,
    //仅为示例，并非真实的接口地址
    data: param,
    header,
    method: "POST",
    success: function(res) {
      result(res);
      log(res.data);
    },
    fail: function(res) {
      log(res);
      result(false);
    }
  });
}
function byPostJson(url, param, result) {
  var header = {};
  header["content-type"] = "application/json";
  var userInfo = getApp().globalData.data.userInfo;
  if (!isEmpty(userInfo)) {
    header["username"] = userInfo.username;
    header["token"] = userInfo.token;
    header["timestamp"] = Date.parse(/* @__PURE__ */ new Date());
  }
  printLog(url, param);
  return common_vendor.index.request({
    timeout: 2e4,
    url,
    //仅为示例，并非真实的接口地址
    data: param,
    header,
    method: "POST",
    success: function(res) {
      result(res);
      log(res.data);
    },
    fail: function(res) {
      log(res);
      result(false);
    }
  });
}
function getStorage(key, data) {
  if (key) {
    common_vendor.index.getStorage({
      key,
      success: function(res) {
        data(res.data);
      },
      fail: function(res) {
        data(false);
      }
    });
  } else {
    data("");
  }
}
function setStorage(key, value, result) {
  common_vendor.index.setStorage({
    key,
    data: value,
    success() {
      result(true);
    },
    fail() {
      result(false);
    }
  });
}
function clearStorage() {
  common_vendor.index.clearStorage();
}
function getNetworkType(getNetworkType2) {
  common_vendor.index.getNetworkType({
    success: function(res) {
      getNetworkType2(res.networkType != "none");
    },
    fail: function(res) {
      getNetworkType2(true);
    }
  });
}
function onNetworkStatusChange(onNetworkStatusChange2) {
  common_vendor.index.onNetworkStatusChange(function(res) {
    onNetworkStatusChange2(res);
  });
}
function openLocation(latitude, longitude, scale) {
  common_vendor.index.openLocation({
    latitude,
    longitude,
    scale: scale ? scale : 18
  });
}
function isEmpty(obj) {
  if (typeof obj == "undefined" || obj == null || obj == "" || !obj) {
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
function navigateTo(url) {
  if (!isEmpty(url)) {
    common_vendor.index.navigateTo({
      url
    });
  }
}
var SHOW_TYPE = {
  IDCARD_TYPE: 1,
  //只上传身份证
  DRIVINGCARD_TYPE: 2,
  //只上传驾驶证
  ALL_TYPE: 3
  //全部都上传
};
function chooseImageDefault(result) {
  common_vendor.index.chooseImage({
    count: 1,
    sizeType: ["original", "compressed"],
    sourceType: ["album", "camera"],
    success(res) {
      result(res);
    },
    fail(res) {
      result(false);
    }
  });
}
function getImageInfo(src, result) {
  common_vendor.index.getImageInfo({
    src,
    success: function(res) {
      result(res);
    },
    fail: function() {
      result(false);
    }
  });
}
function takePhoto(ctx, result) {
  ctx.takePhoto({
    quality: "high",
    success: function(res) {
      result(res);
    },
    fail: function() {
      result(false);
    }
  });
}
function uploadFile(url, path, param, result) {
  printLog(url, param);
  return common_vendor.index.uploadFile({
    url,
    filePath: path,
    name: "Filedata",
    header: {
      "content-type": "multipart/form-data"
    },
    formData: param,
    success(res) {
      log(res);
      result(res);
    },
    fail: function() {
      result(false);
    }
  });
}
function uploadFile2(url, fileName, path, param, result) {
  if (isEmpty(path)) {
    byPost(url, param, result);
  } else {
    var header = {};
    header["content-type"] = "multipart/form-data";
    var userInfo = getApp().globalData.data.userInfo;
    if (!isEmpty(userInfo)) {
      header["username"] = userInfo.username;
      header["token"] = userInfo.token;
      header["timestamp"] = Date.parse(/* @__PURE__ */ new Date());
    }
    printLog(url, param);
    return common_vendor.index.uploadFile({
      url,
      filePath: path,
      name: fileName,
      header,
      formData: param,
      success(res) {
        log(res);
        result(res);
      },
      fail: function() {
        result(false);
        common_vendor.index.__f__("log", "at utils/app-util.js:451", "上传发生错误");
      }
    });
  }
}
function jsDateFormatter(date) {
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
  return currentdate;
}
function log(obj) {
  if (getApp().globalData.data.isDebug) {
    common_vendor.index.__f__("log", "at utils/app-util.js:476", obj);
  }
}
function isLogin() {
  var userInfo = getApp().globalData.data.userInfo;
  if (isEmpty(userInfo)) {
    return false;
  } else {
    return true;
  }
}
function byPostFormData(url, contentType, data, result) {
  var header = {};
  header["content-type"] = contentType;
  var userInfo = getApp().globalData.data.userInfo;
  if (!isEmpty(userInfo)) {
    header["username"] = userInfo.username;
    header["token"] = userInfo.token;
    header["timestamp"] = Date.parse(/* @__PURE__ */ new Date());
  }
  printLog(url, data);
  return common_vendor.index.request({
    timeout: 2e4,
    url,
    //仅为示例，并非真实的接口地址
    data,
    header,
    method: "POST",
    success: function(res) {
      result(res);
      log(res.data);
    },
    fail: function(res) {
      log(res);
      result(false);
    }
  });
}
const appUtil = {
  byPostFormData,
  showToast,
  showLoading,
  hideLoading,
  showSucessToast,
  showModal,
  getSystemInfo,
  getSystemInfoComplete,
  getWXLocation,
  byGet,
  byPost,
  byPostJson,
  SCOPE_TYPE,
  getAuthState,
  authorize,
  getStorage,
  setStorage,
  clearStorage,
  getNetworkType,
  onNetworkStatusChange,
  openLocation,
  isEmpty,
  isNumber,
  navigateTo,
  SHOW_TYPE,
  chooseImageDefault,
  takePhoto,
  getImageInfo,
  uploadFile,
  uploadFile2,
  jsDateFormatter,
  log,
  isLogin
};
exports.appUtil = appUtil;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/app-util.js.map
