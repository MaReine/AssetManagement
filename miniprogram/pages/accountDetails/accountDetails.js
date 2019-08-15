// miniprogram/pages/accountDetails/accountDetails.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogShow: false,
    lastMoney: "0.00", // 余额
    accountInfo: null, // 账户信息
    inLabel: "收入", // 操作文案 
    outLabel: "支出", //
    lists: [] // 明细列表
  },

  handleBuy: function() {
    this.setData({
      dialogShow: true
    });
  },

  handleSale: function() {

  },

  cancle: function() {
    this.setData({
      dialogShow: false
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
    let that = this;
    wx.getStorage({
      key: 'AccountInfo',
      success(res) {
        if (res.data) {
          console.log("[账户信息]", res.data);
          switch (res.data.attr) {
            case 0:
              that.setData({
                inLabel: "收入",
                outLabel: "支出"
              });
              break;
            case 1:
              that.setData({
                inLabel: "充值",
                outLabel: "提现"
              });
              break;
            case 2:
              that.setData({
                inLabel: "还款",
                outLabel: "借款"
              });
              break;
          }
          that.setData({
            lastMoney: app.get_thousand_num(res.data.updateMoney),
            accountInfo: res.data
          });
        }
      }
    })
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