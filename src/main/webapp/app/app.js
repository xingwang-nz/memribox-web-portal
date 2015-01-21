var mainApp = angular.module('mainApp', ['ngRoute', 'ngCookies', 'ngAnimate', 'mgcrea.ngStrap', 'appServices']);

mainApp.config(function($routeProvider, $locationProvider, $httpProvider){
		
		$routeProvider.when('/home', {
			controller : 'homeController',
			templateUrl : 'app/home/home.html'
		})
		.when('/myMemribox', {
			controller : 'myMemriboxController',
			templateUrl : 'app/myMemribox/myMemribox.html'
		})
		.when('/profile', {
			controller : 'profileController',
			templateUrl : 'app/profile/profile.html'
		})
		// default
		.otherwise({
			redirectTo : '/home'
		});
		
		
		/* Register the interceptor via an anonymous factory
		 * Register error provider that shows message on failed requests or redirects to login page on
		 * unauthenticated requests */
	    $httpProvider.interceptors.push(function ($q, $rootScope, $location) {
		        return {
		        	'responseError': function(rejection) {
		        		var status = rejection.status;
		        		var config = rejection.config;
		        		var method = config.method;
		        		var url = config.url;
		      
		        		$rootScope.error = method + " on " + url + " failed with status " + status;
		        		if (status == 401) {
		        			$rootScope.authError = "un-authorized";
		        			$rootScope.clearAuth();
		        		} else {
		        			
		        		}
		              
		        		return $q.reject(rejection);
		        	}
		        };
		    }
	    );
	    
	    /* Registers auth token interceptor, auth token is either passed by header or by query parameter
	     * as soon as there is an authenticated user */
	    $httpProvider.interceptors.push(function ($q, $rootScope, $location) {
	        return {
	        	'request': function(config) {
	        		//TODO: check if it is restfull call 
	        		//var isRestCall = config.url.indexOf('services') >= 0;
	        		var isRestCall = true; 
	        		
	        		if (isRestCall && angular.isDefined($rootScope.authToken)) {
	        			var authToken = $rootScope.authToken;
	        			if (appConfig.useAuthTokenHeader) {
	        				config.headers['X-Auth-Token'] = authToken;
	        			} else {
	        				config.url = config.url + "?token=" + authToken;
	        			}
	        		}
	        		return config || $q.when(config);
	        	}
	        };
	    });
		
	});

//run when application starts
mainApp.run(function($rootScope, $location, $cookieStore) {
	
	$rootScope.enableCookie = false;
	
	$rootScope.initialized = true;
	
	
	$rootScope.getServiceFullUrl = function(requestUrl) {
		return appConfig.serverBaseUrl + "/" + requestUrl;
	}
	
	$rootScope.clearAuth = function() {
		delete $rootScope.user;
		delete $rootScope.authToken;
		$cookieStore.remove('authToken');
	}
	
	$rootScope.logout = function() {
		$rootScope.clearAuth();	
		$location.path("/home");
	};
	
	$rootScope.hasUserRole = function(role) {
		if ($rootScope.user === undefined) {
			return false;
		}
		
		if ($rootScope.user.userRoles[role] === undefined) {
			return false;
		}
		
		return $rootScope.user.roles[role];
	};
	
	//setup a watcher to check if any pages (except public access page "home") are accessed un-authorisated  
	$rootScope.$watch(function() { return $location.path(); }, function(newValue, oldValue){  
	    if ((angular.isDefined($rootScope.user) == false || $rootScope.user == null) && newValue != '/home'){  
	    	$location.path('/home');  
	    }  
	});
	
	$rootScope.activePagePath = "/home";
	
	//listen to location change
	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		//next.templateUrl
		$rootScope.activePagePath = $location.path();
	});
	
	$rootScope.activePageClass = function(path) {
		return $rootScope.activePagePath == path ? "active" : "";
	}
	
	//TODO: implement load auth from cookie
	 /* Try getting valid user from cookie, otherwise go to main page */
//	var originalPath = $location.path();
//	var authToken = $cookieStore.get('authToken');
//	if (angular.isDefined(authToken)) {
//		$rootScope.authToken = authToken;
//		userService.get(function(user) {
//			$rootScope.user = user;
//			$location.path(originalPath);
//		});
//	}else {
//		//default to main page
//		$location.path("/home")		
//	}
	
	//default to main page
	$location.path("/home")		

	
	
});


//CONTROLLERS ============================================
mainApp.controller('mainController', function($rootScope, $scope, $aside) {
	
	$rootScope.showLoginSlidePanel = function() {
		$rootScope.showSlidePanel("app/login/login.html", "Login", "300px");
	};
	
	/**
	 * height is side panel height, default 100%
	 */
	$rootScope.showSlidePanel = function(slidePanelContent, panelTitle, height, topPosition) {
		$rootScope.slidePanelContent = slidePanelContent;
		$rootScope.slidePanelTitle = panelTitle;
		
		if(angular.isDefined(height)) {
			$rootScope.slidePanelHeight = height;
		}else {
			$rootScope.slidePanelHeight = "100%";
		}
		
		if(angular.isDefined(topPosition)) {
			$rootScope.slidePanelTopPosition = topPosition;
		}else {
			$rootScope.slidePanelTopPosition = "50px";
		}
		
		// Pre-fetch an external template populated with a custom scope
		var slideSidePanel = $aside({scope: $rootScope, template: 'app/common/side-slide.html'});
		$rootScope.slideSidePanel = slideSidePanel;
		
		$rootScope.slideSidePanel.$promise.then(function() {
			$rootScope.slideSidePanel.show();
		});
	}; 
	
	$rootScope.hideSlidePanel = function() {
		if(angular.isDefined($rootScope.slideSidePanel)) {
			$rootScope.slideSidePanel.hide();	
		}
		
	};
});



