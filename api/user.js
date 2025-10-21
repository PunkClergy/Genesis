import { http } from '@/utils/request/http'

export const login = (data) => http.get('/api/login', data)
export const u_getQrcodeImg = (data) => http.get('/deskapi/getQrcodeImg', data)//获取入群二维码
export const u_updatePassword = (data) => http.get('/api/updatePassword', data)//修改密码
export const u_updateUserName = (data) => http.get('/api/updateUserName', data)//修改用户名
export const u_register = (data) => http.postFormData('/userapi/userReg', data)//注册
export const u_getSmsCode = (data) => http.postFormData('/userapi/sendValidateCode', data)//获取验证码
