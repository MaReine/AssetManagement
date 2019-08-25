// miniprogram/pages/addAccount/addAccount.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "", // 账户名
    money: "", // 账户金额
    rate: "", // 金额汇率
    symbol: "", // 金额符号
    types: [], // 账户类型
    typeIndex: 0, // 默认第一个类型
    attr: "固定资产", // 账户属性
    remark: '' // 账户备注
  },

  inputName: function(e) {
    this.setData({
      name: e.detail.value
    });
  },

  inputMoney: function(e) {
    this.setData({
      money: e.detail.value
    });
  },

  inputRate: function(e) {
    this.setData({
      rate: e.detail.value
    });
  },

  inputSymbol: function(e) {
    this.setData({
      symbol: e.detail.value
    });
  },

  // 类型选择
  typeChange: function(e) {
    this.setData({
      typeIndex: e.detail.value,
      attr: this.data.types[e.detail.value].typeName
    })
  },

  inputRemark: function(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  /**
   * 表单验证
   */
  validate: function() {
    if (this.data.name === "") {
      wx.showToast({
        title: "请输入账户名",
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    if (this.data.money === "") {
      wx.showToast({
        title: "请输入金额",
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    if (isNaN(Number(this.data.money))) {
      wx.showToast({
        title: "金额只能为数字!",
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    if (this.data.rate && isNaN(Number(this.data.rate))) {
      wx.showToast({
        title: "汇率只能为数字!",
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    return true;
  },

  submit: function() {
    if (this.validate()) {
      wx.showLoading({
        title: '保存中...',
      });
      const money = app.Calc(this.data.money, 6);
      const params = {
        name: this.data.name, // 账户名称
        money: money, // 账户金额
        updateMoney: money, // 账户最新的金额
        rate: this.data.rate !== "" ? Number(this.data.rate) : 1.00,
        symbol: this.data.symbol || "￥",
        profit: 0, // 账户收益
        profitPercent: "0.00", // 收益百分比 
        profitType: 1, // 收益类型 1 盈利 2 亏损 
        type: this.data.types[this.data.typeIndex].value, // 账户类型
        typeName: this.data.types[this.data.typeIndex].label, // 账户类型名称
        attr: this.data.types[this.data.typeIndex].type, // 账户属性
        attrName: this.data.types[this.data.typeIndex].typeName, // 账户属性名称
        remark: this.data.remark, // 账户备注
        userInfo: app.globalData.userInfo, // 用户信息
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      }
      console.log("[添加账户] ", params);
      const db = wx.cloud.database()
      db.collection('accounts').add({
        data: params,
        success: res => {
          console.log('[添加账户成功] ', res);
          wx.showToast({
            title: "保存成功",
            icon: 'success',
            duration: 1000
          })
          wx.setStorage({
            key: "IndexUpdate",
            data: true
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000);
        },
        fail: err => {
          console.error('[添加账户失败] ', err);
          wx.showToast({
            title: "保存失败",
            icon: 'none',
            duration: 1000
          })
        },
        complete: res => {
          wx.hideLoading();
        }
      })
    }
  },

  /**
   * 获取账户类型
   */
  getAccountTypes: function(id) {
    const db = wx.cloud.database();
    db.collection('account_types').where({
      _openid: id
    }).get({
      success: res => {
        console.log('[数据库] [查询账户类型] 成功: ', res)
        this.setData({
          types: res.data
        });
      },
      fail: err => {
        console.error('[数据库] [查询账户类型] 失败：', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let openid = app.globalData.openid;
    if (!openid) {
      app.openidReadyCallback = res => {
        openid = res;
        console.log('[回调openid]', openid);
        this.getAccountTypes(openid);
      }
    } else {
      console.log('[openid]', openid);
      this.getAccountTypes(openid);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})