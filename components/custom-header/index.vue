<template>
	<view class="custom-navbar" :style="{ height: navbarTotalHeight + 'px' }">
		<!-- 状态栏占位视图 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<!-- 导航栏主体 -->
		<view class="nav-bar" :style="{ height: navBarHeight + 'px' }"
			style="display: flex;gap: 100rpx;justify-content: flex-start">
			<view style="display: flex;align-items: center;gap: 30rpx;">
				<image src="/static/public/nav_left.png" class="action-icon back-icon" 
					@click="handleBack"></image>
				<image src="/static/public/home.png" class="action-icon home-icon"
					@tap="handleHome"></image>
			</view>
			<view style="font-size: 34rpx;font-weight: 600;">{{title}}</view>
		</view>
	</view>
</template>

<script>
	import {
		info_screen
	} from '@/utils/scheme/screen.js'
	export default {
		name: 'CustomHeader',
		props: {
			title: { // 更明确的属性名
				type: String,
				default: '首页'
			}

		},
		data() {
			return {
				screenInfo: {}, // 屏幕信息对象
				baseLink: 'https://k1sw.wiselink.net.cn', // 基础域名

			};
		},
		methods: {
			// 初始化屏幕信息
			async initialScreenInfo() {
				try {
					this.screenInfo = await info_screen();
				} catch (error) {
					console.error('[ScreenInfo] 获取屏幕信息失败:', error);
					uni.showToast({
						title: '设备信息获取失败',
						icon: 'none'
					});
				}
			},
			// 返回按钮事件
			handleBack() {
				this.$emit('back');
				uni.navigateBack();
			},

			// 首页按钮事件
			handleHome() {
				this.$emit('home');
				console.log((uni))
				uni.switchTab({
					url: '/pages/desk/desk'
				});
			}
		},
		computed: {
			// 当前用户信息
			userInfo() {
				return uni.getStorageSync('user_info') || null;
			},



			// 状态栏高度
			statusBarHeight() {
				return this.screenInfo.statusBarHeight || 0;
			},

			// 导航栏主体高度
			navBarHeight() {
				return this.screenInfo.platform === 'ios' ? 49 : 44;
			},

			// 导航栏总高度
			navbarTotalHeight() {
				return this.statusBarHeight + this.navBarHeight;
			},

			// 安全的屏幕高度
			safeScreenHeight() {
				return this.screenInfo.screenHeight || 667;
			},



		},
		mounted() { // 使用mounted替代onShow
			this.initialScreenInfo();
		}
	};
</script>

<style scoped>
	/* ===== 导航栏样式 ===== */
	.custom-navbar {
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		backdrop-filter: blur(10rpx);
		background-color: #fff;
	}

	.nav-bar {
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.title-container {
		display: flex;
		align-items: center;
		gap: 20rpx;
		height: 100%;
		width: 100%;
	}

	/* ===== 操作图标 ===== */
	.action-icon {
		width: 50rpx;
		height: 50rpx;
		flex-shrink: 0;
	}
	.back-icon{
		width: 55rpx;
		height: 55rpx;
	}
</style>