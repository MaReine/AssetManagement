// miniprogram/pages/index/index.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false
  },
  /**
   * 跳转新增账户页面
   */
  addAccount: function() {
    if (!app.globalData.userInfo) {
      console.log('未登录授权');
      this.setData({
        isLogin: true
      });
    } else {
      wx.navigateTo({
        url: '../addAccount/addAccount'
      })
    }
  },
  // 微信授权后获取用户信息
  getUserInfo: function(e) {
    // console.log(e)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo;
      wx.showToast({
        title: "授权成功",
        icon: 'success',
        duration: 1000
      })
      setTimeout(() => {
        this.setData({
          isLogin: false
        });
        wx.navigateTo({
          url: '../addAccount/addAccount'
        })
      }, 1000);
    } else {
      wx.showToast({
        title: "授权失败",
        icon: 'none',
        duration: 1000
      })
    }
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