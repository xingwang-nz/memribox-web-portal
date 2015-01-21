angular.module('appServices', ['ngResource'])
.factory('userService', function($rootScope, $resource) {
	
	return $resource($rootScope.getServiceFullUrl('user/:action'), {},
			{
				authenticate: {
					method: 'POST',
					params: {'action' : 'auth'},
					headers : {'Content-Type': 'application/x-www-form-urlencoded'}
				},
			}
		);
});