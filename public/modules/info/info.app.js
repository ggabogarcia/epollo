'use strict';

let infoApp = angular.module('epollo.info', [
  'ui.router',
  'epollo.info.controllers'
]);

infoApp.config(function($stateProvider, $locationProvider) {

  $locationProvider.hashPrefix('');

  $stateProvider
  .state('agreement', {
    url: '/agreement',
    templateUrl: 'modules/info/states/user-agreement.html'
  })
  .state('privacy', {
    url: '/privacy',
    templateUrl: 'modules/info/states/privacy.html'
  })
  .state('content', {
    url: '/content',
    templateUrl: 'modules/info/states/content.html'
  });
});

infoApp.run(function($state) {
  $state.go('agreement');
})
