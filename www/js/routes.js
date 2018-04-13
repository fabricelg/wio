angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    

      /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.carte'
      2) Using $state.go programatically:
        $state.go('tabsController.carte');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /carte/tab1/carte
      /carte/tab3/carte
      /carte/tab4/carte
  */
  .state('tabsController.carte', {
    url: '/carte',
    views: {
      'tab1': {
        templateUrl: 'templates/carte.html',
        controller: 'carteCtrl'
      },
      'tab3': {
        templateUrl: 'templates/carte.html',
        controller: 'carteCtrl'
      },
      'tab4': {
        templateUrl: 'templates/carte.html',
        controller: 'carteCtrl'
      }
    }
  })

  .state('tabsController.contributionsValidesCtrl', {
    url: '/valided',
    views: {
      'tab4': {
        templateUrl: 'templates/contributionsValides.html',
        controller: 'contributionsValidesCtrl'
      }
    }
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.contributions'
      2) Using $state.go programatically:
        $state.go('tabsController.contributions');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /carte/tab3/contributions
      /carte/tab4/contributions
  */
  .state('tabsController.contributions', {
    url: '/contributions',
    views: {
      'tab3': {
        templateUrl: 'templates/contributions.html',
        controller: 'contributionsCtrl'
      },
      'tab4': {
        templateUrl: 'templates/contributions.html',
        controller: 'contributionsCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/carte',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('profil', {
    url: '/profil',
    templateUrl: 'templates/profil.html',
    controller: 'profilCtrl'
  })

  .state('paramTres', {
    url: '/parametres',
    templateUrl: 'templates/paramTres.html',
    controller: 'paramTresCtrl'
  })

  .state('chat', {
    url: '/chat',
    templateUrl: 'templates/chat.html',
    controller: 'chatCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('reset', {
    url: '/reset',
    templateUrl: 'templates/reset.html',
    controller: 'resetCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.contribution'
      2) Using $state.go programatically:
        $state.go('tabsController.contribution');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /carte/tab3/contribution
      /carte/tab4/contribution
  */
  .state('tabsController.contribution', {
    url: '/contribution',
	params: {
		item: ""		
	},
    views: {
      'tab3': {
        templateUrl: 'templates/contribution.html',
        controller: 'contributionCtrl'
      },
      'tab4': {
        templateUrl: 'templates/contribution.html',
        controller: 'contributionCtrl'
      }
    }
  })

  .state('tabsController.contributionValide', {
    url: '/contributionValide',
	params: {
		item: ""		
	},
    views: {
      'tab3': {
        templateUrl: 'templates/contributionValide.html',
        controller: 'contributionValideCtrl'
      },
      'tab4': {
        templateUrl: 'templates/contributionValide.html',
        controller: 'contributionValideCtrl'
      }
    }
  })

  .state('mapsExample', {
    url: '/example',
    templateUrl: 'templates/mapsExample.html',
    controller: 'mapsExampleCtrl'
  })

$urlRouterProvider.otherwise('/carte/tab1/carte')


});