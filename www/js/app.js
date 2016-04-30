angular.module('mobileApp', ['ionic', 'mobileApp.controllers', 'mobileApp.services', 'ngCordova'])

.run(function($ionicPlatform, $rootScope) {

  $ionicPlatform.ready(function() {

    $rootScope.images = ['localimages/kuva1.JPG', 'localimages/kuva2.JPG'];
    $rootScope.cloudImages = [];
    $rootScope.previewPhoto = null;
    $rootScope.localFileDir = 'mobiledev';

    $rootScope.shownPhoto = null;

    $rootScope.showPhoto = function(array, id){
      $rootScope.shownPhoto = array[id];
      var asd = document.getElementById('showPhoto');
      asd.style.display = 'block';
    }
    $rootScope.closePhoto = function(){
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
