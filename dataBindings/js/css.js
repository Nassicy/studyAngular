/*
* @Author: anchen
* @Date:   2016-12-04 15:31:08
* @Last Modified by:   anchen
* @Last Modified time: 2016-12-04 15:36:08
*/

'use strict';

var myCSSModule = angular.module('myCSSModule',[]);

myCSSModule.controller('cssCtrl',['$scope',
    function($scope){
        $scope.color="red";
        $scope.setGreen = function(){
            $scope.color = "green";
        }
    }
])