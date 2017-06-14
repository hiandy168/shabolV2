var app = getApp()
Page({
  data:{
    edit: -1,
    inputValue:'',
    photo:'',
    userName:'',
    placeholder:true,
    showTopTips:false,  //是否显示提示
    showTopTxt:'',  //提示内容
    textValues: ''
  },
  onLoad:function(options){
    this.setData({
      edit:options.edit
    })
    wx.setNavigationBarTitle({
      title:options.edit == '2' ? '发布车源' : '发布货源'
    })
    var that = this
    var userInfo = wx.getStorageSync('userInfo')
    if(!userInfo || userInfo == ''){ // 如果没有user信息，重新授权获取
      that.getSetting()
    } else {  // 如果有直接读缓存
      app.authSetting = true
      that.getClipBoard()
      wx.getStorage({
        key: 'userInfo',
        success: function(res) {
          that.setData({
            photo:res.data.photo,
            userName:res.data.userName
          })
        }
      })
    }
  },
  focus:function(){ // 获取焦点
    this.setData({
      placeholder:false
    })
  },
  getSetting () {  // 拒绝授权的时候，自动跳转到授权页获取个人信息
    var that = this
    if (wx.getSetting) {
      wx.getSetting({
        success:(r) => {
          if (!r.authSetting["scope.userInfo"]){
            wx.openSetting({
              success: (res) =>{
                wx.setStorage({
                  key:"userInfo",
                  data:{
                    userName:res.userInfo.nickName,
                    photo:res.userInfo.avatarUrl
                  }
                })
                that.setData({
                  photo:res.userInfo.avatarUrl,
                  userName:res.userInfo.nickName
                })
                that.getClipBoard()
                app.authSetting = true
              }
            })
          }
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  getClipBoard () {  // 获取剪切板
    var that = this
    if (wx.getClipboardData) {
      wx.getClipboardData({
        success: function(res){
          if (trims(res.data) !== '') {
            wx.showModal({ // 弹窗
              title: '剪切板内容',
              content: res.data,
              confirmText: '粘贴',
              success (r) {
                if (r.confirm) { // 点击确定
                  that.setData({
                    placeholder:false,
                    textValues: res.data
                  })
                }
              }
            })
          }
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  blur:function(){  // 失去焦点
    if(trims(this.data.inputValue || trims(this.data.textValues)) == ''){
      this.setData({
        placeholder:true
      })
    }
  },
  inputValue:function(e){//输入内容
    this.setData({
      inputValue:e.detail.value
    })
  },
  formSubmit:function(e){//提交表单
    if(app.republish)  return;
    if(app.authSetting){
      var that = this
      app.republish = true
      var c = e.detail.value.textarea;   //获取textarea输入内容
      var phoneNums = c.match(/1(([38]\d)|(4[57])|(5[012356789])|(7[0135678]))\d{8}/g);  //匹配电话数组
      if((that.data.inputValue || that.data.textValues) && phoneNums){  ///如果匹配到电话，就进行上传接口
        wx.showToast({
          title: '正在发布',
          icon: 'loading'
        })
        wx.request({
          url:app.ajaxurl,
          data:{
            c: 'carnewapi',
            m: 'savecargo',
            isCarGo: that.data.edit,
            openId: app.uid,
            userName:that.data.userName,
            photo:that.data.photo,
            content: c,
            ts:+new Date()
          },
          success:function(res){
            app.republish = false
            if(res.data.data.info == 3){
              wx.showModal({
                title: '提示',
                content: '你已被管理员移除群聊，不能发布货源！',
                showCancel:false,
                success:function(){
                  wx.navigateBack()
                }
              })
            }else{
              wx.showToast({
                title: '发布成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.hideToast()
                if(that.data.edit == '1'){
                  wx.redirectTo({
                    url:'../index/index?chooseTab=' + true
                  })
                }else{
                  wx.redirectTo({
                    url:'../index/index?chooseTab=' + false
                  })
                }
              }, 1500)
            }
          }
        })
      }else{
        app.republish = false
        that.setData({
          showTopTips:true,
          showTopTxt:'内容或者电话不能为空',
        })
        setTimeout(() => {
          that.setData({
            showTopTips:false
          })
        }, 1000)
      }
    }else{
      wx.showModal({
        title: '提示',
        content: '10分钟后再次登录小程序或进行用户授权',
        showCancel:false,
        success:function(){
          wx.navigateBack()
        }
      })
    }
  }
})
function trims(str){  //去除前面空格
  var str = str.replace(/^\s*/g,"")
  return str
}
