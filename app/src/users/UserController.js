(function(){

  angular
       .module('users')
       .controller('UserController', [
          'userService', 'userData', 'FacebookAnalitycs','SeacrhFacebookPerson', '$mdSidenav', '$mdBottomSheet', '$log', '$q',
          UserController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function UserController( userService,userData, FacebookAnalitycs,SeacrhFacebookPerson, $mdSidenav, $mdBottomSheet, $log, $q) {
    var self = this;

    self.selected     = null;
    self.users        = [ ];
    self.selectUser   = selectUser;
    self.toggleList   = toggleUsersList;
    self.share        = share;
      self.searchPerson = searchPerson;
      self.data = [];
    // Load all registered users
      self.options = {
          chart: {
              type: 'cumulativeLineChart',
              height: 450,
              margin : {
                  top: 20,
                  right: 20,
                  bottom: 60,
                  left: 65
              },
              x: function(d){ return d[0]; },
              y: function(d){ return d[1]; },
              average: function(d) { return d.mean/100; },

              color: d3.scale.category10().range(),
              transitionDuration: 300,
              useInteractiveGuideline: true,
              clipVoronoi: false,

              xAxis: {
                  axisLabel: 'Date',
                  tickFormat: function(d) {
                      return d3.time.format('%d %H:%m')(new Date(d))
                  },
                  showMaxMin: true,
                  staggerLabels: true
              },

              yAxis: {
                  axisLabel: 'Likes',
                  tickFormat: function(d){
                      return d3.format('.4f%')(d);
                  },
                  axisLabelDistance: 1
              }
          }
      };
      userData
          .loadAllUsersData()
          .then( function( allData ) {
                self.data = allData;
          });
    userService
          .loadAllUsers()
          .then( function( users ) {
            for (var item in users) {

                FacebookAnalitycs
                    .get(users[item].fid)
                    .then( function( datas ) {
                        self.users.push(datas);
                    });





                self.selected = self.users[0];

            }


          });

    // *********************************
    // Internal methods
    // *********************************
      self.toggleLeft = function() {
          $mdSidenav('left').toggle()
              .then(function(){
                  $log.debug("toggle left is done");
              });
      };
      self.toggleRight = function() {
          $mdSidenav('right').toggle()
              .then(function(){
                  $log.debug("toggle RIGHT is done");
              });
      };
      self.close = function() {
          $mdSidenav('left').close()
              .then(function(){
                  $log.debug("close LEFT is done");
              });
      };
    /**
     * First hide the bottomsheet IF visible, then
     * hide or Show the 'left' sideNav area
     */
    function toggleUsersList() {
      var pending = $mdBottomSheet.hide() || $q.when(true);

      pending.then(function(){
        $mdSidenav('left').toggle();
      });
    }

    /**
     * Select the current avatars
     * @param menuId
     */
    function selectUser ( user ) {

        userData.getData(user.id).then( function(data){
            self.selected = angular.isNumber(user) ? $scope.users[user] : user;
            self.data = data;
            self.options = self.options;
            self.toggleList();
        });

    }

    /**
     * Show the bottom sheet
     */
    function share($event) {
        var user = self.selected;

        $mdBottomSheet.show({
          parent: angular.element(document.getElementById('content')),
          templateUrl: '/src/users/view/contactSheet.html',
          controller: [ '$mdBottomSheet', UserSheetController],
          controllerAs: "vm",
          bindToController : true,
          targetEvent: $event
        }).then(function(clickedItem) {
          clickedItem && $log.debug( clickedItem.name + ' clicked!');
        });

        /**
         * Bottom Sheet controller for the Avatar Actions
         */
        function UserSheetController( $mdBottomSheet ) {
          this.user = user;
          this.items = [
            { name: 'Phone'       , icon: 'phone'       , icon_url: 'assets/svg/phone.svg'},
            { name: 'Twitter'     , icon: 'twitter'     , icon_url: 'assets/svg/twitter.svg'},
            { name: 'Google+'     , icon: 'google_plus' , icon_url: 'assets/svg/google_plus.svg'},
            { name: 'Hangout'     , icon: 'hangouts'    , icon_url: 'assets/svg/hangouts.svg'}
          ];
          this.performAction = function(action) {
            $mdBottomSheet.hide(action);
          };
        }
    }

      /**
       * Search function
       */
      function searchPerson( ) {

          SeacrhFacebookPerson
              .get( self.text)
              .then( function( datas ) {
                  self.users.push(datas);
              });
      }
  }

})();
