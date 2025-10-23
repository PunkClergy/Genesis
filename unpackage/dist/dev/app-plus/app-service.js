if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const info_screen = () => {
    return new Promise((resolve, reject) => {
      uni.getSystemInfo({
        success: function(res) {
          formatAppLog("log", "at utils/scheme/screen.js:10", "屏幕可用高度:", res.windowHeight);
          resolve(res);
        },
        fail: function(err) {
          formatAppLog("error", "at utils/scheme/screen.js:14", "获取系统信息失败", err);
          reject(err);
        }
      });
    });
  };
  var SCOPE_TYPE = {
    SCOPE_LOCATION: "scope.userLocation",
    SCOPE_CAMERA: "scope.camera",
    SCOPE_BLUETOOTH: "scope.bluetooth"
  };
  function showToast(msg) {
    uni.showToast({
      title: msg,
      icon: "none"
    });
  }
  function showSucessToast(msg) {
    uni.showToast({
      title: msg,
      icon: "success"
    });
  }
  function showLoading(msg) {
    uni.showLoading({
      title: msg,
      mask: true
    });
  }
  function hideLoading() {
    uni.hideLoading();
  }
  function showModal(msg, showCancel, behavior) {
    uni.showModal({
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
    uni.getSystemInfo({
      success: function(res) {
        systemInfo(res);
      }
    });
  }
  function getSystemInfoComplete(systemInfo, complete) {
    uni.getSystemInfo({
      success: function(res) {
        systemInfo(res);
      },
      complete: function() {
        complete();
      }
    });
  }
  function getWXLocation(location) {
    uni.getLocation({
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
    uni.getSetting({
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
    uni.authorize({
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
    formatAppLog("log", "at utils/app-util.js:143", getApp());
    if (!isEmpty(userInfo)) {
      header["username"] = userInfo.username;
      header["token"] = userInfo.token;
      header["timestamp"] = Date.parse(/* @__PURE__ */ new Date());
    }
    printLog(url, param);
    param.version = getApp().globalData.data.version;
    return uni.request({
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
    formatAppLog("log", "at utils/app-util.js:178", getApp());
    if (!isEmpty(userInfo)) {
      header["username"] = userInfo.username;
      header["token"] = userInfo.token;
      header["timestamp"] = Date.parse(/* @__PURE__ */ new Date());
    }
    printLog(url, param);
    return uni.request({
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
    return uni.request({
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
      uni.getStorage({
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
    uni.setStorage({
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
    uni.clearStorage();
  }
  function getNetworkType(getNetworkType2) {
    uni.getNetworkType({
      success: function(res) {
        getNetworkType2(res.networkType != "none");
      },
      fail: function(res) {
        getNetworkType2(true);
      }
    });
  }
  function onNetworkStatusChange(onNetworkStatusChange2) {
    uni.onNetworkStatusChange(function(res) {
      onNetworkStatusChange2(res);
    });
  }
  function openLocation(latitude, longitude, scale) {
    uni.openLocation({
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
      uni.navigateTo({
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
    uni.chooseImage({
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
    uni.getImageInfo({
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
    return uni.uploadFile({
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
      return uni.uploadFile({
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
          formatAppLog("log", "at utils/app-util.js:451", "上传发生错误");
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
      formatAppLog("log", "at utils/app-util.js:476", obj);
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
    return uni.request({
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
  function e(tag, msg) {
    if (msg) {
      formatAppLog("log", "at utils/logger.js:6", tag, msg);
    } else {
      formatAppLog("log", "at utils/logger.js:8", tag);
    }
    {
      if (msg) {
        writeLogFile(getDataString(tag + " " + msg));
      } else {
        writeLogFile(getDataString(tag));
      }
    }
  }
  function clear() {
    uni.setStorage({
      key: "log",
      data: ""
    });
  }
  function getDataString(msg) {
    var d = /* @__PURE__ */ new Date();
    var formatData = "MM-dd HH:mm:ss SSS " + msg + "\n";
    var data = formatData.replace("yyyy", d.getFullYear()).replace("MM", fillZero(d.getMonth() + 1)).replace("dd", fillZero(d.getDate())).replace("HH", fillZero(d.getHours())).replace("mm", fillZero(d.getMinutes())).replace("ss", fillZero(d.getSeconds())).replace("SSS", d.getMilliseconds());
    return data;
  }
  function getDateString(timestamp) {
    var d = new Date(timestamp);
    var formatData = "yyyy-MM-dd HH:mm:ss";
    var data = formatData.replace("yyyy", d.getFullYear()).replace("MM", fillZero(d.getMonth() + 1)).replace("dd", fillZero(d.getDate())).replace("HH", fillZero(d.getHours())).replace("mm", fillZero(d.getMinutes())).replace("ss", fillZero(d.getSeconds())).replace("SSS", d.getMilliseconds());
    return data;
  }
  function fillZero(value) {
    if (value.toString().length < 2) {
      return "0" + value;
    }
    return value;
  }
  function writeLogFile(msg) {
    try {
      var value = uni.getStorageSync("log");
      if (value) {
        try {
          var data = value + msg;
          var length = data.length;
          if (length > 5120) {
            uni.setStorageSync("log", data.substring(4096));
          } else {
            uni.setStorageSync("log", data);
          }
        } catch (e2) {
          formatAppLog("log", "at utils/logger.js:71", "CatchClause", e2);
          formatAppLog("log", "at utils/logger.js:72", "CatchClause", e2);
        }
      } else {
        try {
          uni.setStorageSync("log", msg);
        } catch (e2) {
          formatAppLog("log", "at utils/logger.js:78", "CatchClause", e2);
          formatAppLog("log", "at utils/logger.js:79", "CatchClause", e2);
        }
      }
    } catch (e2) {
      formatAppLog("log", "at utils/logger.js:83", "CatchClause", e2);
      formatAppLog("log", "at utils/logger.js:84", "CatchClause", e2);
    }
  }
  const logger = {
    e,
    clear,
    getDateString
  };
  getApp();
  function hexStringToArray(s) {
    var typedArray = new Uint8Array(
      s.match(/[\da-f]{2}/gi).map(function(h) {
        return parseInt(h, 16);
      })
    );
    if (typedArray.length > 1) {
      return Array.apply(new Array(), typedArray);
    } else {
      return typedArray;
    }
  }
  function string2buffer(str) {
    let val = "";
    for (let i = 0; i < str.length; i++) {
      if (val === "") {
        val = str.charCodeAt(i).toString(16);
      } else {
        val += str.charCodeAt(i).toString(16);
      }
    }
    return new Uint8Array(
      val.match(/[\da-f]{2}/gi).map(function(h) {
        return parseInt(h, 16);
      })
    ).buffer;
  }
  function hexStringToArrayBuffer(s) {
    var typedArray = new Uint8Array(
      s.match(/[\da-f]{2}/gi).map(function(h) {
        return parseInt(h, 16);
      })
    );
    return typedArray;
  }
  function stringToBytes(str) {
    var ch;
    var st;
    var re = [];
    for (var i = 0; i < str.length; i++) {
      ch = str.charCodeAt(i);
      st = [];
      do {
        st.push(ch & 255);
        ch = ch >> 8;
      } while (ch);
      re = re.concat(st.reverse());
    }
    return re;
  }
  function shortToSingleBytes(s, asc) {
    var buf = new Array(1);
    buf[0] = s & 255;
    return buf;
  }
  function shortToBytes(s, asc) {
    var buf = new Array(2);
    if (asc) {
      for (var i = buf.length - 1; i >= 0; i--) {
        buf[i] = s & 255;
        s >>= 8;
      }
    } else {
      for (var i = 0; i < buf.length; i++) {
        buf[i] = s & 255;
        s >>= 8;
      }
    }
    return buf;
  }
  function intToBytes(s, asc) {
    var buf = new Array(4);
    if (asc) {
      for (var i = buf.length - 1; i >= 0; i--) {
        buf[i] = s & 255;
        s >>= 8;
      }
    } else {
      for (var i = 0; i < buf.length; i++) {
        buf[i] = s & 255;
        s >>= 8;
      }
    }
    return buf;
  }
  function checkCRC_XW(CRC_TABLE_XW, buff, start, length) {
    var crc = 65535;
    for (var i = 0; i < length; i++) {
      crc = crc >>> 8 ^ CRC_TABLE_XW[(crc ^ buff[start + i]) & 255];
    }
    return crc;
  }
  function crcEncrypt(CRC_TABLE_XW, content, header) {
    var crc = checkCRC_XW(CRC_TABLE_XW, content, 0, content.length);
    var crcByte = shortToBytes(crc, false);
    var len = content.length + crcByte.length;
    var lenByte = shortToBytes(len, true);
    return header.concat(lenByte).concat(content).concat(crcByte);
  }
  function crcEncrypt_KTQUpgrade(content) {
    var crc = 0;
    for (var i = 0; i < 128; i++) {
      crc = crc ^ content[3 + i] << 8;
      for (var j = 0; j < 8; j++) {
        if (crc & 32768) {
          crc = crc << 1 ^ 4129;
        } else {
          crc = crc << 1;
        }
      }
    }
    var crcByte = shortToBytes(crc, true);
    return crcByte;
  }
  function buf2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join("");
  }
  function bytesToInt(b1, b2, b3, b4) {
    return b4 & 255 | (b3 & 255) << 8 | (b2 & 255) << 16 | (b1 & 255) << 24;
  }
  function converTude2Double(bytes, start) {
    var londu = bytes[start] & 255;
    var lonfen1 = bytes[start + 1] & 255;
    var lonfen2 = (bytes[start + 2] & 255) / 100;
    var lonfen3 = (bytes[start + 3] & 255) / 1e4;
    var lond = (lonfen1 + lonfen2 + lonfen3) / 60;
    return londu + lond;
  }
  function bytesToShort(b1, b2) {
    return bytesToInt(0, 0, b1, b2);
  }
  function getShortWith(data, asc) {
    if (data == null) {
      return 0;
    }
    var length = data.length;
    var r = 0;
    if (!asc) {
      for (var i = length - 1; i >= 0; i--) {
        r <<= 8;
        r |= data[i] & 255;
      }
    } else {
      for (var i = 0; i < length; i++) {
        r <<= 8;
        r |= data[i] & 255;
      }
    }
    return r;
  }
  function hexCharCodeToStr(hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
    var len = rawStr.length;
    if (len % 2 !== 0) {
      formatAppLog("log", "at utils/byte-util.js:231", "Illegal Format ASCII Code!");
      return "";
    }
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16);
      resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join("");
  }
  function buf2string(buffer) {
    var arr = Array.prototype.map.call(new Uint8Array(buffer), (x) => x);
    var str = "";
    for (var i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i]);
    }
    return str;
  }
  const utils = {
    // 十六进制转化Array()
    hexStringToArrayBuffer,
    // 十六进制转化ArrayBuffer
    hexStringToArray,
    // 字符串转ArrayBuffer
    string2buffer,
    // 字符串转字节数组
    stringToBytes,
    // 转化一个字节的数组
    shortToSingleBytes,
    // 转化两个字节的数组
    shortToBytes,
    // 转化4个字节数组
    intToBytes,
    // crc加密
    crcEncrypt,
    // ArrayBuffer转换为Hex
    buf2hex,
    //数组转化int
    bytesToInt,
    //数组转化short
    bytesToShort,
    //转经纬度
    converTude2Double,
    //数组转化short
    getShortWith,
    //十六进制转字符串
    hexCharCodeToStr,
    //arraybuffer 转 string
    buf2string,
    // crc加密(开通器升级)
    crcEncrypt_KTQUpgrade
  };
  var gWriteService = "";
  const WRITE_SERVICE_SHORTHAND = "6E400001";
  var gReadService = "";
  const READ_SERVICE_SHORTHAND = "6E400001";
  var gWriteCharacteristic = "";
  const WIRTE_CHARACTERISTIC_SHORTHAND = "6E400002";
  var gReadCharacteristic = "";
  const READ_CHARACTERISTIC_SHORTHAND = "6E400003";
  var gReadRandomCharacteristic = "";
  const READRANDOM_CHARACTERISTIC_SHORTHAND = "6E400004";
  var ReadServiceFixed = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  var WriteServiceFixed = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  var ReadCharacteristicFixed = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
  var WriteCharacteristicFixed = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
  var ReadRandomCharacteristicFixed = "6E400004-B5A3-F393-E0A9-E50E24DCCA9E";
  var gIdc = "";
  var gBluetoothState;
  var gOnReceiveValue;
  var deviceId = "";
  var available = false;
  var discovering = false;
  var isBLEAdapterOpen = false;
  var connected = false;
  var DEFAULT_BLUETOOTH_STATE = {
    //各种错误,可用来关闭dialog
    BLUETOOTH_ERROR: -2,
    //连接失败
    BLUETOOTH_CONNECT_FAILED: -1,
    //连接成功
    BLUETOOTH_CONNECT_SUCESS: 0,
    //蓝牙适配器不可用
    BLUETOOTH_ADAPTER_UNAVAILABLE: 1,
    //打开蓝牙扫描失败
    BLUETOOTH_DEVICES_DISCOVERY_FAILD: 2,
    //频繁调用
    BLUETOOTH_SEND_FREQUENTLY: 3,
    //开始调用senddata发送数据,可以用来显示dialog
    BLUETOOTH_PRE_EXECUTE: 4,
    //没有扫到设备
    BLUETOOTH_NOT_FOUND: 5,
    //不支持BLE
    BLUETOOTH_UNSUPPORTED: 6,
    //发送失败
    BLUETOOTH_SEND_FAILED: 7,
    //无响应
    BLUETOOTH_NO_RESPONSE: 8
  };
  function getBLEDataTime() {
    const date = /* @__PURE__ */ new Date();
    const MM = `${String(date.getMonth() + 1).padStart(2, "0")}`;
    const dd = `${String(date.getDate()).padStart(2, "0")}`;
    const hh = `${String(date.getHours()).padStart(2, "0")}`;
    const mm = `${String(date.getMinutes()).padStart(2, "0")}`;
    const ss = `${String(date.getSeconds()).padStart(2, "0")}`;
    const ii = `${String(date.getMilliseconds()).padStart(3, "0")}`;
    const formatted = MM + "/" + dd + " " + hh + ":" + mm + ":" + ss + "." + ii;
    return formatted;
  }
  function getBLEConnectionState() {
    return connected;
  }
  function getBLEConnectionID() {
    return gIdc;
  }
  function releaseData() {
    logger.e("释放deviceId");
    deviceId = "";
  }
  function releaseBle() {
    gIdc = "";
    if (discovering) {
      logger.e("停止扫描");
      stopScanBle();
    }
    if (connected) {
      logger.e("断开连接");
      disConnect();
    }
    if (isBLEAdapterOpen) {
      logger.e("关闭适配器");
      closeBluetoothAdapter();
    }
    releaseData();
    logger.e("关闭连接事件监听");
    uni.offBLEConnectionStateChange();
    logger.e("关闭特征变化监听");
    uni.offBLECharacteristicValueChange();
  }
  function isSupportedBLE(isSupported) {
    const deviceInfo = uni.getDeviceInfo();
    var brand = deviceInfo.brand;
    var platform = deviceInfo.platform;
    var system = deviceInfo.system;
    logger.e("手机型号:" + brand + ",系统信息:" + platform + ",系统版本:" + system);
    isSupported(true);
  }
  function isBLEAdapterAvailable(onResult) {
    if (isBLEAdapterOpen) {
      if (!available) {
        getBluetoothAdapterState(function(res) {
          setBLEAdapterState(res.available, res.discovering);
          onResult(res.available);
        });
      } else {
        onResult(available);
      }
    } else {
      openBluetoothAdapter(function(openSuccess) {
        if (openSuccess) {
          getBluetoothAdapterState(function(res) {
            setBLEAdapterState(res.available, res.discovering);
            onResult(res.available);
          });
        } else {
          onResult(openSuccess);
        }
      });
    }
  }
  function openBluetoothAdapter(cOpenBluetoothAdapter) {
    uni.openBluetoothAdapter({
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:194", res);
        isBLEAdapterOpen = true;
        cOpenBluetoothAdapter(true);
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:199", res);
        isBLEAdapterOpen = false;
        setBLEAdapterState(false, false);
        cOpenBluetoothAdapter(false);
      }
    });
  }
  function setBLEAdapterState(ava, discovery) {
    available = ava;
    discovering = discovery;
  }
  function getBluetoothAdapterState(onBleAdapterState) {
    uni.getBluetoothAdapterState({
      success: function(res) {
        onBleAdapterState(res);
      },
      fail: function(res) {
        onBleAdapterState(res);
      }
    });
  }
  function onBluetoothAdapterStateChange() {
    uni.onBluetoothAdapterStateChange(function(res) {
      logger.e(`adapterState changed, now is`, res);
      setBLEAdapterState(res.available, res.discovering);
    });
  }
  function closeBluetoothAdapter() {
    uni.closeBluetoothAdapter({
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:245", res);
        isBLEAdapterOpen = false;
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:249", res);
      }
    });
  }
  function startConnect() {
    uni.createBLEConnection({
      deviceId,
      success: function(res) {
        gWriteService = "";
        gWriteCharacteristic = "";
        gReadService = "";
        gReadCharacteristic = "";
        getBLEDeviceServices();
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:276", res);
        gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED);
      }
    });
  }
  function startConnectConnected() {
    getBLEDeviceServicesConnected();
  }
  function onBLEConnectionStateChange() {
    uni.onBLEConnectionStateChange(function(res) {
      logger.e(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
      connected = res.connected;
      if (gBluetoothState != void 0) {
        if (connected) {
          gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS);
        } else {
          gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
        }
      }
      if (res.deviceId == deviceId) {
        if (res.connected == true) {
          if (discovering) {
            stopScanBle();
          }
        }
      }
    });
  }
  function disConnect() {
    uni.closeBLEConnection({
      deviceId,
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:319", res);
        connected = false;
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:323", res);
      }
    });
  }
  function startBluetoothDevicesDiscovery() {
    uni.startBluetoothDevicesDiscovery({
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:339", res);
        discovering = res.isDiscovering;
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:343", res);
        discovering = res.isDiscovering;
        gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
        gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_DEVICES_DISCOVERY_FAILD);
      }
    });
  }
  function onBluetoothDeviceFound() {
    uni.onBluetoothDeviceFound(function(devices) {
      if (devices.devices[0].name != "") {
        logger.e("device found:" + devices.devices[0].name);
      }
      if (gIdc == devices.devices[0].localName) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:360", devices);
        deviceId = devices.devices[0].deviceId;
        saveBLEDeviceInfo(gIdc);
        onBLEConnectionStateChange();
        onBluetoothAdapterStateChange();
        onBLECharacteristicValueChange();
        startConnect();
      }
    });
  }
  function onBluetoothDeviceFoundConnected() {
    onBluetoothAdapterStateChange();
    onBLECharacteristicValueChangeConnected();
    startConnectConnected();
  }
  function stopScanBle() {
    uni.stopBluetoothDevicesDiscovery({
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:383", res);
        discovering = false;
        logger.e("stopScanBle-true discovering:" + discovering);
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:388", res);
        discovering = false;
        logger.e("stopScanBle-false discovering:" + discovering);
      }
    });
  }
  function getBLEDeviceServices() {
    uni.getBLEDeviceServices({
      deviceId,
      success: function(res) {
        for (var i = 0; i < res.services.length; i++) {
          formatAppLog("log", "at utils/BleKeyFun-utils-single.js:407", res);
          if (res.services[i].uuid.indexOf(WRITE_SERVICE_SHORTHAND) != -1) {
            gWriteService = res.services[i].uuid;
          }
          if (res.services[i].uuid.indexOf(READ_SERVICE_SHORTHAND) != -1) {
            gReadService = res.services[i].uuid;
          }
        }
        logger.e("device设备的读服务id:", gWriteService);
        logger.e("device设备的写服务id:", gReadService);
        if (gWriteService != "" && gReadService != "" && (gWriteCharacteristic == "" || gReadCharacteristic == "")) {
          getBLEDeviceWriteCharacteristics();
        }
      }
    });
  }
  function getBLEDeviceServicesConnected() {
    uni.getBLEDeviceServices({
      deviceId,
      success: function(res) {
        logger.e("device设备的读服务id:", WriteServiceFixed);
        logger.e("device设备的写服务id:", ReadServiceFixed);
        getBLEDeviceWriteCharacteristicsConnected();
      }
    });
  }
  function getBLEDeviceReadCharacteristics() {
    uni.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: gReadService,
      success: function(res) {
        for (var i = 0; i < res.characteristics.length; i++) {
          if (res.characteristics[i].uuid.indexOf(READ_CHARACTERISTIC_SHORTHAND) != -1) {
            gReadCharacteristic = res.characteristics[i].uuid;
          }
          if (res.characteristics[i].uuid.indexOf(READRANDOM_CHARACTERISTIC_SHORTHAND) != -1) {
            gReadRandomCharacteristic = res.characteristics[i].uuid;
          }
        }
        logger.e("device设备的读特征值id:" + gReadCharacteristic);
        logger.e("device设备的读Random特征值id:" + gReadRandomCharacteristic);
        if (gReadCharacteristic != "") {
          notifyBLECharacteristicValueChange();
        }
        if (gReadRandomCharacteristic != "") {
          setTimeout(() => {
            readBLECharacteristicValue();
          }, 100);
        }
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:464", res);
      }
    });
  }
  function getBLEDeviceReadCharacteristicsConnected() {
    uni.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: ReadServiceFixed,
      success: function(res) {
        logger.e("device设备的读特征值id:" + ReadCharacteristicFixed);
        logger.e("device设备的读Random特征值id:" + ReadRandomCharacteristicFixed);
        notifyBLECharacteristicValueChangeConnected();
        readBLECharacteristicValueConnected();
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:480", res);
      }
    });
  }
  function notifyBLECharacteristicValueChange() {
    uni.notifyBLECharacteristicValueChange({
      deviceId,
      serviceId: gReadService,
      characteristicId: gReadCharacteristic,
      state: true,
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:495", res);
        appUtil.getSystemInfoComplete(
          function(res2) {
            var system = res2.system;
            var blankIndex = system.indexOf(" ");
            var pointIndex = system.indexOf(".");
            if (blankIndex != -1 && pointIndex != -1) {
              system.substring(0, blankIndex);
              system.substring(blankIndex + 1, pointIndex + 2);
            }
          },
          function() {
            uni.setBLEMTU({
              deviceId,
              mtu: 240,
              success: function(res2) {
                formatAppLog("log", "at utils/BleKeyFun-utils-single.js:511", "MTU modify success");
              },
              fail: function(res2) {
                formatAppLog("log", "at utils/BleKeyFun-utils-single.js:514", "MTU modify fail");
              }
            });
          }
        );
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:522", res);
      }
    });
  }
  function notifyBLECharacteristicValueChangeConnected() {
    uni.notifyBLECharacteristicValueChange({
      deviceId,
      serviceId: ReadServiceFixed,
      characteristicId: ReadCharacteristicFixed,
      state: true,
      success: function(res) {
        appUtil.getSystemInfoComplete(
          function(res2) {
            var system = res2.system;
            var blankIndex = system.indexOf(" ");
            var pointIndex = system.indexOf(".");
            if (blankIndex != -1 && pointIndex != -1) {
              system.substring(0, blankIndex);
              system.substring(blankIndex + 1, pointIndex + 2);
            }
          },
          function() {
            uni.setBLEMTU({
              deviceId,
              mtu: 240,
              success: function(res2) {
                formatAppLog("log", "at utils/BleKeyFun-utils-single.js:549", "MTU modify success");
              },
              fail: function(res2) {
                formatAppLog("log", "at utils/BleKeyFun-utils-single.js:552", "MTU modify fail");
              }
            });
          }
        );
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:559", res);
      }
    });
  }
  function readBLECharacteristicValue() {
    uni.readBLECharacteristicValue({
      deviceId,
      serviceId: gReadService,
      characteristicId: gReadRandomCharacteristic,
      state: true,
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:571", res);
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:574", res);
      }
    });
  }
  function readBLECharacteristicValueConnected() {
    uni.readBLECharacteristicValue({
      deviceId,
      serviceId: ReadServiceFixed,
      characteristicId: ReadRandomCharacteristicFixed,
      state: true,
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:586", res);
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:589", res);
      }
    });
  }
  function getBLEDeviceWriteCharacteristics() {
    uni.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: gWriteService,
      success: function(res) {
        for (var j = 0; j < res.characteristics.length; j++) {
          if (res.characteristics[j].uuid.indexOf(WIRTE_CHARACTERISTIC_SHORTHAND) != -1) {
            gWriteCharacteristic = res.characteristics[j].uuid;
          }
        }
        logger.e("device设备的写特征值id:" + gWriteCharacteristic);
        if (gReadCharacteristic == "") {
          getBLEDeviceReadCharacteristics();
        }
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:614", res);
      }
    });
  }
  function getBLEDeviceWriteCharacteristicsConnected() {
    uni.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: WriteServiceFixed,
      success: function(res) {
        logger.e("device设备的写特征值id:" + WriteCharacteristicFixed);
        getBLEDeviceReadCharacteristicsConnected();
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:628", res);
      }
    });
  }
  function onBLECharacteristicValueChange() {
    uni.onBLECharacteristicValueChange(function(characteristic) {
      var resultArrayBufferData = characteristic.value;
      var receiverHexData = utils.buf2hex(resultArrayBufferData);
      var arrayData = utils.hexStringToArray(receiverHexData);
      const formatted = getBLEDataTime();
      if (characteristic.characteristicId.indexOf(READRANDOM_CHARACTERISTIC_SHORTHAND) != -1) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:644", "随机指令接收:" + formatted + "  数据:" + receiverHexData);
        logger.e("随机指令数据:" + receiverHexData, false, false, true);
        gOnReceiveValue(0, arrayData, utils.hexCharCodeToStr(receiverHexData), receiverHexData);
      } else {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:648", "通知指令接收:" + formatted + "  数据:" + receiverHexData);
        logger.e("通知指令接收:" + receiverHexData, false, false, true);
        gOnReceiveValue(1, arrayData, utils.hexCharCodeToStr(receiverHexData), receiverHexData);
      }
    });
  }
  function onBLECharacteristicValueChangeConnected() {
    uni.onBLECharacteristicValueChange(function(characteristic) {
      var resultArrayBufferData = characteristic.value;
      var receiverHexData = utils.buf2hex(resultArrayBufferData);
      var arrayData = utils.hexStringToArray(receiverHexData);
      const formatted = getBLEDataTime();
      if (characteristic.characteristicId == ReadRandomCharacteristicFixed) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:663", "随机指令接收:" + formatted + "  数据:" + receiverHexData);
        logger.e("随机指令数据:" + receiverHexData, false, false, true);
        gOnReceiveValue(0, arrayData, utils.hexCharCodeToStr(receiverHexData), receiverHexData);
      } else {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:667", "通知指令接收:" + formatted + "  数据:" + receiverHexData);
        logger.e("通知指令接收:" + receiverHexData, false, false, true);
        gOnReceiveValue(1, arrayData, utils.hexCharCodeToStr(receiverHexData), receiverHexData);
      }
    });
  }
  function writeBLECharacteristicValue(buffer, writeBLECharacteristicValue2) {
    uni.writeBLECharacteristicValue({
      deviceId,
      serviceId: WriteServiceFixed,
      characteristicId: WriteCharacteristicFixed,
      value: buffer,
      success: function(res) {
        writeBLECharacteristicValue2(true);
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:687", res);
        writeBLECharacteristicValue2(false);
      }
    });
  }
  function initSendData(idc, pwd, sendType, bluetoothState, onReceiveValue) {
    if (gBluetoothState != bluetoothState) {
      gBluetoothState = bluetoothState;
    }
    if (gOnReceiveValue != onReceiveValue) {
      gOnReceiveValue = onReceiveValue;
    }
    if (gIdc != idc) {
      gIdc = idc;
    }
    onBluetoothDeviceFound();
  }
  function initSendDataConnected(idc, pwd, sendType, bluetoothState, onReceiveValue) {
    if (gBluetoothState != bluetoothState) {
      gBluetoothState = bluetoothState;
    }
    if (gOnReceiveValue != onReceiveValue) {
      gOnReceiveValue = onReceiveValue;
    }
    if (gIdc != idc) {
      gIdc = idc;
    }
    onBluetoothDeviceFoundConnected();
  }
  function connectBLE(idc, bluetoothState, onReceiveValue) {
    connectMyBLE(idc, bluetoothState, onReceiveValue);
  }
  function connectBLEConnected(idc, bluetoothState, onReceiveValue) {
    connectMyBLEConnected(idc, bluetoothState, onReceiveValue);
  }
  function connectMyBLE(idc, bluetoothState, onReceiveValue, isIntercept) {
    if (connected)
      ;
    else {
      isSupportedBLE(function(isSupported) {
        if (isSupported) {
          isBLEAdapterAvailable(function(ava) {
            if (ava) {
              initSendData(idc, "", "", bluetoothState, onReceiveValue);
              startBluetoothDevicesDiscovery();
            } else {
              gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
              gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE);
            }
          });
        } else {
          bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
          bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED);
        }
      });
    }
  }
  function connectMyBLEConnected(idc, bluetoothState, onReceiveValue, isIntercept) {
    isSupportedBLE(function(isSupported) {
      if (isSupported) {
        isBLEAdapterAvailable(function(ava) {
          if (ava) {
            initSendDataConnected(idc, "", "", bluetoothState, onReceiveValue);
          } else {
            bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
            bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE);
          }
        });
      } else {
        bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
        bluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED);
      }
    });
  }
  function dispatcherSend2(sendData, noRepeat) {
    var data = sendData;
    delaySend2(data);
  }
  function delaySend2(data, noRepeat) {
    var d = data;
    setTimeout(function() {
      send2(d);
    }, 10);
  }
  function send2(hex, noRepeat) {
    var buffer = hex;
    writeBLECharacteristicValue(buffer, function(isSuccess) {
      const formatted = getBLEDataTime();
      var sendArrayBufferData = buffer;
      var sendHexData = utils.buf2hex(sendArrayBufferData);
      if (isSuccess) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:834", "指令发送成功:" + formatted + "  数据:" + sendHexData);
        logger.e("指令发送成功:" + sendHexData, false, false, true);
      } else {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:837", "!!!指令发送失败:" + formatted + "  数据:" + sendHexData);
        logger.e("!!!指令发送失败:" + sendHexData, false, false, true);
      }
    });
  }
  function makePair() {
    uni.makeBluetoothPair({
      deviceId,
      timeout: 2e4,
      success: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:852", res);
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:855", res);
      }
    });
  }
  function saveBLEDeviceInfo(deviceIDC) {
    formatAppLog("log", "at utils/BleKeyFun-utils-single.js:861", "saveBLEDeviceInfo");
    var param = {};
    param["deviceId"] = deviceId;
    param["readServiceUUID"] = gReadService;
    param["writeServiceUUID"] = gWriteService;
    param["readCharacUUID"] = gReadCharacteristic;
    param["writeCharacUUID"] = gWriteCharacteristic;
    param["randomServiceUUID"] = gReadService;
    param["randomCharacUUID"] = gReadRandomCharacteristic;
    var jparam = JSON.stringify(param);
    uni.setStorage({
      key: deviceIDC,
      data: jparam,
      success: function() {
      }
    });
  }
  function getBLEDeviceInfo(deviceIDC, result) {
    formatAppLog("log", "at utils/BleKeyFun-utils-single.js:879", "getBLEDeviceInfo");
    uni.getStorage({
      key: deviceIDC,
      success: function(res) {
        var param = JSON.parse(res.data);
        deviceId = param.deviceId;
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:885", deviceId);
        gReadService = param.readServiceUUID;
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:887", gReadService);
        gWriteService = param.writeServiceUUID;
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:889", gWriteService);
        gReadCharacteristic = param.readCharacUUID;
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:891", gReadCharacteristic);
        gWriteCharacteristic = param.writeCharacUUID;
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:893", gWriteCharacteristic);
        gReadRandomCharacteristic = param.randomCharacUUID;
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:895", gReadRandomCharacteristic);
        result(true, param);
      },
      fail: function(res) {
        formatAppLog("log", "at utils/BleKeyFun-utils-single.js:900", res);
        result(false);
      }
    });
  }
  function clrBLEDeviceInfo(deviceIDC) {
    formatAppLog("log", "at utils/BleKeyFun-utils-single.js:907", "clrBLEDeviceInfo");
    uni.removeStorage({
      key: deviceIDC,
      success: function() {
      }
    });
  }
  const bleKeyManager = {
    connectBLE,
    releaseBle,
    dispatcherSend2,
    DEFAULT_BLUETOOTH_STATE,
    getBLEConnectionState,
    getBLEConnectionID,
    makePair,
    saveBLEDeviceInfo,
    getBLEDeviceInfo,
    clrBLEDeviceInfo,
    connectBLEConnected
  };
  const defaultConfig = {
    url: "",
    method: "GET",
    timeout: 1e4,
    loading: true
  };
  class Http {
    constructor(config) {
      this.baseURL = config.baseURL;
      this.interceptor = {};
    }
    // 设置拦截器
    setInterceptor(interceptor) {
      this.interceptor = interceptor;
    }
    // 核心请求方法
    async request(config) {
      let mergedConfig = {
        ...defaultConfig,
        ...config
      };
      if (typeof this.interceptor.request === "function") {
        mergedConfig = this.interceptor.request(mergedConfig);
      }
      let url = this.baseURL + mergedConfig.url;
      if (mergedConfig.params) {
        const params = new URLSearchParams(mergedConfig.params).toString();
        url += `?${params}`;
      }
      try {
        let requestData = mergedConfig.data || {};
        if (mergedConfig.isFormData) {
          const formData = {};
          for (const key in requestData) {
            if (requestData.hasOwnProperty(key)) {
              formData[key] = String(requestData[key]);
            }
          }
          requestData = formData;
        }
        formatAppLog("log", "at utils/request/http.js:65", "发送请求:", {
          url,
          method: mergedConfig.method,
          data: requestData,
          header: mergedConfig.header
        });
        const response = await uni.request({
          url,
          method: mergedConfig.method,
          data: requestData,
          header: mergedConfig.header,
          timeout: mergedConfig.timeout
        });
        let res = response;
        if (typeof this.interceptor.response === "function") {
          res = this.interceptor.response(response);
        }
        if (res.statusCode === 200) {
          return res.data;
        } else {
          formatAppLog("error", "at utils/request/http.js:90", "接口返回异常:", res);
          return Promise.reject(res.data);
        }
      } catch (error) {
        formatAppLog("error", "at utils/request/http.js:95", "请求异常:", error);
        this.handleError(error);
        return Promise.reject(error);
      } finally {
        if (mergedConfig.loading) {
          uni.hideLoading();
        }
      }
    }
    // 错误处理
    handleError(error) {
      const errMsg = error.errMsg || "";
      if (errMsg.includes("timeout")) {
        uni.showToast({
          title: "请求超时",
          icon: "none"
        });
      } else if (errMsg.includes("abort")) {
        formatAppLog("log", "at utils/request/http.js:115", "请求被取消");
      } else {
        uni.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      }
    }
    // 快捷方法
    get(url, params, config) {
      return this.request({
        ...config,
        url,
        method: "GET",
        params
      });
    }
    post(url, data, config) {
      return this.request({
        ...config,
        url,
        method: "POST",
        data
      });
    }
    postFormData(url, data, config) {
      return this.request({
        ...config,
        url,
        method: "POST",
        data,
        isFormData: true
      });
    }
    put(url, data, config) {
      return this.request({
        ...config,
        url,
        method: "PUT",
        data
      });
    }
    delete(url, params, config) {
      return this.request({
        ...config,
        url,
        method: "DELETE",
        params
      });
    }
  }
  const http = new Http({
    baseURL: "https://k1sw.wiselink.net.cn"
    // 你的基础地址
  });
  http.get = (url, params, config) => http.request({
    ...config,
    url,
    method: "GET",
    params
  });
  http.post = (url, data, config) => http.request({
    ...config,
    url,
    method: "POST",
    data
  });
  http.postFormData = (url, data, config) => http.request({
    ...config,
    url,
    method: "POST",
    data,
    isFormData: true
  });
  http.put = (url, data, config) => http.request({
    ...config,
    url,
    method: "PUT",
    data
  });
  http.delete = (url, params, config) => http.request({
    ...config,
    url,
    method: "DELETE",
    params
  });
  http.setInterceptor({
    request: (config) => {
      const token = uni.getStorageSync("token");
      let header = config.header || {};
      if (token) {
        header["token"] = token;
      }
      if (config.isFormData) {
        header["content-type"] = "application/x-www-form-urlencoded";
      } else {
        header["content-type"] = "application/json";
      }
      config.header = header;
      return config;
    },
    response: (response) => {
      if (response.data.code === 9e3) {
        uni.navigateTo({
          url: "/pages/login/login"
        });
      }
      return response;
    }
  });
  const _imports_0 = "/static/set_up.png";
  const _imports_1 = "/static/gy.png";
  const _imports_2 = "/static/clzx.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const VehicleCommand = {
    UNLOCK: 3,
    //开锁
    LOCK: 4,
    //关锁
    OPEN_TRUNK: 5,
    //尾箱
    FIND_CAR: 6,
    //寻车
    CONTROL_WINDOW: 7
    //操作车窗
  };
  const _sfc_main$1 = {
    data() {
      return {
        latitude: 39.90469,
        longitude: 116.40717,
        markers: [{
          id: 1,
          latitude: 39.90469,
          longitude: 116.40717,
          title: "天安门",
          callout: {
            content: "这里是天安门",
            display: "ALWAYS"
          }
        }],
        entries: [
          {
            text: "开锁",
            icon: "/static/lock.png",
            evt: "handleUnlock"
          },
          {
            text: "关锁",
            icon: "/static/unlock.png",
            evt: "handleLock"
          },
          {
            text: "寻车",
            icon: "/static/xunche.png",
            evt: "handleFindCar"
          },
          {
            text: "尾箱",
            icon: "/static/weixiang.png",
            evt: "handleOpenTrunk"
          },
          {
            text: "升窗",
            icon: "/static/sc.png",
            evt: "handleRaiseTheWindow"
          },
          {
            text: "降窗",
            icon: "/static/jc.png",
            evt: "handleLowerTheWindow"
          },
          {
            text: "左中门",
            icon: "/static/zm.png"
          },
          {
            text: "右中门",
            icon: "/static/ym.png"
          }
        ],
        itemsPerPage: 4,
        current: 0,
        screenInfo: {},
        // 蓝牙连接状态：未连接 / 已连接
        connectionState: "未连接",
        // 当前连接ID
        connectionID: ""
      };
    },
    async onLoad() {
      this.isLoading = true;
      uni.hideTabBar({
        animation: true
      });
      try {
        await Promise.allSettled([
          this.initialScreenInfo()
        ]);
      } catch (error) {
        formatAppLog("error", "at pages/index/index.vue:224", "初始化失败:", error);
      } finally {
        this.isLoading = false;
      }
      this.getLocation();
    },
    onShow: function() {
      this.initialScreenInfo();
      this.handleStart();
      this.startConnectionStatusPolling();
    },
    computed: {
      pages() {
        const pages = [];
        const total = this.entries.length;
        for (let i = 0; i < total; i += this.itemsPerPage) {
          pages.push(this.entries.slice(i, i + this.itemsPerPage));
        }
        return pages;
      },
      containerStyle() {
        formatAppLog("log", "at pages/index/index.vue:249", this.screenInfo);
        return {
          height: `${this.screenInfo.screenHeight || 667}px`
        };
      },
      // 导航栏样式
      navbarStyle() {
        return {
          marginTop: `${this.screenInfo.statusBarHeight}px`
        };
      }
    },
    methods: {
      // 获取屏幕信息
      async initialScreenInfo() {
        try {
          this.screenInfo = await info_screen();
        } catch (error) {
          uni.showToast({
            title: "设备信息获取失败",
            icon: "none"
          });
        }
      },
      // 启动连接状态轮询
      startConnectionStatusPolling() {
        if (this.pageInterval) {
          return;
        }
        this.pageInterval = setInterval(() => {
          const isConnected = bleKeyManager.getBLEConnectionState();
          const connectionID = isConnected ? bleKeyManager.getBLEConnectionID() : "";
          this.connectionState = isConnected ? "已连接" : "未连接";
          this.connectionID = connectionID;
        }, 200);
      },
      // 连接蓝牙
      handleStart() {
        const mockBluetoothData = {
          // sn: '19585080015',
          // bluetoothKey: "333688439194",
          sn: "19585080049",
          bluetoothKey: "333917323272"
        };
        if (mockBluetoothData) {
          this.deviceIDC = mockBluetoothData.sn;
          if (mockBluetoothData.bluetoothKey) {
            const numStr = mockBluetoothData.bluetoothKey.toString();
            const bytes = [];
            for (let i = 0; i < numStr.length; i += 2) {
              const byteStr = numStr.substring(i, i + 2);
              bytes.push(parseInt(byteStr, 16));
            }
            this.orgKey = bytes;
          }
          this.orgKeyOld = mockBluetoothData.bluetoothKey;
          this.bluetoothData = mockBluetoothData;
          setTimeout(() => {
            bleKeyManager.connectBLE(
              this.deviceIDC,
              (state) => {
                this.bluetoothStateMonitor(state);
              },
              (type, arrayData, hexData, hexTextData) => {
                this.bluetoothDataMonitor(type, arrayData, hexData, hexTextData);
              }
            );
          }, 100);
        }
      },
      // 蓝牙状态执行对应操作
      bluetoothStateMonitor(state) {
        const showErrorToast = (message) => {
          uni.hideLoading();
          uni.showToast({
            title: message,
            icon: "none",
            duration: 3e3,
            mask: true
          });
        };
        const showSuccessToast = (message = "操作成功") => {
          uni.hideLoading();
          uni.showToast({
            title: message,
            icon: "none",
            duration: 2e3
          });
        };
        const stateHandlers = {
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE]: () => {
            uni.showLoading({
              title: "加载中...",
              mask: true
            });
          },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR]: () => {
            uni.hideLoading();
          },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE]: () => {
            showErrorToast("请打开蓝牙");
          },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND]: () => {
            showErrorToast("没有发现设备");
          },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED]: () => {
            showErrorToast("蓝牙连接失败");
          },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED]: () => {
            showErrorToast("您的手机不支持低功耗蓝牙");
          },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED]: () => {
            showErrorToast("数据发送失败");
          },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE]: () => {
            showErrorToast("设备超时无响应");
          },
          [bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS]: () => {
            showSuccessToast("连接成功");
          }
        };
        const handler = stateHandlers[state];
        if (handler) {
          handler();
        } else {
          formatAppLog("warn", "at pages/index/index.vue:385", "未知的蓝牙状态:", state);
          uni.hideLoading();
        }
      },
      // 解析数据+验证合法性
      bluetoothDataMonitor: function(type, arrayData, hexData, hexTextData) {
        const dataStr = hexTextData || "";
        if (type === 0) {
          this.btnCmdSend(16, arrayData);
          setTimeout(() => {
            this.PackAndSend(16, 8, [0, 0, 0, 0, 0, 0, 0, 0]);
          }, 1e3);
        }
        this.parseData(this.trimHexData(dataStr));
      },
      // 点击操作手动区事件
      parseEventDynamicCode($, evt) {
        this.handleEvent(evt);
      },
      // 手动操作区执行事件
      handleEvent(eventType) {
        const actions = {
          handleUnlock: () => {
            this.sendVehicleCommandFun(VehicleCommand.UNLOCK, "");
          },
          handleLock: () => {
            this.sendVehicleCommandFun(VehicleCommand.LOCK, "");
          },
          handleOpenTrunk: () => {
            this.sendVehicleCommandFun(VehicleCommand.OPEN_TRUNK, "");
          },
          handleFindCar: () => {
            this.sendVehicleCommandFun(VehicleCommand.FIND_CAR, "");
          },
          handleRaiseTheWindow: () => {
            this.sendVehicleCommandFun(VehicleCommand.CONTROL_WINDOW, WindowAction.RAISE);
          },
          handleLowerTheWindow: () => {
            this.sendVehicleCommandFun(VehicleCommand.CONTROL_WINDOW, WindowAction.LOWER);
          }
        };
        const action = actions[eventType];
        if (typeof action === "function") {
          action();
        }
      },
      // 指令公共方法
      sendVehicleCommandFun: function(commandCode, code) {
        if (this.connectionState == "已连接") {
          uni.showModal({
            title: "提示",
            content: commandCode == 3 || commandCode == 4 ? "确认下发指令" : "如原车钥匙不支持此功能请自行点击【更多钥匙功能】关闭",
            confirmText: commandCode == 3 || commandCode == 4 ? "确认" : "确认支持",
            complete: (res) => {
              if (res.confirm) {
                uni.showLoading({
                  title: "加载中...",
                  mask: true
                });
                this.btnCmdSend(commandCode, code);
                setTimeout(() => {
                  uni.hideLoading();
                }, 1e3);
                this.handleSendInfo(commandCode, code);
              }
            }
          });
          return;
        }
        if (this.connectionState == "未连接") {
          uni.showToast({
            title: "请等待蓝牙连接后重试",
            icon: "none"
          });
          return;
        }
      },
      // 发送控制命令
      handleSendInfo(commandCode, code) {
        var _a;
        ({
          sn: this.deviceIDC,
          controltype: `${commandCode}${code}`,
          electricity: ((_a = this == null ? void 0 : this.parsedData) == null ? void 0 : _a.electric) || 0
        });
      },
      // 认证加密算法 passwordSource 原始密码(6字节数组) random 随机数(6字节数组) returns 加密后的密码(8字节数
      auth_encrypt: function(passwordSource, random) {
        var passwordEncrypt = [0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < 6; i++) {
          passwordEncrypt[i] = passwordSource[i] ^ random[i] ^ 255;
        }
        return passwordEncrypt;
      },
      // 发送控制命令 type 命令类型 data 命令数据
      btnCmdSend: function(type, data) {
        const that = this;
        const defaultData = [0, 0, 0, 0, 0, 0, 0, 0];
        switch (type) {
          case 16:
            const orgKey = this.orgKey;
            that.PackAndSend(type, 8, that.auth_encrypt(orgKey, data));
            break;
          case 3:
          case 4:
          case 5:
          case 6:
            that.PackAndSend(type, 8, defaultData);
            break;
          case 34:
            that.PackAndSend(type, 8, data);
            break;
          case 7:
            that.PackAndSend07(type, 8, data);
            break;
          case 58:
            const flameoutData = data;
            this.PackAndSend3a(type, 12, flameoutData);
            break;
        }
      },
      /**
       * 数据打包与发送
       * @param {number} type 数据类型
       * @param {number} len 数据长度
       * @param {Array} data 数据内容
       */
      PackAndSend: function(type, len, data) {
        var packet = [36, type, len, ...data, 36];
        bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
      },
      // 打包并发送数据（支持动态数据体长度）
      PackAndSend3a(type, dataLength, data, sign) {
        const header = [36];
        const end = [36];
        const paddedData = [...data].concat(new Array(dataLength - data.length).fill(0)).slice(0, dataLength);
        const packet = dataLength == 8 ? [...header, type, dataLength, ...data, ...end] : [
          ...header,
          type,
          ...paddedData,
          ...end
        ];
        bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
      },
      // 升窗降窗指令封装
      PackAndSend07: function(type, len, data) {
        const defaultData = [0, 0, 0, 0, 0, 0, 0];
        var packet = [36, type, len, data, ...defaultData, 36];
        bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
      },
      /**
       * 数组转ArrayBuffer
       * @param {Array} array 原始数组
       * @param {number} elementSize 元素大小(默认1字节)
       * @returns {ArrayBuffer} 转换后的缓冲区
       */
      arrayToArrayBuffer: function(array, elementSize = 1) {
        const typedArray = new Uint8Array(array.length * elementSize);
        array.forEach((value, index) => typedArray[index * elementSize] = value);
        return typedArray.buffer;
      },
      // 转换电池剩余电量
      initVoltage(dy) {
        const thresholds = [4, 3.9, 3.8, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2, 3.1];
        const scores = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
        const index = thresholds.findIndex((threshold) => dy >= threshold);
        return index !== -1 ? scores[index] : 0;
      },
      // 剩余电量显示图片
      getBatteryImage(voltage) {
        const levels = [
          {
            min: 75,
            value: "100"
          },
          {
            min: 50,
            value: "75"
          },
          {
            min: 25,
            value: "50"
          },
          {
            min: 10,
            value: "25"
          }
        ];
        const level = levels.find((item) => voltage > item.min) || {
          value: "0"
        };
        this.voltage_image = level.value;
      },
      // 剩余电量处转换
      getBatteryLevel(voltage) {
        this.getBatteryImage(voltage);
        const thresholds = [90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
        const values = ["100", "90", "80", "70", "60", "50", "40", "30", "20", "10"];
        const index = thresholds.findIndex((threshold) => voltage > threshold);
        return index !== -1 ? values[index] : "1";
      },
      /**
       * 解析16进制车辆状态数据
       * @param {string} hexString 30字符的16进制字符串
       * @returns {Array|null} 解析结果数组，格式为[{key: string, value: any}]
       */
      parseHexDataObject: function(hexString) {
        if (hexString.length !== 30) {
          return null;
        }
        const bytes = [];
        for (let i = 0; i < 30; i += 2) {
          bytes.push(parseInt(hexString.substr(i, 2), 16));
        }
        const resultObject = {};
        resultObject.lock = bytes[2] === 1 ? true : false;
        resultObject.voltage = (bytes[12] / 10).toFixed(1);
        resultObject.electric = this.getBatteryLevel(this.initVoltage((bytes[12] / 10).toFixed(
          1
        )));
        resultObject.supply = bytes[3];
        resultObject.induction = bytes[0] === 1 ? "感应模式" : "手动模式";
        return resultObject;
      },
      /**
       * 数据解析按钮处理
       * @param {string} hexData 16进制数据字符串
       */
      parseData: function(hexData) {
        const parsedResult = this.parseHexDataObject(hexData);
        if (parsedResult) {
          this.parsedData = parsedResult;
        }
      },
      /**
       * 修剪16进制数据
       * @param {string} hexString 原始16进制字符串
       * @returns {string} 修剪后的有效数据部分
       */
      trimHexData: function(hexString) {
        if (typeof hexString !== "string" || !/^[0-9a-fA-F]+$/.test(hexString)) {
          throw new Error("无效的16进制字符串");
        }
        return hexString.slice(4, -2);
      },
      onSwiperChange(e2) {
        this.current = e2.detail.current;
      },
      // 获取当前位置
      getLocation() {
        uni.getLocation({
          type: "gcj02",
          // 返回国测局坐标（可用于腾讯地图、高德等）
          success: (res) => {
            this.latitude = res.latitude;
            this.longitude = res.longitude;
            this.markers[0].latitude = res.latitude;
            this.markers[0].longitude = res.longitude;
            this.markers[0].title = "当前位置";
            this.markers[0].callout.content = "你在这里";
          },
          fail: (err) => {
            formatAppLog("error", "at pages/index/index.vue:675", "获取位置失败", err);
            uni.showToast({
              title: "定位失败",
              icon: "none"
            });
          }
        });
      },
      onRegionChange(e2) {
        formatAppLog("log", "at pages/index/index.vue:684", "地图区域变化", e2);
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "section",
      {
        class: "control_container",
        style: vue.normalizeStyle($options.containerStyle),
        onTouchmove: _cache[2] || (_cache[2] = vue.withModifiers(() => {
        }, ["prevent"]))
      },
      [
        vue.createCommentVNode(" 头部内容 "),
        vue.createElementVNode(
          "view",
          {
            class: "control_title",
            style: vue.normalizeStyle($options.navbarStyle)
          },
          [
            vue.createElementVNode("view", { class: "header" }, [
              vue.createElementVNode("view", { class: "title" }, [
                vue.createTextVNode(" 雅迪王 "),
                vue.createElementVNode("text", { style: { "font-size": "16px" } }, "京AYU76G")
              ]),
              vue.createElementVNode("view", { class: "icons-container" }, [
                vue.createElementVNode("image", {
                  src: _imports_0,
                  class: "icon"
                })
              ])
            ]),
            vue.createElementVNode("view", { class: "subtitle" }, [
              vue.createElementVNode("text", null, "已关锁"),
              vue.createElementVNode("text", { class: "location-divider" }, "丨"),
              vue.createElementVNode("text", null, "北京市丰台区海鹰大厦")
            ])
          ],
          4
          /* STYLE */
        ),
        vue.createCommentVNode(" 地图内容 "),
        vue.createElementVNode("view", { class: "control_car_picture" }, [
          vue.createElementVNode("map", {
            id: "myMap",
            scale: 20,
            class: "map",
            latitude: $data.latitude,
            longitude: $data.longitude,
            markers: $data.markers,
            "show-location": "",
            onRegionchange: _cache[0] || (_cache[0] = (...args) => $options.onRegionChange && $options.onRegionChange(...args))
          }, [
            vue.createElementVNode("cover-view", { class: "map_control" }, [
              vue.createElementVNode("cover-image", {
                src: $data.connectionState == "已连接" ? "/static/bluetooth_select.png" : "/static/bluetooth.png",
                class: "map_image"
              }, null, 8, ["src"])
            ])
          ], 40, ["latitude", "longitude", "markers"])
        ]),
        vue.createCommentVNode(" 操控区域内容 "),
        vue.createElementVNode("view", { class: "control_quick-entry" }, [
          vue.createCommentVNode(" swiper 组件 "),
          vue.createElementVNode(
            "swiper",
            {
              class: "entry-swiper",
              "indicator-dots": false,
              "indicator-color": "rgba(0, 0, 0, .3)",
              "indicator-active-color": "#ffffff",
              autoplay: false,
              interval: 3e3,
              duration: 500,
              circular: false,
              vertical: false,
              onChange: _cache[1] || (_cache[1] = (...args) => $options.onSwiperChange && $options.onSwiperChange(...args))
            },
            [
              vue.createCommentVNode(" 动态生成 swiper-item "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($options.pages, (page, pageIndex) => {
                  return vue.openBlock(), vue.createElementBlock("swiper-item", { key: pageIndex }, [
                    vue.createElementVNode("view", { class: "entry-page" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(page, (item, index) => {
                          return vue.openBlock(), vue.createElementBlock("view", {
                            key: index,
                            class: "entry-item",
                            onClick: ($event) => $options.parseEventDynamicCode($event, item.evt)
                          }, [
                            vue.createElementVNode("image", {
                              src: item.icon,
                              class: "entry-icon",
                              mode: "aspectFit"
                            }, null, 8, ["src"]),
                            vue.createElementVNode(
                              "text",
                              { class: "entry-text" },
                              vue.toDisplayString(item.text),
                              1
                              /* TEXT */
                            )
                          ], 8, ["onClick"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ],
            32
            /* NEED_HYDRATION */
          ),
          vue.createElementVNode(
            "view",
            { class: "custom-indicator" },
            vue.toDisplayString($data.current + 1) + " / " + vue.toDisplayString($options.pages.length),
            1
            /* TEXT */
          )
        ]),
        vue.createCommentVNode(" 信息中心 "),
        vue.createElementVNode("view", { class: "control_info-root" }, [
          vue.createCommentVNode(" 左侧卡片 "),
          vue.createElementVNode("view", { class: "control_info-left-card" }, [
            vue.createCommentVNode(" 左上角 "),
            vue.createElementVNode("view", { class: "control_info-corner control_info-top-left" }, [
              vue.createElementVNode("text", { class: "control_info-date" }, "29天前"),
              vue.createElementVNode("text", { class: "control_info-label" }, "上次充电")
            ]),
            vue.createCommentVNode(" 右上角 "),
            vue.createElementVNode("view", { class: "control_info-corner control_info-top-right" }, [
              vue.createElementVNode("text", { class: "control_info-battery-value" }, [
                vue.createTextVNode(" 72"),
                vue.createElementVNode("text", { class: "control_info-battery-unit" }, "%")
              ])
            ]),
            vue.createCommentVNode(" 左下角 "),
            vue.createElementVNode("view", { class: "control_info-corner control_info-bottom-left" }, [
              vue.createElementVNode("text", { class: "control_info-label" }, "21天"),
              vue.createElementVNode("text", { class: "control_info-date" }, "已用天数")
            ]),
            vue.createCommentVNode(" 右下角 "),
            vue.createElementVNode("view", { class: "control_info-corner control_info-bottom-right" }, [
              vue.createElementVNode("text", { class: "control_info-label" }, "10天"),
              vue.createElementVNode("text", { class: "control_info-date" }, "可用天数")
            ])
          ]),
          vue.createCommentVNode(" 右侧两个区域 "),
          vue.createElementVNode("view", { class: "control_info-right-container" }, [
            vue.createElementVNode("view", { class: "control_info-right-item" }, [
              vue.createElementVNode("image", {
                src: _imports_1,
                class: "control_info-icon"
              }),
              vue.createElementVNode("view", { class: "control_car_text" }, [
                vue.createElementVNode("text", { class: "control_info-title" }, "感应模式"),
                vue.createElementVNode("text", { class: "control_info-status" }, "未开启")
              ])
            ]),
            vue.createElementVNode("view", { class: "control_info-right-item" }, [
              vue.createElementVNode("image", {
                src: _imports_2,
                class: "control_info-icon"
              }),
              vue.createElementVNode("text", { class: "control_info-title" }, "车辆中心")
            ])
          ])
        ]),
        vue.createCommentVNode(" 解释权区域 "),
        this.screenInfo.screenHeight > 600 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "control_footer"
        }, [
          vue.createElementVNode("view", { class: "footer-content" }, [
            vue.createElementVNode("view", { class: "footer-item" }, [
              vue.createElementVNode("text", { class: "footer-title" }, "连接状态："),
              vue.createElementVNode("text", { class: "footer-info" }, "当地图上蓝牙图标呈蓝色高亮时，表示车辆已就绪，可进行操控")
            ]),
            vue.createElementVNode("view", { class: "footer-item" }, [
              vue.createElementVNode("text", { class: "footer-title" }, "位置信息："),
              vue.createElementVNode("text", { class: "footer-info" }, "当前显示为车辆上一次蓝牙连接时的最后记录位置")
            ]),
            vue.createElementVNode("view", { class: "footer-item" }, [
              vue.createElementVNode("text", { class: "footer-title" }, "操控区域："),
              vue.createElementVNode("text", { class: "footer-info" }, "基础控制功能适用于全部车型，高级功能仅支持高配版及商务车型")
            ]),
            vue.createElementVNode("view", { class: "footer-item" }, [
              vue.createElementVNode("text", { class: "footer-title" }, "电量信息："),
              vue.createElementVNode("text", { class: "footer-info" }, "蓝牙连接后同步获取，可用天数预估基于本次充电后的实际用车习惯动态计算")
            ]),
            vue.createElementVNode("view", { class: "footer-item" }, [
              vue.createElementVNode("text", { class: "footer-title" }, "感应模式："),
              vue.createElementVNode("text", { class: "footer-info" }, "需在设置中完成蓝牙配对后方可启用（仅限车主账户操作）")
            ]),
            vue.createCommentVNode(" 更多内容 ")
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ],
      36
      /* STYLE, NEED_HYDRATION */
    );
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/PC/Documents/GitHub/Genesis/pages/index/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/PC/Documents/GitHub/Genesis/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
