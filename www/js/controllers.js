angular.module('mobileApp.controllers', [])

.controller('MainCtrl', function($scope, $cordovaCamera, $cordovaFile,
                            $rootScope, $state, $timeout, CameraService) {

  $scope.addMessage = function(asd){
    document.body.innerHTML = "<p>"+asd+"</p>";
  }

  $scope.takePhoto = function(){
    CameraService.addImage();
  }

})

.controller('LocalStorageCtrl', function($scope, $ionicBackdrop, $rootScope) {

  $scope.shownPhoto = $rootScope.shownPhoto;

  $scope.showPhoto = function(id){
    $rootScope.showPhoto($rootScope.images, id);
  }
  $scope.closePhoto = function(){
    $rootScope.closePhoto();
  }
})

.controller('CloudStorageCtrl', function($scope, $stateParams, $rootScope, BackendService) {
  var kuvalista = BackendService.getImageListing();
  var i = 0, l = kuvalista.data.length, a = kuvalista.data;
  for(; i < l; i++){
    $rootScope.cloudImages.push(a[i].publicUrl);
  }
  $scope.shownPhoto = $rootScope.shownPhoto;

  $scope.showPhoto = function(id){
    $rootScope.showPhoto($rootScope.cloudImages, id);
  }
  $scope.closePhoto = function(){
    $rootScope.closePhoto();
  }
});
