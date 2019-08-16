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
    currentOpType: -1, // -1 当前没有操作 0 out 1 in
    currentOpTypeName: "",
    lists: [], // 明细列表
    recordMoney: "", // 记录金额
    recordRemark: "", // 记录备注
    selectAccountIndex: 0, // 选择的账户下标
    accountLists: [{
      name: "其它",
      attr: -1,
      type: -1
    }] // 账户列表
  },

  accountChange: function(e) {
    this.setData({
      selectAccountIndex: e.detail.value
    })
  },

  inputRecordMoney: function(e) {
    this.setData({
      recordMoney: e.detail.value
    });
  },

  inputRecordRemark: function(e) {
    this.setData({
      recordRemark: e.detail.value
    });
  },

  handleBuy: function() {
    this.setData({
      dialogShow: true,
      currentOpType: 1,
      currentOpTypeName: this.data.inLabel
    });
    this.getAccountLists(app.globalData.openid);
  },

  handleSale: function() {
    this.setData({
      dialogShow: true,
      currentOpType: 0,
      currentOpTypeName: this.data.outLabel
    });
    this.getAccountLists(app.globalData.openid);
  },

  /**
   * 关闭添加记录弹窗
   */
  cancle: function() {
    this.setData({
      dialogShow: false
    });
  },

  /**
   * 表单验证
   */
  validate: function() {
    if (this.data.recordMoney === "") {
      wx.showToast({
        title: "请输入金额",
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (isNaN(Number(this.data.recordMoney))) {
      wx.showToast({
        title: "请输入正确金额",
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    return true;
  },

  /**
   * 添加记录保存
   */
  save: function() {
    if (this.validate()) {
      wx.showLoading({
        title: '保存中...',
      });

      // 新增记录参数
      const params = {
        _accountId: this.data.accountInfo._id, // 当前账户id
        money: Number(this.data.recordMoney), // 记录金额
        remark: this.data.recordRemark, // 记录备注
        operateType: this.data.currentOpType, // 记录类型
        operateTypeName: this.data.currentOpTypeName, // 类型名称
        currentAccountInfo: this.data.accountInfo, // 当前账户信息
        selectAccountInfo: this.data.accountLists[this.data.selectAccountIndex], // 选择的账户信息
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      };

      console.log("[账户详情] [添加记录]", params);
      const db = wx.cloud.database()
      db.collection('account_details').add({
        data: params,
        success: res => {
          console.log('[添加记录成功] ', res);
          wx.showToast({
            title: "保存成功",
            icon: 'success',
            duration: 1000
          })
          setTimeout(() => {
            this.setData({
              dialogShow: false
            })
            this.updateCurrentAccount();
            this.updateSelectAccount();
          }, 1000);
        },
        fail: err => {
          console.error('[添加记录失败] ', err);
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
   * 删除一条记录
   */
  deleteRecord: function(e) {
    const info = e.currentTarget.dataset.item;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '删除记录会造成账户数据不准确,确认要删除吗？',
      success(res) {
        if (res.confirm) {
          app.DeleteSingleData("account_details", info._id).then(res => {
            console.log("[账户详情] [删除记录] 成功", res);
            this.getSingleAccountInfo();
            wx.setStorage({
              key: "IndexUpdate",
              data: true
            })
          }).catch(err => {
            console.log("[账户详情] [删除记录] 失败", err);
          });
        }
      }
    })
  },

  /**
   * 更新当前账户数据
   */
  updateCurrentAccount: function() {
    let money = this.data.accountInfo.money;
    let updateMoney = this.data.accountInfo.updateMoney;
    if (this.data.accountInfo.attr === 2) {
      if (this.data.currentOpType === 1) {
        money = money - Number(this.data.recordMoney);
        updateMoney = updateMoney - Number(this.data.recordMoney);
      } else {
        money = money + Number(this.data.recordMoney);
        updateMoney = updateMoney + Number(this.data.recordMoney);
      }
    } else {
      if (this.data.currentOpType === 1) {
        money = money + Number(this.data.recordMoney);
        updateMoney = updateMoney + Number(this.data.recordMoney);
      } else {
        money = money - Number(this.data.recordMoney);
        updateMoney = updateMoney - Number(this.data.recordMoney);
      }
    }
    // 当前账户需要更新的参数
    const params = {
      money: money,
      updateMoney: updateMoney,
      updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
    }
    app.UpdateSingleData("accounts", this.data.accountInfo._id, params).then(res => {
      console.log("[账户详情] [更新当前账户信息] 成功", res);
      this.getSingleAccountInfo();
      wx.setStorage({
        key: "IndexUpdate",
        data: true
      })
    }).catch(err => {
      console.log("[账户详情] [更新当前账户信息] 失败", err);
    });
  },

  /**
   * 更新选择账户数据
   */
  updateSelectAccount: function() {
    const accountInfo = this.data.accountLists[this.data.selectAccountIndex];
    if (accountInfo.attr !== -1) {
      // 先更新账户数据
      let money = accountInfo.money;
      let updateMoney = accountInfo.updateMoney;
      if (accountInfo.attr === 2) {
        if (this.data.currentOpType === 0) {
          money = money - Number(this.data.recordMoney);
          updateMoney = updateMoney - Number(this.data.recordMoney);
        } else {
          money = money + Number(this.data.recordMoney);
          updateMoney = updateMoney + Number(this.data.recordMoney);
        }
      } else {
        if (this.data.currentOpType === 0) {
          money = money + Number(this.data.recordMoney);
          updateMoney = updateMoney + Number(this.data.recordMoney);
        } else {
          money = money - Number(this.data.recordMoney);
          updateMoney = updateMoney - Number(this.data.recordMoney);
        }
      }
      const params = {
        money: money,
        updateMoney: updateMoney,
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      }
      app.UpdateSingleData("accounts", accountInfo._id, params).then(res => {
        console.log("[账户详情] [更新关联账户信息] 成功", res);
      }).catch(err => {
        console.log("[账户详情] [更新关联账户信息] 失败", err);
      });

      // 再自动添加账户记录
      // 新增记录参数
      let opType = -1,
        opTypeName = "";
      if (this.data.currentOpType === 1) {
        opType = 0;
      } else if (this.data.currentOpType === 0) {
        opType = 1;
      }

      switch (accountInfo.attr) {
        case 0:
          if (opType == 1) {
            opTypeName = "转入";
          } else if (opType == 0) {
            opTypeName = "转出";
          }
          break;
        case 1:
          if (opType == 1) {
            opTypeName = "充值";
          } else if (opType == 0) {
            opTypeName = "提现";
          }
          break;
        case 2:
          if (opType == 1) {
            opTypeName = "还款";
          } else if (opType == 0) {
            opTypeName = "借款";
          }
          break;
      }

      const recordParams = {
        _accountId: accountInfo._id, // 当前账户id
        money: Number(this.data.recordMoney), // 记录金额
        remark: "", // 记录备注
        operateType: opType, // 记录类型
        operateTypeName: opTypeName, // 类型名称
        currentAccountInfo: accountInfo, // 当前账户信息
        selectAccountInfo: this.data.accountInfo, // 选择的账户信息
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      };

      console.log("[账户详情] [添加关联记录]", recordParams);
      const db = wx.cloud.database()
      db.collection('account_details').add({
        data: recordParams,
        success: res => {
          console.log('[账户详情] [添加关联记录成功] ', res);
        },
        fail: err => {
          console.error('[账户详情] [添加关联记录失败] ', err);
        }
      })
    }
  },

  /**
   * 获取账户列表
   */
  getAccountLists: function(id) {
    const db = wx.cloud.database();
    db.collection('accounts').where({
      _openid: id
    }).orderBy('updateDate', 'desc').get({
      success: res => {
        console.log('[账户详情] [查询账户列表] 成功: ', res)
        if (res.data.length !== 0) {
          let resList = [],
            fixedList = [],
            floatList = [],
            liabiList = [];
          res.data.map(item => {
            if (item._id !== this.data.accountInfo._id) {
              switch (item.attr) {
                case 0: // 固定资产
                  fixedList.push(item);
                  break;
                case 1: // 浮动资产
                  floatList.push(item);
                  break;
                case 2: // 负债
                  liabiList.push(item);
                  break;
              }
            }
          });
          resList = fixedList.concat(floatList).concat(liabiList).concat(this.data.accountLists);
          this.setData({
            accountLists: resList
          });
        }
      },
      fail: err => {
        console.error('[账户详情] [查询账户列表] 失败：', err)
      },
      complete: res => {}
    })
  },

  /**
   * 获取单个的账户信息
   */
  getSingleAccountInfo: function() {
    app.GetSingleData("accounts", this.data.accountInfo._id).then(res => {
      console.log("[账户详情] [查询单条账户信息] 成功", res);
      if (res && res.data) {
        this.setData({
          lastMoney: app.get_thousand_num(res.data.updateMoney),
          accountInfo: res.data
        });
        this.getRecordLists(res.data._id);
      }
    }).catch(err => {
      console.log("[账户详情] [查询单条账户信息] 失败", err);
    });
  },

  /**
   * 获取记录列表
   */
  getRecordLists: function(id) {
    wx.showLoading({
      title: '加载中...',
    });
    const db = wx.cloud.database();
    db.collection('account_details').where({
      _accountId: id
    }).orderBy('updateDate', 'desc').get({
      success: res => {
        console.log('[账户详情] [查询记录列表] 成功: ', res)
        if (res.data.length !== 0) {
          this.setData({
            lists: res.data
          });
        }
      },
      fail: err => {
        console.error('[账户详情] [查询记录列表] 失败：', err)
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
          console.log("[账户详情] [账户信息]", res.data);
          switch (res.data.attr) {
            case 0:
              that.setData({
                inLabel: "转入",
                outLabel: "转出"
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
          that.getRecordLists(res.data._id);
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