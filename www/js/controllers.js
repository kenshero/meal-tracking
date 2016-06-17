var myApp = angular.module('starter.controllers', ['chart.js']);

myApp.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.logout = function(){

    var myFirebaseRef = new Firebase("https://meal-track.firebaseio.com/");
    myFirebaseRef.unauth();
    $state.go('app.login')
  }


});

myApp.controller('DashBoardCtrl', function($scope, $state) {


  var myFirebaseRef = new Firebase("https://meal-track.firebaseio.com");
  
  // $scope.foods = {};
  $scope.sortFoods = {};

  var authData = myFirebaseRef.getAuth();
  if (authData) {
    $scope.pleaseLoginBox = false;
    // console.log("Authenticated user with uid:", authData.uid);

    myFirebaseRef.child('users').child(authData.uid).once('value').then(function(snapshot) {
      
      $scope.foods = snapshot.val();
      // console.log(snapshot.val());
      $scope.$apply(function(){
        $scope.foods = $scope.foods;

        var keys = Object.keys($scope.foods);
        var i, len = keys.length;
        keys.sort(function(a, b){return b-a});
        for (i = 0; i < len; i++) {
          k = keys[i];
          $scope.sortFoods[k] = $scope.foods[k]
        }
        // console.log($scope.sortFoods);
      });

    });


  }else{

    console.log("please Login");
    $scope.pleaseLoginBox = true;
    $scope.msgPleaseLogin = "Please Login";
    $state.go('app.login');
    
  }

  $scope.getKeyTime = function(val,index){
    var keysTime = Object.keys(val);
    // console.log(keysTime);
    return keysTime[index]
  }

});

myApp.controller('AddMealCtrl', function($scope, $stateParams ,$state,$compile) {


  var myFirebaseRef = new Firebase("https://meal-track.firebaseio.com/");

  var authData = myFirebaseRef.getAuth();
  if (authData) {
    $scope.pleaseLoginBox = false;
    console.log("Authenticated user with uid:", authData.uid);
    google.maps.event.addDomListener(window, 'load', initMap);
  }else{
    console.log("please Login");
    $scope.pleaseLoginBox = true;
    $scope.msgPleaseLogin = "Please Login";
    $state.go('app.login');

  }

  $scope.ate = function(foodName,chorestoral,kaimun,protein,chabohidate,sodium){

    if (!$scope.pleaseLoginBox) {

      var currentDate = convertTimetoDate(+new Date()); 
      var datesave = new Date(currentDate).getTime();
      var usersRef = myFirebaseRef.child("users").child(authData.uid).child(datesave);

      usersRef.push({
        FoodName: foodName,
        Chorestoral: chorestoral,
        Kaimun: kaimun,
        Protein: protein,
        Chabohidate: chabohidate,
        Sodium: sodium,
        ImgProfile: $scope.foodImg,
        MapLocation: $scope.pos,
        DateAte: Firebase.ServerValue.TIMESTAMP
      });

      $state.go('app.dashboard', {}, {reload: true});

    } 
  } // ate

  $scope.getPicture = function(){
    console.log("dddd");
    if (!$scope.pleaseLoginBox) {
      var oFReader = new FileReader();
      oFReader.readAsDataURL(document.getElementById("product_img").files[0]);
      oFReader.onload = function (oFREvent) {
        document.getElementById("image_priview_div").src = oFREvent.target.result;
        document.getElementById("image_priview_div").setAttribute('style', 'width:180px !important;, text-align:center;');
        $scope.foodImg = oFREvent.target.result;
        console.log($scope.foodImg);
      };
    }
    
  } //getPicture

  function convertTimetoDate(unix_timestamp){
    var a = new Date(unix_timestamp);
    var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = year + '/' + month + '/' + date  ;
    console.log(time);
    return time;
  }
     function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 6
        });

        var infoWindow = new google.maps.InfoWindow({map: map});

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            $scope.pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            console.log($scope.pos);
            infoWindow.setPosition($scope.pos);
            infoWindow.setContent('Location found.');
            map.setCenter($scope.pos);
            var GeoMarker = new GeolocationMarker(map);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }



      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }


});

