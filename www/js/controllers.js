angular.module('mobileApp.controllers', [])

//Controller present in all tabs
.controller('MainCtrl', function($scope, $cordovaCamera, $cordovaFile,
                            $rootScope, $state, $timeout, CameraService, imageService) {
  $scope.addMessage = function(asd){
    document.body.innerHTML = "<p>"+asd+"</p>";
  }
  $scope.takePhoto = function(){
    CameraService.addImage();
  }
  $scope.save = function(){
    imageService.saveToDevice();
  }
  $scope.upload = function(){
    BackendService.uploadImage($rootScope.selectedImage);
  }
})

//Local storage controller
.controller('LocalStorageCtrl', function($scope, $ionicBackdrop, $rootScope, $cordovaFile, imageService) {

  $scope.shownPhoto = $rootScope.shownPhoto;

  $scope.showPhoto = function(id){
    $rootScope.showPhoto($rootScope.images, id, 'local');
  }
  $scope.closePhoto = function(){
    $rootScope.closePhoto();
  }
})

//Cloud controller
.controller('CloudStorageCtrl', function($scope, $stateParams, $rootScope, BackendService, imageService) {
  var kuvalista = BackendService.getImageListing();
  var i = 0, l = kuvalista.data.length, a = kuvalista.data;
  for(; i < l; i++){
    if($rootScope.cloudImages.indexOf(a[i].publicUrl) === -1){
        $rootScope.cloudImages.push(a[i].publicUrl);
    }
  }
  $scope.shownPhoto = $rootScope.shownPhoto;

  $scope.showPhoto = function(id){
    $rootScope.showPhoto($rootScope.cloudImages, id, 'cloud');
  }
  $scope.closePhoto = function(){
    $rootScope.closePhoto();
  }
})

//Full image listing controller
.controller('BothStoragesCtrl', function($scope, $stateParams, $rootScope, BackendService) {
  var kuvalista = BackendService.getImageListing();
  var i = 0, l = kuvalista.data.length, a = kuvalista.data;
  for(; i < l; i++){
    if($rootScope.cloudImages.indexOf(a[i].publicUrl) === -1){
        $rootScope.cloudImages.push(a[i].publicUrl);
    }
  }
  $scope.shownPhoto = $rootScope.shownPhoto;

  $scope.showPhoto = function(id, target){
    if(target.toLowerCase() === 'cloud')
      $rootScope.showPhoto($rootScope.cloudImages, id);
    else
      $rootScope.showPhoto($rootScope.images, id);
  }
  $scope.closePhoto = function(){
    $rootScope.closePhoto();
  }
});
;
