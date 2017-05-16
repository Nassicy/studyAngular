/*
* @Author: anchen
* @Date:   2016-12-04 14:39:32
* @Last Modified by:   anchen
* @Last Modified time: 2016-12-04 15:21:50
*/

'use strict';
var bookStoreApp = angular.module('bookStoreApp', [
    'ngRoute','ngAnimate','bookStoreCtrls','bookStoreFilters','bookStoreServices','bookStoreDirectives']);

bookStoreApp.config(function($routeProvider){
    $routeProvider.when('/hello',{
        templateUrl:'tpls/hello.html',
        controller :'helloCtrl'
    }).when('/list',{
        templateUrl : 'tpls/bookList.html',
        controller : 'BookListCtrl'
    }).otherwise({
        redirectTo : '/hello'
    })
});

