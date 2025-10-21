<template>
	<view class="container" :style="{ height: `${safeScreenHeight}px` }">
		<CustomNavBar title="手机钥匙控车" />
		
		<!-- 车辆信息卡片 -->
		<view class="vehicle-card" :style="'margin-top: ' + (navbarTotalHeight) + 'px;'">
			<!-- 车牌与提示信息 -->
			<view class="license-plate-section">
				<view class="license-plate-container">
					<view class="vehicle-info">
						<text class="license-plate" v-if="bluetoothData.platenumber">{{ bluetoothData.platenumber }}</text>
						<text class="license-plate bind-vehicle" @tap="handleBindVechi" v-else>请绑定车辆</text>
						<view class="vehicle-status">
							<view class="status-dot" :class="connectionState === '已连接' ? 'connected' : 'disconnected'"></view>
							<text class="status-text">{{ connectionState }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 车辆图片 -->
			<view class="vehicle-image-container">
				<image class="vehicle-image" src="https://k3a.wiselink.net.cn/img/app/blue/privateCar.png" mode="aspectFit"></image>
				<view class="vehicle-overlay">
					<view class="battery-status" @tap="handleVoltage">
					
						<image :src="'https://k3a.wiselink.net.cn/img/app/blue/battery_' + voltage_image + '.png'"
							class="battery-icon" />
						<text class="battery-text" v-if="parsedData.electric">{{ parsedData.electric || 100 }}%</text>
						<text class="battery-text" v-else>--</text>
					</view>
					
					<view class="bluetooth-container">
					<view :class="'bluetooth-status ' + (connectionState == '已连接' ? 'connected' : 'disconnected')"
							@tap="handleBlueToothState">
							<icon v-if="connectionState == '已连接'" type="success" size="16" color="#2d8cf0"></icon>
							<view v-else class="loading-icon"></view>
							<text>{{ connectionState == '已连接' ? '蓝牙已连接' : '蓝牙已断开' }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 模式选择器 -->
			<view class="mode-section" v-if="!netWork">
				<view class="GY-sensor-mode-wrapper" @tap="toggleSensorMode">
					<view
						:class="'GY-sensor-mode ' + (parsedData.induction == '感应模式' && connectionState == '已连接' ? 'on' : 'off')">
						<view
							:class="'GY-ripple ' + (parsedData.induction == '感应模式' && connectionState == '已连接' ? 'active' : '')">
						</view>
						<view class="GY-icon"></view>
						<view class="GY-label"
							:style="'color:' + (parsedData.induction == '感应模式' && connectionState == '已连接' ? '#fff' : '#333') + ';'">
							<text>{{ parsedData.induction == '感应模式' && connectionState == '已连接' ? '感应模式已开启' : '感应模式已关闭' }}</text>
							<image :src="
                                    parsedData.induction == '感应模式' && connectionState == '已连接'
                                        ? 'https://k3a.wiselink.net.cn/img/app/blue/arrow.png'
                                        : 'https://k3a.wiselink.net.cn/img/app/blue/arrow_01.png'
                                " style="width: 37rpx; height: 37rpx" />
						</view>
					</view>
				</view>
			</view>
			
			<view class="GY-grant" v-else>
				<view class="grant-title">授权使用时间</view>
				<view class="grant-period">{{ bluetoothData.startDate }} 至 {{ bluetoothData.endDate }}</view>
			</view>
		</view>

		<!-- 控制功能区 - 每行3个大按钮 -->
		<view class="control-section">
			<view class="control-title">
				<view class="title-bold">手动操作</view>
				<view class="more-functions" @tap="handleToConfigure">
					<text>更多钥匙功能</text>
					<image src="/static/privateCar/right_1.png" />
				</view>
			</view>
			<view class="control-grid">
				<view class="control-item" v-for="(item, index) in controlItems" :key="index">
					<block v-if="item.enabled">
						<view class="control-icon" @tap="parseEventDynamicCode($event, item.evt)" :data-id="item.id">
							<image
								:src="item.id === 1 || item.id === 2 ? ((item.id === 1 ? parsedData.lock : !parsedData.lock) ? item.ative : item.icon) : item.icon"
								class="control-icon-image"></image>
						</view>
						<text class="control-name">{{ item.name }}</text>
					</block>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import bleKeyManager from '@/utils/BleKeyFun-utils-single.js'
	import {
		u_getCarBluetoothKeyByCode,
		u_paivatecarList,
		u_paivatesendInfo,
		u_paivateuploadLog
	} from '@/api'
	import CustomNavBar from "@/components/custom-header/index.vue";
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	// 操作区指令封装常量
	const VehicleCommand = {
		UNLOCK: 3, //开锁
		LOCK: 4, //关锁
		OPEN_TRUNK: 5, //尾箱
		FIND_CAR: 6, //寻车
		CONTROL_WINDOW: 7, //操作车窗
	};
	const WindowAction = {
		RAISE: 3, //升窗
		LOWER: 4, //降窗
	};
	export default {
		components: {
			CustomNavBar
		},
		data() {
			// 图片资源基础路径
			const baseUrl = 'https://k3a.wiselink.net.cn/img/app/blue';
			return {
				screenInfo: {}, // 屏幕信息对象
				// 设备唯一编号
				deviceIDC: '932505100228',
				// 通信密钥
				orgKey: [51, 71, 1, 130, 52, 51],
				// 原始密钥（用于跳转）
				orgKeyOld: '',

				// 蓝牙连接状态：未连接 / 已连接
				connectionState: '未连接',
				// 当前连接ID
				connectionID: '',
				// 是否点击蓝牙状态区域
				blue_tooth_state: false,

				// 解析的设备数据
				parsedData: {
					electric: '', // 电量
					induction: '', // 感应模式
					lock: '' // 锁状态
				},
				// 电池图标等级（100/75/50）
				voltage_image: '100',
				// 是否点击电池区域
				voltage_state: false,

				// 操作按钮列表
				controlItems: [{
						id: 1,
						name: '开锁',
						enabled: true,
						icon: `${baseUrl}/unlock_off.png`,
						ative: `${baseUrl}/unlock_on.png`,
						evt: 'handleUnlock'
					},
					{
						id: 2,
						name: '关锁',
						enabled: true,
						icon: `${baseUrl}/lock_off.png`,
						ative: `${baseUrl}/lock_on.png`,
						evt: 'handleLock'
					},
					{
						id: 3,
						name: '尾箱',
						enabled: true,
						icon: `${baseUrl}/box_off.png`,
						evt: 'handleOpenTrunk'
					},
					{
						id: 4,
						name: '寻车',
						enabled: true,
						icon: `${baseUrl}/search_off.png`,
						evt: 'handleFindCar'
					},
					{
						id: 5,
						name: '升窗',
						enabled: true,
						icon: `${baseUrl}/search_off.png`,
						evt: 'handleRaiseTheWindow'
					},
					{
						id: 6,
						name: '降窗',
						enabled: true,
						icon: `${baseUrl}/search_off.png`,
						evt: 'handleLowerTheWindow'
					}
				],

				// 指令日志记录
				logs: [],

				// 手机系统信息
				deviceInfo: {},

				// 页面传参
				options: {},

				// 是否为分享用户
				netWork: false,

				// 轮询定时器ID
				pageInterval: 0,

				// 当前车辆信息
				bluetoothData: {
					platenumber: '', // 车牌号
					startDate: '', // 授权开始时间
					endDate: '' // 授权结束时间
				}
			};
		},
		onLoad(options) {
			// 保存入参（仅在后续需要时才赋值）
			this.options = options;
			// 初始化配置缓存（假设是同步）
			this.initToConfigureCache();
			// 获取系统信息（适配屏幕等）
			this.handleSystemInfo();
		},
		onShow: function() {
			// 获取设备屏幕信息
			this.initialScreenInfo()
			// 开始蓝牙连接流程
			this.handleStart();
			// 启动连接状态轮询
			this.startConnectionStatusPolling();
		},
		onHide: function() {
			this.cleanupResources();
		},
		onUnload: function() {
			this.cleanupResources();
		},
		computed: {
			// 状态栏高度
			statusBarHeight() {
				return this.screenInfo.statusBarHeight || 0;
			},
			// 导航栏高度
			navBarHeight() {
				return this.screenInfo.platform === 'ios' ? 49 : 44;
			},
			// 导航栏总高度（状态栏+导航栏）
			navbarTotalHeight() {
				return this.statusBarHeight + this.navBarHeight;
			},
			// 安全区域高度
			safeScreenHeight() {
				return this.screenInfo.screenHeight || 667;
			}
		},

		methods: {
			// 获取屏幕信息
			async initialScreenInfo() {
				try {
					this.screenInfo = await info_screen();
				} catch (error) {
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					});
				}
			},
			// 统一清理页面资源
			cleanupResources() {
				// 停止定时器（安全清除）
				if (this.pageInterval) {
					clearInterval(this.pageInterval);
					this.pageInterval = null;
				}
				// 重置连接状态
				this.connectionState = '未连接';
				this.connectionID = '';
				this.parsedData = {};
				// 关闭屏幕常亮
				uni.setKeepScreenOn({
					keepScreenOn: false
				});
				// 延迟，释放蓝牙资源
				setTimeout(() => {
					bleKeyManager.releaseBle();
				}, 500);
			},
			// 手动操作区执行事件
			handleEvent(eventType) {
				const actions = {
					handleUnlock: () => {
						this.sendVehicleCommandFun(VehicleCommand.UNLOCK, '');
					},
					handleLock: () => {
						this.sendVehicleCommandFun(VehicleCommand.LOCK, '');
					},
					handleOpenTrunk: () => {
						this.sendVehicleCommandFun(VehicleCommand.OPEN_TRUNK, '');
					},
					handleFindCar: () => {
						this.sendVehicleCommandFun(VehicleCommand.FIND_CAR, '');
					},
					handleRaiseTheWindow: () => {
						this.sendVehicleCommandFun(VehicleCommand.CONTROL_WINDOW, WindowAction.RAISE);
					},
					handleLowerTheWindow: () => {
						this.sendVehicleCommandFun(VehicleCommand.CONTROL_WINDOW, WindowAction.LOWER);
					},
				};

				const action = actions[eventType];
				if (typeof action === 'function') {
					action();
				}
			},
			// 点击操作手动区事件
			parseEventDynamicCode($, evt) {
				this.handleEvent(evt);
			},
			// 切换感应模式
			toggleSensorMode() {
				const induction = this.parsedData.induction;
				const isManualInduction = !induction || induction === '手动模式';
				if (this?.bluetoothData?.platenumber) {
					if (!isManualInduction) {
						// 此时为感应模式，可直接切换手动模式
						uni.showModal({
							title: '提示',
							content: '确认关闭感应模式?',
							complete: (res) => {
								if (res.confirm) {
									this.btnCmdSend(58, [0]);
								}
							}
						});
						return;
					}
					if (this.parsedData.induction != '感应模式') {
						uni.showModal({
							title: '提示',
							content: '请到开通设定-功能设置处完善设置',
							complete: (res) => {
								if (res.confirm) {
									uni.redirectTo({
										url: '/pages/listOfPrivateCars/list/index?tabs=3'
									});
								}
							}
						});
					}
				} else {
					uni.showModal({
						title: '提示',
						content: '请先开通设定再到开通设定-功能设置处完善设置',
						confirmText: '立即开通',
						success: (res) => {
							if (res.confirm) {
								uni.redirectTo({
									url: '/pages/listOfPrivateCars/list/index'
								});
							}
						}
					});
				}
			},

			// 获取设备信息
			handleSystemInfo() {
				uni.getSystemInfo({
					success: (res) => {
						const {
							brand,
							model,
							system,
							platform,
							screenWidth,
							screenHeight,
							pixelRatio,
							statusBarHeight
						} = res;
						this.deviceInfo = {
							brand,
							model,
							system,
							platform,
							screenWidth,
							screenHeight,
							pixelRatio,
							statusBarHeight
						}

						console.log('设备信息:', this.deviceInfo);
					},
					fail: console.error
				});
			},

			// 启动连接状态轮询
			startConnectionStatusPolling() {
				if (this.pageInterval) {
					return;
				}
				this.pageInterval = setInterval(() => {
					const isConnected = bleKeyManager.getBLEConnectionState();
					const connectionID = isConnected ? bleKeyManager.getBLEConnectionID() : '';
					const displayText = isConnected ? connectionID : '未连接';
					this.connectionState = isConnected ? '已连接' : '未连接'
					this.connectionID = connectionID
				}, 200);
			},

			// 蓝牙连接处理
			handleStart() {
				const that = this;
				const options = this.options;
				// 统一处理函数
				const handleData = (data) => {
					if (!data) {
						return;
					}
					that.deviceIDC = `${data?.sn}`
					that.orgKey = that.handleTransformation(data?.bluetoothKey)
					that.orgKeyOld = data?.bluetoothKey
					that.bluetoothData = data
					setTimeout(() => {
						that.btnStartConnect();
					}, 100);


				};
				if (options?.scene) {
					u_getCarBluetoothKeyByCode({
						code: options?.scene
					}).then(response => {
						if (!response?.content) {
							return;
						}
						this.netWork = true

						handleData(response?.content);
					})
				} else {
					// 本地存储处理
					uni.getStorage({
						key: 'bluetoothData',
						success(res) {
							handleData(res.data);
						},
						fail(err) {
							const param = {
								page: 1
							};
							u_paivatecarList(param).then(response => {
								uni.setStorageSync('bluetoothData', response?.content?.[0]);
								handleData(response?.content?.[0]);
							})
						}
					});
				}
			},

			// 认证加密算法 passwordSource 原始密码(6字节数组) random 随机数(6字节数组) returns 加密后的密码(8字节数
			auth_encrypt: function(passwordSource, random) {
				var passwordEncrypt = [0, 0, 0, 0, 0, 0, 0, 0];
				for (var i = 0; i < 6; i++) {
					passwordEncrypt[i] = passwordSource[i] ^ random[i] ^ 255;
				}
				return passwordEncrypt;
			},
			// 去绑定车辆
			handleBindVechi() {
				uni.redirectTo({
					url: '/pages/listOfPrivateCars/list/index'
				});
			},

			// 跳转到详细设置
			handleSelectJump() {
				if (this?.bluetoothData?.platenumber) {
					uni.redirectTo({
						url: `/pages/privateCar/SettingsDetail/index?sn=${this.deviceIDC}&bluetoothKey=${this.orgKeyOld}`
					});
				} else {
					uni.showModal({
						title: '提示',
						content: '请先绑定车辆',
						confirmText: '立即绑定',
						success: (res) => {
							if (res.confirm) {
								uni.redirectTo({
									url: '/pages/listOfPrivateCars/list/index'
								});
							}
						}
					});
				}
			},

			// 点击蓝牙出现tips
			handleBlueToothState() {
				const _this = this;
				_this.blue_tooth_state = true
				setTimeout(() => {
					_this.blue_tooth_state = false
				}, 3000); // 3000 是 setTimeout 的延迟时间


			},

			// 点击电池出现tips
			handleVoltage() {
				const _this = this;
				_this.voltage_state = true


				setTimeout(() => {
					_this.voltage_state = false
				}, 3000); // 3000 是 setTimeout 的延迟时间


			},

			// 跳转安装手册
			handleJumpSc() {
				uni.redirectTo({
					url: '/pages/privateCar/pdf/index?flag=1'
				});
			},

			// 蓝牙状态执行对应操作
			bluetoothStateMonitor: function(state) {
				if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE == state) {
					//显示加载框
					//appUtil.showLoading('加载中...');
				} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR == state) {
					//异常取消加载框
					appUtil.hideLoading();
				} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE == state) {
					//蓝牙不可用
					appUtil.showModal('请打开蓝牙', false, function(confirm) {});
				} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND == state) {
					//没有扫描到设备信息
					appUtil.showModal('没有发现设备', false, function(confirm) {});
				} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED == state) {
					//连接失败
					//appUtil.showModal('蓝牙连接失败', false, function (confirm) { });
				} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED == state) {
					//不支持ble
					appUtil.showModal('您的手机不支持低功耗蓝牙', false, function(confirm) {});
				} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED == state) {
					//发送失败
					appUtil.showModal('数据发送失败', false, function(confirm) {});
				} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE == state) {
					//无响应
					appUtil.showModal('设备超时无响应', false, function(confirm) {});
				} else if (bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS == state) {
					appUtil.hideLoading();
				}
			},

			// 解析数据+验证合法性
			bluetoothDataMonitor: function(type, arrayData, hexData, hexTextData) {
				const dataStr = hexTextData || '';
				if (type === 0) {
					this.btnCmdSend(16, arrayData);
					setTimeout(() => {
						this.PackAndSend(16, 8, [0, 0, 0, 0, 0, 0, 0, 0]);
					}, 1000);
				}
				this.parseData(this.trimHexData(dataStr));
				this.handleLoggerapi(dataStr);
				const scrollTarget = 'hiddenview';
			},

			// 发送控制命令 type 命令类型 data 命令数据
			btnCmdSend: function(type, data) {
				const that = this;
				const defaultData = [0, 0, 0, 0, 0, 0, 0, 0];
				switch (type) {
					case 16:
						// 认证命令
						const orgKey = this.orgKey; // 原始密钥
						that.PackAndSend(type, 8, that.auth_encrypt(orgKey, data));
						break;
					case 3: // 开锁
					case 4: // 锁车
					case 5: // 尾箱
					case 6:
						// 寻车
						that.PackAndSend(type, 8, defaultData);
						break;
					case 34:
						// 配对
						that.PackAndSend(type, 8, data);
						break;
					case 7:
						//
						that.PackAndSend07(type, 8, data);
						break;
					case 58:
						// 设置 手动或感应模式
						const flameoutData = data; // 第一个字节为0x01，后面补11个0x00
						this.PackAndSend3a(type, 12, flameoutData); // 发送12字节数据
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
				// 数据包格式: 起始符(0x24) + 类型 + 长度 + 数据 + 结束符(0x24)
				var packet = [36, type, len, ...data, 36];
				bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet));
			},

			// 打包并发送数据（支持动态数据体长度）
			PackAndSend3a(type, dataLength, data, sign) {
				const header = [36]; // 数据头
				const end = [36]; // 数据尾
				// 根据要求的数据长度填充数据，不足补0
				const paddedData = [...data].concat(new Array(dataLength - data.length).fill(0)).slice(0, dataLength);
				const packet = dataLength == 8 ? [...header, type, dataLength, ...data, ...end] : [...header, type, ...
					paddedData, ...end
				]; // 组合数据包
				bleKeyManager.dispatcherSend2(this.arrayToArrayBuffer(packet)); // 发送数据
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
				array.forEach((value, index) => (typedArray[index * elementSize] = value));
				return typedArray.buffer;
			},

			handleTransformation(number) {
				if (!number) {
					return;
				}
				const numStr = number.toString();
				// 分割成每两个字符一组
				const bytes = [];
				for (let i = 0; i < numStr.length; i += 2) {
					const byteStr = numStr.substring(i, i + 2);
					bytes.push(parseInt(byteStr, 16)); // 按16进制解析
				}

				return bytes;
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
				const levels = [{
						min: 75,
						value: '100'
					},
					{
						min: 50,
						value: '75'
					},
					{
						min: 25,
						value: '50'
					},
					{
						min: 10,
						value: '25'
					}
				];
				const level = levels.find((item) => voltage > item.min) || {
					value: '0'
				};
				this.voltage_image = level.value

			},

			// 剩余电量处转换
			getBatteryLevel(voltage) {
				this.getBatteryImage(voltage);
				const thresholds = [90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
				const values = ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10'];
				const index = thresholds.findIndex((threshold) => voltage > threshold);
				return index !== -1 ? values[index] : '1';
			},

			/**
			 * 解析16进制车辆状态数据
			 * @param {string} hexString 30字符的16进制字符串
			 * @returns {Array|null} 解析结果数组，格式为[{key: string, value: any}]
			 */
			parseHexDataObject: function(hexString) {
				// 验证数据长度
				if (hexString.length !== 30) {
					// wx.showToast({ title: '数据长度不正确', icon: 'none' });
					return null;
				}

				// 转换为字节数组
				const bytes = [];
				for (let i = 0; i < 30; i += 2) {
					bytes.push(parseInt(hexString.substr(i, 2), 16));
				}
				const resultObject = {};
				resultObject.lock = bytes[2] === 1 ? true : false; //锁状态
				resultObject.voltage = (bytes[12] / 10).toFixed(1); //电池剩余电压计算
				resultObject.electric = this.getBatteryLevel(this.initVoltage((bytes[12] / 10).toFixed(
					1))); //电池剩余电量计算图片
				resultObject.supply = bytes[3];
				resultObject.induction = bytes[0] === 1 ? '感应模式' : '手动模式'; //执行模式
				return resultObject;
			},

			// 上传报文
			handleLoggerapi(evt) {
				const MAX_LOGS_BEFORE_UPLOAD = 10;
				const {
					deviceInfo,
					deviceIDC,
					logs: currentLogs
				} = this;
				const userId = getApp().globalData.data?.userInfo?.id;
				const d = new Date();
				const fmt =
					d.getFullYear() +
					'-' +
					String(d.getMonth() + 1).padStart(2, '0') +
					'-' +
					String(d.getDate()).padStart(2, '0') +
					' ' +
					String(d.getHours()).padStart(2, '0') +
					':' +
					String(d.getMinutes()).padStart(2, '0') +
					':' +
					String(d.getSeconds()).padStart(2, '0');

				// 构造当前日志项
				const newLogEntry = {
					userId,
					sn: deviceIDC,
					mobileinfo: `${deviceInfo?.brand || ''} ${deviceInfo?.model || ''} ${deviceInfo?.platform || ''} ${deviceInfo?.system || ''}`,
					content: `${evt}${JSON.stringify(this.parseHexDataObject(this.trimHexData(evt)))}`,
					logdate: fmt
				};

				// 创建新日志数组（避免直接修改原数组）
				const updatedLogs = [...currentLogs, newLogEntry];
				// 判断是否达到上传阈值
				if (updatedLogs.length >= MAX_LOGS_BEFORE_UPLOAD) {
					u_paivateuploadLog(updatedLogs).then(response => {
						console.log(response)
						if (response?.code === 1000) {
							this.logs = []

						} else {
							// 上传失败，保留日志（后续可重试）
							this.logs = updatedLogs

						}
					}).catch(() => {
						this.logs = updatedLogs
					})
				} else {
					// 未达到阈值，仅本地保存
					this.logs = updatedLogs
				}
			},

			/**
			 * 数据解析按钮处理
			 * @param {string} hexData 16进制数据字符串
			 */
			parseData: function(hexData) {
				const parsedResult = this.parseHexDataObject(hexData);
				if (parsedResult) {
					this.parsedData = parsedResult

				}
			},

			/**
			 * 初始化蓝牙连接
			 */
			btnStartConnect: function() {
				const that = this;
				if (that.connectionID == '') {
					bleKeyManager.connectBLE(
						that.deviceIDC,
						function(state) {
							that.bluetoothStateMonitor(state);
						},
						function(type, arrayData, hexData, hexTextData) {
							that.bluetoothDataMonitor(type, arrayData, hexData, hexTextData);
						}
					);
				} else {
					appUtil.showModal('已连接蓝牙', false, function(confirm) {});
				}
			},

			/**
			 * 修剪16进制数据
			 * @param {string} hexString 原始16进制字符串
			 * @returns {string} 修剪后的有效数据部分
			 */
			trimHexData: function(hexString) {
				if (typeof hexString !== 'string' || !/^[0-9a-fA-F]+$/.test(hexString)) {
					throw new Error('无效的16进制字符串');
				}
				return hexString.slice(4, -2); // 去除头尾固定字符
			},

			/**
			 * 断开蓝牙连接
			 */
			btnEndConnect: function() {
				bleKeyManager.releaseBle();
			},

			// 指令公共方法
			sendVehicleCommandFun: function(commandCode, code) {
				if (!this?.bluetoothData?.platenumber) {
					uni.showModal({
						title: '提示',
						content: '请先开通设定再到开通设定-功能设置处完善设置',
						confirmText: '立即开通',
						success: (res) => {
							if (res.confirm) {
								uni.redirectTo({
									url: '/pages/listOfPrivateCars/list/index'
								});
							}
						}
					});
					return;
				}
				if (this?.bluetoothData?.platenumber && this.connectionState == '已连接') {
					uni.showModal({
						title: '提示',
						content: commandCode == 3 || commandCode == 4 ? '确认下发指令' :
							'如原车钥匙不支持此功能请自行点击【更多钥匙功能】关闭',
						confirmText: commandCode == 3 || commandCode == 4 ? '确认' : '确认支持',
						complete: (res) => {
							if (res.confirm) {
								uni.showLoading({
									title: '加载中...',
									mask: true
								});
								this.btnCmdSend(commandCode, code);
								setTimeout(() => {
									uni.hideLoading();
								}, 1000);
								this.handleSendInfo(commandCode, code);
							}
						}
					});
					return;
				}
				if (this.connectionState == '未连接') {
					uni.showToast({
						title: '请等待蓝牙连接后重试',
						icon: 'none'
					});
					return;
				}
			},

			// 发送控制命令
			handleSendInfo(commandCode, code) {
				const temp = {
					sn: this.deviceIDC,
					controltype: `${commandCode}${code}`,
					electricity: this?.parsedData?.electric || 0
				};
				// byPost('https://k1sw.wiselink.net.cn/' + u_sendInfo.URL, temp, function() {});
				u_paivatesendInfo(temp)
			},

			handleToConfigure: function() {
				uni.redirectTo({
					url: `/pages/privateCar/btSettings/index?sign=${4}`
				});
			},

			//跳转配置

			/**
			 * 获取已连接设备信息
			 */
			btnConnected: function() {
				bleKeyManager.connectedDevice();
			},


			// 初始化获取缓存内容
			initToConfigureCache() {
				const currentItems = this.controlItems || [];
				uni.getStorage({
					key: 'controlItems',
					success: (res) => {
						const storageItems = res.data || [];
						const merged = [...currentItems, ...storageItems];
						const uniqueMap = new Map();
						merged.forEach((item) => {
							const existing = uniqueMap.get(item.id);
							if (!existing) {
								uniqueMap.set(item.id, item);
							} else {
								if (item.enabled === false) {
									uniqueMap.set(item.id, item);
								}
							}
						});
						const result = Array.from(uniqueMap.values());
						this.controlItems = result
					}
				});
			}
		}
	};
