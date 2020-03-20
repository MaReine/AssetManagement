// miniprogram/pages/accountDetails/accountDetails.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogShow: false, // 控制操作弹窗
    updateDialog: false, // 更新余额弹窗
    balanceMoney: "", // 更新的余额
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

  inputBalanceMoney: function(e) {
    this.setData({
      balanceMoney: e.detail.value
    });
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

  cancleU: function() {
    this.setData({
      updateDialog: false
    });
  },

  /**
   * 重置表单数据
   */
  resetParams: function() {
    this.setData({
      recordMoney: "", // 记录金额
      recordRemark: "", // 记录备注
      selectAccountIndex: 0 // 选择的账户下标
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

  validateU: function() {
    if (this.data.balanceMoney === "") {
      wx.showToast({
        title: "请输入金额",
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (isNaN(Number(this.data.balanceMoney))) {
      wx.showToast({
        title: "请输入正确金额",
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    if (Number(this.data.balanceMoney) == this.data.lastMoney) {
      wx.showToast({
        title: "余额未发生改变",
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    return true;
  },

  saveU: function() {
    if (this.validateU()) {
      wx.showLoading({
        title: '更新中...',
      });
      const transM = app.Calc(this.data.balanceMoney, 6);
      const profit = app.Calc(transM, this.data.accountInfo.money, "-");
      let profitType = 1; // 1 盈利 2 亏损 
      if (profit < 0) {
        profitType = 2;
      }
      const profitPercent = app.Calc(app.Calc(profit, this.data.accountInfo.money, "/") * 100, 2);
      // 当前账户需要更新的参数
      const params = {
        updateMoney: transM,
        profit: profit, // 账户收益
        profitPercent: profitPercent, // 收益百分比 
        profitType: profitType, // 收益类型 1 盈利 2 亏损 
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      }
      // console.log("[账户详情] [更新账户参数]", params);
      app.UpdateSingleData("accounts", this.data.accountInfo._id, params).then(res => {
        // console.log("[账户详情] [更新账户信息] 成功", res);
        wx.showToast({
          title: "更新成功",
          icon: 'success',
          duration: 1000
        })
        setTimeout(() => {
          this.cancleU();
          this.getSingleAccountInfo(0);
          wx.setStorage({
            key: "IndexUpdate",
            data: true
          })
        }, 1000);
      }).catch(err => {
        console.log("[账户详情] [更新账户信息] 失败", err);
        wx.showToast({
          title: "更新失败",
          icon: 'none',
          duration: 1000
        })
      }).finally(() => {
        wx.hideLoading();
      });
    }
  },
  /**
   * 删除记录
   */
  deleteRecord: function(e) {
    const item = e.currentTarget.dataset.item
    wx.showModal({
      title: '提示',
      content: '确认删除这条记录？',
      success: res => {
        if (res.confirm) {
          // console.log(item)
          app.DeleteSingleData('account_details', item._id).then(res => {
            // console.log("[账户详情] [删除记录] 成功", res);
            wx.showToast({
              title: "删除成功",
              icon: 'success',
              duration: 1000
            })
            setTimeout(() => {
              const operateType = item.operateType ? 0 : 1
              // 删除后更新当前账户信息
              this.updateAccount(this.data.accountInfo, operateType, item.money);
              // 删除关联记录
              app.DeleteSingleData('account_details', item.relationRecordId).then(res => {
                // console.log("[账户详情] [删除关联记录] 成功", res)
                app.GetSingleData("accounts", item.relationAccountInfo._id).then(res => {
                  // console.log("[账户详情] [查询单条账户信息] 成功", res);
                  // 更新关联账户信息
                  this.updateAccount(res.data, item.operateType, item.money);
                })
              })
            }, 1000)
          }).catch(err => {
            console.log("[账户详情] [删除记录] 失败", err);
            wx.showToast({
              title: "删除失败",
              icon: 'none',
              duration: 1000
            })
          })
        }
      },
    })
  },
  /**
   * 添加记录保存
   */
  save: function() {
    if (this.validate()) {
      wx.showLoading({
        title: '保存中...',
      });

      const money = app.Calc(this.data.recordMoney, 6);

      // 新增记录参数
      const params = {
        _accountId: this.data.accountInfo._id, // 当前账户id
        money: money, // 记录金额
        symbol: this.data.accountInfo.symbol, // 符号
        remark: this.data.recordRemark, // 记录备注
        operateType: this.data.currentOpType, // 记录类型
        operateTypeName: this.data.currentOpTypeName, // 类型名称
        accountInfo: this.data.accountInfo, // 当前账户信息
        relationAccountInfo: this.data.accountLists[this.data.selectAccountIndex], // 关联账户信息
        relationRecordId: "", // 关联记录id
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      };

      // console.log("[账户详情] [添加记录]", params);
      const db = wx.cloud.database()
      db.collection('account_details').add({
        data: params,
        success: res => {
          // console.log('[添加记录成功] ', res);
          wx.showToast({
            title: "保存成功",
            icon: 'success',
            duration: 1000
          })
          setTimeout(() => {
            this.cancle();
            this.resetParams();
            this.updateAccount(params.accountInfo, params.operateType, params.money);
            this.updateRelationAccount(params.relationAccountInfo, params.operateType, params.money, res._id);
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
   * 更新余额
   */
  changeMoney: function() {
    this.setData({
      updateDialog: true
    });
  },

  /**
   * 更新账户数据
   * params a[账户信息]
   * params o[操作类型]
   * parmas m[金额]
   */
  updateAccount: function(a, o, m) {
    let money = a.money;
    let updateMoney = a.updateMoney;
    if (a.attr === 2) { // 负债
      if (o === 1) {
        money = app.Calc(money, m, "-");
        updateMoney = app.Calc(updateMoney, m, "-");
      } else {
        money = app.Calc(money, m, "+");
        updateMoney = app.Calc(updateMoney, m, "+");
      }
    } else {
      if (o === 1) {
        money = app.Calc(money, m, "+");
        updateMoney = app.Calc(updateMoney, m, "+");
      } else {
        money = app.Calc(money, m, "-");
        updateMoney = app.Calc(updateMoney, m, "-");
      }
    }
    // 当前账户需要更新的参数
    const params = {
      money: money,
      updateMoney: updateMoney,
      updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
    }
    // console.log("[账户详情] [更新账户参数]", params);
    app.UpdateSingleData("accounts", a._id, params).then(res => {
      // console.log("[账户详情] [更新账户信息] 成功", res);
      if (a._id === this.data.accountInfo._id) {
        this.getSingleAccountInfo(1);
      }
      wx.setStorage({
        key: "IndexUpdate",
        data: true
      })
    }).catch(err => {
      console.log("[账户详情] [更新账户信息] 失败", err);
    });
  },

  /**
   * 更新关联账户数据
   * params a[账户信息]
   * params o[操作类型]
   * parmas m[金额]
   */
  updateRelationAccount: function(a, o, m, recordId) {
    if (a.attr !== -1) {
      // 获取当前账户信息
      const currentA = this.data.accountInfo;
      // 金额需要先转化成关联账户的汇率金额
      const rmb = app.Calc(m, currentA.rate, "*");
      const transM = app.Calc(app.Calc(rmb, a.rate, "/"), 6);
      // 先更新账户数据
      let money = a.money;
      let updateMoney = a.updateMoney;
      if (a.attr === 2) {
        if (o === 0) {
          money = app.Calc(money, transM, "-");
          updateMoney = app.Calc(updateMoney, transM, "-");
        } else {
          money = app.Calc(money, transM, "+");
          updateMoney = app.Calc(updateMoney, transM, "+");
        }
      } else {
        if (o === 0) {
          money = app.Calc(money, transM, "+");
          updateMoney = app.Calc(updateMoney, transM, "+");
        } else {
          money = app.Calc(money, transM, "-");
          updateMoney = app.Calc(updateMoney, transM, "-");
        }
      }
      const params = {
        money: money,
        updateMoney: updateMoney,
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      }
      app.UpdateSingleData("accounts", a._id, params).then(res => {
        // console.log("[账户详情] [更新关联账户信息] 成功", res);
      }).catch(err => {
        console.log("[账户详情] [更新关联账户信息] 失败", err);
      });

      // 再自动添加账户记录
      // 新增记录参数
      let opType = -1,
        opTypeName = "";
      if (o === 1) {
        opType = 0;
      } else if (o === 0) {
        opType = 1;
      }

      switch (a.attr) {
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
        _accountId: a._id, // 当前账户id
        money: transM, // 记录金额
        symbol: a.symbol, // 符号
        remark: "", // 记录备注
        operateType: opType, // 记录类型
        operateTypeName: opTypeName, // 类型名称
        accountInfo: a, // 当前账户信息
        relationAccountInfo: currentA, // 选择的账户信息
        relationRecordId: recordId, // 当前新增的记录id
        updateDate: app.dateFormat('yyyy-MM-dd hh:mm:ss') // 更新时间
      };

      // console.log("[账户详情] [添加关联记录]", recordParams);
      const db = wx.cloud.database()
      db.collection('account_details').add({
        data: recordParams,
        success: res => {
          // console.log('[账户详情] [添加关联记录成功] ', res);
          app.UpdateSingleData('account_details', recordId, {
            relationRecordId: res._id
          }).then(res => {
            // console.log('[账户详情] [更新新增记录成功]', res)
          })
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
        // console.log('[账户详情] [查询账户列表] 成功: ', res)
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
   * @parms t 0 更新余额 1 添加记录
   */
  getSingleAccountInfo: function(t) {
    app.GetSingleData("accounts", this.data.accountInfo._id).then(res => {
      // console.log("[账户详情] [查询单条账户信息] 成功", res);
      if (res && res.data) {
        this.setData({
          lastMoney: app.get_thousand_num(res.data.updateMoney),
          accountInfo: res.data
        });
        if (t === 1) {
          this.getRecordLists(res.data._id);
        }
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
        // console.log('[账户详情] [查询记录列表] 成功: ', res)
        if (res.data.length !== 0) {
          this.setData({
            lists: res.data
          });
        } else {
          this.setData({
            lists: []
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
          // console.log("[账户详情] [账户信息]", res.data);
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