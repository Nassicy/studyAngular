

var routerApp = angular.module('routerApp', ['ui.router']);
routerApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/index');
    $stateProvider
        .state('index',{
            url:'/index',
            views:{
                '':{
                    templateUrl:'tpls/index.html'
                },
                'topbar@index':{
                    templateUrl:'tpls/topbar.html'
                },
                'main@index':{
                    templateUrl:'tpls/home.html'
                }
            }
        })
        .state('index.usermng',{
            url:'/usermng',
            views:{
                'main@index':{
                    templateUrl:'tpls/usermng.html',
                    controller:function($scope,$state){
                        $scope.addUserType = function(){
                            $state.go("index.usermng.addusertype");
                        }
                    }
                }
            }
        })
        .state('index.usermng.highendusers',{
            url:'/highendusers',
            templateUrl:'tpls/highendusers.html'
        })
        .state('index.usermng.normalusers',{
            url:'/normalusers',
            templateUrl:'tpls/normalusers.html'
        })
        .state('index.usermng.lowusers',{
            url:'/lowusers',
            templateUrl:'tpls/lowusers.html'
        })
        .state('index.usermng.addusertype',{
            url:'/addusertype',
            templateUrl:'tpls/addusertypeform.html',
            controller:function($scope,$state){
                $scope.backToPrevious = function(){
                    window.history.back();
                }
            }
        })
        .state('index.permission',{
            url:'/permission',
            views:{
                'main@index':{
                    template:'权限管理模块'
                }
            }
        })
        .state('index.report',{
            url:'/report',
            views:{
                'main@index':{
                    template:'报表管理模块'
                }
            }
        })
        .state('index.settings',{
            url:'/settings',
            views:{
                'main@index':{
                    template:'系统管理模块'
                }
            }
        })


});