</script>

<style>
	/* 基础样式 */
	page {
		background: linear-gradient(to bottom, #2d8cf0, #ffffff);
		font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
		min-height: 100vh;
	}

	.container {
		padding: 20rpx;
		padding-top: 40rpx;
		display: flex;
		flex-direction: column;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
	}

	/* 车辆卡片 */
	.vehicle-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}

	/* 车牌与提示信息 */
	.license-plate-section {
		margin-bottom: 30rpx;
	}

	/* 车牌和提示的水平布局容器 */
	.license-plate-container {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.vehicle-info {
		display: flex;
		flex-direction: column;
	}

	.license-plate {
		font-size: 42rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.vehicle-status {
		display: flex;
		align-items: center;
	}

	.status-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		margin-right: 10rpx;
	}

	.status-dot.connected {
		background-color: #40b87c;
	}

	.status-dot.disconnected {
		background-color: #ff6b6b;
	}

	.status-text {
		font-size: 24rpx;
		color: #666;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}

	/* "安装使用手册" 提示框样式 */
	.manual-tip {
		font-size: 24rpx;
		border: 1px solid #ddd;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		color: #666;
	}

	/* "详细设置" 提示样式 */
	.connection-tip {
		font-size: 24rpx;
		display: flex;
		align-items: center;
		background: #2d8cf0;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		color: #fff;
		gap: 8rpx;
	}

	.action-icon {
		width: 28rpx;
		height: 28rpx;
	}

	/* 车辆图片容器 */
	.vehicle-image-container {
		position: relative;
		width: 100%;
		height: 320rpx;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
		background: linear-gradient(to bottom, #bad7f5, #ffffff);
	}

	.vehicle-image {
		width: 100%;
		height: 100%;
	}

	.vehicle-overlay {
		position: absolute;
		bottom: 20rpx;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		padding: 0 20rpx;
	}

	.battery-status,
	.bluetooth-container {
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.battery-status {
		color: #2d8cf0;
		position: relative;
	}

	.bluetooth-status.connected {
		display: flex;
		gap: 10rpx;
		color: #2d8cf0;
		font-size: 28rpx;
	}

	.bluetooth-status.disconnected {
		display: flex;
		gap: 10rpx;
		color: #666;
		font-size: 28rpx;
		position: relative;
	}

	/* 模式选择器 */
	.mode-section {
		display: flex;
		flex-direction: column;
		margin-bottom: 30rpx;
	}

	.mode-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 15rpx;
	}

	/* 控制功能区 - 每行3个大按钮 */
	.control-section {
		background: #fff;
		border-radius: 20rpx;
		padding: 0rpx 30rpx 20rpx 30rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
		display: flex;
		gap: 40rpx;
		flex-direction: column;
	}

	.control-title {
		border-bottom: 1px solid #f0f0f0;
		height: 100rpx;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
		font-size: 30rpx;
	}

	.control-title .title-bold {
		font-weight: bold;
		color: #333;
	}

	.control-title .more-functions {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		font-size: 28rpx;
		color: #2d8cf0;
	}

	.control-title .more-functions image {
		width: 40rpx;
		height: 30rpx;
		margin-left: 10rpx;
	}

	.control-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.control-item {
		width: 30%;
		/* 每行3个按钮 */
		margin-bottom: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: transform 0.2s;
	}

	.control-item:active {
		transform: scale(0.95);
	}

	.control-icon {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		background: #f5f5f5;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 15rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		transition: all 0.3s;
	}

	.control-icon:active {
		background: #e0e0e0;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	}

	.control-name {
		font-size: 28rpx;
		color: #333;
		text-align: center;
		font-weight: 500;
	}

	.control-icon-image {
		width: 50rpx;
		height: 50rpx;
	}

	.battery-icon {
		width: 36rpx;
		height: 36rpx;
		margin-right: 10rpx;
	}

	.battery-text {
		font-size: 28rpx;
		font-weight: 500;
	}

	.tips_voltage {
		position: absolute;
		top: -80%;
		right: -50%;
		background: rgba(66, 66, 66, 0.9);
		border-radius: 10rpx;
		color: #fff;
		padding: 10rpx 20rpx;
		font-size: 26rpx;
		z-index: 10;
	}

	.tips_bluetooth {
		position: absolute;
		top: -80%;
		right: 10%;
		background: rgba(66, 66, 66, 0.9);
		border-radius: 10rpx;
		color: #fff;
		padding: 10rpx 20rpx;
		font-size: 26rpx;
		z-index: 10;
	}

	.GY-sensor-mode-wrapper {
		width: 100%;
		transition: transform 0.1s ease;
	}

	.GY-sensor-mode-wrapper:active {
		transform: scale(0.98);
	}

	.GY-sensor-mode {
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
		position: relative;
		overflow: hidden;
	}

	.GY-sensor-mode.off {
		background-color: #f0f0f0;
		color: #999;
	}

	.GY-sensor-mode.on {
		background-color: #2d8cf0;
		color: #fff;
		box-shadow: 0 6rpx 16rpx rgba(45, 140, 240, 0.3);
	}

	.GY-ripple {
		position: absolute;
		width: 100%;
		border-radius: 30%;
		border: 2px solid rgba(255, 255, 255, 0.4);
		opacity: 0;
		animation: none;
	}

	/* 图标设计 */
	.GY-icon {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background-color: currentColor;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.GY-icon::before {
		content: '';
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background-color: #fff;
	}

	.GY-label {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 15rpx;
		font-size: 30rpx;
		font-weight: 500;
		margin-left: 20rpx;
	}

	.GY-grant {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 12rpx;
	}

	.grant-title {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.grant-period {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.loading-icon {
		width: 32rpx;
		height: 32rpx;
		border: 2px solid #ddd;
		border-top: 2px solid #2d8cf0;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
</style>