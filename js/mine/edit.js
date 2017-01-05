 mui.ready(function () {
   	mui.plusReady(function () {
   	    $('#btn').on('tap',function(){
   	    	if ($('#old').val()=='') {
   	    		mui.toast('请输入原密码');
   	    		return false;
   	    	}
   	    	if ($('#new1').val()=='') {
   	    		mui.toast('请输入新密码');
   	    		return false;
   	    	}
   	    	if ($('#new2').val()=='') {
   	    		mui.toast('请输入新密码');
   	    		return false;
   	    	}
   	    	if ($('#new1').val()!=$('#new2').val()) {
   	    		mui.toast('两次密码不一致！');
   	    		return false;
   	    	}
   	    	var newp = md5($('#new1').val());
   	    	var old = md5($('#old').val());
   	    	var user = JSON.parse(localStorage.getItem('$guardUser'));
   	    	console.log(user.ip);
   	    	mui.ajax(util.url+'/UpdatePassword',{
   	    		data:{
   	    			userName:user.userName,
   	    			password:old,
   	    			ip:user.ip,
   	    			newPassword: newp
   	    		},
   	    		dataType:'json',//服务器返回json格式数据
   	    		type:'post',//HTTP请求类型
   	    		timeout:10000,//超时时间设置为10秒；
   	    		success:function(data){
   	    			console.log(JSON.stringify(data));
   	    			if (data.error_code==0) {
   	    				var user1 = {
		   	    			ip:user.ip,
   	    					userName:user.userName,
		   	    			password:newp
   	    				};
   	    				localStorage.setItem('$guardUser',JSON.stringify(user1));
   	    				mui.toast('修改成功！');
   	    				mui.openWindow('../../login.html','login.html',{});
   	    			}else{
   	    				mui.toast('原密码错误！');
   	    			}
   	    		},
   	    		error:function(xhr,type,errorThrown){
   	    			
   	    		}
   	    	});
   	    })
   	})
   })