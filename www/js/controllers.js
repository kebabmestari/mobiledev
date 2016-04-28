angular.module('mobileApp.controllers', [])

.controller('MainCtrl', function($scope, $cordovaCamera, $cordovaFile, $rootScope, $state, $timeout) {

  $scope.addMessage = function(asd){
    document.body.innerHTML += "<p>"+asd+"</p>";
  }

    // (function getLocalPhotos(){
    //   $cordovaFile.checkDir(cordova.file.dataDirectory, $rootScope.localFileDir)
    //   .then(function(success){
    //     //Exists already
    //   }, function(error){
    //     $cordovaFile.createDir(cordova.file.dataDirectory, $rootScope.localFileDir, false);
    //   });
    //   window.resolveLocalFileSystemURL(cordova.file.dataDirectory + $rootScope.localFileDir, function(fs){
    //     var directoryReader = fs.createReader();
    //     directoryReader.readEntries(function(s){
    //       var l = s.length, i = 0;
    //       for(; i < l; i++){
    //         document.getElementById('asd').innerHTML += ' ' + s[i];
    //         if(/(\.jpg|\.png)/ig.test(s[i])){
    //           $rootScope.images.push(s[i]);
    //         }
    //       }
    //     },function(e){console.log('Failed to read directory');});
    //
    //   });
    // })();

    $scope.addImage = function() {

        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
          $rootScope.images.push(imageData);
          $rootScope.previewPhoto = imageData;
          $timeout(function(){$state.go('tab.local'); }, 5000);
          $state.go('preview');
          return;
            onImageSuccess(imageData);

            function onImageSuccess(fileURI) {

                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
            }

            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                    // var targetDir = new DirectoryEntry({fullPath: fileSystem2.fullPath + $rootScope.localFileDir});
                    fileEntry.copyTo(
                        fileSystem2,
                        newName,
                        onCopySuccess,
                        fail
                    );
                },
                fail);
            }

            function onCopySuccess(entry) {
                $rootScope.images.push(entry.nativeURL);
                $rootScope.previewPhoto = imageData;
                $timeout(function(){$state.go('tab.local'); }, 5000);
                $state.go('preview');
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i=0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

        }, function(err) {
            console.log(err);
        });
    }

    $rootScope.urlForImage = function(imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;
        return trueOrigin;
    }

})

.controller('LocalStorageCtrl', function($scope, $ionicBackdrop, $rootScope) {

  $scope.shownPhoto = null;

  $scope.showPhoto = function(id){
    $scope.shownPhoto = $rootScope.images[id];
    var asd = document.getElementById('showPhoto');
    asd.style.display = 'block';
  }
  $scope.closePhoto = function(){
    document.getElementById('showPhoto').style.display = 'none';
  }
})

.controller('CloudStorageCtrl', function($scope, $stateParams) {

});
