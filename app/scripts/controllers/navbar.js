/*jslint
    browser: true,
    devel:true ,
    node:true,
    nomen: true,
    es5:true
*/

/**
 * @auth Gaurav Meena
 * @date 01/16/2014
 * Controller for navbar will automatically check for active view to set class active
 */

/*global angular*/

'use strict';

angular.module('odeskApp')
    .controller('NavbarCtrl', function ($scope, $rootScope, $location, $http, $cookies, $window, OrgAddon, ProfileService, $q) {
        $scope.menu = [
            {
                'title': 'Projects',
                'link': '#/dashboard'
            },
            {
                'title': 'Runners',
                'link': '#/runner'
            },
            {
                'title': 'Factories',
                'link': '#/factories'
            },
            {
                'title': 'Workspaces',
                'link': '#/organizations'
            },
            {
                'title': 'Account',
                'link': '#/account'
            }
        ];

        $scope.helpMenu = [
            {
                'title': 'Codenvy Help',
                'link': 'http://docs.codenvy.com'
            },
            {
                'title': 'Forum',
                'link': 'http://helpdesk.codenvy.com/'
            },
            {
                'title': 'Feedback and Feature Vote',
                'link': 'https://codenvy.uservoice.com/'
            },
            {
                'title': 'Create Support Ticket',
                'link': 'https://codenvy.uservoice.com/'
            }
            ];

        $rootScope.$on('update_fullUserName', function(event, fullUserName){
            $scope.fullUserName = fullUserName;
            });

        ProfileService.getProfile().then(function (profile) {
            var fullUserName;
            if (profile.attributes.firstName && profile.attributes.lastName) {
                fullUserName = profile.attributes.firstName + ' ' + profile.attributes.lastName;
            } else {
                fullUserName = profile.attributes.email;
            }
            $rootScope.$broadcast('update_fullUserName', fullUserName);// update User name at top
        });

        $scope.isActive = function (route) {

        //return route === '#' + $location.path(); //here # is added because of location html5 mode

            var str = '#' + $location.path(),
                str2 = route;

            if (str.indexOf(str2) > -1) {
                return true;
            } else {
                return false;
            }
        };

        $scope.logout = function () {
            $http({
                url: "/api/auth/logout",
                method: "POST",
                data: { "token": $cookies['session-access-key']}
            }).success(function (data, status) {
                $window.location.href = '/site/login';
            });
        };
        $("#navbar-collapse").click(function(){
            $(".navbar-collapse").toggle();
        });
        $("#navbar-collapse-btn").click(function(){
            $(".navbar-collapse").toggle();
        });

		OrgAddon.getOrgAccounts();
});

