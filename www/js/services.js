angular.module('mobileApp.services', [])

.service('BackendService', function(){

  var APPLICATION_ID = '542DD843-1D45-E049-FF68-D216B7503E00',
      SECRET_KEY = '5C8107B9-E881-1E2D-FF5D-C179A53A1F00',
      VERSION = 'v1'; //default application version;
  Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);

  var user = Backendless.UserService.login('lindqvist.samuel@gmail.com', 'ribalesibale', true);

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

  this.uploadImage('https://upload.wikimedia.org/wikipedia/commons/a/a5/European_Rabbit,_Lake_District,_UK_-_August_2011.jpg');

})

// the .factory() method is called internally by Angular JS when the
// PhotoLibraryService is used somewhere in the application for the first time.
// When this service is used again, the same service object is returned.
// more info on angular services here: https://docs.angularjs.org/guide/services
.provider('PhotoLibraryService', function PhotoLibraryProvider() {
  var config;
  this.setConfig = function(newConfig) {
    config = newConfig;
  };

  this.$get = ['$q', function($q) {
    AWS.config.update(config.awsconfig);

    // create API endpoints for S3 and DynamoDB
    var bucket = new AWS.S3({ params: { Bucket: config.bucket } });
    var ddb = new AWS.DynamoDB();

    // this defines the PhotoLibraryService object
    return {
      getPhotos: function() {
        return $q(function(resolve, reject) {
          var params = { TableName: 'ImageInfo' };
          ddb.scan(params, function(error, data) {
            if (error) {
              console.log('AWS DynamoDB Scan ERROR: ' + error);
              reject(error);
            } else {
              var photos = new Array(data.Count);
              for (var i = 0; i < data.Count; i += 1) {
                var imageInfo = data.Items[i];
                photos[i] = {
                  id: imageInfo.photoid.S.slice(0),
                  url: imageInfo.url.S.slice(0),
                  thumbnail_url: imageInfo.thumbnail_url.S.slice(0),
                  title: imageInfo.title.S.slice(0),
                  date: new Date(imageInfo.created_on.S)
                };
              }
              resolve(photos);
            }
          });
        });
      },

      getPhoto: function(photoId) {
        return $q(function(resolve, reject) {
          var params = {
            TableName: 'ImageInfo',
            Key: {
              photoid: { S: photoId }
            }
          };
          ddb.getItem(params, function(error, data) {
            if (error) {
              console.log('AWS DynamoDB GetItem ERROR: ' + error);
              reject(error);
            } else {
              var imageInfo = data.Item;
              resolve({
                id: imageInfo.photoid.S.slice(0),
                url: imageInfo.url.S.slice(0),
                thumbnail_url: imageInfo.thumbnail_url.S.slice(0),
                title: imageInfo.title.S.slice(0),
                date: new Date(imageInfo.created_on.S)
              });
            }
          });
        });
      },

      addPhoto: function(newPhoto) {
        var deferred = $q.defer();
        var params = {
          Key: newPhoto.id + '.jpg',
          Body: newPhoto.blob
        };
        bucket.putObject(params, function(error, data) {
          if (error) {
            console.log("AWS S3 PutObject ERROR: " + error.message);
            deferred.reject(error);
          } else {
            console.log("AWS S3 PutObject OK");

            var photo = {
              id: newPhoto.id,
              thumbnail_url: config.website_url + newPhoto.id +'.jpg',
              url: config.website_url + newPhoto.id + '.jpg',
              title: newPhoto.title,
              date: newPhoto.date
            };

            params = {
              Item: {
                photoid: { S: photo.id },
                url: { S: photo.url },
                thumbnail_url: { S: photo.thumbnail_url },
                title: { S: photo.title },
                created_on: { S: photo.date.toISOString() }
              },
              TableName: 'ImageInfo'
            };
            ddb.putItem(params, function(error, data) {
              if (error) {
                console.log("AWS DynamoDB PutItem ERROR: " +
                  error.message);
                deferred.reject(error);
              } else {
                console.log(data);
                deferred.resolve(photo);
              }
            });
          }
        })
        .on('httpUploadProgress', function(progress) {
          var percent = Math.round(progress.loaded / progress.total * 100);
          console.log("AWS S3 PutObject " + percent + "% done");
          deferred.notify(progress);
        });

        return deferred.promise;
      },

      deletePhoto: function(photoid) {
        return $q(function(resolve, reject) {
          var params = {
            TableName: 'ImageInfo',
            Key: {
              photoid: { S: photoid }
            }
          };
          ddb.deleteItem(params, function(error, data) {
            if (error) {
              console.log('AWS DynamoDB DeleteItem ERROR: ' + error);
              reject(error);
            } else {
              params = { Key: photoid + '.jpg' };
              bucket.deleteObject(params, function(error, data) {
                if (error) {
                  console.log("AWS DynamoDB DeleteItem ERROR: " +
                    error.message);
                } else {
                  console.log("AWS DynamoDB DeleteItem OK");
                }
              });
              resolve();
            }
          });
        });
      },

      newPhoto: function() {
        var date = new Date(); // now

        // do some formatting to make an OK default name for the new photo
        // 2011-10-05T14:48:00.000Z -> 2011.10.05 at 14.48.00
        var title = date.toISOString();
        title = title.slice(0, 10).replace(/\-/g, ".") + ' at '
          + title.slice(11, 19).replace(/:/g, ".");

        // generate a unique ID
        var id = '';
        var length = 8;
        var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
          'abcdefghijklmnopqrstuvwxyz' +
          '0123456789';

        for (var i = 0; i < length; i += 1) {
          var random = date.getTime() + Math.random() * alphabet.length;
          id += alphabet.charAt(random % alphabet.length);
        }

        return {
          id: id,
          title: title,
          date: date
        };
      }
    };
  }];
})

.factory('ImageService', function($q) {
  return {
    getBlobFromImageUrl: function(url, size) {
      return $q(function(resolve, reject) {
        // load the image into the browser
        var image = new Image();
        image.src = url;
        image.onload = function () {
          // do the math
          var naturalSize = Math.max(image.naturalHeight,
            image.naturalWidth),
            ratio = size / naturalSize,
            height = Math.round(image.naturalHeight * ratio),
            width = Math.round(image.naturalWidth * ratio);

          // create an off-screen canvas
          var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

          // set its dimension to target size
          canvas.width = width;
          canvas.height = height;

          // draw source image into the off-screen canvas
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(image, 0, 0, width, height);

          // get binary representation of the picture in the new
          // size (jpeg-encoded)
          canvas.toBlob(function onSuccess(blob) {
            resolve(blob);
          }, 'image/jpeg', 0.75);
        };
      });
    }
  };
});
