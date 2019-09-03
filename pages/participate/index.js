var app = getApp();

Page({
  data: {
    showSearch: true,
    demoData:'',
    showState: true,
    listData: '',
    empty: true,
    countDownList: [],
    second:[],
    Url:"",
    activityType:" ",
    activityStatus:"PUBLISHED",
    typeTabList: [{
      'id': '0',
      'title': '不限'
    }, {
      'id': '1',
      'title': '校园活动'
    }, {
      'id': '2',
      'title': '社会实践'
    }, {
      'id': '3',
      'title': '志愿活动'
    }, {
      'id': '4',
      'title': '义工活动'
    }, {
      'id': '5',
      'title': '讲座活动'
    }],
    typeState: [
      {
      'id': '0',
      'title': '进行中'},
      {
        'id': '1',
        'title': '已报名'
      },
      {
        'id': '2',
        'title': '已过期'
      },
    ],
    tab: [true, true],
    currentTab: null,
    page:0,
    stateId:0,
   
  },
  
  onLoad: function () {
    var that = this;
    that.showSeals(); 
    that.countDown();
  },


/**
 * 更新活动数据
 */
loadInfo(){
  var that = this;
  that.setData({
    listData: that.data.demoData,
  });
},


/**
 * 计数器有关的函数
 */
  loadInfoF(){
    var that = this;
    // 给listDate赋值
    that.setData({
      listData: that.data.demoData,
    });
    // total中转
    let total=[];
    // 将demodate内的秒数全部存入total数组
    that.data.listData.forEach(o => total.push(o.second));
    that.setData({ second: total });
    // this.data.second.forEach(o=>console.log(o));
    that.countDown();
  },
  loadInfoS(){
    var that = this;
    // 给listDate赋值
    that.setData({
      listData: that.data.demoData,
    });
    // total中转
    let total = [];
    // 将demodate内的秒数全部存入total数组
    that.data.listData.forEach(o => total.push(o.second));
    that.setData({ second: total });
  },

/**
 * 上拉获取更多数据
 */
  onReachBottom:function(){
      var that=this;
      var page=that.data.page+1;
      that.setData({
        page:page
      });
      wx.showLoading({
        title: '正在获取数据中',
      })
      
      that.getdatalist();
      wx.hideLoading({});
  },

  /**
   * 请求后台 更多数据
   */
  getdatalist:function(){
    var that = this;
    wx.request({
      url: app.globalData.apiUrl +"/activityEntry",
      method:"GET",
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': wx.getStorageSync('server_token')
      },
      data:{
        page:that.data.page,
        activityType:that.data.activityType,
        state:that.data.activityStatus,
      },
      success: function (res) {
        switch (res.data.errorCode) {
          case "200":
            // 从后台请求数据成功之后，开始以下的操作
            var arr1 = that.data.listData; //从data获取当前datalist数组
            var arr2 = res.data.data.content; //从此次请求返回的数据中获取新数组
            var second1=that.data.second;
            var second2 = [];
            if(arr2.length==0){
              var page=that.data.page-1;
              that.setData({
                page:page
              })
              wx.showToast({
                title: '暂无更多数据',
                icon: 'none',
                duration: 2000
              })
            }
            console.log(arr2);
            arr1 = arr1.concat(arr2); //合并数组

            arr2.forEach(o => second2.push(o.second));
            second1=second1.concat(second2);

            that.setData({
              listData: arr1, //合并后更新datalist
              second: second1
            })
            break;
        }
      },
      fail: function () {
        app.warning('服务器错误');
      }

    })
  },



/**
 * 时间转化函数
 */
  timeFormat(param) {
    //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },


/**
 * 计数器
 */
  countDown() {
    //倒计时函数
    // 获取当前时间，同时得到活动结束时间数组
    // let second = new Date().getTime();
    let sec = this.data.second;
    let countDownArr = [];
    //while(1){
      //this.setData({ countDownList: countDownArr });
      for (let index = 0; index < sec.length; index++) {
        if (sec[index] != 0) {
          sec[index]--;
        }
      }
      this.setData({ second: sec });
      // console.log(sec);
      setTimeout(this.countDown, 1000);
      //console.log(1);
    //}
  },
  

/**
 * 加载弹框
 */
  loadDetail(id) {
    wx.showLoading({
      title: '详情加载中...',
    })
  },


  /**
   * 筛选活动页面请求后台接口的连接
   */
  getUrl(id){
    this.data.Url = app.globalData.apiUrl+id;//Url拼接  未完成  
  },


/**
 * 提交报名信息
 */
  signUp(e){
    wx.showLoading({
      title: '正在报名中',
    })
    var that=this;
    let status = e.currentTarget.dataset.status;
    let activityId = e.currentTarget.dataset.activityid;
    if (status == "REGISTRATION"){  
        wx.request({
          url: app.globalData.apiUrl +'/user/signUp',
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': wx.getStorageSync('server_token')
          },
          data:{
            activityEntryId: activityId,
          },
          success: function (res) {
            console.log(res.data)
            switch (res.data.errorCode){
              case "200":
                wx.showToast({
                  title: res.data.errorMsg
                });
                that.setData({
                  activityStatus :"REGISTERED",
                  activityType:" ",
                  stateId:'1',
                  type_id:0,
                  term_id:1,
                  tab:[true,false]
                })
                that.showState();
              break;
            }
          },
          fail: function () {
            app.warning('服务器错误');
          }   
        });
    }
    wx.hideLoading({});
  },


  /**
   * 寻找活动状态
   */
  searchSt(id){
    let D=this.data.listData;
    let status;
    D.forEach(o=>{if(o.id==id){
      status=o.status;
    }})
    if(status=='2'){
      return true;
    }
  },


/**
 * 头部筛选栏触发的函数
 */
  tabNav(e){
    var data = [true, true],
    index = e.target.dataset.currentind;
    data[index] = !this.data.tab[index];
    this.setData({
      tab: data
    })
    if (this.data.currentTab != index) {
      this.setData({
        currentTab: index
      })
    }else{
      this.setData({
        currentTab:null
      })
    }
  },


  /**
   * 筛选项点击操作
   */
  filter: function (e) {
    var that = this,
    id = e.currentTarget.dataset.id,
    index = e.currentTarget.dataset.index;

    // 改变显示状态
    switch (index) {
      case '0':
        that.setData({
          tab: [true, true],
          type_id: id,
          typeIndex: id
        });
        break;
      case '1':
        that.setData({
          tab: [true, true],
          term_id: id,
          termIndex: id
        });
        break;
    }
    if(index==0){
      that.data.activityType=that.typeChange(id);
      console.log(that.data.activityType);
      if (that.data.activityStatus =="REGISTERED"){
        this.showState();
      }else{
        this.showSeals();
      }
    
    }else{
      that.data.activityStatus=that.stateChange(id);
      that.setData({
        stateId:id
      })
      console.log(that.data.activityStatus);
      this.showState();
    }
    that.setData({
      page:0
    })

    
  },

  /**
   * 按钮状态转化
   */
  stateChange(id){
    switch(id){
      case '0':
        return "PUBLISHED";
      case '1':
        return "REGISTERED";
      case '2':
        return "FINISHED";
    }
  },

  /**
   * 类型转化
   */
  typeChange(id) {
    switch (id) {
      case '0':
        return " ";
      case '1':
        return "schoolActivity";
      case '2':
        return "practiceActivity";
      case '3':
        return "volunteerActivity";
      case '4':
        return "volunteerWork";
      case '5':
        return "lectureActivity";
    }
  },


/**
 * 筛选状态的接口
 */
  selectStateUrl:function(){
      var that=this;
    var activityStatus=that.data.activityStatus;     
    switch (activityStatus){
      case "PUBLISHED":
          return  "/activityEntry";
      case "REGISTERED":
          return "/user/registeredActivityEntry";
      case "FINISHED":
          return "/activityEntry";
        
      }
     
  },


  /**
   * 状态 请求后台
   */
  showState:function(){
    var that=this;
    var m = app.globalData.apiUrl + that.selectStateUrl();
  
    console.log(m);
    wx.request({
      url: app.globalData.apiUrl + that.selectStateUrl(),
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': wx.getStorageSync('server_token')
      },
      data: {
        state: this.data.activityStatus,
        activityType: this.data.activityType
      },
      success: function (res) {
        switch (res.data.errorCode) {
          case "200":
            // 从后台请求数据成功之后，开始以下的操作
            that.setData({
              demoData: res.data.data.content,
            });          
              that.loadInfoS();        
            break;
          case "401":
            app.reLaunchLoginPage();
            break;
          default:
            app.warning(res.data.errorMsg);
        }
      },
      fail: function () {
        app.warning('服务器错误');
      }
    })
  },
  

  /**
   * 类型  请求后台
   */
  showSeals: function(code) {
    var that = this;

    wx.request({
      url: app.globalData.apiUrl + '/activityEntry',
      method: 'GET',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': wx.getStorageSync('server_token')
      },
      data:{
        activityType:this.data.activityType,
        state:this.data.activityStatus,
      },
      success: function(res) {
        switch (res.data.errorCode) {
          case "200":
          // 从后台请求数据成功之后，开始以下的操作
            that.setData({
              demoData: res.data.data.content,
            });
          
              that.loadInfoS();
           
            break;
          case "401":
            app.reLaunchLoginPage();
            break;
          default:
            app.warning(res.data.errorMsg);
        }
      },
      fail: function() {
        app.warning('服务器错误');
      }
    })
  }

})