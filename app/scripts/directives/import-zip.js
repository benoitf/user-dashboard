/*jslint
 browser: true,
 devel:true ,
 node:true,
 nomen: true,
 es5:true
 */

/**
 * @auth Stéphane Daviet
 * @date 12/1/2014
 * Directive for GitHub project import
 */

/*global angular*/

'use strict';

angular.module('odeskApp')
    .directive('udImportZip', function() {
        return {
            restrict: 'E',
            scope: {
                workspaces: '=',
                newProjectData: '='
            },
            link: function ($scope) {
                $scope.workspaceSelected = $scope.workspaces[0];

                $scope.setRemoteZipUrl = function() {
                  $scope.newProjectData.remoteUrl = $scope.remoteZipUrl;
                };
;
            },
            templateUrl: 'partials/widgets/importZip.html'
        }
    });