import {
	http
} from '@/utils/request/http'
export const u_getCarList = (data) => http.get('/carapi/getCarList', data) //车辆列表
export const u_addOrUpdateCar = (data) => http.postFormData('/carapi/addOrUpdateCar', data) //车辆编辑和新增
export const u_getAllCarPoisiton = (data) => http.get('/carapi/getAllCarPoisiton', data) //车辆编辑和新增
export const u_rentRecord = (data) => http.get('/rentKeyApi/rentRecord', data) //车辆使用记录
export const u_updateRentKey = (data) => http.postFormData('/rentKeyApi/updateRentKey', data) //修改电子钥匙
export const u_sendRentKey = (data) => http.get('/rentKeyApi/sendRentKey', data) //发送电子钥匙
export const u_cancelRentKey = (data) => http.get('/rentKeyApi/cancelRentKey', data) // 取消电子钥匙