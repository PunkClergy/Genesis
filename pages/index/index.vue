<template>
	<section class="control_container" :style="containerStyle" @touchmove.prevent>
		<!-- 头部内容 -->
		<view class="control_title" :style="navbarStyle">
			<view class="header">
				<view class="title">
					雅迪王
					<text style="font-size: 16px;">京AYU76G</text>
				</view>
				<view class="icons-container">
					<image src="/static/set_up.png" class="icon" />
				</view>
			</view>

			<view class="subtitle">
				<text>已关锁</text>
				<text class="location-divider">丨</text>
				<text>北京市丰台区海鹰大厦</text>
			</view>
		</view>
		<!-- 地图内容 -->
		<view class="control_car_picture">
			<map id="myMap" :scale="20" class="map" :latitude="latitude" :longitude="longitude" :markers="markers"
				show-location @regionchange="onRegionChange">
				<cover-view class="map_control">
					<cover-image
						:src="connectionState == '已连接' ? '/static/bluetooth_select.png' : '/static/bluetooth.png'"
						class="map_image"></cover-image>
				</cover-view>
			</map>
		</view>
		<!-- 操控区域内容 -->
		<view class="control_quick-entry">
			<!-- swiper 组件 -->
			<swiper class="entry-swiper" :indicator-dots="false" indicator-color="rgba(0, 0, 0, .3)"
				indicator-active-color="#ffffff" :autoplay="false" :interval="3000" :duration="500" :circular="false"
				:vertical="false" @change="onSwiperChange">
				<!-- 动态生成 swiper-item -->
				<swiper-item v-for="(page, pageIndex) in pages" :key="pageIndex">
					<view class="entry-page">
						<view v-for="(item, index) in page" :key="index" class="entry-item"
							@tap="parseEventDynamicCode($event, item.evt)">
							<image :src="item.icon" class="entry-icon" mode="aspectFit" />
							<text class="entry-text">{{ item.text }}</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
			<view class="custom-indicator">{{ current + 1 }} / {{ pages.length }}</view>
		</view>

		<!-- 信息中心 -->
		<view class="control_info-root">
			<!-- 左侧卡片 -->
			<view class="control_info-left-card">
				<!-- 左上角 -->
				<view class="control_info-corner control_info-top-left">
					<text class="control_info-date">29天前</text>
					<text class="control_info-label">上次充电</text>
				</view>

				<!-- 右上角 -->
				<view class="control_info-corner control_info-top-right">
					<text class="control_info-battery-value">
						72<text class="control_info-battery-unit">%</text>
					</text>
				</view>

				<!-- 左下角 -->
				<view class="control_info-corner control_info-bottom-left">
					<text class="control_info-label">21天</text>
					<text class="control_info-date">已用天数</text>
				</view>

				<!-- 右下角 -->
				<view class="control_info-corner control_info-bottom-right">
					<text class="control_info-label">10天</text>
					<text class="control_info-date">可用天数</text>
				</view>
			</view>

			<!-- 右侧两个区域 -->
			<view class="control_info-right-container">
				<view class="control_info-right-item">
					<image src="/static/gy.png" class="control_info-icon"></image>
					<view class="control_car_text">
						<text class="control_info-title">感应模式</text>
						<text class="control_info-status">未开启</text>
					</view>
				</view>

				<view class="control_info-right-item">
					<image src="/static/clzx.png" class="control_info-icon"></image>
					<text class="control_info-title">车辆中心</text>
				</view>
			</view>
		</view>

		<!-- 解释权区域 -->
		<view class="control_footer" v-if="this.screenInfo.screenHeight>600">
			<view class="footer-content">
				<view class="footer-item">
					<text class="footer-title">连接状态：</text>
					<text class="footer-info">当地图上蓝牙图标呈蓝色高亮时，表示车辆已就绪，可进行操控</text>
				</view>
				<view class="footer-item">
					<text class="footer-title">位置信息：</text>
					<text class="footer-info">当前显示为车辆上一次蓝牙连接时的最后记录位置</text>
				</view>
				<view class="footer-item">
					<text class="footer-title">操控区域：</text>
					<text class="footer-info">基础控制功能适用于全部车型，高级功能仅支持高配版及商务车型</text>
				</view>
				<view class="footer-item">
					<text class="footer-title">电量信息：</text>
					<text class="footer-info">蓝牙连接后同步获取，可用天数预估基于本次充电后的实际用车习惯动态计算</text>
				</view>
				<view class="footer-item">
					<text class="footer-title">感应模式：</text>
					<text class="footer-info">需在设置中完成蓝牙配对后方可启用（仅限车主账户操作）</text>
				</view>
				<!-- 更多内容 -->
			</view>
		</view>
	</section>
</template>

