
import appUtil from './app-util.js';
const writeToLogFile = true;
function e(tag, msg) {
    if (msg) {
        console.log(tag, msg);
    } else {
        console.log(tag);
    }
    if (writeToLogFile) {
        if (msg) {
            writeLogFile(getDataString(tag + ' ' + msg));
        } else {
            writeLogFile(getDataString(tag));
        }
    }
}
function clear() {
    uni.setStorage({
        key: 'log',
        data: ''
    });
}
function getDataString(msg) {
    var d = new Date();
    var formatData = 'MM-dd HH:mm:ss SSS ' + msg + '\n';
    var data = formatData
        .replace('yyyy', d.getFullYear())
        .replace('MM', fillZero(d.getMonth() + 1))
        .replace('dd', fillZero(d.getDate()))
        .replace('HH', fillZero(d.getHours()))
        .replace('mm', fillZero(d.getMinutes()))
        .replace('ss', fillZero(d.getSeconds()))
        .replace('SSS', d.getMilliseconds());
    return data;
}
function getDateString(timestamp) {
    var d = new Date(timestamp);
    var formatData = 'yyyy-MM-dd HH:mm:ss';
    var data = formatData
        .replace('yyyy', d.getFullYear())
        .replace('MM', fillZero(d.getMonth() + 1))
        .replace('dd', fillZero(d.getDate()))
        .replace('HH', fillZero(d.getHours()))
        .replace('mm', fillZero(d.getMinutes()))
        .replace('ss', fillZero(d.getSeconds()))
        .replace('SSS', d.getMilliseconds());
    return data;
}

//填充0
function fillZero(value) {
    if (value.toString().length < 2) {
        return '0' + value;
    }
    return value;
}
function writeLogFile(msg) {
    try {
        var value = uni.getStorageSync('log');
        if (value) {
            try {
                var data = value + msg;
                var length = data.length;
                if (length > 5120) {
                    uni.setStorageSync('log', data.substring(4096));
                } else {
                    uni.setStorageSync('log', data);
                }
            } catch (e) {
                console.log('CatchClause', e);
                console.log('CatchClause', e);
            }
        } else {
            try {
                uni.setStorageSync('log', msg);
            } catch (e) {
                console.log('CatchClause', e);
                console.log('CatchClause', e);
            }
        }
    } catch (e) {
        console.log('CatchClause', e);
        console.log('CatchClause', e);
    }
}
export default {
    e: e,
    clear: clear,
    getDateString: getDateString
};
