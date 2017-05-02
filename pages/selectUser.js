var app = getApp(),
    util = require('../utils/util.js'),
		UT = require('../utils/request.js');
Page({
  data:{
    unionId: '',
    openId: '',
    userInfo: {},
    loading:false,
    show:true,
    index: ''
  },
  onLoad:function(options){
    var chooseType = wx.getStorageSync('chooseType')
    if(chooseType){
      if(chooseType.type == '1'){
        wx.redirectTo({
          url:'./index/index?type=1'
        })
      } else {
        wx.redirectTo({
          url:'./index/index?type=2'
        })
      }
    } else {
      if(!app.uid){
        util.getUserInfo(this.searchType,this)
      }else{
        this.searchType(app.uid,this)
      }
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
        if(position == '1'){
          wx.redirectTo({
            url:'./index/index?type=1'
          })
        } else if (position == '2') {
          wx.redirectTo({
            url:'./index/index?type=2'
          })
        } else {
          that.setData({
            show:false
          })
        }
        that.setData({
          loading:true
        })
      }
    })
  },
  carOwner:function(e){
    this.setType('1')
    wx.redirectTo({
      url:'index/index?type=1&from=select'
    })
  },
  goodsOwner:function(e){
    this.setType('2')
    wx.redirectTo({
      url:'index/index?type=2&from=select'
    })
  },
  setType (type) {
    wx.setStorage({
      key:"chooseType",
      data:{
        type: type
      }
    })
  }
})
