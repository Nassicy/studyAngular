/*
* @Author: anchen
* @Date:   2016-12-04 14:39:43
* @Last Modified by:   anchen
* @Last Modified time: 2016-12-04 16:30:14
*/

'use strict';

var bookStoreCtrls = angular.module('bookStoreCtrls',[]);

bookStoreCtrls.controller('helloCtrl',['$scope',
    function($scope){
        $scope.greeting = {
            text : 'hello'
        };
        $scope.pageClass="hello";
    }
]);

bookStoreCtrls.controller('BookListCtrl',['$scope',
    function($scope){
        $scope.books=[
            {title:'《Ext江湖》', author:"大漠穷秋"},
            {title:'《ActionScript游戏设计基础（第二版）》',author:"大漠穷秋"},
            {title:'《用AngularJS开发下一代WEB应用》',author:"大漠穷秋"}
        ];
        $scope.pageClass="list";
    }
])