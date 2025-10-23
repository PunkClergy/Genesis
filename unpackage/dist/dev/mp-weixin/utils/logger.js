"use strict";
const common_vendor = require("../common/vendor.js");
function e(tag, msg) {
  if (msg) {
    common_vendor.index.__f__("log", "at utils/logger.js:6", tag, msg);
  } else {
    common_vendor.index.__f__("log", "at utils/logger.js:8", tag);
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
  common_vendor.index.setStorage({
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
    var value = common_vendor.index.getStorageSync("log");
    if (value) {
      try {
        var data = value + msg;
        var length = data.length;
        if (length > 5120) {
          common_vendor.index.setStorageSync("log", data.substring(4096));
        } else {
          common_vendor.index.setStorageSync("log", data);
        }
      } catch (e2) {
        common_vendor.index.__f__("log", "at utils/logger.js:71", "CatchClause", e2);
        common_vendor.index.__f__("log", "at utils/logger.js:72", "CatchClause", e2);
      }
    } else {
      try {
        common_vendor.index.setStorageSync("log", msg);
      } catch (e2) {
        common_vendor.index.__f__("log", "at utils/logger.js:78", "CatchClause", e2);
        common_vendor.index.__f__("log", "at utils/logger.js:79", "CatchClause", e2);
      }
    }
  } catch (e2) {
    common_vendor.index.__f__("log", "at utils/logger.js:83", "CatchClause", e2);
    common_vendor.index.__f__("log", "at utils/logger.js:84", "CatchClause", e2);
  }
}
const logger = {
  e,
  clear,
  getDateString
};
exports.logger = logger;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/logger.js.map
