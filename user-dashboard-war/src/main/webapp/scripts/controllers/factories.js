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
 * Controller for factories
 */

/*global angular, Morris*/

'use strict';
angular.module('odeskApp')
    .controller('FactoriesCtrl', function ($scope, $timeout, projectList) {
        $scope.projects = projectList.query();
        $scope.filter = {};
        var Data = [{x: '2011 Q1', y: 3, z: 3},
                                {x: '2011 Q2', y: 2, z: 1},
                                {x: '2011 Q3', y: 2, z: 4},
                                {x: '2011 Q4', y: 3, z: 3},
                                {x: '2011 Q5', y: 3, z: 4}];
        $timeout(function () {
            Morris.Line({element: 'graph-area-line',
                         behaveLikeLine: false,
                         data: Data,
                         xkey: 'x',
                         ykeys: ['z'],
                         labels: ['Z'],
                         grid:false,
                         lineWidth:1,
                         smooth:false,
                         goals:[0],
                         goalLineColors:['#d9d9d9'],
                         eventLineColors:['#d9d9d9'],
                         events:[Data[0].x],
                         pointSize:5,
                         pointFillColors:['#ffffff'],
                         pointStrokeColors:['#90c6ec'],
                         hoverCallback: function(index, options, content) {
                            var row = options.data[index];
                            return "<div class='morris-hover-row-label'>"+row.z+" Sessions</div><div class='morris-hover-point'>235 Minutes</div>";
                        },
                         lineColors: ['#e5e5e5']});

        });
    });
