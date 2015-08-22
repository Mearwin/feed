
var app = angular.module('feedApp',[]);
app.controller('feedCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {

  $scope.lastprogress={};
  $scope.progress={};

  $scope.uploadFile = function(file) {
    $scope.uploadFileP(file)
    .then(function(response){
      $scope.uploadMessage = "File: "+response.message+" uploaded.";
      $scope.uploadSuccess = true;
      $scope.getFileList();
    }, function(){
      $scope.uploadMessage = "File: "+file.name+" upload failed.";
      $scope.uploadSuccess =  false;
    });
  }


  $scope.uploadFileP = function(file){
    var deferred =  $q.defer();
    var getProgressListener = function(deferred) {
      return function(event) {
        $scope.lastProgress = $scope.progress;
        $scope.progress = event;
        deferred.notify();
      };
    };
    var formData = new FormData();

    formData.append('file', file);

    $.ajax({
      type: 'POST',
      url: "/uploadDone?path="+$scope.getPath(),
      data: formData,
      cache: false,
      contentType: false,
      processData: false,

      xhr: function() {
        var xmlHttpRequest = $.ajaxSettings.xhr();
        if (xmlHttpRequest.upload) {
         xmlHttpRequest.upload.addEventListener(
          'progress', getProgressListener(deferred), false);
       } else {
        console.log('Upload progress is not supported.');
      }
      return xmlHttpRequest;
    },
    success: function(response, textStatus, jqXHR) {
      deferred.resolve(response);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      deferred.reject(errorThrown);
    }
  });
    return deferred.promise;
  };

  $scope.dropbox = document.getElementById("drop");

  $scope.dropbox.addEventListener("drop", function(e) {
    e.stopPropagation();
    e.preventDefault();
    $scope.dropbox.classList.remove('hover');
    $scope.uploadFile(e.dataTransfer.files[0]);
  });

  $scope.dropbox.addEventListener("dragenter", function() {
    $scope.dropbox.classList.add('hover');
  });

  $scope.dropbox.addEventListener("dragleave", function() {
    $scope.dropbox.classList.remove('hover');
  });

  $scope.removeFile = function(file) {
    $http.get("/file/remove", {"params": {"file": $scope.getPath()+file}})
    .success(function(response) {
      $scope.getFileList();
    });
  };

  $scope.getFileList = function() {
    $http.get("list", {"params": {
      path: $scope.getPath(),
      search: $scope.search
    }})
    .success(function(response) {
      $scope.list = response;
    })
  };

  $scope.dropbox.ondragover = function() {
    return false;
  };

  $scope.enter = function(file) {
    $scope.main.path.push(file);
    $scope.getFileList();
  };

  $scope.getPath = function() {
    var retour = "";
    for (dir in $scope.main.path) {
      retour+=$scope.main.path[dir]+"/";
    }
    return retour;
  };

  $scope.main.path = [];
  $scope.getFileList();

}]);
