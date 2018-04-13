angular.module("categories", ["firebase"]).service("Categories", [
  "$firebaseArray",
  function($firebaseArray) {
    var ref = firebase.database().ref().child("wio/categories");
    var items = $firebaseArray(ref);

    var categorieCurrent = {};

    var categories = {
      items: items,

      getCategorie: function() {
        console.log("Categories => getCategorie:", categorieCurrent);
        return categorieCurrent;
      },
      setCategorie: function(new_categorie) {
        categorieCurrent = new_categorie;
        console.log("Categories => setCategories :", categorieCurrent);
      },
      updateCategories: function(user) {
        categorieCurrent = categorie;
        items.$save(categorie);
        console.log("Categories => updateCategories :", categorieCurrent);
      }
    };

    return categories;
  }
]);
