(function(owner){
	owner.url = 'http://139.224.230.94:90/api';
	owner.host = "139.224.230.94:9876";
	owner.getUser = function(){
		var user = localStorage.getItem('$guardUser');
		return user;
	}
	
	
	
	
	
	
})(window.util = {})