angular.module("users", ["firebase"]).service("Users", [
  "$firebaseArray",
  function($firebaseArray) {
    var ref = firebase.database().ref().child("wio/users");
    var items = $firebaseArray(ref);

    var userCurrent = {};

    var users = {
      items: items,

      getUser: function() {
        //console.log('Users => getUser:', userCurrent);
        return userCurrent;
      },
      setUser: function(new_user) {
        userCurrent = new_user;
        //console.log('Users => setUser :', userCurrent);
      },
      updateUser: function(user) {
        userCurrent = user;
        items.$save(user);
        //console.log('Users => updateUser :', userCurrent);
      }
    };

    return users;
  }
]);
