
var routerApp=angular.module('routerApp',['ui.router']);

routerApp.config(function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise('/index');
    $stateProvider
        .state('index',{
            url:'/index',
            views:{
                '':{
                    templateUrl:'../tpls/index.html'
                },
                'topbar@index':{
                    templateUrl:'../tpls/topbar.html'
                },
                'main@index':{
                    templateUrl:'../tpls/home.html'
                }
            }
        })
});