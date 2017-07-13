var app = getApp(),
    util = require('../../utils/util.js'),
		UT = require('../../utils/request.js');
Page({
  data:{
    list:[],
    messages:[],
    showSelectCity:true,
    provinceId: '',
    province: '',
    page: 1,
    loading:true,
    loadMore:true,
    end:false,
    activeIndex: -1,
    search: '',
    type: -1,  // 获取搜索车源还是货源
    lastMessageId: '',
    scrollStatus: true
  },
  onLoad:function(options){
    console.log(options)
    this.setData({
      type: options.type
    })
    if(options.type == '2'){
      this.setData({
        searchInfo: '车源',
        search: '搜索车源',
        edit: options.edit
      })
    } else {
      this.setData({
        searchInfo: '货源',
        search: '搜索货源',
        edit: options.edit
      })
    }
    var cityList = wx.getStorageSync('cityList')
    if(cityList){
      this.setData({
        list:cityList
      })
    }else{
      this.getCityList()
    }
  },
  getCityList () {  // 获取省份列表
    var that = this
    wx.request({
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'getcitylist',
        ts:+ new Date()
      },
      success:function(res){
        that.setData({
          list:res.data.data
        })
        wx.setStorage({  // 缓存省份
          key:'cityList',
          data:res.data.data
        })
      }
    })
  },
  getCargoList () {  // 获取省份搜索信息
    var that = this
    wx.request({
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'getcitycargolist',
        provinceId:that.data.provinceId,
        page:that.data.page,
        isCarGo: that.data.type,
        ts:+ new Date()
      },
      success:function(res){
        if(res.data.data.info != '2'){
          var c = []
          var data = res.data.data
          for (let key in data) {
            c.unshift(data[key])
          }
          for (let key in c) {
            c[key].add_time = util.getLocalTime(c[key].add_time)
          }
          // 替换关键字
          let a = that.data.province
          util.replaceKeyWord(c,a)
          that.setData({
            messages:c,
            lastMessageId:'maxlength',
            loading:true
          })
        } else {
          that.setData({
            messages: [],
            loading: true
          })
        }
      }
    })
  },
  loadMore () { // 加载更多
    if(app.load) return
    app.load = true
    var that = this
    var id = that.data.messages[0].id
    that.setData({
				page:that.data.page + 1,
        loadMore:false,
        scrollStatus: false
			})
    wx.request({  // 省份筛选
      url:app.ajaxurl,
      data:{
        c:'carnewapi',
        m:'getcitycargolist',
        provinceId:that.data.provinceId,
        page:that.data.page,
        isCarGo: that.data.type,
        ts:+ new Date()
      },
      success:function(res){
        if(res.data.data.info !== 2){
          var c = []
          for (let key in res.data.data) {
            c.unshift(res.data.data[key])
          }
          for (let key in c) {
            c[key].add_time = util.getLocalTime(c[key].add_time)
          }
          // 替换关键字
          let a = that.data.province
          util.replaceKeyWord(c,a)
          that.setData({
            messages:c.concat(that.data.messages),
            scrollStatus: true
          })
          setTimeout(() => {
            that.setData ({
              lastMessageId :'item_' + id,
              loadMore:true
            })
          }, 0)
        } else {
          that.setData({
            end:true,
            loadMore:true,
            scrollStatus: true
          })
        }
        app.load = false
      }
    })
  },
  makePhoneCall:function(e){ // 拨打电话
    var item = e.target.dataset.item
    var content = e.target.dataset.content
    if (this.data.type == '2') { // 车源筛选
      wx.showModal({
        title: '提示',
        content: '请联系客服认证身份，才能看到车主电话，谢谢！客服电话：15710036003',
        confirmText: '联系客服',
        success: function(res) {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber:'15710036003',
              success:function(){
                util.analytics({
                  t:'event',
                  ec:'点击联系客服',
                  ea:'',
                  el:'15710036003'
            		})
              }
            })
          }
        }
      })
      util.analytics({
        t:'event',
        ec:'点击拨打车源电话',
        ea:content,
        el:item
      })
    } else {
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
    }
  },
  selectedItem (e) { // 选择省份
    if(e.target.dataset.item == this.data.province) return
    this.setData({
      provinceId:e.target.dataset.id,
      province:e.target.dataset.item,
      activeIndex:e.target.dataset.index,
      page:1,
      end:false,
      search:e.target.dataset.item,
      messages: [],
      showSelectCity:false,
      loading:false
    })
    this.getCargoList()
  },
  closeShow () {  // 点击关闭弹层
    this.setData({
      showSelectCity:false
    })
  },
  showSearch () { // 显示弹层
    this.setData({
      showSelectCity:true
    })
  },
  carToEdit () {  // 发布车源
    if(this.data.edit == '2'){
      wx.navigateTo({
        url:'../add/add?edit=1'
      })
    } else {
      wx.navigateTo({
        url:'../add/add?edit=2'
      })
    }

  },
  jumpToUserCenter (e) { // 跳转个人中心
    var that = this
    console.log(e)
    var nickname = e.target.dataset.nickname
    var avatar = e.target.dataset.avatar
    var unionId = e.target.dataset.unionid
    var openid = e.target.dataset.openid
    wx.navigateTo({
      url: '../close/close?unionId=' + unionId + '&nickname=' + nickname + '&avatar=' + avatar + '&isCarGo=' + that.data.type + '&openid=' + encodeURIComponent(openid)
    })
  },
  toUpper:function(){ // 下拉加载
    if(this.data.end) return
    this.loadMore()
  }
})
