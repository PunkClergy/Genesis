import {
	http
} from '@/utils/request/http'
export const u_companyInfo = (data) => http.get('/companyapi/companyInfo', data) //查询资料
export const u_companyImprove = (data) => http.postFormData('/companyapi/companyImprove', data) //查询资料
export const u_installerapiList = (data) => http.get('/installerapi/list', data) //查询安装商地址
export const u_shopapiList = (data) => http.get('/shopapi/list', data) //查询安装商地址
export const u_addMessage = (data) => http.postFormData('/userapi/addMessage', data) //留言






