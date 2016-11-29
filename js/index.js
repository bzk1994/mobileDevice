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
//	setTimeout(function() {
		map = new plus.maps.Map("map");
		map.centerAndZoom(pcenter, 6);
		var address = JSON.parse(localStorage.getItem('$guardAddress')).data;
		for(var i = 0; i < address.length; i++) {
			createMarker(address[i]);
		}
		
		// 创建子窗口
		//		createSubview();
//	}, 300);
	// 显示页面并关闭等待框
	ws.show("pop-in");

	// 监听点击消息事件
	plus.push.addEventListener("click", function(msg) {
		// 判断是从本地创建还是离线推送的消息
		switch(msg.payload) {
			case "LocalMSG":
				//					var list = plus.webview.getWebviewById('mesList.html');
				//					mui.fire(list, 'mesRefresh');
				alert(msg.content);
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
				alert('收到！');
				var localLost;
				if (localStorage.getItem('$localLost')==null) {
					localLost = {};
					localStorage.setItem('$localLost',JSON.stringify(localLost));
				}else{
					localLost = JSON.parse(localStorage.getItem('$localLost'));
				}
				
				//将点插入数组
				var lost = JSON.parse(msg.content);
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
				createLocalPushMsg(msg.title, msg.content);
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
	var dst = new plus.maps.Point(event.detail.longitude, event.detail.latitude);
	console.log(event.detail.des);
	map.getUserLocation(function(state, pos) {
		if(0 == state) {
			var src = pos;
			map.setCenter(pos);
			plus.maps.openSysMap(dst, event.detail.des, src);
		}
	});

	//	map.addOverlay(routeObj);
	//	$('.search').val(routeObj.distance);
})