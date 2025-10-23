"use strict";
const common_vendor = require("../../common/vendor.js");
const info_screen = () => {
  return new Promise((resolve, reject) => {
    common_vendor.index.getSystemInfo({
      success: function(res) {
        common_vendor.index.__f__("log", "at utils/scheme/screen.js:10", "屏幕可用高度:", res.windowHeight);
        resolve(res);
      },
      fail: function(err) {
        common_vendor.index.__f__("error", "at utils/scheme/screen.js:14", "获取系统信息失败", err);
        reject(err);
      }
    });
  });
};
exports.info_screen = info_screen;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/scheme/screen.js.map
