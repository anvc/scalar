/**
 * Scalar
 * Copyright 2013 The Alliance for Networking Visual Culture.
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

$.fn.accessibleBootstrapTabs = function() {
    return this.each(function(i, el) {

      var $tablist = $(el)
          , $lis = $tablist.children('li')
          , $tabs = $tablist.find('[data-toggle="tab"], [data-toggle="pill"]')

      $tablist.attr('role', 'tablist')
      $lis.attr('role', 'presentation')
      $tabs.attr('role', 'tab')

      $tabs.each(function( index ) {
        var tabpanel = $($(this).attr('href'))
          , tab = $(this)
          , tabid = tab.attr('id') || uniqueId('ui-tab')

          tab.attr('id', tabid)

        if(tab.parent().hasClass('active')){
          tab.attr( { 'tabIndex' : '0', 'aria-expanded' : 'true', 'aria-selected' : 'true', 'aria-controls': tab.attr('href') ? tab.attr('href').substr(1) : ''} )
          tabpanel.attr({ 'role' : 'tabpanel', 'tabIndex' : '0', 'aria-hidden' : 'false', 'aria-labelledby':tabid })
        }else{
          tab.attr( { 'tabIndex' : '-1', 'aria-expanded' : 'false', 'aria-selected' : 'false', 'aria-controls': tab.attr('href') ? tab.attr('href').substr(1) : '' } )
          tabpanel.attr( { 'role' : 'tabpanel', 'tabIndex' : '-1', 'aria-hidden' : 'true', 'aria-labelledby':tabid } )
        }
      })

    });

};

