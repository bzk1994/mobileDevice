window.onload = function() {
	mui.plusReady(function() {
		var self = plus.webview.currentWebview();
		var data = self.data;
		var mac = data.mac;
		var diviceStatus = data.status;
		
		//时间选择器参数
		var hour = 0;
		var minute = 0;
		var second = 0;
		
		
		//获取当前反馈时间
		var user = JSON.parse(util.getUser());
		plus.nativeUI.showWaiting();
		mui.ajax(util.url + '/SetTime', {
			data: {
				userName: user.userName,
				password: user.password,
				ip: user.ip,
				mac: mac
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				console.log(JSON.stringify(data));
				plus.nativeUI.closeWaiting();
				if(data.error_code == 0) {
					var result = parseInt(data.minutes);
					var h = parseInt(result / 60);
					var m = result - h * 60;
					
					hour = h;
					minute = m;
					second = parseInt(data.seconds);
					h += '小时';
					m += '分钟';
					$('.hour').html(h);
					$('.minute').html(m);
					$('.mobile').html(data.seconds + '秒');
					if (data.connection==0) {
						mui.toast('仪器未连接');
						mui.back();
					}
					//改变按钮状态
					$('#btn').removeAttr('disabled');
					
					if(data.status == 1) {
						$('#reset').removeClass('availed');
						$('#pause').addClass('availed');
					}else if (data.status==2) {
						$('#pause').removeClass('availed');
						$('#reset').addClass('availed');
					}
				} else {
					mui.toast('网络错误')
				}
			},
			error: function(xhr, type, errorThrown) {
				alert('error');
				plus.nativeUI.closeWaiting();
			}
		});

		
		//*******************   websocket开始   ***********************************
		
		var host = "139.224.230.94:9876";
        var status;
        var pack;
        var ws;
        var SocketCreated = false;
        var isUserloggedout = false;
        var pointStatus;
        
        
        function ToggleConnectionClicked(str) {
            switch (str){
            	case '1003':
            		pack = '1003'+'000001'+mac+','+(hour*60+minute)+','+second;
                	console.log(pack);
            		break;
            	case '1004':
            		pack = '1004'+'000001'+mac+pointStatus;
            		break;
            	case '1007':
            		pack = '1007'+'000001'+mac;
            		break;
            	default:
            		break;
            }
            if (SocketCreated && (ws.readyState == 0 || ws.readyState == 1)) {
               
                SocketCreated = false;
                isUserloggedout = true;
                ws.close();
            } else {
                try {
                    if ("WebSocket" in window) {
                        ws = new WebSocket("ws://" + host);
                    }
                    else if ("MozWebSocket" in window) {
                        ws = new MozWebSocket("ws://" + host);
                    }
                    SocketCreated = true;
                    isUserloggedout = false;
                } catch (ex) {
                }
                ws.onopen = WSonOpen;
                ws.onmessage = WSonMessage;
                ws.onclose = WSonClose;
                ws.onerror = WSonError;
            }
        };
        
        //
        function WSonOpen() {
            ws.send(pack);
        };
        //
        function WSonMessage(event) {
           // console.log('mes:'+event)
        };
        //
        function WSonClose() {
        };
        //
        function WSonError() {
        };
        //
        function SendDataClicked() {

        };
		
		
		
		//1003
		$('#btn').on('tap',function(){
			plus.nativeUI.showWaiting();
			ToggleConnectionClicked('1003');
		});
		//1004
		$('#pause').on('tap',function(){
			pointStatus = '2';
			plus.nativeUI.showWaiting();
			ToggleConnectionClicked('1004');
		});
		$('#reset').on('tap',function(){
			pointStatus = '1';
			plus.nativeUI.showWaiting();
			ToggleConnectionClicked('1004');
		});
		//1007
		$('#query').on('tap', function() {
			console.log(util.getUser());
			console.log(mac);
			plus.nativeUI.showWaiting();
			mui.ajax(util.url + '/SetTime',{
				data:{
					userName: user.userName,
					password: user.password,
					ip: user.ip,
					mac: mac
				},
				dataType:'json',//服务器返回json格式数据
				type:'post',//HTTP请求类型
				timeout:10000,//超时时间设置为10秒；
				success:function(data){
					plus.nativeUI.closeWaiting();
					if(data.error_code == 0) {
						if (data.connection==1) {
							mui.toast('仪器连接正常！');
						}else if(data.connection==0){
							mui.toast('仪器连接中断！');
						}
					}
				},
				error:function(xhr,type,errorThrown){
					plus.nativeUI.closeWaiting();
					mui.toast('网络超时');
				}
			});
		});
		
		
		
		
		
		
		var minuteData = [];
		for(var i = 0; i < 12; i++) {
			minuteData[i] = {};
			minuteData[i].value = i * 5;
			minuteData[i].text = i * 5 + '分钟';
		}
		var hourData = [];
		for(var i = 0; i < 24; i++) {
			hourData[i] = {};
			hourData[i].value = i;
			hourData[i].text = i + '小时';
			hourData[i].children = minuteData;
		}
		
		var secondData = [];
		for(var i = 5; i < 21; i++) {
			secondData[i - 5] = {};
			secondData[i - 5].value = i;
			secondData[i - 5].text = i + '秒';
		}
		//去除0小时子节点的0分钟
		hourData[0].children = hourData[0].children.slice(1);
		$('#normal').on('tap', function() {
			var picker = new mui.PopPicker({layer: 2});
			picker.setData(hourData);
			picker.show(function(items) {
				hour = items[0].value;
				minute = items[1].value;
				$('.hour').html(items[0].text);
				$('.minute').html(items[1].text);
			})
		});
		$('#mobile').on('tap', function() {
			var picker = new mui.PopPicker();
			picker.setData(secondData);
			picker.show(function(items) {
				second = items[0].value;
				$('.mobile').html(items[0].text);
			})
		});
		
		
		// 监听在线消息事件
//		plus.push.addEventListener("receive", function(msg) {
//			if(msg.aps) { // Apple APNS message
//			} else {
//				if(plus.os.name == "Android") {
//					alert(msg.title+msg.content);
//					plus.nativeUI.closeWaiting();
//					var receiveData = JSON.parse(msg.content);
//					if (receiveData.header!=null) {
//						if (receiveData.header == '0000') {
//							//提示断开连接
//							mui.toast('仪器已断开连接');
//							mui.back();
//						}
//						if (receiveData.header == '9003') {
//							if (receiveData.check=='1') {
//								mui.toast('反馈时间设置成功!');
//							}else{
//								mui.toast('反馈时间设置失败!');
//							}
//						}
//						if (receiveData.header == '9004') {
//							if (receiveData.check=='1') {
//								mui.toast('操作成功!');
//							}else{
//								mui.toast('操作失败!');
//							}
//						}
//					}
//				}
//			}
//		})

		window.addEventListener('offLine',function(){
			plus.nativeUI.closeWaiting();
			mui.toast('仪器已断开连接');
			mui.back();
		});
		window.addEventListener('setOK',function(){
			plus.nativeUI.closeWaiting();
			mui.toast('反馈时间设置成功');
		});
		window.addEventListener('setNo',function(){
			plus.nativeUI.closeWaiting();
			mui.toast('反馈时间设置失败');
		});
		
		window.addEventListener('success',function(){
			plus.nativeUI.closeWaiting();
			mui.toast('操作成功');
		});
		window.addEventListener('faile',function(){
			plus.nativeUI.closeWaiting();
			mui.toast('操作失败');
		});
		
		
	})
}