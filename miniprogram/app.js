//app.js
App({
  /**
   * 全局参数
   */
  globalData: {},
  /**
   * 获取用户的openid
   */
  getOpenid: function() {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        // console.log('[云函数] [login] user openid: ', res.result.openid)
        this.globalData.openid = res.result.openid

        // 由于 云函数 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (this.openidReadyCallback) {
          this.openidReadyCallback(res.result.openid)
        }
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log("[app用户信息] ", res.userInfo);
              this.globalData.userInfo = res.userInfo;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
      this.getOpenid();
      this.getUserInfo();
    }
  },
  // 以下是全局的一些工具方法
  /**
   * @description {{日期格式转换:月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)可以用 1-2 个占位符、周(E)可以用 1-3 个占位符
   *                          年(y)、季度(q)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)}
   * @param date[String][可选,默认返回当前时间] 要处理的日期
   * @param format[String][可选,默认"yyyy-MM-dd"] 格式
   * @return resultDate[String]
   */
  dateFormat: function(date, format) {
    let resultDate = null,
      now = new Date();
    switch (arguments.length) {
      case 0:
        resultDate = _getDate(now, "yyyy-MM-dd");
        break;
      case 1:
        if (/(y+)|(M+)|(d+)|(h+)|(H+)|(m+)|(s+)|(S+)|(E+)|(q+)/.test(arguments[0]) && !/GMT/.test(arguments[0])) {
          resultDate = _getDate(now, arguments[0]);
        } else {
          resultDate = _getDate(new Date(_getCorrectDate(arguments[0])), "yyyy-MM-dd");
        }
        break;
      case 2:
        resultDate = _getDate(new Date(_getCorrectDate(arguments[0])), arguments[1]);
        break;
    }

    function _getDate(date, format) {
      try {
        var o = {
          "M+": date.getMonth() + 1, //月份
          "d+": date.getDate(), //日
          "h+": date.getHours(), //小时
          "H+": date.getHours(), //小时
          "m+": date.getMinutes(), //分
          "s+": date.getSeconds(), //秒
          "q+": Math.floor((date.getMonth() + 3) / 3), //季度
          "S": date.getMilliseconds() //毫秒
        };
        var week = {
          "0": "日",
          "1": "一",
          "2": "二",
          "3": "三",
          "4": "四",
          "5": "五",
          "6": "六"
        };
        if (/(y+)/.test(format)) {
          format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(format)) {
          format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[date.getDay() + ""]);
        }
        if (/(q+)/.test(format)) {
          format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? (RegExp.$1.length > 3 ? "第" : "") : "") : "") + o["q+"] + ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? (RegExp.$1.length > 3 ? "季度" : "季度") : "季") : ""));
        }
        for (var k in o) {
          if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (o[k].length > 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)));
          }
        }
        return format;
      } catch (e) {
        console.log(e);
      }
    }

    function _getCorrectDate(d) {
      if (typeof d === 'string' && d.indexOf('-') != -1 && !/(T|t)/.test(d)) {
        d = date.replace(/-/g, '/');
      }
      return d;
    }

    return resultDate;
  },
  /**
   * 金额千分位","处理显示
   */
  get_thousand_num: function(num) {
    return num.toString().replace(/\d+/, function(n) { // 先提取整数部分
      return n.replace(/(\d)(?=(\d{3})+$)/g, function($1) { // 对整数部分添加分隔符
        return $1 + ",";
      });
    });
  }
})