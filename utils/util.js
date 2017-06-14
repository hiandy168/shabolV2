let app = getApp();
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const _exports = {
  analyticsDefaultData:{
    v:1,
    tid:'UA-77901546-10',
    cid:'',
    t:'event'
  },
  getUserInfo:function(callback,page){
    let that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
            //发起网络请求
            wx.request({
              url: app.ajaxurl,
              data: {
                  c:'caruser',
                  m:'login',
                  code: res.code,
                  ts:+new Date()
              },
            success:function(res){
              if(res && res.data){
                  app.uid = res.data['msg'];
                  that.analyticsDefaultData['cid'] = app.uid;
                  wx.setStorageSync('userid',app.uid);
                  callback && callback(app.uid,page);
              }
            }
          })
        }
      }
    })
  },
  analytics:function(data){
    let d = this.analyticsDefaultData;
    for(let i in data){
        d[i] = data[i]
    };
    wx.request({
        url:'https://www.google-analytics.com/collect',
        data:d
    });
  },
  getLocalTime (date) {  // 转换时间
    var past = new Date(parseInt(date)*1000)
    var now = new Date()
    var yestoday = new Date() - 24*60*60*1000
    var time = (now-past)/1000
    if (new Date(past).toDateString() === new Date().toDateString()) {
      return '今天'
    } else if((now.getDate() - 1) === past.getDate()){
      return '昨天'
    } else {
      var m = (past.getMonth()+1 < 10 ? '0'+(past.getMonth()+1) : past.getMonth()+1)
      var d = (past.getDate() < 10 ? '0'+(past.getDate()) : past.getDate())
      return m + '月' + d + '日'
    }
  }
}
module.exports = _exports;