<script>
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	import bleKeyManager from '@/utils/BleKeyFun-utils-single.js'
	import {
		u_getCarBluetoothKeyByCode,
		u_paivatecarList,
		u_paivatesendInfo,
		u_paivateuploadLog
	} from '@/api'

	// 操作区指令封装常量
	const VehicleCommand = {
		UNLOCK: 3, //开锁
		LOCK: 4, //关锁
		OPEN_TRUNK: 5, //尾箱
		FIND_CAR: 6, //寻车
		CONTROL_WINDOW: 7, //操作车窗
	};
	export default {
		data() {
			return {
				latitude: 39.90469,
				longitude: 116.40717,
				markers: [{
					id: 1,
					latitude: 39.90469,
					longitude: 116.40717,
					title: '天安门',
					callout: {
						content: '这里是天安门',
						display: 'ALWAYS'
					}
				}],
				entries: [{
						text: '开锁',
						icon: '/static/lock.png',
						evt: 'handleUnlock'
					},
					{
						text: '关锁',
						icon: '/static/unlock.png',
						evt: 'handleLock'
					},
					{
						text: '寻车',
						icon: '/static/xunche.png',
						evt: 'handleFindCar'
					},
					{
						text: '尾箱',
						icon: '/static/weixiang.png',
						evt: 'handleOpenTrunk'
					},
					{
						text: '升窗',
						icon: '/static/sc.png',
						evt: 'handleRaiseTheWindow'
					},
					{
						text: '降窗',
						icon: '/static/jc.png',
						evt: 'handleLowerTheWindow'
					},
					{
						text: '左中门',
						icon: '/static/zm.png'
					},
					{
						text: '右中门',
						icon: '/static/ym.png'
					},
				],
				itemsPerPage: 4,
				current: 0,
				screenInfo: {},
				// 蓝牙连接状态：未连接 / 已连接
				connectionState: '未连接',
				// 当前连接ID
				connectionID: '',
			};
		},

		async onLoad() {
			this.isLoading = true;
			uni.hideTabBar({
				animation: true
			});

			try {
				await Promise.allSettled([
					this.initialScreenInfo(),
				]);

			} catch (error) {
				console.error('初始化失败:', error);
			} finally {
				this.isLoading = false;
			}
			this.getLocation();
		},
		onShow: function() {
			// 获取设备屏幕信息
			this.initialScreenInfo()
			// 开始蓝牙连接流程
			this.handleStart();
			// 启动连接状态轮询
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
				console.log(this.screenInfo)
				return {
					height: `${this.screenInfo.screenHeight || 667}px`
				}
			},
			// 导航栏样式
			navbarStyle() {
				return {
					marginTop: `${this.screenInfo.statusBarHeight}px`,
				}
			},
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
			// 连接蓝牙
			handleStart() {
				const mockBluetoothData = {
					// sn: '19585080015',
					// bluetoothKey: "333688439194",
					sn: '19585080049',
					bluetoothKey: "333917323272",
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
				// 内部辅助函数：显示错误Toast
				const showErrorToast = (message) => {
					uni.hideLoading();
					uni.showToast({
						title: message,
						icon: 'none',
						duration: 3000,
						mask: true
					});
				};

				// 内部辅助函数：显示成功Toast
				const showSuccessToast = (message = '操作成功') => {
					uni.hideLoading();
					uni.showToast({
						title: message,
						icon: 'none',
						duration: 2000
					});
				};

				const stateHandlers = {
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_PRE_EXECUTE]: () => {
						uni.showLoading({
							title: '加载中...',
							mask: true
						});
					},
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ERROR]: () => {
						uni.hideLoading();
					},
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_ADAPTER_UNAVAILABLE]: () => {
						showErrorToast('请打开蓝牙');
					},
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NOT_FOUND]: () => {
						showErrorToast('没有发现设备');
					},
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_FAILED]: () => {
						showErrorToast('蓝牙连接失败');
					},
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_UNSUPPORTED]: () => {
						showErrorToast('您的手机不支持低功耗蓝牙');
					},
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_SEND_FAILED]: () => {
						showErrorToast('数据发送失败');
					},
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_NO_RESPONSE]: () => {
						showErrorToast('设备超时无响应');
					},
					[bleKeyManager.DEFAULT_BLUETOOTH_STATE.BLUETOOTH_CONNECT_SUCESS]: () => {
						showSuccessToast('连接成功');
					}
				};

				const handler = stateHandlers[state];
				if (handler) {
					handler();
				} else {
					console.warn('未知的蓝牙状态:', state);
					// 对于未知状态，也隐藏loading避免卡住界面
					uni.hideLoading();
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
			},


			// 点击操作手动区事件
			parseEventDynamicCode($, evt) {
				this.handleEvent(evt);
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
			// 指令公共方法
			sendVehicleCommandFun: function(commandCode, code) {
				if (this.connectionState == '已连接') {
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


			onSwiperChange(e) {
				this.current = e.detail.current;
			},
			// 获取当前位置
			getLocation() {
				uni.getLocation({
					type: 'gcj02', // 返回国测局坐标（可用于腾讯地图、高德等）
					success: (res) => {
						this.latitude = res.latitude;
						this.longitude = res.longitude;
						this.markers[0].latitude = res.latitude;
						this.markers[0].longitude = res.longitude;
						this.markers[0].title = '当前位置';
						this.markers[0].callout.content = '你在这里';
					},
					fail: (err) => {
						console.error('获取位置失败', err);
						uni.showToast({
							title: '定位失败',
							icon: 'none'
						});
					}
				});
			},
			onRegionChange(e) {
				console.log('地图区域变化', e);
			}
		}
	};
</script>

<style scoped>
	/* 主容器 */
	.control_container {
		display: flex;
		gap: 20px;
		flex-direction: column;
		padding: 15px;
		height: 100vh;
		background: linear-gradient(to bottom, #E6F1F5, #F0F7F9);
	}


	/* 头部内容 */
	.control_title {
		display: flex;
		gap: 5px;
		flex-direction: column;
		/* margin-top: 80px; */
	}

	.control_title .header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.control_title .title {
		color: #333;
		font-size: 24px;
	}

	.control_title .subtitle {
		color: #666;
		font-size: 16px;
	}

	.control_title .location-divider {
		font-size: 15px;
	}

	.control_title .icon {
		width: 26px;
		height: 26px;
	}

	.control_title .icons-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
	}


	/* 地图内容 */
	.control_car_picture {
		position: relative;
		display: flex;
		justify-content: center;
	}

	.control_car_picture .map {
		width: 100%;
	}

	.control_car_picture .map_control {
		position: absolute;
		top: 10px;
		right: 10px;
		background-color: #fff;
		width: 35px;
		height: 35px;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50px;
	}

	.control_car_picture .map_image {
		width: 26px;
		height: 26px;
	}


	/* 控制中心 */
	.control_quick-entry {
		position: relative;
		background-color: #fff;
		border-radius: 4px;
	}

	.entry-swiper {
		height: 200rpx;
		width: 100%;
	}

	.entry-page {
		display: flex;
		align-items: center;
		padding-left: 20rpx;
		box-sizing: border-box;
		height: 100%;
	}

	.entry-item {
		width: 23%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		height: 160rpx;
	}

	.entry-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.entry-text {
		font-size: 24rpx;
		color: #333;
		text-align: center;
	}

	.custom-indicator {
		position: absolute;
		bottom: 4rpx;
		right: 10rpx;
		padding: 3rpx 10rpx;
		background-color: rgba(0, 0, 0, .3);
		color: white;
		border-radius: 20rpx;
		font-size: 24rpx;
	}

	/* 信息中心 */
	.control_info-root {
		display: flex;
		height: 150px;
		gap: 20px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}

	/* 左侧卡片 */
	.control_info-left-card {
		flex: 1;
		background-color: #fff;
		position: relative;
		box-sizing: border-box;
		border-radius: 8px;
		padding: 20px;
	}

	/* 四个角的通用样式 */
	.control_info-corner {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.control_info-top-left {
		top: 20px;
		left: 20px;
	}

	.control_info-top-right {
		top: 20px;
		right: 20px;
	}

	.control_info-bottom-left {
		bottom: 20px;
		left: 20px;
	}

	.control_info-bottom-right {
		bottom: 20px;
		right: 20px;
	}

	.control_info-date {
		font-size: 11px;
		color: #777;
	}

	.control_info-label {
		font-size: 13px;
		color: #555;
		margin-top: 4px;
	}

	.control_info-battery-value {
		font-size: 15px;
		color: #555;
		font-weight: 500;
	}

	.control_info-battery-unit {
		font-size: 11px;
		color: #777;
	}

	/* 右侧区域 */
	.control_info-right-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.control_info-right-item {
		flex: 1;
		background-color: #fff;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 15px;
	}

	.control_info-icon {
		width: 30px;
		height: 30px;
	}

	.control_info-title {
		color: #444;
		font-size: 14px;
	}

	.control_info-status {
		color: #888;
		font-size: 12px;
		margin-top: 2px;
	}

	.control_car_text {
		display: flex;
		flex-direction: column;
	}


	/* 解释权区域 */
	.control_footer {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
		box-sizing: border-box;
	}

	.footer-content {
		flex: 1;
		overflow-y: auto;
		background-color: #fff;
		padding: 10px;
	}

	.footer-item {
		color: #666;
		line-height: 1.2;
	}

	.footer-title {
		font-size: 12px;
		font-weight: bold;
		color: #333333;
	}

	.footer-info {
		font-size: 12px;
		color: #666;
	}
</style>