myApp.controller('FoodCtrl', function($scope, $stateParams) {

  console.log($stateParams);
  var myFirebaseRef = new Firebase("https://meal-track.firebaseio.com");

  var authData = myFirebaseRef.getAuth();
  if (authData) {
    $scope.pleaseLoginBox = false;
    myFirebaseRef.child('users').child(authData.uid).child($stateParams.timeKey)
    .child($stateParams.foodId).once('value').then(function(snapshot) {
    
      
      $scope.$apply(function(){
        $scope.food = snapshot.val();

        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 6
        });
        map.setCenter($scope.food.MapLocation);
        var GeoMarker = new GeolocationMarker(map);

      });

    });
  }else{

    console.log("please Login");
    $scope.pleaseLoginBox = true;
    $scope.msgPleaseLogin = "Please Login";
    $state.go('app.login');
    
  }
});

myApp.controller('GraphCtrl', function($scope) {
  $scope.labels = ["Chorestoral", "Kaimun", "Protein", "Chabohidate","Sodium"];


  $scope.food_report = [];
  var count_ingredients = 0;
  var myFirebaseRef = new Firebase("https://meal-track.firebaseio.com");
  
  // $scope.foods = {};
  $scope.sortFoods = {};

  var authData = myFirebaseRef.getAuth();
  if (authData) {
    $scope.pleaseLoginBox = false;
    console.log("Authenticated user with uid:", authData.uid);

    myFirebaseRef.child('users').child(authData.uid).limitToLast(3).once('value').then(function(snapshot) {
      
      // console.log(snapshot.val());
      $scope.foods = snapshot.val()
      $scope.keys_foods = Object.keys($scope.foods);
        for (var key_food in $scope.foods) {
          var report_data = [0,0,0,0,0];
          for (var food in $scope.foods[key_food]) {
            console.log($scope.foods[key_food][food]);

            report_data[0] += $scope.foods[key_food][food].Chorestoral
            report_data[1] += $scope.foods[key_food][food].Kaimun
            report_data[2] += $scope.foods[key_food][food].Chabohidate
            report_data[3] += $scope.foods[key_food][food].Protein
            report_data[4] += $scope.foods[key_food][food].Sodium

          }
          $scope.food_report.push(report_data);
          count_ingredients++;
        }
        $scope.$apply(function(){
          $scope.food_report = $scope.food_report;
          console.log($scope.food_report);
          console.log($scope.keys_foods[2]);
        })
    });


  }else{

    console.log("please Login");
    $scope.pleaseLoginBox = true;
    $scope.msgPleaseLogin = "Please Login";
    $state.go('app.login');
    
  }

});

// myApp.controller('PlaylistCtrl', function($scope, $stateParams) {

// });

myApp.controller('LoginCtrl', function($scope, $stateParams, $state) {
  var myFirebaseRef = new Firebase("https://meal-track.firebaseio.com/");

  $scope.doLogin = function(email_user,password){
    
    if( checkValid(email_user,password) ){
      console.log("error");
      $scope.errorMsg = "Please valid data !";
      $scope.errorBox = true;
    } else {
      myFirebaseRef.authWithPassword({
        email    : email_user,
        password : password
      }, function(error, authData) {
        if (error) {
          $scope.$apply(function(){
            $scope.errorMsg = "Username Or Password Incorrect !";
            $scope.errorBox = true;
          });
          console.log("Login Failed!", error);
        } else {
          $scope.errorBox = false
          console.log("Authenticated successfully with payload:", authData);
          $state.go('app.dashboard');
        }
      });
    }
  } // doLogin

  function checkValid(email,password){
    if (email === undefined || email === "" || password === undefined || password === "") {
      return true;
    }
    return false;
  }

});

myApp.controller('RegisterCtrl', function($scope, $stateParams, $state){
  var myFirebaseRef = new Firebase("https://meal-track.firebaseio.com/");

  $scope.doRegister = function(email_user,password,confirmPassword){
    if (password != confirmPassword) {
      console.log("error");
      $scope.errorMsg = "Confirmpassword Incorrect !"
      $scope.errorBox = true;
    }else if( checkValid(email_user,password) ){
      console.log("error");
      $scope.errorMsg = "Please valid data !"
      $scope.errorBox = true;
    } else {
      $scope.errorBox = false;
      console.log("login");
      myFirebaseRef.createUser({
        email    : email_user,
        password : password
      }, function(error, userData) {
        if (error) {
          console.log("Error creating user:", error);
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          $state.go('app.login');
        }
      });
    }

  } // doRegister

  function checkValid(email,password){
    if (email === undefined || email === "" || password === undefined || password === "") {
      return true;
    }
    return false;
  }

});

