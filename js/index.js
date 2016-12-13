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
				mui.ajax(util.url+'/BaseGet',{
					data:{
						userName:user.userName,
   	    				password:user.password,
   	    				ip:user.ip
					},	
					dataType:'json',//服务器返回json格式数据
					type:'post',//HTTP请求类型
					timeout:10000,//超时时间设置为10秒；
					success:function(data){
						if (data.data.length>0) {
							console.log(JSON.stringify(data));
							address = data.data;
							for(var i = 0; i < address.length; i++) {
								createMarker(address[i]);
							}
						}
					},
					error:function(xhr,type,errorThrown){
						mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
						mui.toast('网络超时！');
					}
				});
			
		
		
		
		
		
		
		//localStorage.setItem('$localLost','{"bzk":[{"mac":"bzk","longitude":"114.23","latitude":"45.22"},{"mac":"bzk","longitude":"114.23","latitude":"47.22"},{"mac":"bzk","longitude":"123.23","latitude":"45.22"},{"mac":"bzk","longitude":"114.23","latitude":"45.22"},{"mac":"bzk","longitude":"114.23","latitude":"45.22"},{"mac":"bzk","longitude":"117.23","latitude":"45.22"},{"mac":"bzk","longitude":"114.23","latitude":"49.22"},{"mac":"bzk","longitude":"134.23","latitude":"49.22"},{"mac":"bzk","longitude":"104.23","latitude":"39.22"},{"mac":"bzk","longitude":"110.23","latitude":"49.22"}]}');
		//获取用户位置
		userLocation();
		
		//遍历画出所有路线
		if (localStorage.getItem('$localLost')!=null) {
			var localLost = JSON.parse(localStorage.getItem('$localLost'));
			for(var i in localLost){
				var lostArray = localLost[i];
				if (lostArray.length>1) {
					for (var j = 0; j < lostArray.length; j++) {
						lostArray[j] = new plus.maps.Point(lostArray[j].longitude,lostArray[j].latitude);
					}
					var polylineObj = new plus.maps.Polyline(lostArray);
					map.addOverlay(polylineObj);
				}
			}
		}
		
		//路线清除
		$('#clear').on('tap',function(){
			plus.nativeUI.confirm('清除所有路线？',function (e) {
				if(e.index ==1){
					map.clearOverlays();
					localStorage.removeItem('$localLost');
					for(var i = 0; i < address.length; i++) {
						createMarker(address[i]);
					}
				}
			},'提示',['取消','确认']);
			
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
				//alert(msg.content);
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
		} else {
			if(plus.os.name == "Android") {
					var receiveData = JSON.parse(msg.content);
					if (plus.webview.getWebviewById('control.html')) {
						var control = plus.webview.getWebviewById('control.html');
					}
					if (receiveData.header!=null) {
						if (receiveData.header == '0000') {
							//提示断开连接
							mui.fire(control,'offLine',{});
						}
						if (receiveData.header == '9003') {
							if (receiveData.check=='1') {
								mui.fire(control,'setOK',{});
							}else{
								mui.fire(control,'setNo',{});
							}
						}
						if (receiveData.header == '9004') {
							if (receiveData.check=='1') {
								mui.fire(control,'success',{});
							}else{
								mui.fire(control,'faile',{});
							}
						}
					}else{
						var localLost;
						if (localStorage.getItem('$localLost')==null) {
							localLost = {};
							localStorage.setItem('$localLost',JSON.stringify(localLost));
						}else{
							localLost = JSON.parse(localStorage.getItem('$localLost'));
						}
						
						//将点插入数组
						var lost = JSON.parse(msg.content);
						if (lost.status>0) {
							var mac = lost.mac;
							if (localLost[mac]==undefined) {
								localLost[mac] = new Array();
								localLost[mac].push(lost);
								localStorage.setItem('$localLost',JSON.stringify(localLost));
							}else{
								localLost[mac].push(lost);
								localStorage.setItem('$localLost',JSON.stringify(localLost));
							}
							//遍历当前数组，绘出路线
							var lostArray = localLost[mac];
							lostArray.push(lost);
							if (lostArray.length>1) {
								for (var i = 0; i < lostArray.length; i++) {
									lostArray[i] = new plus.maps.Point(lostArray[i].longitude,lostArray[i].latitude);
								}
								var polylineObj = new plus.maps.Polyline(lostArray);
								map.addOverlay(polylineObj);
							}
						}else{
							createLocalPushMsg(lost.address, '设备运行正常！');
						}
						
					}
			}
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
	marker.setIcon("images/dw.png");
	//marker.setLabel("基站");
	var bubble = new plus.maps.Bubble(data.address);
	marker.setBubble(bubble);
	map.addOverlay(marker);
}

function resetMap() {
	//map.centerAndZoom(pcenter,12);
	map.reset();
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
	//$('.search').val(event.detail.des);
	//var routeObj = new plus.maps.Route(new plus.maps.Point(116.404, 39.715), new plus.maps.Point(116.347292, 39.968716));
	//pcenter = new plus.maps.Point(116.404, 39.715);
	//map.centerAndZoom(pcenter, 12);
	
	
	//BD-09 to GCJ-02先将百度坐标转成中国坐标
	var tmp = GPS.bd_decrypt(parseFloat(event.detail.latitude),parseFloat(event.detail.longitude));
	//GCJ-02 to WGS-84再将中国坐标转成GPS坐标
	var dstarr = GPS.gcj_decrypt_exact(tmp['lat'],tmp['lon']);
	
	var dst = new plus.maps.Point(dstarr['lon'],dstarr['lat']);
	//console.log(event.detail.des);
	map.showUserLocation( true );
	map.getUserLocation(function(state, pos) {
		if(0 == state) {
			var src = pos;
			map.setCenter(pos);
			plus.maps.openSysMap(dst, event.detail.des, src);
		}else{
			mui.toast('获取当前位置失败，请打开GPS至开阔地导航！');
		}
	});

	//	map.addOverlay(routeObj);
	//	$('.search').val(routeObj.distance);
});

