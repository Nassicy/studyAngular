/*
* @Author: dongying
* @Date:   2017-01-11 10:08:14
* @Last Modified by:   anchen
* @Last Modified time: 2017-01-11 13:49:20
*/


(function(){
    var routeApp = angular.module('blogApp', ['ui.router', 'ngGrid']);


    routeApp.config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            var routes, setRoutes;

            routes = [
                'pages/dashboard/home',
                'pages/public/login'

            ];

            setRoutes = function(route) {
                var config, url;
                url = '/' + route;
                config = {
                    url: url,
                    templateUrl: 'app/' + route + '.html'
                };
                $stateProvider.state(route, config);
                return $stateProvider;
            };

            routes.forEach(function(route) {
                return setRoutes(route);
            });

            $urlRouterProvider
                .when('/', '/pages/dashboard/home')
                .when("", "/pages/public/login");

            }
        ]);

})();
