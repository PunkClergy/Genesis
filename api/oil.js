import {
	http
} from '@/utils/request/http'
export const u_oilDipstickapiDipsticHistory = (data) => http.get('/oilDipstickapi/dipsticHistory', data) //油量检测记录
export const u_dzBussinessMobileApiGetCarStatus = (data) => http.postFormData('/dzBussinessMobileApi/getCarStatus', data) //自动检测
export const u_dzBussinessMobileApiRentStart = (data) => http.get('/oilDipstickapi/rentStart', data) //起租
export const u_oilDipstickapiRentEnd = (data) => http.get('/oilDipstickapi/rentEnd', data) //选择起租订单
export const u_oilDipstickapiGetOilPriceList = (data) => http.get('/oilDipstickapi/getOilPriceList', data) //选择起租订单
export const u_getOilSet = (data) => http.get('/oilDipstickapi/getOilSet', data) //获取油价
export const u_saveOilSet = (data) => http.post('/oilDipstickapi/saveOilSet', data) //保存设置



