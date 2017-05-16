/*
* @Author: anchen
* @Date:   2016-12-04 12:15:59
* @Last Modified by:   anchen
* @Last Modified time: 2016-12-04 13:03:03
*/

'use strict';
var userInfoModule=angular.module('userInfoModule', []);

userInfoModule.controller("userInfoController",["$scope",
    function($scope){
        $scope.userInfo={
            email : "38492123@qq.com",
            password : "123456",
            autoLogin : true
        };
        $scope.getFormData=function(){
            console.log($scope.userInfo);
        };

        $scope.setFormData=function(){
            $scope.userInfo={
                email:"damo@126.com",
                password:"111111",
                autoLogin:false
            }
        };
        $scope.resetFormData=function(){
            $scope.userInfo={
            email : "38492123@qq.com",
            password : "123456",
            autoLogin : true
            }
        };
    }
])
