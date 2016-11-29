window.onload = function(){
	mui.plusReady(function () {
	    var self = plus.webview.currentWebview();
	    var data = self.data;
	    var mac = data.mac;
	    
	    var diviceStatus = data.status;
		$('header h1').html(data.des);
		if (status==1) {
			
		}
		var user = JSON.parse(util.getUser());
		mui.ajax(util.url+'/SetTime',{
			data:{
				userName:user.userName,
				password:user.password,
				ip:user.ip,
				mac:mac
			},
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				if (data.error_code==0) {
					$('.normal').html(data.minutes);
					$('.mobile').html(data.seconds);
				}else{
					mui.toast('网络错误')
				}
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
		
		
		$('#pause').on('tap',function(){
			
		});
		$('#reset').on('tap',function(){
			
		});
		$('#query').on('tap',function(){
			
		});
		$('#normal').on('tap',function(){
			
		});
		$('#mobile').on('tap',function(){
			
		});
	})
	
	
	
	
	
}
