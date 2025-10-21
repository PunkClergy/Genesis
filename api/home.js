import {
	http
} from '@/utils/request/http'
export const u_navlist = (data) => http.get('/appdeskapi/navlist', data)
export const u_logo = (data) => http.get('/appdeskapi/logo', data)
export const u_bannerlist = (data) => http.get('/appdeskapi/bannerlist', data)
export const u_midMenulist = (data) => http.get('/appdeskapi/midMenulist', data)
export const u_rightMenulist = (data) => http.get('/appdeskapi/rightMenulist', data)
export const u_getCarPoisitonWx = (data) => http.postFormData('/h5Car/getCarPoisitonWx', data)
export const u_getCarPoisiton = (data) => http.postFormData('/dzBussinessMobileApi/getCarPoisiton', data)
export const u_operation = (data) => http.postFormData('/dzBussinessMobileApi/operation', data)


