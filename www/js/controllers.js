angular
  .module("app.controllers", [])
  .controller("menuCtrl", [
    "$scope",
    "$stateParams",
    "$ionicUser",
    "$ionicAuth",
    "$state",
    "$ionicSideMenuDelegate",
    "Users",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $ionicUser, $ionicAuth, $state, $ionicSideMenuDelegate, Users) {
      /*
    //--- UserData from Ionic
  	// Updated on 1/9/2017 to fix issues with logging
    // out and back in, as well as history issues with side menu + tabs.
  	function checkLoggedIn(){
        if ($ionicAuth.isAuthenticated()) {
            alert('isAuthenticated');
            // Make sure the user data is going to be loaded
            $ionicUser.load().then(function() {
            	$scope.userData = $ionicUser.details;
            });
        }else{
        	alert('notAuthenticated');
            $scope.userData = {}; 
        }
    }
    
    checkLoggedIn();
    
    $scope.$on('login_change', checkLoggedIn);

    $scope.logout = function(){
        $ionicAuth.logout();
        // Updated on 1/9/2017 to make sure the menu closes when
        // you log out so that it's closed if you log back in.
        $ionicSideMenuDelegate.toggleLeft(false);
        $state.go('login');
    }
*/

      $scope.userData = {};

      //--- UserData from Firebase
      function checkLoggedInFirebase() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            /* If the provider gives a display name, use the name for the
            personal welcome message. Otherwise, use the user's email. */
            /*
            user.getToken().then(function(idToken) {
              userIdToken = idToken;
              $scope.userData = Users.items[Users.items.$indexFor(user.uid)];
              console.log('Menu $scope.userData : ', $scope.userData);
            });
            */
            Users.items.$loaded().then(function(users) {
              $scope.userData = users[users.$indexFor(user.uid)];
              //console.log('Menu $loaded user : ', $scope.userData);
              Users.setUser($scope.userData);
            });
          } else {
            $ionicSideMenuDelegate.canDragContent(false);
            $state.go("login");
          }
        });
      }

      checkLoggedInFirebase();

      $scope.$on("login_change", checkLoggedInFirebase);

      $scope.logoutFirebase = function() {
        firebase.auth().signOut().then(
          function() {
            console.log("Logged out!");
            // Updated on 1/9/2017 to make sure the menu closes when
            // you log out so that it's closed if you log back in.
            $ionicSideMenuDelegate.toggleLeft(false); // forcer le menu à se fermer
            $state.go("login");
          },
          function(error) {
            console.log(error.code);
            console.log(error.message);
          }
        );
      };
    }
  ])
  .controller("carteCtrl", [
    "$scope",
    "$rootScope",
    "$stateParams",
    "$ionicLoading",
    "$ionicModal",
    "Categories",
    "$log",
    "$timeout",
    "$ionicPopup",
    "uiGmapGoogleMapApi",
    "Contributions",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal, Categories, $log, $timeout, $ionicPopup, uiGmapGoogleMapApi, Contributions) {
      $scope.categories = Categories.items; //liste de toutes les catégories dans Firebase
      $scope.categoriesSelected = []; //liste des catégories sélectionnées via la modal
      $scope.input = {
        searchInput: "",
        adresseInput: ""
      };

      $scope.modal = $ionicModal.fromTemplate(
        "<ion-modal-view>" +
          "<ion-header-bar class='bar-light'  item-input-inset>" +
          "<div class='bar bar-header bar-light item-input-inset' style='top:-5px'>" +
          "<label class='item-input-wrapper' >" +
          "<i class='icon ion-search placeholder-icon'></i>" +
          "<input type='search' ng-model='input.searchInput' placeholder='Search'>" +
          "</label>" +
          "<button class='button button-light icon ion-ios-close-outline' ng-click='clearSearchInput()' ng-show='input.searchInput !== \x22\x22'></button>" +
          "</div>   " +
          "<button class='button button-light icon ion-close-circled' ng-click='closeModal()'></button>" +
          "</ion-header-bar>" +
          "<ion-content padding='false'>" +
          "<ion-list>" +
          "<div ng-repeat='categorie in categories | filter:input.searchInput'>" +
          "<ion-item ng-class='{active: isGroupShown(categorie)}' style='padding: 0; margin: 0;'>" +
          "<button class='flat button button-block button-whrite text-royal' style='text-align: left;padding-left: 15px;' ng-click='setCategories(categorie)'>{{categorie.$id}} - {{categorie.name}}</button>" +
          "<button class='icon icon-chevron-categorie' ng-class='isGroupShown(categorie) ? \x22ion-chevron-up\x22 : \x22ion-chevron-down\x22' ng-click='toggleGroup(categorie)'></button>" +
          "</ion-item>" +
          "<ion-item ng-repeat='sous_categorie in categorie.sous_categories | filter:input.searchInput' class='item-accordion' ng-show='isGroupShown(categorie)'>" +
          "<button class='flat button button-block button-light text-royal' style='text-align: left;padding-left: 15px;' ng-click='setSousCategories(sous_categorie)'>{{sous_categorie.id}} - {{sous_categorie.name}}</button>" +
          "</ion-item>" +
          "</div>" +
          "</ion-list>" +
          "</ion-content>" +
          "</ion-modal-view>",
        {
          scope: $scope,
          animation: "slide-in-up"
        }
      );

      $scope.$watch(
        "input.adresseInput",
        function(newValue, oldValue) {
          if ($scope.input.adresseInput !== "") {
            document.getElementById("buttonShowModal").style.display = "none";
            document.getElementById("buttonClearAdresseInput").style.display = "";
          } else {
            document.getElementById("buttonClearAdresseInput").style.display = "none";
            document.getElementById("buttonShowModal").style.display = "";
          }
        },
        true
      );

      $scope.isSearchText = function() {
        if ($scope.input.adresseInput !== "") {
          document.getElementById("buttonShowModal").style.display = "none";
          document.getElementById("buttonClearAdresseInput").style.display = "";
        } else {
          document.getElementById("buttonClearAdresseInput").style.display = "none";
          document.getElementById("buttonShowModal").style.display = "";
        }
      };

      $scope.clearAdresseInput = function() {
        $scope.input.adresseInput = "";
        $scope.isSearchText();
      };

      $scope.clearSearchInput = function() {
        $scope.input.searchInput = "";
      };

      $scope.showModal = function() {
        $scope.modal.show();
      };

      $scope.closeModal = function() {
        $scope.modal.hide();
      };

      /*
    * if given group is the selected group, deselect it
    * else, select the given group
    */
      $scope.toggleGroup = function(group) {
        if ($scope.isGroupShown(group)) {
          $scope.shownGroup = null;
        } else {
          $scope.shownGroup = group;
        }
      };

      $scope.isGroupShown = function(group) {
        return $scope.shownGroup === group;
      };

      $scope.setCategories = function(categorie) {
        //console.log('Carte => setCategories : categorie : ', categorie);
        $scope.categoriesSelected = [];
        angular.forEach(categorie.sous_categories, function(sous_categories) {
          $scope.categoriesSelected.push(sous_categories.id[0]);
        });
        $scope.modal.hide().then(function() {
          $scope.changeCategoriePlace();
        });
      };

      $scope.setSousCategories = function(sousCategorie) {
        $scope.categoriesSelected = sousCategorie.id;
        //console.log('Carte => setCategories : $scope.categoriesSelected : ', $scope.categoriesSelected);
        $scope.modal.hide().then(function() {
          $scope.changeCategoriePlace();
        });
      };

      var geocoder = new google.maps.Geocoder();
      $scope.Gmap;
      $scope.search = {};

      var infowindow = new google.maps.InfoWindow({
        content: ""
      });

      $scope.map = {
        center: {
          latitude: 48.866667, // Paris centre
          longitude: 2.333333 // Paris centre
        },
        control: {},
        zoom: 13,
        options: {
          disableDefaultUI: true,
          clickableIcons: false,
          cluster: {
            styles: [
              {
                url: "img/m2.png",
                width: 53,
                height: 50,
                textColor: "white",
                textSize: 14
              }
            ]
          }
        },
        events: {
          idle: function(map) {
            //console.log("Carte map event idle : ", map.getBounds());
            var bounds = map.getBounds();
            $scope.map.searchbox.options.bounds = bounds;
            $scope.updateBounds(map);
          },
          zoom_changed: function(map) {
            //console.log("Carte map event zoom_changed : ", map.getBounds());
            var bounds = map.getBounds();
            $scope.map.searchbox.options.bounds = bounds;
            $scope.updateBounds(map);
          }
        },
        searchbox: {
          events: {
            places_changed: function(searchBox) {
              var placesResult = searchBox.getPlaces();
              //console.log("Carte  map event places_changed : ", placesResult);
              if ($scope.input.adresseInput.toLowerCase() === "paki") {
                $scope.isContributions = true;
                $scope.showPaki();
              } else {
                $scope.isContributions = false;
                createMarker(placesResult);
              }
            }
          },
          options: {
            bounds: {}
          },
          parentdiv: "div-adresse-input",
          template: "templates/searchbox.html"
        },
        markers: {
          placesContribute: {
            markers: [],
            options: {
              icon: {
                url: "img/location-pin-green.svg"
              }
            }
          },
          placesOpen: {
            markers: [],
            options: {
              icon: {
                url: "img/location-pin-green.svg"
              }
            }
          },
          placesClose: {
            markers: [],
            options: {
              icon: {
                url: "img/location-pin-red.svg"
              }
            }
          },
          placesOther: {
            markers: [],
            options: {
              icon: {
                url: "img/location-pin-blue.svg"
              }
            }
          },
          markerClick: function(marker, eventName, model, args) {
            //console.log("Clicked");
            $scope.map.infowindow.model = model;
            console.log("Carte PlacesService marker : ", marker);

            if (!$scope.map.infowindow.show) {
              var service = new google.maps.places.PlacesService($scope.Gmap);
              service.getDetails({ placeId: marker.model.place_id }, function(place, status) {
                console.log("Carte PlacesService details place : ", place);
                if (!$scope.isContributions) $scope.map.infowindow.model.place = place;
                $timeout(function() {
                  $scope.map.infowindow.show = true;
					      }, 100);
              });
            } else {
              $scope.map.infowindow.show = false;
            }
          }
        },
        infowindow: {
          model: {},
          show: false,
          template: "templates/infowindow.html",
          options: {
            pixelOffset: { width: 0, height: -15 }
          },
          closeClick: function(marker, eventName, model) {
            //console.log("Close!!");
            $scope.map.infowindow.show = false;
          }
        }
      };

      uiGmapGoogleMapApi.then(function(uiMap) {
        $scope.centerMap();
      });

      $scope.centerOnMe = function() {
        //console.log("Carte Getting current location");
        $ionicLoading.show({
          template: "Getting current location",
          duration: 10000
        });
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            $scope.setCenter(pos.coords.latitude, pos.coords.longitude);
            $ionicLoading.hide();
          },
          function(error) {
            $log.error("Unable to get location", error);
            $ionicLoading.hide();
          }
        );
      };

      $scope.setCenter = function(lat, lng) {
        //console.log("got location", { lat, lng });
        $scope.search.lat = lat;
        $scope.search.lng = lng;
        $scope.map.zoom = 16;
        $scope.map.position = {
          id: "position",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 1.0,
            fillColor: "#4D90FE",
            strokeColor: "#ffffff",
            strokeWeight: 2.0,
            scale: 7
          },
          coords: {
            latitude: $scope.search.lat,
            longitude: $scope.search.lng
          }
        };
        $scope.centerMap();
      };

      $scope.centerMap = function() {
        //console.log("Centering");
        if (Object.keys($scope.search).length === 0) {
          //console.log("centerOnMe again");
          $scope.centerOnMe();
        } else {
          $scope.map.center.latitude = $scope.search.lat;
          $scope.map.center.longitude = $scope.search.lng;
          //console.log("Carte Centering $scope.Gmap : ", $scope.Gmap);
          if (undefined !== $scope.Gmap) {
            var latlng = new google.maps.LatLng($scope.search.lat, $scope.search.lng);
            $scope.Gmap.setCenter(latlng);
            //console.log("Centering $scope.Gmap");
          }
        }
      };

      $scope.updateBounds = function(map) {
        $scope.Gmap = map;
        //var latlng = new google.maps.LatLng(map.center.lat(), map.center.lng());
        var bounds = $scope.Gmap.getBounds();
        $scope.map.searchbox.options.bounds = new google.maps.LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast());
        //console.log("updateBounds searchbox bounds: ", $scope.map.searchbox.options.bounds);
        //var distance = Math.sqrt(Math.pow(69.1 / 1.61 * (ne.lat() - sw.lat()), 2) + Math.pow(53 / 1.61 * (ne.lng() - sw.lng()), 2)) / 2;
      };

      // Adds a marker to the map and push to the array.
      function createMarker(placesResult) {
        //console.log("Markers a creer pour les 'places' :", placesResult);
        var bounds = new google.maps.LatLngBounds();
        $scope.map.markers.placesOpen.markers = [];
        $scope.map.markers.placesClose.markers = [];
        $scope.map.markers.placesOther.markers = [];

        var bounds = $scope.Gmap.getBounds();
        var swPoint;
        var nePoint;
        var swLat;
        var swLng;
        var neLat;
        var neLng;

        var day = new Date();
        var cptMarker = 0;

        for (var i = 0; i < placesResult.length; ++i) {
          var place = placesResult[i];
          var isMarkerOK = true;
          var isOpen = false;
          swPoint = bounds.getSouthWest();
          nePoint = bounds.getNorthEast();
          swLat = swPoint.lat();
          swLng = swPoint.lng();
          neLat = nePoint.lat();
          neLng = nePoint.lng();

          if ($scope.isContributions) {
            if (place.valided && swLat < place.geometry.location.lat && place.geometry.location.lat < neLat && swLng < place.geometry.location.lng && place.geometry.location.lng < neLng) {
              isMarkerOK = true;

              var timeCurrent = (day.getHours() < 10 ? "0" + day.getHours() : day.getHours()) + "" + (day.getMinutes() < 10 ? "0" + day.getMinutes() : day.getMinutes());

              if (place.opening_hours.periods[day.getDay()].checked && place.opening_hours.periods[day.getDay()].open.time <= timeCurrent && place.opening_hours.periods[day.getDay()].close.time > timeCurrent) {
                place.opening_hours.open_now = true;
              } else {
                place.opening_hours.open_now = false;
              }
            } else {
              isMarkerOK = false;
            }
          }

          if (isMarkerOK) {
            //console.log("Markers isMarkerOK :", place);

            cptMarker++;

            var marker = {
              id: place.place_id,
              place_id: place.place_id,
              latitude: $scope.isContributions ? place.geometry.location.lat : place.geometry.location.lat(),
              longitude: $scope.isContributions ? place.geometry.location.lng : place.geometry.location.lng(),
              place: place,
              etat: ""
            };

            var latlng = new google.maps.LatLng(marker.latitude, marker.longitude);
            bounds.extend(latlng);

            if (place.opening_hours && place.opening_hours.open_now) {
              //console.log("Markers Open :", marker);
              marker.etat = "Ouvert";
              $scope.map.markers.placesOpen.markers.push(marker);
            } else if (place.opening_hours && !place.opening_hours.open_now) {
              //console.log("Markers Close :", marker);
              marker.etat = "Fermé";
              $scope.map.markers.placesClose.markers.push(marker);
            } else {
              //console.log("Markers Other :", marker);
              marker.etat = "Pas d'horaire indiqué";
              $scope.map.markers.placesOther.markers.push(marker);
            }
          }
        }

        if (cptMarker > 0) {
          $scope.Gmap.fitBounds(bounds); // Permet de zoomer/dezoomer en fonction du nombre de resultat
          //google.maps.event.trigger($scope.Gmap, 'resize');
          //console.log("Markers  : nombre de 'places' :", placesResult.length);
          if (placesResult.length < 2) {
            //$scope.Gmap.fitBounds(placesResult[0].geometry.viewport); // Permet de zoomer/dezoomer en fonction du resultat (point précis, ville, pays, ...)
          }
        }
      }

      $scope.changeCategoriePlace = function(event, args) {
        //console.log("reloadNearbySearch => $scope.categoriesSelected : ", $scope.categoriesSelected);
        if ($scope.categoriesSelected[0] === "Paki") {
          $scope.isContributions = true;
          $scope.showPaki();
        } else {
          $scope.isContributions = false;
          var service = new google.maps.places.PlacesService($scope.Gmap); //Appel webService Google nearbySearch
          service.nearbySearch(
            {
              location: $scope.Gmap.center,
              bounds: $scope.Gmap.getBounds(),
              types: $scope.categoriesSelected
              //openNow: true
            },
            function(placesResult, status, pagination) {
              //console.log("service.nearbySearch => results : ", placesResult);
              //console.log("service.nearbySearch => status : ", status);
              //console.log("service.nearbySearch => pagination : ", pagination);

              if (status === google.maps.places.PlacesServiceStatus.OK) {
                createMarker(placesResult);
              }
            }
          );
        }
      };

      $scope.showPaki = function() {
        createMarker(Contributions.getAllItems());
        /*
        var alertPopup = $ionicPopup
          .alert({
            //cssClass: 'danger',
            title: "Coming soon !",
            template: "Les pakis arrivent bientôt ;)",
            buttons: [
              {
                text: "Ok",
                type: "button-positive"
              }
            ]
          })
          .then(function(res) {
            //console.log("Fermeture alerte");
          });
        */
      };
    }
  ])
  .controller("contributionCtrl", [
    "$scope",
    "$stateParams",
    "$state",
    "$ionicLoading",
    "$ionicPopup",
    "Contributions",
    "$log",
    "$timeout",
    "uiGmapGoogleMapApi",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $state, $ionicLoading, $ionicPopup, Contributions, $log, $timeout, uiGmapGoogleMapApi) {
      $scope.item = Contributions.getItem();
      //console.log('ContributionCtrl =>$scope.item  : ', $scope.item );

      $scope.isGooglePlaceSelected = true;
      $scope.lbGooglePlaceSelected = "";

      if (!$scope.item.$id) {
        $scope.item = {
          //'valided' : false,
          siteweb: "",
          geometry: { location: { lat: "", lng: "" } },
          icon: "",
          id: "",
          name: "",
          opening_hours: {
            open_now: false,
            periods: [
              {
                close: {
                  time: "2400",
                  hours: 24,
                  minutes: 0
                },
                open: {
                  time: "0000",
                  hours: 0,
                  minutes: 0
                },
                checked: false,
                day: 0,
                name: "dimanche",
                timeValue: {
                  open: 0,
                  close: 14.4
                }
              },
              {
                close: {
                  time: "2400",
                  hours: 24,
                  minutes: 0
                },
                open: {
                  time: "0000",
                  hours: 0,
                  minutes: 0
                },
                day: 1,
                checked: false,
                name: "lundi",
                timeValue: {
                  open: 0,
                  close: 14.4
                }
              },
              {
                close: {
                  time: "2400",
                  hours: 24,
                  minutes: 0
                },
                open: {
                  time: "0000",
                  hours: 0,
                  minutes: 0
                },
                day: 2,
                checked: false,
                name: "mardi",
                timeValue: {
                  open: 0,
                  close: 14.4
                }
              },
              {
                close: {
                  time: "2400",
                  hours: 24,
                  minutes: 0
                },
                open: {
                  time: "0000",
                  hours: 0,
                  minutes: 0
                },
                day: 3,
                checked: false,
                name: "mercredi",
                timeValue: {
                  open: 0,
                  close: 14.4
                }
              },
              {
                close: {
                  time: "2400",
                  hours: 24,
                  minutes: 0
                },
                open: {
                  time: "0000",
                  hours: 0,
                  minutes: 0
                },
                day: 4,
                checked: false,
                name: "jeudi",
                timeValue: {
                  open: 0,
                  close: 14.4
                }
              },
              {
                close: {
                  time: "2400",
                  hours: 24,
                  minutes: 0
                },
                open: {
                  time: "0000",
                  hours: 0,
                  minutes: 0
                },
                day: 5,
                checked: false,
                name: "vendredi",
                timeValue: {
                  open: 0,
                  close: 14.4
                }
              },
              {
                close: {
                  time: "2400",
                  hours: 24,
                  minutes: 0
                },
                open: {
                  time: "0000",
                  hours: 0,
                  minutes: 0
                },
                day: 6,
                checked: false,
                name: "Samedi",
                timeValue: {
                  open: 0,
                  close: 14.4
                }
              }
            ],
            weekday_text: ["lundi: 00:00 – 24:00", "mardi: 00:00 – 24:00", "mercredi: 00:00 – 24:00", "jeudi: 00:00 – 24:00", "vendredi: 00:00 – 24:00", "samedi: 00:00 – 24:00", "dimanche: 00:00 – 24:00"]
          },
          place_id: "",
          rating: "",
          reference: "",
          scope: "",
          types: [""],
          vicinity: "",
          address_components: [{ long_name: "", short_name: "", types: ["route"] }, { long_name: "", short_name: "", types: ["locality", "political"] }, { long_name: "", short_name: "", types: ["country", "political"] }, { long_name: "", short_name: "", types: ["postal_code"] }],
          formatted_address: "",
          formatted_phone_number: ""
        };
      } else {
        //$scope.isGooglePlaceSelected = true;
        $scope.lbGooglePlaceSelected = $scope.item.formatted_address;
      }

      $scope.$watch(
        "item.formatted_address",
        function(newValue, oldValue) {
          if (newValue !== $scope.lbGooglePlaceSelected) {
            $scope.isGooglePlaceSelected = false;
          }
        },
        true
      );

      /*
      // Gestion des 2 ranges
      $scope.setTime = function(value, day, type) {
        var hours = Math.floor(value / 0.6);
        var minutes = Math.round((value - hours * 0.6) * 100);

        if (type === "open") {
          $scope.item.opening_hours.periods[day].open.hours = hours;
          $scope.item.opening_hours.periods[day].open.minutes = minutes;
          $scope.item.opening_hours.periods[day].open.time = (hours < 10 ? "0" + hours.toString() : hours.toString()) + (minutes < 10 ? "00" : minutes.toString());
        }
        if (type === "close") {
          $scope.item.opening_hours.periods[day].close.hours = hours;
          $scope.item.opening_hours.periods[day].close.minutes = minutes;
          $scope.item.opening_hours.periods[day].close.time = (hours < 10 ? "0" + hours.toString() : hours.toString()) + (minutes < 10 ? "00" : minutes.toString());
        }
      };
      */
      angular.element(document).ready(function() {
        var sliders = [];
        sliders = document.getElementsByClassName("sliders_time");

        for (var i = 0; i < sliders.length; i++) {
          noUiSlider.create(sliders[i], {
            start: [$scope.item.opening_hours.periods[i].timeValue.open, $scope.item.opening_hours.periods[i].timeValue.close],
            step: 0.3,
            tooltips: [true, true],
            connect: true,
            //padding: 10,
            range: {
              min: 0,
              max: 14.4
            },
            behaviour: "tap-drag",
            format: {
              to: function(value) {
                var hour = Math.floor(value / 0.6);
                //console.log("value : "+value+" - Math.round(value % 0.6 * 100) / 100 : "+Math.round(value % 0.6 * 100) / 100);
                hour = hour < 10 ? "0" + hour.toString() : hour.toString();
                if (Math.round(value % 0.6 * 100) / 100 == 0 || Math.round(value % 0.6 * 100) / 100 == 0.6) {
                  //le || est pour fixer un bug : le modulo return 0.6 au lieu de 0 de temps en temps (pour 13.2%0.6 => 22:00 = 13.2))
                  minutes = "00";
                } else {
                  minutes = "30";
                }
                return hour + ":" + minutes;
              },
              from: function(value) {
                return value;
              }
            }
          });
          sliders[i].noUiSlider.on("change", addValues);
        }

        function addValues(lChange) {
          var allValues = [];
          var time = [];
          var timeOpen = [];
          var timeClose = [];

          for (var i = 0; i < sliders.length; i++) {
            console.log("for allValues : ", allValues.push(sliders[i].noUiSlider.get()));
            console.log("for sliders[i] : ", sliders[i].noUiSlider.get());
            time = sliders[i].noUiSlider.get();

            timeOpen = time[0].split(":");
            $scope.item.opening_hours.periods[i].open.hours = Number(timeOpen[0]);
            $scope.item.opening_hours.periods[i].open.minutes = Number(timeOpen[1]);
            $scope.item.opening_hours.periods[i].open.time = timeOpen[0] + timeOpen[1];
            $scope.item.opening_hours.periods[i].timeValue.open = Math.round((Number(timeOpen[0]) * 0.6 + (Number(timeOpen[1]) != 0 ? 0.3 : 0)) * 100) / 100;

            timeClose = time[1].split(":");
            $scope.item.opening_hours.periods[i].close.hours = Number(timeClose[0]);
            $scope.item.opening_hours.periods[i].close.minutes = Number(timeClose[1]);
            $scope.item.opening_hours.periods[i].close.time = timeClose[0] + timeClose[1];
            $scope.item.opening_hours.periods[i].timeValue.close = Math.round((Number(timeClose[0]) * 0.6 + (Number(timeOpen[1]) != 0 ? 0.3 : 0)) * 100) / 100;
          }

          console.log("allValues : ", allValues);
        }

        /*
        for (var i = 0; i < $scope.item.opening_hours.periods.length; i++) {
          var slider = document.getElementById("slider_" + i);

          noUiSlider.create(slider, {
            start: [$scope.item.opening_hours.periods[i].timeValue.open, $scope.item.opening_hours.periods[i].timeValue.close],
            step: 0.3,
            tooltips: [true, true],
            connect: true,
            range: {
              min: 0,
              max: 14.4
            },
            behaviour: "tap-drag",
            format: {
              to: function(value) {
                var hour = Math.floor(value / 0.6);
                hour = hour < 10 ? "0" + hour.toString() : hour.toString();
                if (Math.round(value % 0.6 * 100) / 100 == 0) {
                  minutes = "00";
                } else {
                  minutes = "30";
                }
                return hour + ":" + minutes;
              },
              from: function(value) {
                return value;
              }
            }
          });

          slider.noUiSlider.on("update", function(values, handle, unencoded) {
            console.log("update values : " + values);
            console.log("update handle : " + handle);
            console.log("update unencoded : " + unencoded);
          });
        }
        */
      });

      $scope.toggleValided = function(form) {
        if (form.$valid) {
          if ($scope.item.valided) {
            document.getElementById("contribution-novalid").style.display = "none";
            document.getElementById("contribution-add").style.display = "none";
            document.getElementById("contribution-maj").style.display = "";
            document.getElementById("contribution-valide").style.display = "";
            document.getElementById("contribution-delete").style.display = "";
            document.getElementById("contribution-button-bar").style.display = "";
            Contributions.setValided($scope.item, false);
            //$state.go("tabsController.contribution");
          } else {
            document.getElementById("contribution-add").style.display = "none";
            document.getElementById("contribution-maj").style.display = "none";
            document.getElementById("contribution-valide").style.display = "none";
            document.getElementById("contribution-delete").style.display = "none";
            document.getElementById("contribution-button-bar").style.display = "none";
            document.getElementById("contribution-novalid").style.display = "";
            Contributions.setValided($scope.item, true);
            $state.go("tabsController.contributionValide");
          }
        } else {
          //console.log('Contribution => addItem NOK : ', form)
          var alertPopup = $ionicPopup
            .alert({
              //cssClass: 'danger',
              title: "Erreur !",
              template: "Champs en erreur !",
              buttons: [
                {
                  text: "Ok",
                  type: "button-assertive"
                }
              ]
            })
            .then(function(res) {
              //console.log("Fermeture alerte");
            });
        }
      };

      $scope.updateWeekdayText = function() {
        for (var i = 0; i < $scope.item.opening_hours.periods.length; i++) {
          if ($scope.item.opening_hours.periods[i].checked) {
            if ($scope.item.opening_hours.periods[i].open.time === "0000" && $scope.item.opening_hours.periods[i].close.time === "2400") {
              $scope.item.opening_hours.weekday_text[i] = $scope.item.opening_hours.periods[i].name + ": Ouvert 24h/24";
            } else {
              $scope.item.opening_hours.weekday_text[i] = $scope.item.opening_hours.periods[i].name + ": " + $scope.item.opening_hours.periods[i].open.time.substr(0, 2) + ":" + $scope.item.opening_hours.periods[i].open.time.substr(2, 2) + " - " + $scope.item.opening_hours.periods[i].close.time.substr(0, 2) + ":" + $scope.item.opening_hours.periods[i].close.time.substr(2, 2);
            }
          } else {
            $scope.item.opening_hours.weekday_text[i] = $scope.item.opening_hours.periods[i].name + ": Fermé";
          }
        }
      };

      $scope.addItem = function(form) {
        if (form.$valid && $scope.isGooglePlaceSelected) {
          //console.log("Contribution => addItem : ", $scope.item);
          $scope.updateWeekdayText();
          Contributions.addItem($scope.item);
          $state.go("tabsController.contributions");
        } else {
          //console.log('Contribution => addItem NOK : ', form)
          var alertPopup = $ionicPopup
            .alert({
              //cssClass: 'danger',
              title: "Erreur !",
              template: "Champs en erreur !",
              buttons: [
                {
                  text: "Ok",
                  type: "button-assertive"
                }
              ]
            })
            .then(function(res) {
              //console.log("Fermeture alerte");
            });
        }
      };

      $scope.updateItem = function(form) {
        if (form.$valid && $scope.isGooglePlaceSelected) {
          $scope.updateWeekdayText();
          Contributions.updateItem($scope.item);
          $state.go("tabsController.contributions");
        } else {
          //console.log('Contribution => updateItem NOK : ', form)
          var alertPopup = $ionicPopup
            .alert({
              //cssClass: 'danger',
              title: "Erreur !",
              template: "Champs en erreur !",
              buttons: [
                {
                  text: "Ok",
                  type: "button-assertive"
                }
              ]
            })
            .then(function(res) {
              //console.log("Fermeture alerte");
            });
        }
      };

      $scope.deleteItem = function() {
        var confirmPopup = $ionicPopup
          .confirm({
            title: "Supprimer",
            template: "OK ?",
            cancelText: "Non",
            okText: "Oui"
          })
          .then(function(res) {
            if (res) {
              Contributions.deleteItem($scope.item);
              //console.log('Contribution => deleteItem : confirmed');
              $state.go("tabsController.contributions");
            }
          });
      };

      // Triggered on a button click, or some other target
      $scope.showConfirmPopup = function() {
        var alertPopup = $ionicPopup
          .alert({
            title: "C'est fait !",
            template: "Enregistrement effectué."
          })
          .then(function(res) {
            //console.log("Profil enregistré");
          });
      };

      var geocoder = new google.maps.Geocoder();
      $scope.Gmap;
      $scope.search = {};

      $scope.marker = {
        id: 0,
        coords: {
          latitude: 48.866667,
          longitude: 2.333333
        },
        options: { draggable: true },
        events: {
          dragend: function(marker, eventName, args) {
            //console.log("Contribution marker dragend : ", marker);
            var lat = marker.getPosition().lat();
            var lon = marker.getPosition().lng();
            $log.log(lat);
            $log.log(lon);
            //console.log("contribution on continue lat : ", lat);
            //console.log("contribution on continue lon : ", lon);
            $scope.marker.options.labelContent = "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude;
            //console.log("contribution Markers  $scope.marker :", $scope.marker);
            geocoder.geocode(
              {
                latLng: marker.getPosition()
              },
              function(responses) {
                //console.log("contribution Markers geocoder.geocode :", responses);
                if (responses.length > 0) {
                  $scope.isGooglePlaceSelected = true;
                  $scope.updateItemInfoMap(responses[0]);
                }
              }
            );
          }
          /*
          click: function(gMarker, eventName, model) {
            var service = new google.maps.places.PlacesService($scope.Gmap);
            service.getDetails({ placeId: $scope.marker.id }, function(place, status) {
              console.log("PlacesService details place : ", place);
            });
          }
          */
        }
      };

      $scope.map = {
        center: {
          latitude: 48.866667, // Paris centre
          longitude: 2.333333 // Paris centre
        },
        control: {},
        zoom: 16,
        options: {
          disableDefaultUI: true,
          clickableIcons: false
        },
        events: {
          idle: function(map) {
            console.log("Contribution idle $state : ", $state);
            if ($state.current.name === "tabsController.contribution_tab3" || $state.current.name === "tabsController.contribution_tab4") {
              console.log("Contribution map event idle : ", map.getBounds());
              var bounds = map.getBounds();
              $scope.map.searchbox.options.bounds = bounds;
              $scope.updateBounds(map);
            }
          },
          zoom_changed: function(map) {
            console.log("Contribution zoom_changed $state : ", $state);
            if ($state.current.name === "tabsController.contribution_tab3" || $state.current.name === "tabsController.contribution_tab4") {
              console.log("Contribution map event zoom_changed : ", map.getBounds());
              var bounds = map.getBounds();
              $scope.map.searchbox.options.bounds = bounds;
              $scope.updateBounds(map);
            }
          }
        },
        searchbox: {
          events: {
            places_changed: function(searchBox) {
              //console.log("Contribution places_changed searchBox.getPlaces() : ", searchBox.getPlaces());
              $scope.isGooglePlaceSelected = true;
              var placesResult = searchBox.getPlaces();
              if (placesResult.length > 0) {
                $scope.updateItemInfoMap(placesResult[0]);
                var bounds = new google.maps.LatLngBounds();
                if (placesResult[0].geometry.viewport) {
                  // Only geocodes have viewport.
                  bounds.union(placesResult[0].geometry.viewport);
                } else {
                  bounds.extend(placesResult[0].geometry.location);
                }
                $scope.Gmap.fitBounds(bounds);
              }
            }
          },
          options: {
            //type: ["address"],
            bounds: {}
          },
          parentdiv: "div-contribution-adresse-input",
          template: "templates/searchbox.html"
        }
      };

      uiGmapGoogleMapApi.then(function(uiMap) {
        $scope.centerMap();
      });

      $scope.centerOnMe = function(isCliked) {
        //console.log("Contribution  Getting current location");
        $ionicLoading.show({
          template: "Getting current location",
          duration: 10000
        });
        if ($scope.item.$id && !isCliked) {
          $scope.setCenter($scope.item.geometry.location.lat, $scope.item.geometry.location.lng);
          $ionicLoading.hide();
        } else {
          navigator.geolocation.getCurrentPosition(
            function(pos) {
              $scope.setCenter(pos.coords.latitude, pos.coords.longitude);
              $ionicLoading.hide();
            },
            function(error) {
              $log.error("Contribution Unable to get location", error);
              $ionicLoading.hide();
            }
          );
        }
      };

      $scope.setCenter = function(lat, lng) {
        //console.log("Contribution  got location", { lat, lng });
        $scope.search.lat = lat;
        $scope.search.lng = lng;
        $scope.map.zoom = 16;
        $scope.map.position = {
          id: "position",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 1.0,
            fillColor: "#4D90FE",
            strokeColor: "#ffffff",
            strokeWeight: 2.0,
            scale: 7
          },
          coords: {
            latitude: $scope.search.lat,
            longitude: $scope.search.lng
          }
        };
        $scope.centerMap();
      };

      $scope.centerMap = function() {
        //console.log("Contribution Centering");
        if (Object.keys($scope.search).length === 0) {
          //console.log("Contribution centerOnMe again");
          $scope.centerOnMe();
        } else {
          $scope.map.center.latitude = $scope.search.lat;
          $scope.map.center.longitude = $scope.search.lng;
          //console.log("Contribution Centering $scope.Gmap : ", $scope.Gmap);
          if (undefined !== $scope.Gmap) {
            var latlng = new google.maps.LatLng($scope.search.lat, $scope.search.lng);
            $scope.Gmap.setCenter(latlng);
            //console.log("Contribution Centering $scope.Gmap");
          }
        }
      };

      $scope.updateBounds = function(map) {
        $scope.Gmap = map;
        //console.log("contribution $scope.Gmap :", $scope.Gmap);
        //var latlng = new google.maps.LatLng(map.center.lat(), map.center.lng());
        $scope.marker.coords.latitude = map.center.lat();
        $scope.marker.coords.longitude = map.center.lng();
        $timeout(function() {
          $scope.marker.options.labelContent = "lat: " + $scope.marker.coords.latitude + " " + "lon: " + $scope.marker.coords.longitude;
          //console.log("contribution Marker :", $scope.marker);
          var bounds = $scope.Gmap.getBounds();
          $scope.map.searchbox.options.bounds = new google.maps.LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast());
          geocoder.geocode(
            {
              latLng: new google.maps.LatLng($scope.marker.coords.latitude, $scope.marker.coords.longitude)
            },
            function(responses) {
              //console.log("contribution Markers geocoder.geocode :", responses);
              if (responses.length > 0) {
                $scope.updateItemInfoMap(responses[0]);
              }
            }
          );
        }, 400);
        //console.log("updateBounds searchbox bounds: ", $scope.map.searchbox.options.bounds);
        //var distance = Math.sqrt(Math.pow(69.1 / 1.61 * (ne.lat() - sw.lat()), 2) + Math.pow(53 / 1.61 * (ne.lng() - sw.lng()), 2)) / 2;
      };

      $scope.updateItemInfoMap = function(place) {
        //console.log("contribution updateItemInfoMap :", place);
        $timeout(function() {
          //$scope.marker.id = place.place_id;
          $scope.lbGooglePlaceSelected = place.formatted_address;
          $scope.item.place_id = place.place_id;
          $scope.item.formatted_address = place.formatted_address;
          $scope.item.address_components = place.address_components;
          $scope.item.geometry.location.lat = place.geometry.location.lat();
          $scope.item.geometry.location.lng = place.geometry.location.lng();
          //console.log("contribution updateItemInfoMap :", place);
          //console.log("contribution $scope.item :", $scope.item);
        }, 400);
      };
    }
  ])
  .controller("contributionValideCtrl", [
    "$scope",
    "$stateParams",
    "$state",
    "$ionicLoading",
    "$ionicPopup",
    "Contributions",
    "$log",
    "$timeout",
    "uiGmapGoogleMapApi",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $state, $ionicLoading, $ionicPopup, Contributions, $log, $timeout, uiGmapGoogleMapApi) {
      $scope.item = Contributions.getItem();
      //console.log('ContributionCtrl =>$scope.item  : ', $scope.item );

      $scope.isGooglePlaceSelected = true;
      $scope.lbGooglePlaceSelected = "";

      if ($scope.item.$id) {
        //$scope.isGooglePlaceSelected = true;
        $scope.lbGooglePlaceSelected = $scope.item.formatted_address;
      }

      $scope.toggleValided = function() {
        Contributions.setValided($scope.item, false);
        $state.go("tabsController.contribution");
      };

      // Triggered on a button click, or some other target
      $scope.showConfirmPopup = function() {
        var alertPopup = $ionicPopup
          .alert({
            title: "C'est fait !",
            template: "Enregistrement effectué."
          })
          .then(function(res) {
            //console.log("Profil enregistré");
          });
      };

      $scope.Gmap;
      $scope.search = {};

      $scope.marker = {
        id: 0,
        coords: {
          latitude: $scope.item.geometry.location.lat,
          longitude: $scope.item.geometry.location.lng
        },
        options: { draggable: false }
      };

      $scope.map = {
        center: {
          latitude: $scope.item.geometry.location.lat, // Localsation de la contribution
          longitude: $scope.item.geometry.location.lng // Localsation de la contribution
        },
        zoom: 16,
        options: {
          draggable: false,
          disableDoubleClickZoom: true,
          disableDefaultUI: true,
          clickableIcons: false,
          zoomControl: false,
          scrollwheel: false
        }
      };

      uiGmapGoogleMapApi.then(function(uiMap) {
        $scope.centerMap();
      });

      $scope.centerOnMe = function(isCliked) {
        //console.log("Contribution  Getting current location");
        $ionicLoading.show({
          template: "Getting current location",
          duration: 10000
        });
        if ($scope.item.$id && !isCliked) {
          $scope.setCenter($scope.item.geometry.location.lat, $scope.item.geometry.location.lng);
          $ionicLoading.hide();
        } else {
          navigator.geolocation.getCurrentPosition(
            function(pos) {
              $scope.setCenter(pos.coords.latitude, pos.coords.longitude);
              $ionicLoading.hide();
            },
            function(error) {
              $log.error("Contribution Unable to get location", error);
              $ionicLoading.hide();
            }
          );
        }
      };

      $scope.setCenter = function(lat, lng) {
        //console.log("Contribution  got location", { lat, lng });
        $scope.search.lat = lat;
        $scope.search.lng = lng;
        $scope.map.zoom = 16;
        $scope.centerMap();
      };

      $scope.centerMap = function() {
        //console.log("Contribution Centering");
        if (Object.keys($scope.search).length === 0) {
          //console.log("Contribution centerOnMe again");
          $scope.centerOnMe();
        } else {
          $scope.map.center.latitude = $scope.search.lat;
          $scope.map.center.longitude = $scope.search.lng;
          //console.log("Contribution Centering $scope.Gmap : ", $scope.Gmap);
          if (undefined !== $scope.Gmap) {
            var latlng = new google.maps.LatLng($scope.search.lat, $scope.search.lng);
            $scope.Gmap.setCenter(latlng);
            //console.log("Contribution Centering $scope.Gmap");
          }
        }
      };
    }
  ])
  .controller("contributionsCtrl", [
    "$scope",
    "$stateParams",
    "$state",
    "Contributions",
    "$ionicPopup",
    "$timeout",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $state, Contributions, $ionicPopup, $timeout) {
      $scope.input = {
        searchInput: ""
      };

      // handle event
      $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.items = Contributions.getAllItems();
        //console.log("Contributions => ionicView.beforeEnter : $scope.items: ", $scope.items);
      });

      $scope.setContribution = function(item) {
        Contributions.setItem(item);
        $state.go("tabsController.contribution");
      };

      $scope.addContribution = function() {
        Contributions.setItem({});
        $state.go("tabsController.contribution");
      };

      $scope.deleteItem = function(item) {
        var confirmPopup = $ionicPopup
          .confirm({
            title: "Supprimer",
            template: "OK ?",
            cancelText: "Non",
            okText: "Oui"
          })
          .then(function(res) {
            if (res) {
              Contributions.deleteItem(item);
              //console.log('Contribution => deleteItem : confirmed');
              $state.go("tabsController.contributions");
            }
          });
      };

      $scope.refreshTasks = function() {
        $timeout(function() {
          $scope.items = Contributions.getAllItemsFirebase();
          //console.log("Contributions => Refreshing : $scope.items: ", $scope.items);
          $scope.$broadcast("scroll.refreshComplete");
        }, 1000);
      };
    }
  ])
  .controller("contributionsValidesCtrl", [
    "$scope",
    "$stateParams",
    "$state",
    "Contributions",
    "$timeout",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $state, Contributions, $timeout) {
      //$scope.items = Contributions.items;
      //console.log("contributionsCtrl $scope.items: ", $scope.items);
      $scope.input = {
        searchInput: ""
      };

      $scope.setContribution = function(item) {
        Contributions.setItem(item);
        $state.go("tabsController.contributionValide");
      };

      $scope.refreshTasks = function() {
        //console.log('Contributions => Refreshing');
        $timeout(function() {
          $scope.items = Contributions.getAllItemsFirebase();
          //console.log("Contributions => beforeEnter : $scope.items: ", $scope.items);
          $scope.$broadcast("scroll.refreshComplete");
        }, 1000);
      };

      // handle event
      $scope.$on("$ionicView.beforeEnter", function(event, data) {
        //console.log('Contributions => ionicView.beforeEnter');
        $scope.items = Contributions.getAllItems();
        //Contributions.setAllItems($scope.items);
        //console.log("Contributions => First beforeEnter : $scope.items: ", $scope.items);
      });
    }
  ])
  .controller("profilCtrl", [
    "$scope",
    "$stateParams",
    "$ionicPopup",
    "Users",
    "Images",
    "$ionicActionSheet",
    "$cordovaCamera",
    "$cordovaImagePicker",
    "$cordovaFile",
    "$ionicPlatform",
    "$q",
    "$timeout",

    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $ionicPopup, Users, Images, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $cordovaFile, $ionicPlatform, $q, $timeout) {
      $scope.userData = Users.getUser();
      //console.log("Profil :", $scope.userData);

      $scope.updateItem = function(user) {
        Users.updateUser($scope.userData);
        $scope.showAlertPopup();
      };

      // Triggered on a button click, or some other target
      $scope.showAlertPopup = function() {
        var alertPopup = $ionicPopup
          .alert({
            title: "C'est fait !",
            template: "Enregistrement effectué"
          })
          .then(function(res) {
            //console.log("Profil enregistré");
          });
      };

      /**
       * Take a picture from camera 
       * And save it in user 
       */
      if (!$scope.userData.images) {
        $scope.userData.images = [];
      }

      $scope.upload = function() {
        var options = {
          quality: 75,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          targetWidth: 500,
          targetHeight: 500,
          saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(
          function(imageData) {
            $scope.userData.images.push({ image: imageData });
            Users.updateUser($scope.userData).then(function() {
              alert("Image has been uploaded");
            });
          },
          function(error) {
            alert(error);
          }
        );
      };

      /**
     * query firebase database for a list of images stored in the 
     * firebase storage. You cannot query firebase storage for a list
     * of objects.
     * 
     */
      function loadData() {
        firebase.database().ref("assets").on("value", function(_snapshot) {
          // need to reset array each time
          var result = [];

          // loop through the snapshot to get the objects
          // to display in the list
          _snapshot.forEach(function(childSnapshot) {
            // get key & data...
            // var element = Object.assign({ id: childSnapshot.key }, childSnapshot.val());
            var element = childSnapshot.val();
            element.id = childSnapshot.key;

            // add to array object
            result.push(element);
          });

          // put the array on the $scope for display in the UI,
          // we will wrap it in a $timeout to ensure the screen is
          // updated
          $timeout(function() {
            $scope.assetCollection = result;
          }, 2);
        });
      }

      /** 
     *  from documentation:
     *  https://firebase.google.com/docs/storage/web/upload-files
     * 
     * This function returns a promise now to better process the
     * image data.
     */
      function saveToFirebase(_imageBlob, _filename) {
        return $q(function(resolve, reject) {
          alert("saveToFirebase");
          Images.saveToFirebase(_imageBlob, _filename);

          // Register three observers:
          // 1. 'state_changed' observer, called any time the state changes
          // 2. Error observer, called on failure
          // 3. Completion observer, called on successful completion
          uploadTask.on(
            "state_changed",
            function(snapshot) {
              // Observe state change events such as progress, pause, and resume
              // See below for more detail
            },
            function(error) {
              // Handle unsuccessful uploads, alert with error message
              alert(error.message);
              reject(error);
            },
            function() {
              // Handle successful uploads on complete
              var downloadURL = uploadTask.snapshot.downloadURL;

              // when done, pass back information on the saved image
              resolve(uploadTask.snapshot);
            }
          );
        });
      }

      function saveReferenceInDatabase(_snapshot) {
        // see information in firebase documentation on storage snapshot and metaData
        var dataToSave = {
          URL: _snapshot.downloadURL, // url to access file
          name: _snapshot.metadata.name, // name of the file
          lastUpdated: new Date().getTime()
        };

        $scope.userData.images.push({ image: imageData });
        Users.updateUser($scope.dataToSave)
          .then(function() {
            alert("Image has been uploaded");
          })
          .catch(function(_error) {
            alert("Error Saving to Assets " + _error.message);
          });
      }

      /** 
     * copied directly from documentation
     * http://ngcordova.com/docs/plugins/imagePicker/
     */
      $scope.doGetImage = function() {
        var options = {
          maximumImagesCount: 1, // only pick one image
          width: 800,
          height: 800,
          quality: 80
        };

        var fileName, path;

        $cordovaImagePicker
          .getPictures(options)
          .then(function(results) {
            console.log("Image URI: " + results[0]);
            alert("Image URI: " + results[0]);
            // lets read the image into an array buffer..
            // see documentation:
            // http://ngcordova.com/docs/plugins/file/
            fileName = results[0].replace(/^.*[\\\/]/, "");

            // modify the image path when on Android
            if ($ionicPlatform.is("android")) {
              path = cordova.file.cacheDirectory;
            } else {
              path = cordova.file.tempDirectory;
            }
            alert("la");

            return $cordovaFile.readAsArrayBuffer(path, fileName);
          })
          .then(function(success) {
            alert("debut saveToFirebase");
            // success - get blob data
            var imageBlob = new Blob([success], { type: "image/jpeg" });

            // missed some params... NOW it is a promise!!
            return saveToFirebase(imageBlob, fileName);
          })
          .then(function(_responseSnapshot) {
            alert("debut saveReferenceInDatabase");
            // we have the information on the image we saved, now
            // let's save it in the realtime database
            alert("saveReferenceInDatabase");
            return saveReferenceInDatabase(_responseSnapshot);
          })
          .then(
            function(_response) {
              alert("Saved Successfully!!");
            },
            function(error) {
              // error
              console.log(error);
            }
          );
      };
    }
  ])
  .controller("paramTresCtrl", [
    "$scope",
    "$stateParams",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams) {}
  ])
  .controller("chatCtrl", [
    "$scope",
    "$stateParams",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams) {}
  ])
  .controller("loginCtrl", [
    "$scope",
    "$stateParams",
    "$ionicUser",
    "$ionicAuth",
    "$state",
    "$ionicHistory",
    "$rootScope",
    "$ionicSideMenuDelegate",
    "Users",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $ionicUser, $ionicAuth, $state, $ionicHistory, $rootScope, $ionicSideMenuDelegate, Users) {
      $scope.data = {
        email: "",
        password: ""
      };

      $scope.error = "";

      /*
    //Auth Ionic
    if ($ionicAuth.isAuthenticated()) {
      // Updated on 1/9/2017 to fix issues with logging
      // out and back in, as well as history issues with side menu + tabs.
      $ionicUser.load().then(function() {
        $rootScope.$broadcast('login_change');
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $state.go('tabsController.carte');  
      });
    }
    
    $scope.login = function(){
        $scope.error = '';
        $ionicAuth.login('basic', $scope.data).then(function(){
            $rootScope.$broadcast('login_change');
            $state.go('tabsController.carte');
        }, function(){
            $scope.error = 'Error logging in.';
        })
    }
*/
      //Auth Firebase
      $ionicSideMenuDelegate.canDragContent(false); // Ne pas afficher le menu en swipant

      $scope.loginFirebase = function() {
        function signInSuccess(response) {
          $rootScope.$broadcast("login_change");
          $ionicHistory.nextViewOptions({
            historyRoot: true
          });
          //console.log("Logged in!");
          $state.go("tabsController.carte_tab1");
        }

        function signInError(response) {
          $scope.error = response.message;
          //console.log("login : signInError $scope.error : ", $scope.error);
        }

        if ($scope.data.email === "" || $scope.data.password === "") {
          $scope.error = "Login ou password invalide.";
        } else {
          firebase.auth().signInWithEmailAndPassword($scope.data.email, $scope.data.password).then(signInSuccess).catch(signInError);
        }
      };
    }
  ])
  .controller("resetCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "$ionicSideMenuDelegate",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $state, $stateParams, $ionicSideMenuDelegate) {
      $scope.data = {
        email: ""
      };

      $scope.error = "";

      $scope.resetPasswordFirebase = function() {
        if ($scope.data.email === "") {
          $scope.error = "Email error";
          return false;
        }
        firebase.auth().sendPasswordResetEmail($scope.data.email).then(
          function() {
            //console.log("resetPasswordFirebase!");
            // Updated on 1/9/2017 to make sure the menu closes when
            // you log out so that it's closed if you log back in.
            $ionicSideMenuDelegate.toggleLeft(false); // forcer le menu à se fermer
            $state.go("login");
          },
          function(error) {
            //console.log(error.code);
            //console.log(error.message);
          }
        );
      };
    }
  ])
  .controller("signupCtrl", [
    "$scope",
    "$stateParams",
    "$ionicAuth",
    "$ionicUser",
    "$state",
    "$ionicHistory",
    "$rootScope",
    // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
    // You can include any angular dependencies as parameters for this function
    // TIP: Access Route Parameters for your page via $stateParams.parameterName
    function($scope, $stateParams, $ionicAuth, $ionicUser, $state, $ionicHistory, $rootScope) {
      //$scope.users = Users.items;

      $scope.data = {
        name: "",
        email: "",
        password: ""
      };

      $scope.error = "";

      /*
    //Signup Ionic
    $scope.signup = function(){

        $ionicAuth.signup($scope.data).then(function() {
            // `$ionicUser` is now registered
            $ionicAuth.login('basic', $scope.data).then(function(){
            
                // Updated on 1/9/2017 to fix issues with logging
                // out and back in, as well as history issues with
                // side menu + tabs.
                $rootScope.$broadcast('login_change');
                $ionicHistory.nextViewOptions({
                    historyRoot: true
                });
                $state.go('tabsController.carte');
            });
        }, function(err) {
            
            var error_lookup = {
                'required_email': 'Missing email field',
                'required_password': 'Missing password field',
                'conflict_email': 'A user has already signed up with that email',
                'conflict_username': 'A user has already signed up with that username',
                'invalid_email': 'The email did not pass validation'
            }    
        
            $scope.error = error_lookup[err.details[0]];
        });
    }
*/
      //Signup Firebase
      $scope.signupFirebase = function() {
        function signInSuccess(response) {
          firebase.database().ref("wio/users").child(response.uid).set({
            email: $scope.data.email,
            name: $scope.data.name
          });
          // Updated on 1/9/2017 to fix issues with logging
          // out and back in, as well as history issues with
          // side menu + tabs.
          $rootScope.$broadcast("login_change");
          $ionicHistory.nextViewOptions({
            historyRoot: true
          });
          //console.log("Signup !");
          $state.go("tabsController.carte_tab1");
        }

        function signInError(response) {
          $scope.error = response.message;
        }

        $scope.error = "";
        firebase.auth().createUserWithEmailAndPassword($scope.data.email, $scope.data.password).then(signInSuccess).catch(signInError);
      };
    }
  ])
  .controller("mapsExampleCtrl", [
    "$scope",
    "$log",
    "$timeout",
    "uiGmapGoogleMapApi",
    "$ionicLoading",
    "$cordovaGeolocation",
    function($scope, $log, $timeout, uiGmapGoogleMapApi, $ionicLoading, $cordovaGeolocation) {
      $scope.map = {
        center: {
          latitude: 40.1451,
          longitude: -99.668
        },
        zoom: 14,
        events: {
          idle: function(map) {
            //console.log("map event idle : ", map.getBounds());
            var bounds = map.getBounds();
            //$scope.map.searchbox.options.bounds = bounds;
            //$scope.updateBounds(map);
          },
          zoom_changed: function(map) {
            //console.log("map event zoom_changed : ", map.getBounds());
            var bounds = map.getBounds();
            //$scope.map.searchbox.options.bounds = bounds;
            //$scope.updateBounds(map);
          },
          bounds_changed: function(map) {
            //console.log("map event zoom_changed : ", map.getBounds());
            var bounds = map.getBounds();
            //$scope.map.searchbox.options.bounds = bounds;
            //$scope.updateBounds(map);
          }
        },
        searchbox: {
          events: {
            places_changed: function(searchBox) {
              var places = searchBox.getPlaces();
              var bounds = new google.maps.LatLngBounds();
              $scope.markers = [];
              for (var i = 0; i < places.length; ++i) {
                //console.log("places_changed : ", places[i]);
              }
            }
          },
          parentdiv: "div-adresse-input",
          template: "templates/searchbox.html"
        }
      };
    }
  ]);
