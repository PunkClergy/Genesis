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
  const _imports_0 = "/static/set_up.png";
  const _imports_1 = "/static/bluetooth.png";
  const _imports_2 = "/static/gy.png";
  const _imports_3 = "/static/clzx.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
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
            icon: "/static/lock.png"
          },
          {
            text: "关锁",
            icon: "/static/unlock.png"
          },
          {
            text: "寻车",
            icon: "/static/xunche.png"
          },
          {
            text: "尾箱",
            icon: "/static/weixiang.png"
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
        screenInfo: {}
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
        formatAppLog("error", "at pages/index/index.vue:195", "初始化失败:", error);
      } finally {
        this.isLoading = false;
      }
      this.getLocation();
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
        formatAppLog("log", "at pages/index/index.vue:212", this.screenInfo);
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
      // 初始化屏幕信息
      async initialScreenInfo() {
        try {
          this.screenInfo = await info_screen();
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:231", "[ScreenInfo] 获取屏幕信息失败:", error);
        }
      },
      onSwiperChange(e) {
        this.current = e.detail.current;
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
            formatAppLog("error", "at pages/index/index.vue:251", "获取位置失败", err);
            uni.showToast({
              title: "定位失败",
              icon: "none"
            });
          }
        });
      },
      onRegionChange(e) {
        formatAppLog("log", "at pages/index/index.vue:260", "地图区域变化", e);
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
                src: _imports_1,
                class: "map_image"
              })
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
                            onClick: ($event) => _ctx.handleClick(item)
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
                src: _imports_2,
                class: "control_info-icon"
              }),
              vue.createElementVNode("view", { class: "control_car_text" }, [
                vue.createElementVNode("text", { class: "control_info-title" }, "感应模式"),
                vue.createElementVNode("text", { class: "control_info-status" }, "未开启")
              ])
            ]),
            vue.createElementVNode("view", { class: "control_info-right-item" }, [
              vue.createElementVNode("image", {
                src: _imports_3,
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
