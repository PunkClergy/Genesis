"use strict";
const common_vendor = require("../../common/vendor.js");
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
      common_vendor.index.__f__("log", "at utils/request/http.js:65", "发送请求:", {
        url,
        method: mergedConfig.method,
        data: requestData,
        header: mergedConfig.header
      });
      const response = await common_vendor.index.request({
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
        common_vendor.index.__f__("error", "at utils/request/http.js:90", "接口返回异常:", res);
        return Promise.reject(res.data);
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/request/http.js:95", "请求异常:", error);
      this.handleError(error);
      return Promise.reject(error);
    } finally {
      if (mergedConfig.loading) {
        common_vendor.index.hideLoading();
      }
    }
  }
  // 错误处理
  handleError(error) {
    const errMsg = error.errMsg || "";
    if (errMsg.includes("timeout")) {
      common_vendor.index.showToast({
        title: "请求超时",
        icon: "none"
      });
    } else if (errMsg.includes("abort")) {
      common_vendor.index.__f__("log", "at utils/request/http.js:115", "请求被取消");
    } else {
      common_vendor.index.showToast({
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
    const token = common_vendor.index.getStorageSync("token");
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
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    }
    return response;
  }
});
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/request/http.js.map
