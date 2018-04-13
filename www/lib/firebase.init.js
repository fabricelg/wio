angular.module('firebaseConfig', ['firebase'])

.run(function(){

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA8UIP71BZK8GkqbmBx-Kvgo7mKwM5m0LE",
    authDomain: "what-is-open.firebaseapp.com",
    databaseURL: "https://what-is-open.firebaseio.com",
    projectId: "what-is-open",
    storageBucket: "what-is-open.appspot.com",
    messagingSenderId: "730322080211"
  };
  firebase.initializeApp(config);

})

/*

.service("TodoExample", ["$firebaseArray", function($firebaseArray){
    var ref = firebase.database().ref().child("todos");
    var items = $firebaseArray(ref);
    var todos = {
        items: items,
        addItem: function(title){
            items.$add({
                title: title,
                finished: false
            })
        },
        setFinished: function(item, newV){
            item.finished = newV;
            items.$save(item);
        }
    }
    return todos;
}])

*/