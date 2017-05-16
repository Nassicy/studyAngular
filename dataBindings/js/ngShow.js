/*
* @Author: anchen
* @Date:   2016-12-04 16:04:25
* @Last Modified by:   anchen
* @Last Modified time: 2016-12-04 16:07:27
*/

'use strict';
var ngShowModule = angular.module("ngShowModule",[]);
ngShowModule.controller("menuController",['$scope',
    function($scope){
        $scope.menuState = {show:false};
        $scope.toggleMenu = function(){
            $scope.menuState.show = ! $scope.menuState.show;
        };
    }
])