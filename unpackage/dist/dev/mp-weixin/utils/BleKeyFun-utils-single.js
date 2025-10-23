"use strict";
const common_vendor = require("../common/vendor.js");
const utils_byteUtil = require("./byte-util.js");
const utils_appUtil = require("./app-util.js");
const utils_logger = require("./logger.js");
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
  utils_logger.logger.e("释放deviceId");
  deviceId = "";
}
function releaseBle() {
  gIdc = "";
  if (discovering) {
    utils_logger.logger.e("停止扫描");
    stopScanBle();
  }
  if (connected) {
    utils_logger.logger.e("断开连接");
    disConnect();
  }
  if (isBLEAdapterOpen) {
    utils_logger.logger.e("关闭适配器");
    closeBluetoothAdapter();
  }
  releaseData();
  utils_logger.logger.e("关闭连接事件监听");
  common_vendor.index.offBLEConnectionStateChange();
  utils_logger.logger.e("关闭特征变化监听");
  common_vendor.index.offBLECharacteristicValueChange();
}
function isSupportedBLE(isSupported) {
  const deviceInfo = common_vendor.index.getDeviceInfo();
  var brand = deviceInfo.brand;
  var platform = deviceInfo.platform;
  var system = deviceInfo.system;
  utils_logger.logger.e("手机型号:" + brand + ",系统信息:" + platform + ",系统版本:" + system);
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
  common_vendor.index.openBluetoothAdapter({
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:194", res);
      isBLEAdapterOpen = true;
      cOpenBluetoothAdapter(true);
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:199", res);
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
  common_vendor.index.getBluetoothAdapterState({
    success: function(res) {
      onBleAdapterState(res);
    },
    fail: function(res) {
      onBleAdapterState(res);
    }
  });
}
function onBluetoothAdapterStateChange() {
  common_vendor.index.onBluetoothAdapterStateChange(function(res) {
    utils_logger.logger.e(`adapterState changed, now is`, res);
    setBLEAdapterState(res.available, res.discovering);
  });
}
function closeBluetoothAdapter() {
  common_vendor.index.closeBluetoothAdapter({
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:245", res);
      isBLEAdapterOpen = false;
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:249", res);
    }
  });
}
function startConnect() {
  common_vendor.index.createBLEConnection({
    deviceId,
    success: function(res) {
      gWriteService = "";
      gWriteCharacteristic = "";
      gReadService = "";
      gReadCharacteristic = "";
      getBLEDeviceServices();
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:276", res);
      gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED);
    }
  });
}
function startConnectConnected() {
  getBLEDeviceServicesConnected();
}
function onBLEConnectionStateChange() {
  common_vendor.index.onBLEConnectionStateChange(function(res) {
    utils_logger.logger.e(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
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
  common_vendor.index.closeBLEConnection({
    deviceId,
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:319", res);
      connected = false;
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:323", res);
    }
  });
}
function startBluetoothDevicesDiscovery() {
  common_vendor.index.startBluetoothDevicesDiscovery({
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:339", res);
      discovering = res.isDiscovering;
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:343", res);
      discovering = res.isDiscovering;
      gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR);
      gBluetoothState(DEFAULT_BLUETOOTH_STATE.BLUETOOTH_DEVICES_DISCOVERY_FAILD);
    }
  });
}
function onBluetoothDeviceFound() {
  common_vendor.index.onBluetoothDeviceFound(function(devices) {
    if (devices.devices[0].name != "") {
      utils_logger.logger.e("device found:" + devices.devices[0].name);
    }
    if (gIdc == devices.devices[0].localName) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:360", devices);
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
  common_vendor.index.stopBluetoothDevicesDiscovery({
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:383", res);
      discovering = false;
      utils_logger.logger.e("stopScanBle-true discovering:" + discovering);
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:388", res);
      discovering = false;
      utils_logger.logger.e("stopScanBle-false discovering:" + discovering);
    }
  });
}
function getBLEDeviceServices() {
  common_vendor.index.getBLEDeviceServices({
    deviceId,
    success: function(res) {
      for (var i = 0; i < res.services.length; i++) {
        common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:407", res);
        if (res.services[i].uuid.indexOf(WRITE_SERVICE_SHORTHAND) != -1) {
          gWriteService = res.services[i].uuid;
        }
        if (res.services[i].uuid.indexOf(READ_SERVICE_SHORTHAND) != -1) {
          gReadService = res.services[i].uuid;
        }
      }
      utils_logger.logger.e("device设备的读服务id:", gWriteService);
      utils_logger.logger.e("device设备的写服务id:", gReadService);
      if (gWriteService != "" && gReadService != "" && (gWriteCharacteristic == "" || gReadCharacteristic == "")) {
        getBLEDeviceWriteCharacteristics();
      }
    }
  });
}
function getBLEDeviceServicesConnected() {
  common_vendor.index.getBLEDeviceServices({
    deviceId,
    success: function(res) {
      utils_logger.logger.e("device设备的读服务id:", WriteServiceFixed);
      utils_logger.logger.e("device设备的写服务id:", ReadServiceFixed);
      getBLEDeviceWriteCharacteristicsConnected();
    }
  });
}
function getBLEDeviceReadCharacteristics() {
  common_vendor.index.getBLEDeviceCharacteristics({
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
      utils_logger.logger.e("device设备的读特征值id:" + gReadCharacteristic);
      utils_logger.logger.e("device设备的读Random特征值id:" + gReadRandomCharacteristic);
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
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:464", res);
    }
  });
}
function getBLEDeviceReadCharacteristicsConnected() {
  common_vendor.index.getBLEDeviceCharacteristics({
    deviceId,
    serviceId: ReadServiceFixed,
    success: function(res) {
      utils_logger.logger.e("device设备的读特征值id:" + ReadCharacteristicFixed);
      utils_logger.logger.e("device设备的读Random特征值id:" + ReadRandomCharacteristicFixed);
      notifyBLECharacteristicValueChangeConnected();
      readBLECharacteristicValueConnected();
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:480", res);
    }
  });
}
function notifyBLECharacteristicValueChange() {
  common_vendor.index.notifyBLECharacteristicValueChange({
    deviceId,
    serviceId: gReadService,
    characteristicId: gReadCharacteristic,
    state: true,
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:495", res);
      utils_appUtil.appUtil.getSystemInfoComplete(
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
          common_vendor.index.setBLEMTU({
            deviceId,
            mtu: 240,
            success: function(res2) {
              common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:511", "MTU modify success");
            },
            fail: function(res2) {
              common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:514", "MTU modify fail");
            }
          });
        }
      );
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:522", res);
    }
  });
}
function notifyBLECharacteristicValueChangeConnected() {
  common_vendor.index.notifyBLECharacteristicValueChange({
    deviceId,
    serviceId: ReadServiceFixed,
    characteristicId: ReadCharacteristicFixed,
    state: true,
    success: function(res) {
      utils_appUtil.appUtil.getSystemInfoComplete(
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
          common_vendor.index.setBLEMTU({
            deviceId,
            mtu: 240,
            success: function(res2) {
              common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:549", "MTU modify success");
            },
            fail: function(res2) {
              common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:552", "MTU modify fail");
            }
          });
        }
      );
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:559", res);
    }
  });
}
function readBLECharacteristicValue() {
  common_vendor.index.readBLECharacteristicValue({
    deviceId,
    serviceId: gReadService,
    characteristicId: gReadRandomCharacteristic,
    state: true,
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:571", res);
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:574", res);
    }
  });
}
function readBLECharacteristicValueConnected() {
  common_vendor.index.readBLECharacteristicValue({
    deviceId,
    serviceId: ReadServiceFixed,
    characteristicId: ReadRandomCharacteristicFixed,
    state: true,
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:586", res);
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:589", res);
    }
  });
}
function getBLEDeviceWriteCharacteristics() {
  common_vendor.index.getBLEDeviceCharacteristics({
    deviceId,
    serviceId: gWriteService,
    success: function(res) {
      for (var j = 0; j < res.characteristics.length; j++) {
        if (res.characteristics[j].uuid.indexOf(WIRTE_CHARACTERISTIC_SHORTHAND) != -1) {
          gWriteCharacteristic = res.characteristics[j].uuid;
        }
      }
      utils_logger.logger.e("device设备的写特征值id:" + gWriteCharacteristic);
      if (gReadCharacteristic == "") {
        getBLEDeviceReadCharacteristics();
      }
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:614", res);
    }
  });
}
function getBLEDeviceWriteCharacteristicsConnected() {
  common_vendor.index.getBLEDeviceCharacteristics({
    deviceId,
    serviceId: WriteServiceFixed,
    success: function(res) {
      utils_logger.logger.e("device设备的写特征值id:" + WriteCharacteristicFixed);
      getBLEDeviceReadCharacteristicsConnected();
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:628", res);
    }
  });
}
function onBLECharacteristicValueChange() {
  common_vendor.index.onBLECharacteristicValueChange(function(characteristic) {
    var resultArrayBufferData = characteristic.value;
    var receiverHexData = utils_byteUtil.utils.buf2hex(resultArrayBufferData);
    var arrayData = utils_byteUtil.utils.hexStringToArray(receiverHexData);
    const formatted = getBLEDataTime();
    if (characteristic.characteristicId.indexOf(READRANDOM_CHARACTERISTIC_SHORTHAND) != -1) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:644", "随机指令接收:" + formatted + "  数据:" + receiverHexData);
      utils_logger.logger.e("随机指令数据:" + receiverHexData, false, false, true);
      gOnReceiveValue(0, arrayData, utils_byteUtil.utils.hexCharCodeToStr(receiverHexData), receiverHexData);
    } else {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:648", "通知指令接收:" + formatted + "  数据:" + receiverHexData);
      utils_logger.logger.e("通知指令接收:" + receiverHexData, false, false, true);
      gOnReceiveValue(1, arrayData, utils_byteUtil.utils.hexCharCodeToStr(receiverHexData), receiverHexData);
    }
  });
}
function onBLECharacteristicValueChangeConnected() {
  common_vendor.index.onBLECharacteristicValueChange(function(characteristic) {
    var resultArrayBufferData = characteristic.value;
    var receiverHexData = utils_byteUtil.utils.buf2hex(resultArrayBufferData);
    var arrayData = utils_byteUtil.utils.hexStringToArray(receiverHexData);
    const formatted = getBLEDataTime();
    if (characteristic.characteristicId == ReadRandomCharacteristicFixed) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:663", "随机指令接收:" + formatted + "  数据:" + receiverHexData);
      utils_logger.logger.e("随机指令数据:" + receiverHexData, false, false, true);
      gOnReceiveValue(0, arrayData, utils_byteUtil.utils.hexCharCodeToStr(receiverHexData), receiverHexData);
    } else {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:667", "通知指令接收:" + formatted + "  数据:" + receiverHexData);
      utils_logger.logger.e("通知指令接收:" + receiverHexData, false, false, true);
      gOnReceiveValue(1, arrayData, utils_byteUtil.utils.hexCharCodeToStr(receiverHexData), receiverHexData);
    }
  });
}
function writeBLECharacteristicValue(buffer, writeBLECharacteristicValue2) {
  common_vendor.index.writeBLECharacteristicValue({
    deviceId,
    serviceId: WriteServiceFixed,
    characteristicId: WriteCharacteristicFixed,
    value: buffer,
    success: function(res) {
      writeBLECharacteristicValue2(true);
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:687", res);
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
    var sendHexData = utils_byteUtil.utils.buf2hex(sendArrayBufferData);
    if (isSuccess) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:834", "指令发送成功:" + formatted + "  数据:" + sendHexData);
      utils_logger.logger.e("指令发送成功:" + sendHexData, false, false, true);
    } else {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:837", "!!!指令发送失败:" + formatted + "  数据:" + sendHexData);
      utils_logger.logger.e("!!!指令发送失败:" + sendHexData, false, false, true);
    }
  });
}
function makePair() {
  common_vendor.index.makeBluetoothPair({
    deviceId,
    timeout: 2e4,
    success: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:852", res);
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:855", res);
    }
  });
}
function saveBLEDeviceInfo(deviceIDC) {
  common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:861", "saveBLEDeviceInfo");
  var param = {};
  param["deviceId"] = deviceId;
  param["readServiceUUID"] = gReadService;
  param["writeServiceUUID"] = gWriteService;
  param["readCharacUUID"] = gReadCharacteristic;
  param["writeCharacUUID"] = gWriteCharacteristic;
  param["randomServiceUUID"] = gReadService;
  param["randomCharacUUID"] = gReadRandomCharacteristic;
  var jparam = JSON.stringify(param);
  common_vendor.index.setStorage({
    key: deviceIDC,
    data: jparam,
    success: function() {
    }
  });
}
function getBLEDeviceInfo(deviceIDC, result) {
  common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:879", "getBLEDeviceInfo");
  common_vendor.index.getStorage({
    key: deviceIDC,
    success: function(res) {
      var param = JSON.parse(res.data);
      deviceId = param.deviceId;
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:885", deviceId);
      gReadService = param.readServiceUUID;
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:887", gReadService);
      gWriteService = param.writeServiceUUID;
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:889", gWriteService);
      gReadCharacteristic = param.readCharacUUID;
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:891", gReadCharacteristic);
      gWriteCharacteristic = param.writeCharacUUID;
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:893", gWriteCharacteristic);
      gReadRandomCharacteristic = param.randomCharacUUID;
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:895", gReadRandomCharacteristic);
      result(true, param);
    },
    fail: function(res) {
      common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:900", res);
      result(false);
    }
  });
}
function clrBLEDeviceInfo(deviceIDC) {
  common_vendor.index.__f__("log", "at utils/BleKeyFun-utils-single.js:907", "clrBLEDeviceInfo");
  common_vendor.index.removeStorage({
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
exports.bleKeyManager = bleKeyManager;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/BleKeyFun-utils-single.js.map
