(function(){
  'use strict';

  angular.module('users')
        .service('userService', ['$q', '$http', UserService])
      .service('userData', ['$q', '$http', UserData])
        .service('FacebookAnalitycs', ['$q', '$http', FacebookAnalitycs])
        .service('SeacrhFacebookPerson', ['$q', '$http', SeacrhFacebookPerson]);

  /**
   * Users DataService
   * Uses embedded, hard-coded data model; acts asynchronously to simulate
   * remote data service call(s).
   *
   * @returns {{loadAll: Function}}
   * @constructor
   */
  function UserService($q, $http){
      var users = {};
      users.loadAllUsers = function() {
          var deferred = $q.defer();
          $http.get('/api/all/users')
              .then(function(response){
                  deferred.resolve(response.data);
              })
              .catch(function(response){
                  deferred.reject(response);
              });
          return deferred.promise;
      }

      return users;
  }

    function UserData($q, $http){
        var users = {};
        users.getData = function(param) {
            var deferred = $q.defer();
            $http.get('/api/'+param+'/status')
                .then(function(response){
                    deferred.resolve(response.data);
                })
                .catch(function(response){
                    deferred.reject(response);
                });
            return deferred.promise;
        },
        users.loadAllUsersData = function() {
            var deferred = $q.defer();
            $http.get('/api/all/status')
                .then(function(response){
                    deferred.resolve(response.data);
                })
                .catch(function(response){
                    deferred.reject(response);
                });
            return deferred.promise;
        }

        return users;
    }

    /**
     *
     */
    function FacebookAnalitycs($q, $http){
        var lng = {};
        lng.get = function(param) {
            var deferred = $q.defer();
            $http.get('https://graph.facebook.com/' + param + '?fields=id,name,is_verified,picture{url},cover,about,likes')
                .then(function(response){
                    deferred.resolve(response.data);
                })
                .catch(function(response){
                    deferred.reject(response);
                });
            return deferred.promise;
        }

        return lng;

        //https://www.facebook.com/profile.php?id=185643387303
        //https://www.facebook.com/pages/Kiszel-T%C3%BCnde-hivatalos-oldala/110882779067292
        //var access_token ='794122650601154|1DPhNia4bi3oxqrfbBRenCQfvM0';
    }

    function SeacrhFacebookPerson($q, $http) {
        var usr = {};
        usr.get = function(param) {
            var deferred = $q.defer();
            $http.get('https://graph.facebook.com/search?q=' + escape(param) + '&type=page&access_token=794122650601154|1DPhNia4bi3oxqrfbBRenCQfvM0')
                .then(function(response){
                    deferred.resolve(response.data);
                })
                .catch(function(response){
                    deferred.reject(response);
                });
            return deferred.promise;
        }

        return usr;
    }
})();
