/**
 * 获取设备屏幕信息（Promise 风格）
 * @returns {Promise<Object>} 设备信息对象
 */
export const info_screen = () => {
  return new Promise((resolve, reject) => {
    uni.getSystemInfo({
      success: function (res) {
        // res 包含 windowHeight / windowWidth / screenHeight / screenWidth 等
        console.log('屏幕可用高度:', res.windowHeight);
        resolve(res); // 成功返回设备信息
      },
      fail: function (err) {
        console.error('获取系统信息失败', err);
        reject(err); // 错误处理
      }
    });
  });
};