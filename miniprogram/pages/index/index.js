// miniprogram/pages/index/index.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    totalAssets: "0.00", // 总资产
    fixedAssets: "0.00", // 固定资产
    floatAssets: "0.00", // 浮动资产
    liabilities: "0.00", // 负债
    lists: [], // 账户列表
    jumpUrl: "" // 授权后要跳转的界面
  },
  /**
   * 跳转新增账户页面
   */
  addAccount: function() {
    if (!app.globalData.userInfo) {
      console.log('未登录授权');
      this.setData({
        isLogin: true,
        jumpUrl: "../addAccount/addAccount"
      });
    } else {
      wx.navigateTo({
        url: '../addAccount/addAccount'
      })
    }
  },
  openDetail: function(e) {
    const info = e.currentTarget.dataset.item;
    if (info) {
      if (!app.globalData.userInfo) {
        console.log('未登录授权');
        this.setData({
          isLogin: true,
          jumpUrl: "../accountDetails/accountDetails"
        });
      } else {
        wx.navigateTo({
          url: '../accountDetails/accountDetails'
        })
      }
      wx.setStorage({
        key: 'AccountInfo',
        data: info,
      })
    }
  },
  /**
   * 取消授权
   */
  cancle: function() {
    this.setData({
      isLogin: false
    });
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
          url: this.data.jumpUrl
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
   * 获取账户列表
   */
  getAccountLists: function(id) {
    wx.showLoading({
      title: '加载中...',
    });
    const db = wx.cloud.database();
    db.collection('accounts').where({
      _openid: id
    }).orderBy('updateDate', 'desc').get({
      success: res => {
        console.log('[数据库] [查询账户列表] 成功: ', res)
        if (res.data.length !== 0) {
          let resList = [],
            totalList = [],
            fixedList = [],
            floatList = [],
            liabiList = [],
            totalAssets = 0,
            fixedAssets = 0,
            floatAssets = 0,
            liabilities = 0;
          res.data.map(item => {
            item.showDate = item.updateDate.split(" ")[0];
            switch (item.attr) {
              case 0: // 固定资产
                fixedAssets += item.money * 10000;
                fixedList.push(item);
                break;
              case 1: // 浮动资产
                floatAssets += item.money * 10000;
                floatList.push(item);
                break;
              case 2: // 负债
                liabilities += item.money * 10000;
                liabiList.push(item);
                break;
            }
          });

          totalList = floatList.concat(fixedList).concat(liabiList);
          totalAssets = fixedAssets + floatAssets - liabilities;

          totalList.map(item => {
            if (resList.length === 0) {
              let obj = {
                type: item.type,
                typeName: item.typeName,
                totalMoney: item.money,
                items: [item]
              };
              resList.push(obj);
            } else {
              let isExt = false;
              resList.map((list) => {
                if (list.type === item.type) {
                  list.items.push(item);
                  list.totalMoney = (list.totalMoney * 10000 + item.money * 10000) / 10000;
                  isExt = true;
                }
              });
              if (!isExt) {
                let obj = {
                  type: item.type,
                  typeName: item.typeName,
                  totalMoney: item.money,
                  items: [item]
                };
                resList.push(obj);
              }
            }
          });
          this.setData({
            totalAssets: app.get_thousand_num(totalAssets / 10000),
            fixedAssets: app.get_thousand_num(fixedAssets / 10000),
            floatAssets: app.get_thousand_num(floatAssets / 10000),
            liabilities: app.get_thousand_num(liabilities / 10000),
            lists: resList
          });
          console.log('[账户列表] : ', resList)
        }
      },
      fail: err => {
        console.error('[数据库] [查询账户列表] 失败：', err)
      },
      complete: res => {
        wx.hideLoading();
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
        this.getAccountLists(openid);
      }
    } else {
      console.log('[openid]', openid);
      this.getAccountLists(openid);
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
    let that = this;
    wx.getStorage({
      key: 'IndexUpdate',
      success(res) {
        if (res.data) {
          that.getAccountLists(app.globalData.openid);
          wx.setStorage({
            key: "IndexUpdate",
            data: false
          })
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