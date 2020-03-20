// miniprogram/pages/index/index.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    setDialog: false,
    totalAssets: "0.00", // 总资产
    fixedAssets: "0.00", // 固定资产
    floatAssets: "0.00", // 浮动资产
    liabilities: "0.00", // 负债
    lists: [], // 账户列表
    currentAccount: { // 当前选择的账户
      index: -1,
      type: -1
    },
    currentAccountInfo: null,
    rate: "", // 汇率
    symbol: "", // 符号
    remark: "",
    jumpUrl: "", // 授权后要跳转的界面
    // 左滑参数
    startX: 0,
    currentTouch: ''
  },
  reset: function() {
    this.setData({
      isLogin: false,
      setDialog: false,
      totalAssets: "0.00", // 总资产
      fixedAssets: "0.00", // 固定资产
      floatAssets: "0.00", // 浮动资产
      liabilities: "0.00", // 负债
      lists: [], // 账户列表
      currentAccount: { // 当前选择的账户
        index: -1,
        type: -1
      },
      currentAccountInfo: null,
      rate: "", // 汇率
      symbol: "", // 符号
      remark: "",
      jumpUrl: "" // 授权后要跳转的界面
    });
  },
  inputRemark: function(e) {
    this.setData({
      remark: e.detail.value
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
  /**左滑效果实现 */
  touchS(e) {
    if (e.touches.length) {
      const info = JSON.parse(e.currentTarget.dataset.index);
      let currentAccount = 'lists['
      this.data.lists.forEach((item, i) => {
        if (item.type === info.type) {
          currentAccount = currentAccount + i + '].items['
        }
      })
      currentAccount = currentAccount + info.index + '].translateX'
      this.setData({
        startX: e.touches[0].clientX,
        currentTouch: currentAccount
      })
    }
  },
  touchM(e) {
    if (e.touches.length) {
      const moveX = e.touches[0].clientX
      const disX = this.data.startX - moveX
      const params = {}
      if (disX === 0 || disX < 0) { // 小于0说明是向右滑
        params[this.data.currentTouch] = '0rpx'
      } else if (disX <= 60) {
        params[this.data.currentTouch] = -disX + 'rpx'
      } else {
        params[this.data.currentTouch] = '-40%'
      }
      this.setData(params)
    }
  },
  touchE(e) {
    const info = JSON.parse(e.currentTarget.dataset.index);
    this.setData({
      currentAccount: {
        index: info.index,
        type: info.type
      }
    });
  },
  // 删除账户
  deleteAccount: function() {
    const _self = this;
    wx.showModal({
      title: '提示',
      content: '此账户所有数据都会被删除！',
      success(res) {
        if (res.confirm) {
          let _id = null;
          _self.data.lists.map(item => {
            if (item.type === _self.data.currentAccount.type) {
              _id = item.items[_self.data.currentAccount.index]._id;
            }
          });
          console.log(_id);
          app.DeleteSingleData('accounts', _id).then(res => {
            console.log("[首页] [删除账户] 成功", res);
            wx.cloud.callFunction({
              name: 'dbRemove',
              data: {
                name: "account_details",
                params: {
                  _accountId: _id
                }
              },
              success: res => {
                console.log("[首页] [删除记录] 成功", res);
                wx.showToast({
                  title: "删除成功",
                  icon: 'success',
                  duration: 1000
                })
                setTimeout(() => {
                  _self.getAccountLists(app.globalData.openid);
                }, 1000);
              },
              fail: err => {
                console.error("[首页] [删除记录] 成功", err);
              }
            })
          }).catch(err => {
            console.error("[首页] [删除账户] 失败", err);
            wx.showToast({
              title: "删除失败",
              icon: 'success',
              duration: 1000
            })
          });
        }
      }
    })
  },
  // 设置账户
  setAccount: function() {
    let info = null;
    this.data.lists.map(item => {
      if (item.type === this.data.currentAccount.type) {
        info = item.items[this.data.currentAccount.index];
      }
    });
    this.setData({
      setDialog: true,
      rate: info.rate,
      symbol: info.symbol,
      remark: info.remark,
      currentAccountInfo: info
    });

  },
  /**
   * 表单验证
   */
  validate: function() {
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
  cancleS: function() {
    this.setData({
      setDialog: false
    });
  },
  saveS: function() {
    if (this.validate()) {
      wx.showLoading({
        title: '设置中...',
      });
      const params = {
        rate: this.data.rate !== "" ? Number(this.data.rate) : 1.00,
        symbol: this.data.symbol || "￥",
        remark: this.data.remark,
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      }
      app.UpdateSingleData("accounts", this.data.currentAccountInfo._id, params).then(res => {
        console.log("[账户详情] [更新账户信息] 成功", res);
        wx.showToast({
          title: "设置成功",
          icon: 'success',
          duration: 1000
        })
        setTimeout(() => {
          this.cancleS();
          this.getAccountLists(app.globalData.openid);
          this.setData({
            currentAccount: {
              index: -1,
              type: -1
            }
          });
        }, 1000);
      }).catch(err => {
        console.error("[账户详情] [更新账户信息] 失败", err);
        wx.showToast({
          title: "设置失败",
          icon: 'none',
          duration: 1000
        })
      }).finally(() => {
        wx.hideLoading();
      });
    }
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
      wx.setStorage({
        key: "IndexUpdate",
        data: true
      })
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
        // console.log('[首页] [查询账户列表] 成功: ', res)
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
            // 先转化成人民币
            const rmb = app.Calc(app.Calc(item.updateMoney, item.rate, "*"), 2);
            item.showDate = item.updateDate.split(" ")[0];
            item.translateX = "0rpx"
            switch (item.attr) {
              case 0: // 固定资产
                fixedAssets = app.Calc(fixedAssets, rmb, "+");
                fixedList.push(item);
                break;
              case 1: // 浮动资产
                floatAssets = app.Calc(floatAssets, rmb, "+");
                floatList.push(item);
                break;
              case 2: // 负债
                liabilities = app.Calc(liabilities, rmb, "+");
                liabiList.push(item);
                break;
            }
          });

          totalList = floatList.concat(fixedList).concat(liabiList);
          totalAssets = app.Calc(app.Calc(fixedAssets, floatAssets, "+"), liabilities, "-");

          totalList.map(item => {
            // 先转化成人民币
            const rmb = app.Calc(app.Calc(item.updateMoney, item.rate, "*"), 2);
            if (resList.length === 0) {
              let obj = {
                type: item.type,
                typeName: item.typeName,
                totalMoney: rmb,
                items: [item]
              };
              resList.push(obj);
            } else {
              let isExt = false;
              resList.map((list) => {
                if (list.type === item.type) {
                  list.items.push(item);
                  list.totalMoney = app.Calc(list.totalMoney, rmb, "+");
                  isExt = true;
                }
              });
              if (!isExt) {
                let obj = {
                  type: item.type,
                  typeName: item.typeName,
                  totalMoney: rmb,
                  items: [item]
                };
                resList.push(obj);
              }
            }
          });
          this.setData({
            totalAssets: app.get_thousand_num(totalAssets),
            fixedAssets: app.get_thousand_num(fixedAssets),
            floatAssets: app.get_thousand_num(floatAssets),
            liabilities: app.get_thousand_num(liabilities),
            lists: resList
          });
          // console.log('[首页] [账户列表] : ', resList)
        } else {
          this.reset();
        }
      },
      fail: err => {
        console.error('[首页] [查询账户列表] 失败：', err)
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
    app.userInfoReadyCallback = res => {
      let openid = app.globalData.openid;
      if (!openid) {
        app.openidReadyCallback = res => {
          openid = res;
          // console.log('[回调openid]', openid);
          this.getAccountLists(openid);
        }
      } else {
        // console.log('[openid]', openid);
        this.getAccountLists(openid);
      }
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