angular.module("images", ["firebase"]).service("Images", [
  "$firebaseArray",
  function($firebaseArray) {
    // Create a root reference to the firebase storage
    var storageRef = firebase.storage().ref();

    var images = {
      saveToFirebase: function(imageBlob, filename) {
        // pass in the _filename, and save the _imageBlob
        var uploadTask = storageRef.child("images/" + filename).put(imageBlob);
      }
    };
    return images;
  }
]);
