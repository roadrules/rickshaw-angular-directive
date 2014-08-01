/**
 * Copyright (c) 2014 Road Rules, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  
  angular.module('rickshaw-directive', [])
    .directive('rickshawGraph', rickshawDirective); 


  function rickshawDirective($timeout) {

    function redraw(graph, scope) {
      $timeout(function() {
        graph.configure(scope.options);
        graph.render();
      }, 0);
    }
    
    return {
      restrict: 'E',
      scope: {
        series: '=',
        options: '=',
        graph: '=?',
        watch: '@'
      },
      link: function rickshawDirectiveLink(scope, element, attrs) {

        var watch = scope.watch === undefined || scope.watch === 'true' ? true : false;
        
        var graph = scope.graph = new Rickshaw.Graph({
            element: element[0],
            series: scope.series
        });
        graph.configure(scope.options);
        graph.render();

        scope.$on('rickshaw-directive.render', function() {
          redraw(graph, scope);
        });

        if (watch) {

          scope.$watchCollection('options', function(n, o) {
            redraw(graph, scope);
          });

          var unregisters = [];
          scope.$watchCollection('series', function(n, o) {

            // unregister all of the previous watchers
            for (var i=0, unregister; unregister = unregisters[i]; unregister(), i++);
            unregisters = [];

            //register each series data
            for(var i=0; i < n.length; i++) {
              var unregister = scope.$watchCollection('series['+i+'].data', function(newValue, oldValue) {
                redraw(graph, scope);
              });
              unregisters.push(unregister);
            } 
          });
        }

      }
    };
  }

})();
