angular.module("contributions", ["firebase"]).service("Contributions", [
  "$firebaseArray",
  function($firebaseArray) {
    var ref = firebase.database().ref().child("wio/contributions");
    var items = $firebaseArray(ref);
    var itemCurrent = {};

    var contributions = {
      items: items,
      getAllItemsFirebase: function() {
        items = $firebaseArray(ref);
        //console.log('Items => getAllItemsFirebase :', items);
        return items;
      },
      getAllItems: function() {
        //console.log('Items => getAllItems :', items);
        return items;
      },
      setAllItems: function(new_items) {
        items = new_items;
        //console.log('Items => setAllItems :', new_items);
      },
      getItem: function() {
        //console.log('Items => getItem:', itemCurrent);
        return itemCurrent;
      },
      setItem: function(new_item) {
        itemCurrent = new_item;
        //console.log('Items => setItem :', itemCurrent);
      },
      addItem: function(item) {
        item.valided = false;
        items.$add(item);
        //console.log('Items => addItem apres :', item);
      },
      updateItem: function(item) {
        items.$save(item);
      },
      deleteItem: function(item) {
        items.$remove(item);
      },
      setValided: function(item, newV) {
        item.valided = newV;
        items.$save(item);
      }
    };

    //console.log("Contributions contributions: ", contributions);
    return contributions;
  }
]);
