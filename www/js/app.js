// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
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

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/local');
});
