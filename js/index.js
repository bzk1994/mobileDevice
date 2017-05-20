var ws = null,
	wo = null;
var em = null,
	map = null,
	pcenter = null;
// H5 plus事件处理
function plusReady() {
	if(!em || ws) {
		return
	};
	// 获取窗口对象
	ws = plus.webview.currentWebview();
	wo = ws.opener();
	//高德地图坐标为(116.3974357341,39.9085574220), 百度地图坐标为(116.3975,39.9074)
	pcenter = new plus.maps.Point(110.3975, 35.9074);

	map = new plus.maps.Map("map");
	map.centerAndZoom(pcenter, 6);

	//获取基站
	var address;
	var user = JSON.parse(localStorage.getItem('$guardUser'));

	function getBase() {
		mui.ajax(util.url + '/BaseGet', {
			data: {
				userName: user.userName,
				password: user.password,
				ip: user.ip
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				if(data.data.length > 0) {
					address = data.data;
					for(var i = 0; i < address.length; i++) {
						createMarker(address[i]);
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				mui.toast('网络超时！');
			}
		});
	}
	getBase();
	//获取用户位置
	userLocation();

	//路线清除
	$('#clear').on('tap', function() {
		plus.nativeUI.confirm('清除所有路线？', function(e) {
			if(e.index == 1) {
				map.clearOverlays();
				var time = new Date();
				//alert(time.format("yyyy-MM-dd hh:mm:ss"));
				localStorage.setItem('sTime',time.format("yyyy-MM-dd hh:mm:ss"));
				getBase();
				for(var i = 0; i < address.length; i++) {
					createMarker(address[i]);
				}
			}
		}, '提示', ['取消', '确认']);

	});

	// 显示页面并关闭等待框
	ws.show("pop-in");

	// 监听点击消息事件
	plus.push.addEventListener("click", function(msg) {
		// 判断是从本地创建还是离线推送的消息
		switch(msg.payload) {
			case "LocalMSG":
				//					var list = plus.webview.getWebviewById('mesList.html');
				//mui.fire(list, 'mesRefresh');
				break;
			default:
				// 处理其它数据
				if(plus.os.name == "iOS") {
					mui.toast('IOS');
				}
				break;
		}
	}, false);

	// 监听在线消息事件
	plus.push.addEventListener("receive", function(msg) {
		if(msg.aps) { // Apple APNS message
//			alert(JSON.stringify(msg.aps));
//			alert(msg.content);
		} else {
//			if(plus.os.name == "Android") {
				//alert('1'+JSON.stringify(msg));
				var receiveData = JSON.parse(msg.content);
				if(plus.webview.getWebviewById('control.html')) {
					var control = plus.webview.getWebviewById('control.html');
				}
				if(receiveData.header != null) {
					if(receiveData.header == '0000') {
						//提示断开连接
						mui.fire(control, 'offLine', {});
					}
					if(receiveData.header == '9003') {
						if(receiveData.check == '1') {
							mui.fire(control, 'setOK', {});
						} else {
							mui.fire(control, 'setNo', {});
						}
					}
					if(receiveData.header == '9004') {
						if(receiveData.check == '1') {
							mui.fire(control, 'success', {});
						} else {
							mui.fire(control, 'faile', {});
						}
					}
					if(receiveData.header == '9007') {
						if(receiveData.check == '1') {
							var av;
							switch (receiveData.av){
								case "A":
									av = "定位有效";
									break;
								case "V":
									av = "定位无效";
									break;
								case "J":
									av = "基站定位";
									break;
								default:
									break;
							}
							mui.fire(control, 'checkStatus', {
								'av': av,
								'power': receiveData.power + '%'
							});
						}
					}
				} 
//				else {
//					createLocalPushMsg(123, '设备运行正常！');
//				}
//			}
		}
	}, false);

	function createLocalPushMsg(title, content) {
		var options = {
			cover: false,
			title: title
		};
		plus.push.createMessage(content, "LocalMSG", options);
		if(plus.os.name == "iOS") {
			mui.toast('*如果无法创建消息，请到"设置"->"通知"中配置应用在通知中心显示!');
		}
	}

	function draw(lostArray, j) {
		lostArray = lostArray.data;
		j = j % 5;
		var arr = ['#000000', '#003399', '#00CC00', '#B400FF', '#00FFE7']
		if(lostArray.length > 1) {
			for(var i = 0; i < lostArray.length; i++) {
				lostArray[i] = new plus.maps.Point(lostArray[i].longitude, lostArray[i].latitude);
			}
			var polylineObj = new plus.maps.Polyline(lostArray);
			 
			polylineObj.setStrokeColor(arr[j]);
			map.addOverlay(polylineObj);
		}
	}
	if(localStorage.getItem('sTime')==null){
		var time = new Date();
		time.setHours(0,0,0,0);
		localStorage.setItem('sTime',time.format("yyyy-MM-dd hh:mm:ss"));
	}
	
	function getRoute() {
		mui.ajax(util.url + '/AllRoutes', {
			data: {
				uid: user.userName,
				sTime:localStorage.getItem('sTime')
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				if(data.error_code == 0) {
					//getBase();
					map.clearOverlays();
					var base = data.lonlatdata;
					for(var i = 0; i < base.length; i++) {
						createMarker(base[i]);
					}
					var j = 0;
					for(var i in data.data) {
						draw(data.data[i], j);
						j++;
					}
				}
			},
			error: function(xhr, type, errorThrown) {

			}
		});
	}
	setInterval(function() {
		getRoute();
	}, 8000);
}
if(window.plus) {
	plusReady();
} else {
	document.addEventListener("plusready", plusReady, false);
}
// DOMContentloaded事件处理
document.addEventListener("DOMContentLoaded", function() {
	em = document.getElementById("map");
	window.plus && plusReady();
}, false);

function userLocation() {
	map.showUserLocation(true);
	map.getUserLocation(function(state, pos) {
		if(0 == state) {
			map.setCenter(pos);
		}
	});
}

function createMarker(data) {
	//高德地图坐标为(116.3406445236,39.9630878208), 百度地图坐标为(116.347292,39.968716
	var marker = new plus.maps.Marker(new plus.maps.Point(data.longitude, data.latitude));
	marker.setIcon("images/dw2.png");
	//marker.setLabel("基站");
	var bubble = new plus.maps.Bubble(data.address);
	marker.setBubble(bubble);
	map.addOverlay(marker);
}

function resetMap() {
	//map.centerAndZoom(pcenter,12);
	map.reset();
}
//时间格式化函数
Date.prototype.format = function(format) {
	var o = {
		"M+": this.getMonth() + 1, //month 
		"d+": this.getDate(), //day 
		"h+": this.getHours(), //hour 
		"m+": this.getMinutes(), //minute 
		"s+": this.getSeconds(), //second 
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
		"S": this.getMilliseconds() //millisecond 
	}

	if(/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
}
window.onload = function() {
	var mine = document.getElementById("mine");
	var list = document.getElementById("list");
	var control = document.getElementById("control");
	var search = document.getElementsByClassName('search')[0];
	mine.addEventListener('tap', function() {
		mui.openWindow('html/mine/mine.html', 'mine.html', {})
	});
	list.addEventListener('tap', function() {
		mui.openWindow('html/list/list_main.html', 'list_main.html', {})
	});
	control.addEventListener('tap', function() {
		mui.openWindow('html/control/control_main.html', 'control_main.html', {})
	});
	search.addEventListener('tap', function() {
		mui.openWindow('html/search.html', 'search.html', {})
	})
};

window.addEventListener('satnav', function(event) {

	//BD-09 to GCJ-02先将百度坐标转成中国坐标
	var tmp = GPS.bd_decrypt(parseFloat(event.detail.latitude), parseFloat(event.detail.longitude));
	//GCJ-02 to WGS-84再将中国坐标转成GPS坐标
	var dstarr = GPS.gcj_decrypt_exact(tmp['lat'], tmp['lon']);

	var dst = new plus.maps.Point(dstarr['lon'], dstarr['lat']);
	//console.log(event.detail.des);
	map.showUserLocation(true);
	map.getUserLocation(function(state, pos) {
		if(0 == state) {
			var src = pos;
			map.setCenter(pos);
			plus.maps.openSysMap(dst, event.detail.des, src);
		} else {
			mui.toast('获取当前位置失败，请打开GPS至开阔地导航！');
		}
	});

	//	map.addOverlay(routeObj);
	//	$('.search').val(routeObj.distance);
});