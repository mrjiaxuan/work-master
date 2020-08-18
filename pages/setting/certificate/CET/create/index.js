// pages/setting/certificate/CET/create/index.js
var util = require('../../../../../utils/newutil.js');
var check = require('../../../../../utils/checkutil.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeArray: ['四级证书', '六级证书'],
    typeIndex: 0,
    certificateGrade: '',
    certificateType: 'CET_4',
    description: '',
    certificateStart: '2000-01', //时间选择最早时间
    certificateTime: '',    
    imgUrl:'../../../../../images/upload.png',
  },
  input: function (e) {
    var that = this;
    let inputType = e.currentTarget.dataset.name;
    switch (inputType) {
      case 'description':
        that.setData({
          description: e.detail.value
        })
        break;
      case 'certificateGrade':
        this.setData({
          certificateGrade: e.detail.value
        })
        break;
    }
  },
  bindTypeChange(e) {
    var that = this;
    switch (e.detail.value) {
      case '0':
        that.setData({
          typeIndex: e.detail.value,
          certificateType: 'CET_4',
        })
        break;
      case '1':
        that.setData({
          typeIndex: e.detail.value,
          certificateType: 'CET_6',
        })
        break;
    }
  },
  toSubmit: function () {
    var that = this;
    var thank = this.data;
    let certificateTimes = thank.certificateTime.split("-");
    var certificatePublishTime = new Date(certificateTimes[0], certificateTimes[1] - 1);
    if (thank.certificateGrade == "") {
      wx.showToast({
        title: "成绩不能为空",
        icon: "none",
        duration: 3000
      });
    } else {
      if (!check.checkPInteger(thank.certificateGrade)) {
        wx.showToast({
          title: "成绩只能为正整数",
          icon: "none",
          duration: 3000
        });
      } else {
        if (thank.certificateGrade > 710 || thank.certificateGrade < 425) {
          wx.showToast({
            title: "成绩不能为高于710或小于425",
            icon: "none",
            duration: 3000
          });
        } else {
          let nowDate = (new Date()).getTime();
          if (certificatePublishTime > nowDate) {
            wx.showToast({
              title: "发证时间不能大于当前时间",
              icon: "none",
              duration: 3000
            });
          } else {
            if (thank.description == "") {
              wx.showToast({
                title: "证书详情不能为空",
                icon: "none",
                duration: 3000
              });
            } else{
              if(thank.imgUrl==="../../../../../images/upload.png"){
                wx.showToast({
                  title: "请上传证书图片",
                  icon: "none",
                  duration: 3000
                });
              }else{
                wx.request({
                  url: app.globalData.apiUrl + '/certificate',
                  method: "POST",
                  header: {
                    'Content-Type': 'application/json',
                    'Authorization': wx.getStorageSync('server_token')
                  },
                  data: {
                    "certificatePublishTime": certificatePublishTime.getTime(),
                    "certificateType": "CET_4_6",
                    "rank": thank.certificateType,
                    "pictureUrl":thank.imgUrl,
                    "certificateGrade": thank.certificateGrade,
                    "extInfo": {
                      "description": thank.description
                    }
                  },
                  success: function (res) {
                    switch (res.data.errorCode) {
                      case '200':
                        wx.redirectTo({
                          url: '../index/index',
                        })
                        wx.showToast({
                          title: '创建成功',
                          icon: 'success',
                          duration: 3000
                        })
                        break;
                      default:
                        wx.showToast({
                          title: res.data.errorMsg,
                          icon: 'none',
                          duration: 3000
                        })
                        break;
                    }

                  },
                  fail: function (error) {
                    wx.showToast({
                      title: '创建失败',
                      icon: 'none',
                      duration: 3000
                    })
                  }
                })
              }
             
            }
            }
          }
      }
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var now = new Date();

    /*
      初始化证书时间
    */

    that.setData({
      certificateTime: util.getYM(now),
    });
  },
  changeCertificateTime: function (e) {
    this.setData({
      'certificateTime': e.detail.value,
    });
  },
  changeCertificateImg:function(){
    var that=this; 
    let date=wx.getStorageSync('date');
    let timeMap = wx.getStorageSync('timeMap');
    // console.log(timeMap);
    if (timeMap[date] === undefined){
      timeMap[date]=0;
    }
    if(timeMap[date]>=10){
      wx.showModal({
        title: '上传次数超过限制~',
        content: '上传次数超过限制~，请您隔天再上传哦~'
      })
    }else{
      console.log("ok");
    wx.chooseImage({
      count:1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: ret => {
        var filePath = ret.tempFilePaths[0];
        let time = Date.parse(new Date());
        console.log(time);
        let fileName = app.globalData.stuId+"-"+time+".png";
        console.log(fileName);
        console.log(filePath);
        wx.showLoading({
          title: '正在上传',
        })
        wx.uploadFile({
          url: app.globalData.apiUrl+'/common/aliyun',
          filePath: filePath,
          name: 'file',
          formData: {
            'fileName': fileName
          },
          success: res => {
            wx.showToast({
              title: '图片上传成功'
            });
            timeMap[date] = timeMap[date] + 1;
            wx.setStorageSync('timeMap', timeMap);
            console.log(res);
            let data = JSON.parse(res.data);
            console.log(data);
            that.setData({
              imgUrl:data.data.path
            })
          },
          fail:error=>{
            wx.showToast({
              title: '上传失败',
            })
          }
        });
      }
    })
      // timeMap[date] = timeMap[date] + 1;
      // wx.setStorageSync('timeMap', timeMap);
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})