var app = getApp(),
    util = require('../../utils/util.js'),
		UT = require('../../utils/request.js');
Page({
  data: {
    userInfo: {},
    sharesContent:{},
    lastMessageId:'',
    messages:[],
    nowId:'',
    mineUid:'',
    loading:false,
    loadMore:true,
    loadingText:"加载中...",
    scrollStatus:true
  },
  getRequest:function(id,suc,err){   //进行请求
		wx.request({
			url:app.ajaxurl,
			data:{
        c:'carnewapi',
        m:'getlist',
        id:id
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
        loading:true
      })
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
  onLoad: function () {
    if(this.loaded) return;
    if(!app.uid){
      util.getUserInfo(this.listRender,this)
    }else{
      this.listRender(app.uid,this);
    }
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo,
        sharesContent:{
          title:'极速配万人群',
          desc:'极速配万人超级发货群，不用在转发，一次发送，通知3000万车主，马上找到车！',
          path:'/pages/index/index'
        }
      })
    })
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
    wx.makePhoneCall({
      phoneNumber:item
    })
  },
  jumpToEdit:function(){
    wx.navigateTo({
      url:'../add/add'
    })
  },
  onShareAppMessage:function(){
		return this.data['sharesContent']
	},
})
