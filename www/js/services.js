angular.module('mobileApp.services', [])

.service('CameraService', function($cordovaCamera, $rootScope, $timeout, $state, $cordovaFile){

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

  this.addImage = function() {

      var options = {
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
          allowEdit : false,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
      };

      $cordovaCamera.getPicture(options).then(function(imageData) {
        // $rootScope.images.push(imageData);
        // $rootScope.previewPhoto = imageData;
        // $timeout(function(){$state.go('tab.local'); }, 5000);
        // $state.go('preview');
        // return result;
          onImageSuccess(imageData);

          function onImageSuccess(fileURI) {

              createFileEntry(fileURI);
          }

          function createFileEntry(fileURI) {
              window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
          }

          function copyFile(fileEntry) {
              var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
              document.body.innerHTML = name;
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
              document.body.innerHTML += 'success';
              $rootScope.images.push(entry.nativeURL);
              $rootScope.previewPhoto = imageData;
              BackendService.uploadImage(imageData);
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

  this.urlForImage = function(imageName) {
      var name = imageName.substr(imageName.lastIndexOf('/') + 1);
      var trueOrigin = cordova.file.dataDirectory + name;
      return trueOrigin;
  }

})

//Cloud service,l upload and download
.service('BackendService', function($rootScope){

  var APPLICATION_ID = '542DD843-1D45-E049-FF68-D216B7503E00',
      SECRET_KEY = '5C8107B9-E881-1E2D-FF5D-C179A53A1F00',
      VERSION = 'v1'; //default application version;
  Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);

  var user = Backendless.UserService.login('testi@testi.com', 'salasana', true);

  this.getImageArray = function(lista){
    var tuloslista = [];
    var i = 0, l = lista.data.length, a = lista.data;
    for(;i<l;i++){
      var xhr = new XMLHttpRequest();
      xhr.open("GET", a[i].publicUrl);
      xhr.addEventListener('load', function() {
        console.log('loaded image' + xhr.response);
          $rootScope.images.push(xhr.response);
      });
      xhr.send();
    }
    return tuloslista;
  }

  this.getImageListing = function(){
    var tulos = null;
    try
    {
      tulos = Backendless.Files.listing( "/testi", "*", true );
    }
    catch( err )
    {
      console.log( "Error message - " + err.message );
      console.log( "Error code - " + err.statusCode );
    }
    return tulos;
  }

  this.uploadImage = function(file){
    this.getFileObject(file, function (fileObject) {
      console.log(file + " " + fileObject);
      Backendless.Files.upload(fileObject, 'testi');
    });
  }

  this.getFileBlob = function (url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener('load', function() {
        cb(xhr.response);
    });
    xhr.send();
  };

  this.getFileObject = function(filePathOrUrl, cb) {
    this.getFileBlob(filePathOrUrl, function (blob) {
      blob.lastModifiedDate = new Date();
      blob.name = 'filu.jpg';
      cb(blob);
    });
  };
  //
  this.uploadImage('localimages/kuva1.JPG');
})

.service('imageService', function($rootScope, BackendService){
  //local == get from temporary storage
  //cloud == get from cloud
  this.saveImage = function(id, source){
    if(typeof source === 'string'){
      if(source.toLowerCase() === 'local'){
        this.saveToDevice($rootScope.images[id]);
      }else{
        this.saveToDevice($rootScope.cloudImages[id]);
      }
    }
  }
  this.saveToDevice = function(){
    var fileURI = $rootScope.selectedImage;
    window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
    function copyFile(){
      var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
      var newName = makeid() + name;
      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
          // var targetDir = new DirectoryEntry({fullPath: fileSystem2.fullPath + $rootScope.localFileDir});
          fileEntry.copyTo(
              fileSystem2,
              newName,
              function(){console.log('Save success');},
              function(){console.log('Save failed');}
          );
      },
      fail);
    }
  }
});