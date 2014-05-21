/**
 * Scalar
 * Copyright 2014 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0
 * (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.osedu.org/licenses /ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * @projectDescription  Boot Scalar Javascript/jQuery using yepnope.js
 * @author              Olivier Moratin
 * @version             Cantaloupe 1.0
 */
$.fn.onTab = function(callback) {
  return this.each(function(i, el) {
    $(el).keydown( function(e) {
      var keyCode = e.keyCode || e.which;
      if( keyCode == 9 && !e.shiftKey ) {
        e.preventDefault();
        callback();
      }
    });
  });
};
$.fn.onTabBack = function(callback) {
  return this.each(function(i, el) {
    $(el).keydown( function(e) {
      var keyCode = e.keyCode || e.which;
      if( keyCode == 9 && e.shiftKey ) {
          e.preventDefault();
          callback()
      }
    });
  });

};