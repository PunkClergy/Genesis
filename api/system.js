import {
	http
} from '@/utils/request/http'
export const u_childUserList = (data) => http.get('/accountapi/childUserList', data) //人员列表
export const u_transferAdminUser = (data) => http.postFormData('/accountapi/transferAdminUser', data) //移交管理员
export const u_roleapiList = (data) => http.postFormData('/roleapi/list', data) //角色列表
export const u_roleapigetRole = (data) => http.get('/roleapi/getRole', data) //根据角色名称获取角色ID
export const u_getMenuTree = (data) => http.get('/roleapi/getMenuTree', data) //权限树
export const u_addOrUpdateChildUser = (data) => http.postFormData('/accountapi/addOrUpdateChildUser', data) //新增人员
export const u_delChildUser = (data) => http.get('/accountapi/delChildUser', data) // 删除人员
export const u_roleapidel = (data) => http.get('/roleapi/del', data) // 删除角色
export const u_roleapiaddOrUpdate = (data) => http.postFormData('/roleapi/addOrUpdate', data) // 角色新增
