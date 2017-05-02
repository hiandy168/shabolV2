App({
  onLaunch: function () {
    this.ajaxurl='https://56-api.kcimg.cn/';
    this.getUserInfo()
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (r) {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              wx.request({
                url:'https://56-api.kcimg.cn/wx/littleProject.php',
                data:{
                  code:r.code,
                  encryptedData:res.encryptedData,
                  iv:res.iv,
                  ts:+ new Date()
                },
                success:function(codes){
                  var codes = JSON.parse(codes.data)
                  wx.setStorageSync('unionId',codes.unionId)
                  that.globalData.unionId = codes.unionId
                }
              })
              wx.setStorage({
                key:"userInfo",
                data:{
                  userName:res.userInfo.nickName,
                  photo:res.userInfo.avatarUrl
                }
              })
              typeof cb == "function" && cb(that.globalData.userInfo)
            },
            fail:function(res){ // 拒绝授权
              if(that.globalData.cancle) return
              wx.redirectTo({
                url:'/pages/index/index?type=1'
              })
              that.globalData.cancle = true
              wx.hideShareMenu()
            }
          })
        }
      })
    }
  },
  globalData:{
    code: '',
    userInfo:null,
    userid:'',
    unionId: '',
    cancle:false
  }
})
