var app = getApp(),
    util = require('../../utils/util.js'),
		UT = require('../../utils/request.js');
Page({
  data: {
    userInfo:{},
    sharesContent:{},
    lastMessageId:'',
    messages:[],
    messageContent: [],
    end:false,
    chooseTab:true,
    showStatement: false,
    unionId:'',
    mineUid: '',
    loading:false,
    loadMore:true,
    scrollStatus:true,
    type: '',
    searchInfo: '货源'
  },
  getRequest:function(id,suc,err){   //进行请求
		wx.request({
			url:app.ajaxurl,
			data:{
        c:'carnewapi',
        m:'getlist',
        id:id,
        isCarGo: this.data.chooseTab ? '1' : '2',
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
      if(data.list.length < 40){
        that.setData({
          end:true
        })
      }
      that.setData({
        messages:data.list
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
  chooseGoods () {
    app.load = false
    this.setData({
      end:false,
      chooseTab:true,
      searchInfo: '货源'
    })
    if(!app.uid){
      util.getUserInfo(this.listRender,this)
    }else{
      this.listRender(app.uid,this)
    }
  },
  chooseCars () {
    app.load = false
    this.setData({
      end:false,
      chooseTab:false,
      searchInfo: '车源'
    })
    if(!app.uid){
      util.getUserInfo(this.listRender,this)
    }else{
      this.listRender(app.uid,this)
    }
  },
  loadMore:function(){   // 下拉加载更多
    if(app.load) return;
    app.load = true;   /// 判断是否在进行loadmore
    var id = this.data.messages[0].id
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
            lastMessageId :'item_' + id,
            loadMore:true,
            scrollStatus:true
          })
        }, 0)
        app.load = false;
      }else{
        this.setData({
          end:true,
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
  showTheSelectCity () {
    if(this.data.chooseTab){
      wx.navigateTo({
        url:'../selectCity/selectCity?type=1&edit=' + this.data.type
      })
    } else {
      wx.navigateTo({
        url:'../selectCity/selectCity?type=2&edit=' + this.data.type
      })
    }

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
          that.setData({
            type: position
          })
          // 获取到type才能设置分享 否则无法获取
          app.getUserInfo(function(userInfo){
            let nickname = userInfo.nickName
            let avatar = userInfo.avatarUrl
        		that.setData({
              userInfo:userInfo,
              sharesContent:{
                title:that.data.type == '1' ? nickname + "的车源" : nickname + "的货源",
                path:'/pages/close/close?unionId=' + that.data.unionId + '&nickname=' + nickname + '&avatar=' + avatar + '&isCarGo=' + (that.data.type == '1' ? '2' : '1')
              }
        		})
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
    if(e.chooseTab){  // 判断是否通过添加页面跳转回来的
      this.setData({
        chooseTab:false
      })
    }
    if(e.from){  // 判断是否通过选择身份进入的
      this.setData({
        type:e.type,
        select:e.from
      })
    }else{
      util.getUserInfo(this.searchType,this)
    }
    if(!app.uid){
      util.getUserInfo(this.listRender,this)
    }else{
      this.listRender(app.uid,this)
    }
    var that = this
    var unionId = wx.getStorageSync('unionId')
    var mineUid = wx.getStorageSync('userid')
    that.setData({
      mineUid: mineUid
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
  callToUs () {
    wx.makePhoneCall({
      phoneNumber:'15710036003',
      success:function(){
        util.analytics({
          t:'event',
          ec:'点击拨打客服电话',
          ea:'',
          el:'15710036003'
    		})
      }
    })
  },
  makePhoneCall:function(e){
    var item = e.target.dataset.item
    var content = e.target.dataset.content
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
  goodsToEdit:function(){
    wx.navigateTo({
      url:'../add/add?edit=1'
    })
  },
  carToEdit () {
    wx.navigateTo({
      url:'../add/add?edit=2'
    })
  },
  showStatement () { // 显示声明
    this.setData({
      showStatement: true,
      scrollStatus: false
    })
  },
  cancleStatement () { // 取消声明
    this.setData({
      showStatement: false,
      scrollStatus: true
    })
  },
  onShareAppMessage:function(){
    return this.data['sharesContent']
	}
})
