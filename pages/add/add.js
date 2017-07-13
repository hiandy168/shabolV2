var app = getApp(),
    util = require('../../utils/util.js')
Page({
  data:{
    edit: -1,
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
    app.uid = wx.getStorageSync('userid')
    if(!userInfo || userInfo == '' || !app.uid){ // 如果没有user信息，重新授权获取
      util.getSetting((res)=>{
        wx.login({ // 调用登陆
          success:function(c){
            // 获取用户信息
            wx.getUserInfo({
              success:function(o){
                // 重新获取unionid
                wx.request({
                  url:'https://56-api.kcimg.cn/wx/littleProject.php',
                  data:{
                    code:c.code,
                    encryptedData:o.encryptedData,
                    iv:o.iv,
                    ts:+ new Date()
                  },
                  success:function(codes){
                    var codes = JSON.parse(codes.data)
                    app.uid = codes.openId
                    wx.setStorageSync('unionId',codes.unionId)
                    wx.setStorageSync('userid',app.uid)
                  }
                })
                // 设置用户名称头像
                wx.setStorage({
                  key:"userInfo",
                  data:{
                    userName:o.userInfo.nickName,
                    photo:o.userInfo.avatarUrl
                  }
                })
                app.authSetting = true
              }
            })
          }
        })
      })
    } else {  // 如果有直接读缓存
      app.authSetting = true
      util.getClipBoard((res)=>{
        if (trims(res) !== '' && trims(res).length < 400) {
          wx.showModal({ // 弹窗
            title: '剪切板内容',
            content: res.replace(/\n(\n)*( )*(\n)*\n/g, "\n"),
            confirmText: '粘贴',
            success (r) {
              if (r.confirm) { // 点击确定
                that.setData({
                  placeholder:false,
                  textValues: res
                })
              }
            }
          })
        } else if (trims(res).length >= 400) {
          wx.showModal({ // 弹窗
            title: '剪切板内容',
            content: res.replace(/\n(\n)*( )*(\n)*\n/g, "\n").substring(0,400),
            confirmText: '粘贴',
            success (r) {
              if (r.confirm) { // 点击确定
                that.setData({
                  placeholder:false,
                  textValues: res
                })
              }
            }
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
    if(trims(this.data.textValues) == ''){
      this.setData({
        placeholder:true
      })
    }
  },
  inputValue:function(e){//输入内容
    this.setData({
      textValues:e.detail.value
    })
  },
  formSubmit:function(e){//提交表单
    if(app.republish)  return;
    if(app.authSetting){
      var that = this
      app.republish = true
      let userInfo = wx.getStorageSync('userInfo')
      var c = e.detail.value.textarea;   //获取textarea输入内容
      var phoneNums = c.match(/1(([38]\d)|(4[57])|(5[012356789])|(7[0135678]))\d{8}/g);  //匹配电话数组
      if(phoneNums){  ///如果匹配到电话，就进行上传接口
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
            userName:userInfo.userName,
            photo:userInfo.photo,
            formId: e.detail.formId,
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
