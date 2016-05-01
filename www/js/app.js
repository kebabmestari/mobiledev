angular.module('mobileApp', ['ionic', 'mobileApp.controllers', 'mobileApp.services', 'ngCordova'])

//Global values and functions
.run(function($ionicPlatform, $rootScope) {

  $ionicPlatform.ready(function() {

    $rootScope.images = ['localimages/kuva1.JPG', 'localimages/kuva2.JPG'];
    $rootScope.cloudImages = [];
    $rootScope.previewPhoto = null;
    $rootScope.localFileDir = 'mobiledev';
    $rootScope.selectedPhoto = null;

    $rootScope.shownPhoto = null;

    $rootScope.showPhoto = function(array, id, uploadTarget){
      $rootScope.shownPhoto = array[id];
      var asd = document.getElementById('showPhoto');
      asd.style.display = 'block';
      if(uploadTarget){
        var btn1 = document.getElementById('uploadToLocal');
        var btn2 = document.getElementById('uploadToCloud');
        if(btn1)
          btn1.style.display = 'block';
        if(uploadTarget.toLowerCase() === 'local'){
          $rootScope.selectedImage = $rootScope.images[id];
          if(btn2)
            btn2.style.display = 'block';
        }else{
          $rootScope.selectedImage = $rootScope.cloudImages[id];
        }
      }
    }
    $rootScope.closePhoto = function(){
        var btn1 = document.getElementById('uploadToLocal');
        var btn2 = document.getElementById('uploadToCloud');
        if(btn1)
          btn1.style.display = 'none';
        if(btn2)
          btn2.style.display = 'none';
      document.getElementById('showPhoto').style.display = 'none';
    }

    //Piilota työkalurivi(fullscreen)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

//States
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  .state('tab.local', {
      url: '/local',
      views: {
        'tab-local': {
          templateUrl: 'templates/local.html',
          controller: 'LocalStorageCtrl'
        }
      }
    })
  .state('tab.all', {
      url: '/all',
      views: {
        'tab-all': {
          templateUrl: 'templates/all.html',
          controller: 'BothStoragesCtrl'
        }
      }
    })
  .state('preview', {
    url: '/preview',
    templateUrl: 'templates/showphoto.html',
  })
  .state('tab.cloud', {
      url: '/cloud',
      views: {
        'tab-cloud': {
          templateUrl: 'templates/cloud.html',
          controller: 'CloudStorageCtrl'
        }
      }
    })
    .state('tab.list', {
      url: '/list',
      views: {
        'tab-list': {
          templateUrl: 'templates/list.html',
          controller: 'ListCtrl'
        }
      }
    });
  $urlRouterProvider.otherwise('/tab/local');
});
