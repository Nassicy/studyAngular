/*
* @Author: anchen
* @Date:   2016-12-04 11:31:36
* @Last Modified by:   anchen
* @Last Modified time: 2016-12-04 11:34:37
*/

'use strict';
function EventController($scope){
    $scope.count=0;
    $scope.$on("MyEvent",function(){
        $scope.count++;
    });
}