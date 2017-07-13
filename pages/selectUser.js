var app = getApp(),
    util = require('../utils/util.js'),
		UT = require('../utils/request.js');
Page({
  data:{
    unionId: '',
    openId: '',
    userInfo: {},
    show:true,
    index: ''
  },
  onLoad:function(options){
    if(!app.uid){
      util.getUserInfo(this.searchType,this)
    }else{
      this.searchType(app.uid,this)
    }
  },
  searchType (...options){
    let that = this
    wx.request({
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'getuserposition',
        openId:app.uid
      },
      success:function(res){
        var position = res.data.data.position
        if(position == '1' || position == '2'){
          wx.redirectTo({
            url:'/pages/index/index'
          })
        } else {
          that.setData({
            show:false
          })
        }
      }
    })
  },
  carOwner:function(e){
    wx.redirectTo({
      url:'index/index?type=1&from=select'
    })
  },
  goodsOwner:function(e){
    wx.redirectTo({
      url:'index/index?type=2&from=select'
    })
  }
})
