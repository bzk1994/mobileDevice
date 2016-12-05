(function(owner){
	owner.url = 'http://139.224.230.94:90/api';
	owner.host = "139.224.230.94:9876";
	owner.getUser = function(){
		var user = localStorage.getItem('$guardUser');
		return user;
	}
	
	
	
	
	
	
})(window.util = {})
document.addEventListener("resume", function() {
    var pushManager = plus.android.importClass("com.igexin.sdk.PushManager");
    var context = plus.android.runtimeMainActivity();
    pushManager.getInstance().initialize(context);
  }, false);