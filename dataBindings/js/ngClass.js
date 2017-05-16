/*
* @Author: anchen
* @Date:   2016-12-04 15:53:25
* @Last Modified by:   anchen
* @Last Modified time: 2016-12-04 15:57:57
*/

'use strict';
var ngCssModule = angular.module("ngCssModule",[]);
ngCssModule.controller("headerController",['$scope',
    function($scope){
        $scope.isError = false;
        $scope.isWarning = false;

        $scope.showError = function(){
            $scope.messageText = 'this is an error!';
            $scope.isError = true;
            $scope.isWarning = false;
        };
        $scope.showWarning = function(){
            $scope.messageText = "just a warning, please carry on";
            $scope.isWarning =true;
            $scope.isError =false;
        }
    }
])