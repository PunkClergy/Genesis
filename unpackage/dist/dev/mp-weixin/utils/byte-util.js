"use strict";
const common_vendor = require("../common/vendor.js");
getApp();
function hexStringToArray(s) {
  var typedArray = new Uint8Array(
    s.match(/[\da-f]{2}/gi).map(function(h) {
      return parseInt(h, 16);
    })
  );
  if (typedArray.length > 1) {
    return Array.apply(new Array(), typedArray);
  } else {
    return typedArray;
  }
}
function string2buffer(str) {
  let val = "";
  for (let i = 0; i < str.length; i++) {
    if (val === "") {
      val = str.charCodeAt(i).toString(16);
    } else {
      val += str.charCodeAt(i).toString(16);
    }
  }
  return new Uint8Array(
    val.match(/[\da-f]{2}/gi).map(function(h) {
      return parseInt(h, 16);
    })
  ).buffer;
}
function hexStringToArrayBuffer(s) {
  var typedArray = new Uint8Array(
    s.match(/[\da-f]{2}/gi).map(function(h) {
      return parseInt(h, 16);
    })
  );
  return typedArray;
}
function stringToBytes(str) {
  var ch;
  var st;
  var re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);
    st = [];
    do {
      st.push(ch & 255);
      ch = ch >> 8;
    } while (ch);
    re = re.concat(st.reverse());
  }
  return re;
}
function shortToSingleBytes(s, asc) {
  var buf = new Array(1);
  buf[0] = s & 255;
  return buf;
}
function shortToBytes(s, asc) {
  var buf = new Array(2);
  if (asc) {
    for (var i = buf.length - 1; i >= 0; i--) {
      buf[i] = s & 255;
      s >>= 8;
    }
  } else {
    for (var i = 0; i < buf.length; i++) {
      buf[i] = s & 255;
      s >>= 8;
    }
  }
  return buf;
}
function intToBytes(s, asc) {
  var buf = new Array(4);
  if (asc) {
    for (var i = buf.length - 1; i >= 0; i--) {
      buf[i] = s & 255;
      s >>= 8;
    }
  } else {
    for (var i = 0; i < buf.length; i++) {
      buf[i] = s & 255;
      s >>= 8;
    }
  }
  return buf;
}
function checkCRC_XW(CRC_TABLE_XW, buff, start, length) {
  var crc = 65535;
  for (var i = 0; i < length; i++) {
    crc = crc >>> 8 ^ CRC_TABLE_XW[(crc ^ buff[start + i]) & 255];
  }
  return crc;
}
function crcEncrypt(CRC_TABLE_XW, content, header) {
  var crc = checkCRC_XW(CRC_TABLE_XW, content, 0, content.length);
  var crcByte = shortToBytes(crc, false);
  var len = content.length + crcByte.length;
  var lenByte = shortToBytes(len, true);
  return header.concat(lenByte).concat(content).concat(crcByte);
}
function crcEncrypt_KTQUpgrade(content) {
  var crc = 0;
  for (var i = 0; i < 128; i++) {
    crc = crc ^ content[3 + i] << 8;
    for (var j = 0; j < 8; j++) {
      if (crc & 32768) {
        crc = crc << 1 ^ 4129;
      } else {
        crc = crc << 1;
      }
    }
  }
  var crcByte = shortToBytes(crc, true);
  return crcByte;
}
function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
function bytesToInt(b1, b2, b3, b4) {
  return b4 & 255 | (b3 & 255) << 8 | (b2 & 255) << 16 | (b1 & 255) << 24;
}
function converTude2Double(bytes, start) {
  var londu = bytes[start] & 255;
  var lonfen1 = bytes[start + 1] & 255;
  var lonfen2 = (bytes[start + 2] & 255) / 100;
  var lonfen3 = (bytes[start + 3] & 255) / 1e4;
  var lond = (lonfen1 + lonfen2 + lonfen3) / 60;
  return londu + lond;
}
function bytesToShort(b1, b2) {
  return bytesToInt(0, 0, b1, b2);
}
function getShortWith(data, asc) {
  if (data == null) {
    return 0;
  }
  var length = data.length;
  var r = 0;
  if (!asc) {
    for (var i = length - 1; i >= 0; i--) {
      r <<= 8;
      r |= data[i] & 255;
    }
  } else {
    for (var i = 0; i < length; i++) {
      r <<= 8;
      r |= data[i] & 255;
    }
  }
  return r;
}
function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    common_vendor.index.__f__("log", "at utils/byte-util.js:231", "Illegal Format ASCII Code!");
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16);
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}
function buf2string(buffer) {
  var arr = Array.prototype.map.call(new Uint8Array(buffer), (x) => x);
  var str = "";
  for (var i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i]);
  }
  return str;
}
const utils = {
  // 十六进制转化Array()
  hexStringToArrayBuffer,
  // 十六进制转化ArrayBuffer
  hexStringToArray,
  // 字符串转ArrayBuffer
  string2buffer,
  // 字符串转字节数组
  stringToBytes,
  // 转化一个字节的数组
  shortToSingleBytes,
  // 转化两个字节的数组
  shortToBytes,
  // 转化4个字节数组
  intToBytes,
  // crc加密
  crcEncrypt,
  // ArrayBuffer转换为Hex
  buf2hex,
  //数组转化int
  bytesToInt,
  //数组转化short
  bytesToShort,
  //转经纬度
  converTude2Double,
  //数组转化short
  getShortWith,
  //十六进制转字符串
  hexCharCodeToStr,
  //arraybuffer 转 string
  buf2string,
  // crc加密(开通器升级)
  crcEncrypt_KTQUpgrade
};
exports.utils = utils;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/byte-util.js.map
