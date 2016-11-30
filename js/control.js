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
		
		$('header h1').html(data.des);
		if(status == 1) {

		}
		
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
					
					//改变按钮状态
					$('#btn').removeAttr('disabled');
				} else {
					mui.toast('网络错误')
				}
			},
			error: function(xhr, type, errorThrown) {

			}
		});

		
		//*******************   websocket开始   ***********************************
		
		var host = "139.224.230.94:9876";
        var status;
        var pack;
        var ws;
        var SocketCreated = false;
        var isUserloggedout = false;
        function ToggleConnectionClicked(str) {
            if(str=="1003"){
                //pack="1003,998877665544004,120,10";
                pack = '1003,'+mac+','+(hour*60+minute)+','+second;
                console.log(pack);
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
            console.log('mes:'+event)
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
			ToggleConnectionClicked(1003);
		});
		
		
		
		
		//****************************************************
		$('#pause').on('tap', function() {

		});
		$('#reset').on('tap', function() {

		});
		$('#query').on('tap', function() {

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
	})

}