var app = getApp(),
    util = require('../../utils/util.js'),
    UT = require('../../utils/request.js');
Page({
  data:{
    userInfo: {},
    nickname: '',
    defaultImg: 'https://s.kcimg.cn/gisopic/avatar/wx_img.png',
    avatar: '',
    isCarGo: '',
    messages:[],
    page: 1,
    unionId: '',
    mineUid: '',
    loadMore:true,
    showMsgAll:false,
    addTime: [],
    shareHidden: true
  },
  getRequest:function(unionId,isCarGo,suc,err){   //进行请求
    wx.request({
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'getsharedatelist',
        page: this.data.page,
        unionId:unionId,
        isCarGo:isCarGo,
        ts: +new Date()
      },
      success:function(res){
        UT.isFunction(suc) && suc(res.data)
      },
      fail:function(res){
        UT.isFunction(err) && err(res.data)
      }
    })
  },
  onReady () {
    this.setData({
      mineUid:app.uid
    })
    if(!app.isShowShare && app.uid){
      var that = this;
      that.setData({
        shareHidden:that.data['shareHidden'] ? false : true
      });
      setTimeout(function(){
        that.setData({
          shareHidden:true
        });
      },2000);
    }
    app.isShowShare = true
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options)
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo,
        nickname:options['nickname'],
        avatar:options['avatar'],
        isCarGo:options['isCarGo']
      })
    })
    wx.setNavigationBarTitle({
      title:options['isCarGo'] == '2' ? options['nickname'] + "的车源" : options['nickname'] + "的货源"
    })
    // var unionId = "ozjPGs7ZiXD4qB0LvCmJiAN2CzJI"
    var unionId = options['unionId']
    var isCarGo = options['isCarGo']
    that.getRequest(unionId,isCarGo,(res)=>{
      var data = res.data;
      var d = [];
      for (let key in data.list) {
        d.push(data.list[key])  // 所有数据数组
        d[key]['add_time'] = this.getLocalTime(data.list[key].add_time)
      }
      that.setData({
        messages:d,
        loading:true,
        page:this.data.page + 1,
        unionId:unionId,
        sharesContent:{
          title:options['isCarGo'] == '2' ? options['nickname'] + "的朋友圈车源" : options['nickname'] + "的朋友圈货源",
          path:'/pages/close/close?unionId=' + unionId + '&nickname=' + options['nickname'] + '&avatar=' + options['avatar'] + '&isCarGo=' + options['isCarGo']
        }
      })
    })
  },
  jumpToHome () {
    wx.redirectTo({
      url:'../selectUser'
    })
  },
  makePhoneCall:function(e){
    var item = e.target.dataset.item;
    var content = e.target.dataset.content
    var id = e.target.dataset.id
    wx.makePhoneCall({
      phoneNumber:item,
      success:function(){
        util.analytics({
          t:'event',
          ec:'点击拨打货源电话',
          ea:content,
          el:item
    		})
        wx.request({
          url: app.ajaxurl,
          data: {
            c: 'carnewapi',
            m: 'savephoneclick',
            id: id,
            ts: +new Date()
          },
          success:function(res){
            console.log(res)
          }
        })
      }
    })
  },
  getLocalTime (date) { // 更换时间
    var past = new Date(parseInt(date)*1000)
    var now = new Date()
    var time = (now-past)/1000
    if (new Date(past).toDateString() === new Date().toDateString()) {
      return '今天'
    } else {
      var m = (past.getMonth()+1 < 10 ? '0'+(past.getMonth()+1) : past.getMonth()+1)
      var d = (past.getDate() < 10 ? '0'+(past.getDate()) : past.getDate())
      var arr = [d,(m + '月')]
      return arr
    }
  },
  loadMore:function(){
    var that = this;
    if(app.close) return
    app.close = true;
    that.setData({
      loadMore:false
    })
    that.getRequest(that.data.unionId,that.data.isCarGo,(res)=>{
      var data = res.data;
      var more = [];
      if(data.info == 1){
        for (let key in data.list) {
          more.push(data.list[key])  // 所有数据数组
          more[key]['add_time'] = this.getLocalTime(data.list[key].add_time)
        }
        that.setData({
          messages:this.data.messages.concat(more),
          loadMore:true,
          page:this.data.page + 1
        })
        app.close = false;
      }else{
        that.setData({
          loadMore:true,
          showMsgAll: true
        })
      }
    })
  },
  changeImg () { // 更换图片
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          defaultImg: res.tempFilePaths
        })
      }
    })
  },
  toLower:function(){
    if(app.close) return;
		this.loadMore()
	},
  onShareAppMessage:function(){
		return this.data['sharesContent']
	}
})
