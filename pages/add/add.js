var app = getApp()
Page({
  data:{
    edit: -1,
    inputValue:'',
    unionId: '',
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
    var unionId = wx.getStorageSync('unionId')
    if(app.globalData.userInfo == null){ // 如果没有user信息，重新授权获取
      if(app.authSetting) return
      wx.openSetting({
        success:(res)=>{
          if(!res.authSetting["scope.userInfo"]){
              app.authSetting = false
            // 拒绝授权
          } else {
            app.authSetting = true
          }
          wx.getUserInfo({
            success: function (res) {
              that.setData({
                userName:res.userInfo.nickName,
                photo:res.userInfo.avatarUrl
              })
              wx.setStorage({
                key:"userInfo",
                data:{
                  userName:res.userInfo.nickName,
                  photo:res.userInfo.avatarUrl
                }
              })
            }
          })
        }
      })
    } else {  // 如果有直接读缓存
      app.authSetting = true
      wx.getStorage({
        key: 'userInfo',
        success: function(res) {
          that.setData({
            photo:res.data.photo,
            userName:res.data.userName,
            unionId: unionId
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
      var phoneNums = c.match(/1(([38]\d)|(4[57])|(5[012356789])|(7[013678]))\d{8}/g);  //匹配电话数组
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
                if(that.data.unionId == ''){
                  wx.navigateBack()
                }else{
                  if(that.data.edit == '1'){
                    wx.redirectTo({
                      url:'../close/close?unionId=' + that.data.unionId + '&nickname=' + that.data.userName + '&avatar=' + that.data.photo + '&isCarGo=' + that.data.edit
                    })
                  }else{
                    wx.redirectTo({
                      url:'../index/index?chooseTab=' + false
                    })
                  }
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
