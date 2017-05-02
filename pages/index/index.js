var app = getApp(),
    util = require('../../utils/util.js'),
		UT = require('../../utils/request.js');
Page({
  data: {
    userInfo:{},
    sharesContent:{},
    lastMessageId:'',
    messages:[],
    nowId:'',
    mineUid:'',
    loading:false,
    loadMore:true,
    loadingText:"加载中...",
    scrollStatus:true,
    type: '1'
  },
  getRequest:function(id,suc,err){   //进行请求
		wx.request({
			url:app.ajaxurl,
			data:{
        c:'carnewapi',
        m:'getlist',
        id:id,
        ts:+new Date()
      },
			success:function(res){
				UT.isFunction(suc) && suc(res.data)
			},
			fail:function(res){
				UT.isFunction(err) && err(res.data)
			}
		})
	},
  listRender:function(...options){   // 渲染数据
    var that = this;
    that.getRequest('',(res)=>{
      var data = res.data;
      that.setData({
        messages:data.list,
        mineUid:app.uid
      })
      that.setData({
        lastMessageId:'maxlength',
        loading:true,
        type:options[1].data.type
      })
    })
    if(app.saveuseropenid) return
    var unionId = wx.getStorageSync('unionId')
    if(!unionId) return
    wx.request({
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'saveuseropenid',
        unionId:unionId,
        openId:app.uid,
        status:1,
        ts:+new Date()
      },
      success:function(res){
        app.saveuseropenid = true
      }
    })
  },
  loadMore:function(){   // 下拉加载更多
    if(app.load) return;
    app.load = true;   /// 判断是否在进行loadmore
    var id = this.data.messages[0].id;
    this.setData({
      loadMore:false,
      scrollStatus:false
    })
    this.getRequest(id,(res)=>{
      var data = res.data;
      if(data.info == 1){
        this.setData({
          messages :data.list.concat(this.data.messages)
        });
        setTimeout(() => {
          this.setData ({
            lastMessageId :'item_' + (id-1),
            loadMore:true,
            scrollStatus:true
          })
        }, 0)
        app.load = false;
      }else{
        this.setData({
          loadMore:true,
          scrollStatus:true
        })
      }
    })
  },
  toUpper:function(){ // 下拉加载
    if(app.load) return
    this.loadMore()
  },
  carType (type) {
    wx.request({
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'saveuserposition',
        openId: app.uid,
        position: type
      }
    })
  },
  saveUserInfo (unionId) {
    var that = this
    wx.request({ // 进行用户信息储存
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'savelittleuserinfo',
        unionId:unionId,
        openId:app.uid,
        nickName:that.data.userInfo.nickName,
        headImgUrl:that.data.userInfo.avatarUrl,
        sex:that.data.userInfo.gender,
        language:that.data.userInfo.language,
        country:that.data.userInfo.country,
        province:that.data.userInfo.province,
        city:that.data.userInfo.city
      },
      success:function(res){
        if(res.data.data.info == '1' || res.data.data.info == '3'){
          that.carType(that.data.type)
        }
      }
    })
  },
  searchType (...options) { // 重新获取一下身份
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
        if(position == '2' || position == '1'){
          that.setPositionType(position)
          that.setData({
            type: position
          })
        } else {
          wx.hideShareMenu()
        }
      }
    })
  },
  setPositionType (type) { // 如果选择身份就缓存
    wx.setStorage({
      key:"chooseType",
      data:{
        type: type
      }
    })
  },
  onLoad: function (e) {
    if(this.loaded) return;
    if(e.from){  // 判断是否通过选择身份进入的
      this.setData({
        type:e.type,
        select:e.from
      })
    }else{
      var chooseType = wx.getStorageSync('chooseType')
      if (chooseType) {  // 选择完身份存在缓存
        this.setData({
          type:chooseType.type
        })
      } else {
        util.getUserInfo(this.searchType,this)
      }
    }
    if(!app.uid){
      util.getUserInfo(this.listRender,this)
    }else{
      this.listRender(app.uid,this)
    }
    var that = this
    var unionId = wx.getStorageSync('unionId')
    app.getUserInfo(function(userInfo){
      let nickname = userInfo.nickName
      let avatar = userInfo.avatarUrl
  		that.setData({
        userInfo:userInfo,
        sharesContent:{
          title:nickname + '的朋友圈货源',
          path:'/pages/close/close?unionId=' + unionId + '&nickname=' + nickname + '&avatar=' + avatar
        }
  		})
  	})
    if(unionId && that.data.select){
      that.saveUserInfo(unionId)
    }
  },
  onShow:function(){
    if(this.loaded){
      this.listRender(app.uid,this);
    }else{
      this.loaded = true
    }
  },
  makePhoneCall:function(e){
    var item = e.target.dataset.item;
    var contetn = e.target.dataset.content
    wx.makePhoneCall({
      phoneNumber:item,
      success:function(){
        util.analytics({
          t:'event',
          ec:'点击拨打货源电话',
          ea:content,
          el:item
    		})
      }
    })
  },
  jumpToEdit:function(){
    wx.navigateTo({
      url:'../add/add'
    })
  },
  onShareAppMessage:function(){
    return this.data['sharesContent']
	}
})
