"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_scheme_screen = require("../../utils/scheme/screen.js");
const utils_BleKeyFunUtilsSingle = require("../../utils/BleKeyFun-utils-single.js");
require("../../utils/request/http.js");
const common_assets = require("../../common/assets.js");
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
const _sfc_main = {
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
          icon: "/static/sc.png"
        },
        {
          text: "降窗",
          icon: "/static/jc.png"
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
    common_vendor.index.hideTabBar({
      animation: true
    });
    try {
      await Promise.allSettled([
        this.initialScreenInfo()
      ]);
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/index/index.vue:222", "初始化失败:", error);
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
      common_vendor.index.__f__("log", "at pages/index/index.vue:246", this.screenInfo);
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
        this.screenInfo = await utils_scheme_screen.info_screen();
      } catch (error) {
        common_vendor.index.showToast({
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
        const isConnected = utils_BleKeyFunUtilsSingle.bleKeyManager.getBLEConnectionState();
        const connectionID = isConnected ? utils_BleKeyFunUtilsSingle.bleKeyManager.getBLEConnectionID() : "";
        this.connectionState = isConnected ? "已连接" : "未连接";
        this.connectionID = connectionID;
      }, 200);
    },
    // 连接蓝牙
    handleStart() {
      const mockBluetoothData = {
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
          utils_BleKeyFunUtilsSingle.bleKeyManager.connectBLE(
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
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: message,
          icon: "none",
          duration: 3e3,
          mask: true
        });
      };
      const showSuccessToast = (message = "操作成功") => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: message,
          icon: "none",
          duration: 2e3
        });
      };
      const stateHandlers = {
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE]: () => {
          common_vendor.index.showLoading({
            title: "加载中...",
            mask: true
          });
        },
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR]: () => {
          common_vendor.index.hideLoading();
        },
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE]: () => {
          showErrorToast("请打开蓝牙");
        },
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND]: () => {
          showErrorToast("没有发现设备");
        },
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED]: () => {
          showErrorToast("蓝牙连接失败");
        },
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED]: () => {
          showErrorToast("您的手机不支持低功耗蓝牙");
        },
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED]: () => {
          showErrorToast("数据发送失败");
        },
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE]: () => {
          showErrorToast("设备超时无响应");
        },
        [utils_BleKeyFunUtilsSingle.bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS]: () => {
          showSuccessToast("连接成功");
        }
      };
      const handler = stateHandlers[state];
      if (handler) {
        handler();
      } else {
        common_vendor.index.__f__("warn", "at pages/index/index.vue:380", "未知的蓝牙状态:", state);
        common_vendor.index.hideLoading();
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
        common_vendor.index.showModal({
          title: "提示",
          content: commandCode == 3 || commandCode == 4 ? "确认下发指令" : "如原车钥匙不支持此功能请自行点击【更多钥匙功能】关闭",
          confirmText: commandCode == 3 || commandCode == 4 ? "确认" : "确认支持",
          complete: (res) => {
            if (res.confirm) {
              common_vendor.index.showLoading({
                title: "加载中...",
                mask: true
              });
              this.btnCmdSend(commandCode, code);
              setTimeout(() => {
                common_vendor.index.hideLoading();
              }, 1e3);
              this.handleSendInfo(commandCode, code);
            }
          }
        });
        return;
      }
      if (this.connectionState == "未连接") {
        common_vendor.index.showToast({
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
      utils_BleKeyFunUtilsSingle.bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
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
      utils_BleKeyFunUtilsSingle.bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
    },
    // 升窗降窗指令封装
    PackAndSend07: function(type, len, data) {
      const defaultData = [0, 0, 0, 0, 0, 0, 0];
      var packet = [36, type, len, data, ...defaultData, 36];
      utils_BleKeyFunUtilsSingle.bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
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
    onSwiperChange(e) {
      this.current = e.detail.current;
    },
    // 获取当前位置
    getLocation() {
      common_vendor.index.getLocation({
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
          common_vendor.index.__f__("error", "at pages/index/index.vue:678", "获取位置失败", err);
          common_vendor.index.showToast({
            title: "定位失败",
            icon: "none"
          });
        }
      });
    },
    onRegionChange(e) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:687", "地图区域变化", e);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.s($options.navbarStyle),
    c: $data.connectionState == "已连接" ? "/static/bluetooth_select.png" : "/static/bluetooth.png",
    d: $data.latitude,
    e: $data.longitude,
    f: $data.markers,
    g: common_vendor.o((...args) => $options.onRegionChange && $options.onRegionChange(...args)),
    h: common_vendor.f($options.pages, (page, pageIndex, i0) => {
      return {
        a: common_vendor.f(page, (item, index, i1) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.text),
            c: index,
            d: common_vendor.o(($event) => $options.parseEventDynamicCode($event, item.evt), index)
          };
        }),
        b: pageIndex
      };
    }),
    i: common_vendor.o((...args) => $options.onSwiperChange && $options.onSwiperChange(...args)),
    j: common_vendor.t($data.current + 1),
    k: common_vendor.t($options.pages.length),
    l: common_assets._imports_1,
    m: common_assets._imports_2,
    n: this.screenInfo.screenHeight > 600
  }, this.screenInfo.screenHeight > 600 ? {} : {}, {
    o: common_vendor.s($options.containerStyle),
    p: common_vendor.o(() => {
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
