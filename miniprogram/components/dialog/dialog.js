// components/dialog/dialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer: function(val) {
        this.setData({
          dialogShow: val
        });
      }
    },
    animation: {
      type: String,
      value: "dialog-container-center"
    },
    title: {
      type: String,
      value: "标题"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dialogShow: null,
    maskAnimaton: "animaton_fadeIn"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show: function() {
      this.setData({
        dialogShow: true
      });
    },
    hide: function() {
      this.setData({
        dialogShow: false
      });
    }
  }
})