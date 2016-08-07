

var mainApp = angular.module('mainApp', ['AHDatePicker']);



mainApp.controller('mainController', function ($scope) {
    $scope.dateSource = {};
    $scope.myDate = '1395/5/18';
});