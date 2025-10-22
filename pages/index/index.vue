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
					<image src="/static/scan-code.png" class="icon" />
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
					<cover-image src="/static/bluetooth.png" class="map_image"></cover-image>
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
						<view v-for="(item, index) in page" :key="index" class="entry-item" @click="handleClick(item)">
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
		<view class="control_footer">
			<view class="footer-content">
				<view>连接状态：当地图上蓝牙图标变蓝时车辆可操作</view>
				<view>位置信息：当前显示为上一次蓝牙连接位置</view>
				<view>操控区域：第一页功能支持全部车辆，第二页仅高配或商务车支持</view>
				<view>电量信息：蓝牙连接后获取信息，且可用天数计算规则依照此次充电后个人用车习惯计算</view>
				<view>感应模式：需在设置功能处执行蓝牙配对后方可开启（仅车主支持）</view>
			</view>
			
		</view>
	</section>

</template>

<script>
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
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
						icon: '/static/lock.png'
					},
					{
						text: '关锁',
						icon: '/static/unlock.png'
					},
					{
						text: '寻车',
						icon: '/static/xunche.png'
					},
					{
						text: '尾箱',
						icon: '/static/weixiang.png'
					},
					{
						text: '升窗',
						icon: '/static/sc.png'
					},
					{
						text: '降窗',
						icon: '/static/jc.png'
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
					this.initialScreenInfo(),
				]);

			} catch (error) {
				console.error('初始化失败:', error);
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
			// 初始化屏幕信息
			async initialScreenInfo() {
				try {
					this.screenInfo = await info_screen()

				} catch (error) {
					console.error('[ScreenInfo] 获取屏幕信息失败:', error)

				}
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
</style>