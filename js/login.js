 mui.ready(function () {
   	mui.plusReady(function () {
   		var curr = plus.webview.currentWebview();
		var wvs = plus.webview.all();
		for(var i = 0, len = wvs.length; i < len; i++) {
			//关闭除setting页面外的其他页面
			if(wvs[i].getURL() == curr.getURL())
				continue;
			plus.webview.close(wvs[i]);
		}
//		if(util.getUser()){
//			mui.openWindow('index.html','index.html',{
//				createNew:true
//			});
//		}
		if(util.getUser()){
			var user = JSON.parse(util.getUser());
			$('#account').val(user.userName);
			$('#ip').val(user.ip);
		}
   	    $('.login').on('tap',function(){
   	    	document.getElementById("ip").blur();
   	    	document.getElementById("account").blur();
   	    	document.getElementById("pwd").blur();
   	    	if ($('#ip').val()=='') {
   	    		mui.toast('请输入服务器IP！');
   	    		return false;
   	    	}
   	    	if ($('#account').val()=='') {
   	    		mui.toast('请输入账号！');
   	    		return false;
   	    	}
   	    	if ($('#pwd').val()=='') {
   	    		mui.toast('请输入密码！');
   	    		return false;
   	    	}
   	    	plus.nativeUI.showWaiting();
   	    	var pwd = md5($('#pwd').val());
			var cid = plus.push.getClientInfo().clientid;
   	    	mui.ajax(util.url+'/Login',{
   	    		data:{
   	    			userName:$('#account').val(),
   	    			password: md5($('#pwd').val()),
   	    			ip: $('#ip').val(),
   	    			cid:cid
   	    		},
   	    		dataType:'json',//服务器返回json格式数据
   	    		type:'post',//HTTP请求类型
   	    		timeout:10000,//超时时间设置为10秒；
   	    		success:function(data){
   	    			plus.nativeUI.closeWaiting();
   	    			console.log(JSON.stringify(data));
   	    			if (data.error_code==0) {
   	    				var user = {
   	    					userName:$('#account').val(),
		   	    			password:md5($('#pwd').val()),
		   	    			ip:$('#ip').val()
   	    				};
   	    				localStorage.setItem('$guardUser',JSON.stringify(user));
   	    				localStorage.setItem('$guardAddress',JSON.stringify(data));
   	    				console.log(util.getUser());
   	    				document.getElementById("ip").blur();
   	    				document.getElementById("account").blur();
   	    				document.getElementById("pwd").blur();
   	    				setTimeout(function(){
   	    					mui.openWindow('index.html','index.html',{
   	    					
   	    					});
   	    				},100);
   	    			} else{
   	    				mui.toast('账号或密码错误');
   	    			}
   	    		},
   	    		error:function(xhr,type,errorThrown){
   	    			plus.nativeUI.closeWaiting();
   	    			mui.toast('网络连接超时！');
   	    		}
   	    	});
   	    })
   	})
   })




















// var server = { 
//      // 对外主要提供 connect 和 send 方法
//     connect : function() {
//     	var location ="ws://121.42.197.191:6000"; 
//      	// 创建 WebSockets 并传入 WebSockets server 地址
// 	    this._ws =new WebSocket(location); 
// 	    this._ws.onmessage=this._onmessage; 
// 	    //WebSockets 还提供了 onopen 以及 onclose 事件
// 	    this._ws.onopen =this._onopen; 
// 	    this._ws.onclose =this._onclose; 
//     },
//     _onopen : function(event) {
//     	server._send("Client:Open WebSockets,"+new Date());
//     },
//     _send : function(message) {
//     	if (this._ws) 
//          this._ws.send(message);
//     },
//     send : function(text) {
//     	if (text !=null&& text.length >0) 
//          server._send(text); 
//     },
//     _onmessage : function(event) {
//     	if (event.data) {
//     		alert(event.data);
//     	}
//     },
//     _onclose : function(m) {
//     	this._ws = null;
//     }
//  };
//  server.connect();