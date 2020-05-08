/*!
 * Scalar Lens plugin
 */

;(function ( $, window, document, undefined ) {

    const pluginName = 'ScalarLenses', defaults = {};

    function ScalarLenses(element, options) {
        this.element = element;
        this.options = $.extend( {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    // Init
    ScalarLenses.prototype.init = function (){
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.element
      // and this.options


      // reference for saveLens callback function
      let me = this;

      this.visualizationOptions = {
          'force-directed': {
                id: 1,
                text:'Force-Directed',
                //iconDark:'../images/icon_forcedir_dark.png',
                iconLight:'light'
              },
              'grid': {
                id: 2,
                text:'Grid'

              },
              'list':{
                id: 3,
                text:'List'

              },
              'map':{
                id: 4,
                text:'Map'

              },
              'radial':{
                id: 5,
                text:'Radial'

              },
            'tree':  {
                id: 6,
                text:'Tree'

              },
              'word-cloud':{
                id: 7,
                text:'Word Cloud'

              }

      }

      this.scalarLensObject = this.getEmbeddedJson();
      if(!this.scalarLensObject) {
        this.scalarLensObject = this.getDefaultJson();
      }
      this.getLensResults();
      this.buildEditorDom();
      this.updateEditorDom();

    }

    // get Embedded data
    ScalarLenses.prototype.getEmbeddedJson = function(){

      // convert metadata div content into a JSON object
      if ($("[property|='scalar:isLensOf']").length > 0) {
        return JSON.parse($("[property|='scalar:isLensOf']").html());
      } else {
        return null;
      }
    }

    // get Default data
    ScalarLenses.prototype.getDefaultJson = function(){
      //console.log('Get default JSON');

      // the Lens object
      return {
        "urn": $('link#urn').attr('href').replace("version", "lens"),
        "submitted": false,
        "frozen": false,
        "frozen-items": [],
        "visualization": null,
        "components": []
      };

    }

    // build DOM
    ScalarLenses.prototype.buildEditorDom = function (){

      /// HTML for Lens default state
      let lensHtml = $(
         `<div class="paragraph_wrapper">
           <div class="body_copy">
             <div class="row lens">
               <div class="lens-editor">
                 <div class="col-xs-12">
                   <div class="lens-expand-container" data-toggle="collapse" data-target="">
                     <div class="lens-icon-wrapper col-xs-1">
                       <span class="lens-icon"></span>
                     </div>
                     <div class="lens-content col-xs-11">
                       <h3 class="lens-title heading_font heading_weight">(Untitled lens)</h3>
                       <div class="badge">0</div>
                     <div class="lens-tags">
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>`
      );

      lensHtml.find('.lens-tags').append(this.addVisualizationButton());
      lensHtml.append(this.addContentTypeModal());
      lensHtml.append(this.addDistanceModal());
      lensHtml.append(this.addFilterModal());
      $(this.element).append(lensHtml);
      this.buttonContainer = $(this.element).find('.lens-tags').eq(0);
    }

    // update DOM
    ScalarLenses.prototype.updateEditorDom = function(){
      $(this.element).find('.lens-title').text(scalarapi.model.getCurrentPageNode().current.title);
      this.updateVisualizationButton(this.scalarLensObject.visualization);

      if(this.scalarLensObject.components.length == 0){
         let componentContainer = this.getComponentContainer(0);
         let button = this.addContentSelectorButton(componentContainer, 0);
         this.updateContentSelectorButton(null, button);
         this.scalarLensObject.components[0] = { "content-selector": {}, "modifiers": []}

      } else {
        console.log(this.scalarLensObject);
        this.scalarLensObject.components.forEach((component, componentIndex) => {
          let componentContainer = this.getComponentContainer(componentIndex);

          // content selector button
          let button = componentContainer.find('.content-selector-button')
          if (button.length == 0) button = this.addContentSelectorButton(componentContainer, componentIndex);
          this.updateContentSelectorButton(component["content-selector"], button);

          component.modifiers.forEach((modifier, modifierIndex) => {
            switch (modifier.type) {

              case 'filter':
              button = componentContainer.find('.filter-button').eq(modifierIndex);
              if (button.length == 0) {
                button = this.addFilterButton(this.buttonContainer, componentIndex, modifierIndex);
              }
              this.updateFilterButton(modifier, button);
              break;

              case 'sort':
              break;

            }
          })

          // remove extra modifier buttons
          componentContainer.find('.modifier-button').each(function(index) {
            if (index >= component.modifiers.length) {
              $(this).remove();
            }
          });

          // plus button
          button = $(this.buttonContainer).find('.plus-button').eq(componentIndex);
          if (button.length == 0) this.addPlusButton(this.buttonContainer, componentIndex);
        });
      }
    }

    // looks for a container component div for the component with the given index;
    // creates one if it can't find it
    ScalarLenses.prototype.getComponentContainer = function(componentIndex){
      let componentContainer = this.buttonContainer.find('.component-container').eq(componentIndex);
      if (componentContainer.length == 0) {
        if (componentIndex == 0) {
          componentContainer = $('<div class="component-container"></div>').appendTo(this.buttonContainer);
        } else {
          componentContainer = this.buttonContainer.find('.component-container').eq(componentIndex-1).after('<div class="component-container"></div>');
        }
      }
      return componentContainer;
    }

    // add visualization button
    ScalarLenses.prototype.addVisualizationButton = function(){

      let element = $(
           `<div class="btn-group"><button type="button" class="btn btn-primary btn-xs dropdown-toggle caption_font visualization-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Select visualization <span class="caret"></span></button>
             <ul id="visualization-dropdown" class="dropdown-menu">
             <li><a><span class="viz-icon force"></span>Force-Directed</a></li>
             <li><a><span class="viz-icon grid"></span>Grid</a></li>
             <li><a><span class="viz-icon list"></span>List</a></li>
             <li><a><span class="viz-icon map"></span>Map</a></li>
             <li><a><span class="viz-icon radial"></span>Radial</a></li>
             <li><a><span class="viz-icon tree"></span>Tree</a></li>
             <li><a><span class="viz-icon word-cloud"></span>Word Cloud</a></li>
             </ul>
           </div>`
        )

      var me = this

        element.find('li').on('click', function(){
           let visualizationObj = {
             "type": $(this).text().split(/[_\s]/).join("-").toLowerCase()
           }

          me.scalarLensObject.visualization = visualizationObj
          me.updateVisualizationButton(me.scalarLensObject.visualization)
          me.saveLens(me.getLensResults);

        });
        return element
    }

    // update visualization button
    ScalarLenses.prototype.updateVisualizationButton = function(visualizationObj){

      let button = $(this.element).find('.visualization-button')

      if(!visualizationObj) {
          button.text('Select visualization...').append('<span class="caret"></span>')
        } else {
          button.text(this.visualizationOptions[visualizationObj.type].text).prepend('<span class="viz-icon '  + visualizationObj.type + ' light"</span>').append('<span class="caret"></span>')
        }
    }

    // add content-selector button
    ScalarLenses.prototype.addContentSelectorButton = function(element, componentIndex){

      let button = $(
         `<div class="btn-group content-selector-button"><button type="button" class="btn btn-primary btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
               Select items...<span class="caret"></span></button>
             <ul id="content-dropdown" class="dropdown-menu">
               <li><a>Specific items</a></li>
               <li><a data-toggle="modal" data-target="#modalByType">Items by type</a></li>
               <li><a data-toggle="modal" data-target="#modalByDistance">Items by distance</a></li>
             </ul>
          </div>`
        ).appendTo(element)

        button.data('componentIndex', componentIndex);

        var me = this;

        button.find('li').on('click', function (event) {

          let buttonText = $(this).text();

          me.editedComponentIndex = componentIndex

          switch(buttonText) {
              case 'Specific items':
                // trigger content-selector
                $('<div></div>').content_selector({
                  changeable: true,
                  multiple: true,
                  onthefly: true,
                  msg: 'Choose items to be included in this lens.',
                  callback: function(a){
                    me.handleContentSelected(a)
                  }
                });
              break;

              case 'Items by type':
              break;

              case 'Items by distance':
              break;

          }

        }); // content-selection

      return button

    }

    // update content-selector button
    ScalarLenses.prototype.updateContentSelectorButton = function(contentSelectorObj, element){

        let button = element.find('button');

          if(!contentSelectorObj) {
            button.text('Select items...').append('<span class="caret"></span>');
          }

          else {

            let type = contentSelectorObj.type;

            switch(type){

              case 'specific-items':

                  let items = contentSelectorObj.items;
                  let buttonText;

                  if(items.length <= 1){
                    buttonText = '&#8220;'+ items + '&#8221;';
                  } else {
                    let remainingItems = items.length - 1;
                    buttonText = '&#8220;'+ items[0] + '&#8221;' + ' and ' + remainingItems + ' more...';
                  }

                  button.html(buttonText).append('<span class="caret"></span>');

                  break;

              case 'items-by-type':
                  let contentType = contentSelectorObj["content-type"];
                  switch (contentType) {
                    case 'all-content':
                    button.text('All content').append('<span class="caret"></span>');
                    break;
                    case 'page':
                    case 'media':
                    button.text('All ' + scalarapi.model.scalarTypes[contentType].plural).append('<span class="caret"></span>');
                    break;
                    default:
                    button.text('All ' + scalarapi.model.relationTypes[contentType].bodyPlural).append('<span class="caret"></span>');
                    break;
                  }
                  break;

              case 'items-by-distance':
                  let units = contentSelectorObj.units;
                  let abbreviateUnits;

                  // abbreviate units for display
                  if(units === "miles") {
                    abbreviateUnits = "mi";
                  } else if(units === "kilometers") {
                    abbreviateUnits = "km";
                  }

                  let quantity = contentSelectorObj.quantity;
                  let coordinates = contentSelectorObj.coordinates;

                  // JSON updates content button text
                  let updateByDistance = quantity + ' ' + abbreviateUnits + ' from ' + coordinates;

                  button.text('Items ≤ ' + updateByDistance + '').append('<span class="caret"></span>');

                break;

            }
          }

    }

    // add filter button
    ScalarLenses.prototype.addFilterButton = function(componentContainer, componentIndex, modifierIndex){
      let button = $(
        `<div class="btn-group filter-button modifier-button"><button type="button" class="btn btn-primary btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Filter items...<span class="caret"></span></button>
          <ul class="dropdown-menu filter-type-list"></ul>
        </div>`
      );

      // position button in dom
      if (modifierIndex == 0) {
        componentContainer.find('.content-selector-button').after(button);
      } else {
        componentContainer.find('.filter-button').eq(modifierIndex-1).after(button);
      }

      button.data({
        'componentIndex': componentIndex,
        'modifierIndex': modifierIndex
      });

      let me = this;
      let onClick = function(evt) {
        let option = $(evt.target).parent().data('option');
        let button = $(evt.target).parent().parent().parent();
        me.editedComponentIndex = parseInt(button.data('componentIndex'));
        me.editedModifierIndex = parseInt(button.data('modifierIndex'));
        if (option.value == 'delete') {
          me.deleteFilterButton(me.editedComponentIndex, me.editedModifierIndex);
        } else {
          let filterObj = me.scalarLensObject.components[me.editedComponentIndex].modifiers[me.editedModifierIndex];
          me.updateFilterModal(option.value, filterObj);
        }
      }

      this.populateDropdown(button, button.find('.filter-type-list'), null, onClick,
        '<li><a data-toggle="modal" data-target="#filterModal"></a></li>',
        [
          {label: "Filter by type...", value: "type"},
          {label: "Filter by content...", value: "content"},
          {label: "Filter by relationship...", value: "relationship"},
          {label: "Filter by distance...", value: "distance"},
          {label: "Filter by quantity...", value: "quantity"},
          {label: "Filter by metadata...", value: "metadata"},
          {label: "Filter by visit date...", value: "visit-date"},
          {label: "separator", value: "separator"},
          {label: "Delete", value: "delete"}
        ]);

      return button;
    }

    // update filter button
    ScalarLenses.prototype.updateFilterButton = function(filterObj, element, componentIndex, modifierIndex){

      let button = element.find('button');

      button.data({
        'componentIndex': componentIndex,
        'modifierIndex': modifierIndex
      });

      if(!filterObj) {
        button.text('Filter items...').append('<span class="caret"></span>');

      } else {
        let buttonText = 'Filter items...';
        switch(filterObj.subtype) {

            case 'type':
              let contentTypes = filterObj["content-types"];
              buttonText = 'that are ';
              if (filterObj.operator == 'exclusive') {
                buttonText += 'not ';
              }
              contentTypes.forEach((contentType, index) => {
                if (contentTypes.length > 2) {
                  if (index > 0 && index < contentTypes.length - 2) {
                    buttonText += ', ';
                  }
                  if (index == contentTypes.length - 1) {
                    buttonText += 'or ';
                  }
                }
                buttonText += scalarapi.model.scalarTypes[contentType].plural;
              });
            break;

            case 'content':
              buttonText = 'that ';
              if (filterObj.operator == 'exclusive') {
                buttonText += 'don’t include “';
              } else if (filterObj.operator == 'inclusive') {
                buttonText += 'include “';
              }
              buttonText += filterObj.content + '”';
            break;

            case 'relationship':
              let relationshipContentTypes = filterObj["content-types"];
              let relationshipType = filterObj.relationship;

              if(relationshipContentTypes == 'all-types' && relationshipType == 'parent') {
                buttonText = 'that are parents of';
              }
              if(relationshipContentTypes == 'all-types' && relationshipType == 'child') {
                buttonText = 'that are children of';
              }
              if(relationshipContentTypes == 'path' && relationshipType == 'parent') {
                buttonText = 'that contain';
              }
              if(relationshipContentTypes == 'path' && relationshipType == 'child') {
                buttonText = 'that are contained by';
              }
              if(relationshipContentTypes == 'tag' && relationshipType == 'parent') {
                buttonText = 'that tag ';
              }
              if(relationshipContentTypes == 'tag' && relationshipType == 'child') {
                buttonText = 'that are tagged by ';
              }
              if(relationshipContentTypes == 'annotation' && relationshipType == 'parent') {
                buttonText = 'that annotate ';
              }
              if(relationshipContentTypes == 'annotation' && relationshipType == 'child') {
                buttonText = 'that are annotated by';
              }
              if(relationshipContentTypes == 'comment' && relationshipType == 'parent') {
                buttonText = 'that comment on';
              }
              if(relationshipContentTypes == 'comment' && relationshipType == 'child') {
                buttonText = 'that are commented on by';
              }

            break;

            case 'distance':
              let distanceQuantity = filterObj.quantity;
              let distanceUnits = filterObj.units;
              if(distanceUnits == 'miles'){
                distanceUnits = 'mi.';
              }
              if(distanceUnits == 'kilometers'){
                distanceUnits = 'km.'
              }
              buttonText = `items ≤ ${distanceQuantity} ${distanceUnits} from`;
            break;

            case 'quantity':
              let quantity = filterObj.quantity;
              buttonText = `no more than ${quantity}`;
            break;

            case 'metadata':
              let metadataOperator = filterObj.operator;
              let metadataContent = filterObj.content;
              let metadataProperty = filterObj["metadata-field"]

              let operatorText;
              if(metadataOperator == 'inclusive'){
                operatorText = 'incluse'
              } else if(metadataOperator == 'exclusive'){
                operatorText = 'does not include'
              }
              buttonText = `that ${operatorText} "${metadataContent}" in ${metadataProperty}`;
            break;

            case 'visit-date':
              let visitDateQuantity = filterObj.quantity;
              let visitDateUnits = filterObj.units;
              let visitDate = filterObj.datetime;

              buttonText = `visited ≤ ${visitDateQuantity} ${visitDateUnits} before ${visitDate}`;

            break;
        }
        button.text(buttonText).append('<span class="caret"></span>');
      }
    }

    // delete filter button
    ScalarLenses.prototype.deleteFilterButton = function(componentIndex, modifierIndex) {
      this.scalarLensObject.components[componentIndex].modifiers.splice(modifierIndex, 1);
      this.saveLens();
      this.updateEditorDom();
    }

    // add Plus button
    ScalarLenses.prototype.addPlusButton = function(componentContainer, componentIndex){
      let button = $(
         `<div class="btn-group plus-button"><button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
           <span class="plus-icon"></span></button>
           <ul id="content-dropdown" class="dropdown-menu">
             <li><a>Add content</a></li>
             <li><a>Add filter</a></li>
             <li><a>Add sort</a></li>
           </ul>
         </div>`
      );
      let modifierCount = this.scalarLensObject.components[componentIndex].modifiers.length;
      if (modifierCount == 0) {
        componentContainer.find('.content-selector-button').after(button);
      } else {
        componentContainer.find('.filter-button').eq(modifierCount-1).after(button);
      }
      button.data('componentIndex', componentIndex);
      var me = this;
      button.find('li').on('click', function (event) {
        let buttonText = $(this).text();
        let componentIndex = parseInt($(this).parent().parent().data('componentIndex'));
        switch(buttonText) {
          case 'Add content':
          break;
          case 'Add filter':
          me.scalarLensObject.components[componentIndex].modifiers.push({"type": "filter"});
          me.updateEditorDom();
          break;
          case 'Add sort':
          me.scalarLensObject.components[componentIndex].modifiers.push({"type": "sort"});
          me.updateEditorDom();
          break;
        }
      });
    }

    // add content-type modal
    ScalarLenses.prototype.addContentTypeModal = function(){

      let element = $(
        `<div id="modalByType" class="modal fade caption_font" role="dialog">
           <div class="modal-dialog">
             <div class="modal-content">
               <div class="modal-body">
                 <p>Select all items of this type:</p>
                 <div class="btn-group"><button id="byType" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
                     Select item...<span class="caret"></span></button>
                   <ul id="content-type-dropdown" class="dropdown-menu">
                     <li><a>All content</a></li>
                     <li><a>Page</a></li>
                     <li><a>Media</a></li>
                     <li><a>Path</a></li>
                     <li><a>Tag</a></li>
                     <li><a>Annotation</a></li>
                     <li><a>Comment</a></li>
                   </ul>
                 </div>
               </div>
               <div class="modal-footer">
                 <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                 <button type="button" class="btn btn-primary done" data-dismiss="modal">Done</button>
               </div>
             </div>
           </div>
         </div>`
      )

      var me = this

      // store 'items by type' modal content
      element.find('li').on('click', function(){
        $('#byType').text($(this).text()).append('<span class="caret"></span>')
      });

      element.find('.done').on('click', function(){

        let contentSelector = {
          "type": "items-by-type",
          "content-type": $('#byType').text().split(/[_\s]/).join("-").toLowerCase()
        }
        me.scalarLensObject.components[me.editedComponentIndex]["content-selector"] = contentSelector
        me.updateContentSelectorButton(me.scalarLensObject.components[me.editedComponentIndex]["content-selector"], $(me.element).find('.content-selector-button').eq(me.editedComponentIndex))
        me.saveLens(me.getLensResults)
      });
      return element
    }

    // add distance modal
    ScalarLenses.prototype.addDistanceModal = function(){

      let element = $(
           `<div id="modalByDistance" class="modal fade caption_font" role="dialog">
             <div class="modal-dialog">
               <div class="modal-content">
                 <div class="modal-body">
                   <p>Add any item that is within</p>
                   <div class="row">
                     <div class="col-sm-10">
                       <div class="col-sm-5">
                         <input id="distanceQuantity" type="text" class="form-control" aria-label="..." placeholder="Enter distance">
                       </div>
                       <div class="col-sm-5">
                         <div class="btn-group">
                           <button id="distanceUnits" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
                             Select unit...<span class="caret"></span></button>
                           <ul id="distance-dropdown" class="dropdown-menu">
                             <li><a>miles</a></li>
                             <li><a>kilometers</a></li>
                           </ul>
                         </div>
                       </div>
                     </div>
                   </div>
                   <p>of these coordinates:</p>
                   <div class="row">
                     <div class="col-sm-10">
                       <div class="col-sm-5">
                         <input id="latitude" type="text"class="form-control" aria-label="..." placeholder="Latitude (decimal)">
                       </div>
                       <div class="col-sm-5">
                         <input id="longitude" type="text" class="form-control" aria-label="..." placeholder="Longitude (decimal)">
                       </div>
                     </div>
                   </div>
                 </div>
                 <div class="modal-footer">
                   <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                   <button id="distanceDone" type="button" class="btn btn-primary done" data-dismiss="modal">Done</button>
                 </div>
               </div>
             </div>
           </div>`
        )

        var me = this

        element.find('li').on('click', function(){
          $('#distanceUnits').text($(this).text()).append('<span class="caret"></span>')
        });

        element.find('.done').on('click', function(){
          let contentSelector = {
            "type":"items-by-distance",
            "quantity": $('#distanceQuantity').val(),
            "units": $('#distanceUnits').text(),
            "coordinates": $('#latitude').val() + ', ' + $('#longitude').val()
          }

          me.scalarLensObject.components[me.editedComponentIndex]["content-selector"] = contentSelector
          me.updateContentSelectorButton(me.scalarLensObject.components[me.editedComponentIndex]["content-selector"], $(me.element).find('.content-selector-button').eq(me.editedComponentIndex))
          me.saveLens(me.getLensResults);

        });

        return element

    }

    // add filter Modal
    // sets default state for all filter modals
    // handles done click event for all filters
    ScalarLenses.prototype.addFilterModal = function(){
      let element = $(
        `<div id="filterModal" class="modal fade caption_font" role="dialog">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-body">
                <h4 class="heading_font">Configure filter</h4>
                <div class="filter-modal-container">
                  <div class="filter-modal-content"></div>
                  <div class="filter-counters">
                    <div class="left-badge">
                      <span class="counter">0</span>
                      <span class="filter-arrow"></span>
                    </div>
                    <div class="right-badge">
                      <span class="filter-arrow"></span>
                      <span class="counter">0</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary done" data-dismiss="modal">Done</button>
              </div>
            </div>
          </div>
        </div>`
      )

      var me = this;

      let componentContainer = $('.filter-modal-container')
      element.find('.filter-modal-container').prepend(me.addFilterButton(componentContainer))

      // saves values
      element.find('.done').on('click', function(){

        let type = $('.filter-modal-content').data('filterType')

        switch(type){
          case 'type':
            filterObj = {
              "type": "filter",
              "subtype": "type",
              "operator": $('#operator-button').data('option').value,
              "content-types": [$('#content-type-button').data('option').value]
            }
          break;
          case 'content':
            filterObj = {
              "type": "filter",
              "subtype": "content",
              "operator": $('#operator-button').data('option').value,
              "content": $('#content-input').val()
            }
          break;
          case 'relationship':
            filterObj = {
              "type":"filter",
              "subtype":"relationship",
              "content-types": [$('#relationship-content-button').data('option').value],
              "relationship": $('#relationship-type-button').data('option').value
            }
          break;
          case 'distance':
            filterObj = {
              "type":"filter",
              "subtype":"distance",
              "quantity": $('#distanceFilterQuantity').val(),
              "units": $('#distance-units-button').data('option').value
            }
          break;
          case 'quantity':
            filterObj = {
              "type":"filter",
              "subtype":"quantity",
              "quantity":$('#filterQuantityValue').val()
            }
          break;
          case 'metadata':

          let ontologyValue = $('#ontology-button').data('option').value;
          let propertyValue = $('#property-button').data('option').value;

            filterObj = {
              "type":"filter",
              "subtype":"metadata",
              "operator":$('#operator-button').data('option').value,
              "content":$('#metadata-content').val(),
              "metadata-field":`${ontologyValue}:${propertyValue}`
            }

          break;
          case 'visit-date':

            let dateTimeValue;
            let dateButton = $('#date-button').data('option').value;
            let dateTimeInput = $('#visitdate-input').val();
            if(dateButton == 'now') {
              dateTimeValue = dateButton;
            } else if (dateButton == 'date') {
              dateTimeValue = dateTimeInput;
            }

            filterObj = {
              "type":"filter",
              "subtype": "visit-date",
              "quantity":$('#visitdate-quantity').val(),
              "units":$('#visitdate-units-button').data('option').value,
              "datetime": dateTimeValue
            }


          break;
        }

        me.scalarLensObject.components[me.editedComponentIndex].modifiers[me.editedModifierIndex] = filterObj;
        me.updateFilterButton(me.scalarLensObject.components[me.editedComponentIndex].modifiers[me.editedModifierIndex], $(me.element).find('.component-container').eq(me.editedComponentIndex).find('.filter-button').eq(me.editedModifierIndex))
        me.saveLens(me.getLensResults);
      });

      return element;
    }

    // update Filter modal
    ScalarLenses.prototype.updateFilterModal = function(type, filterObj){

      if(!filterObj) filterObj = this.getDefaultFilter(type);
      let modalContainer = $('.filter-modal-content');
      modalContainer.data('filterType', type);

      switch(type) {

        case 'type':
        this.addTypeFilterForm(modalContainer, filterObj);
        this.updateTypeFilterForm();
        break;

        case 'content':
        this.addContentFilterForm(modalContainer, filterObj);
        this.updateContentFilterForm();
        break;

        case 'relationship':
        this.addRelationshipFilterForm(modalContainer, filterObj);
        this.updateRelationshipFilterForm();
        break;

        case 'distance':
        this.addDistanceFilterForm(modalContainer, filterObj);
        this.updateDistanceFilterForm();
        break;

        case 'quantity':
        this.addQuantityFilterForm(modalContainer, filterObj);
        this.updateQuantityFilterForm();
        break;

        case 'metadata':
        this.addMetadataFilterForm(modalContainer, filterObj);
        this.updateMetadataFilterForm();
        break;

        case 'visit-date':
        this.addVisitDateFilterForm(modalContainer, filterObj);
        this.updateVisitDateFilterForm();
        break;

      }
    }

    // get default filter state
    ScalarLenses.prototype.getDefaultFilter = function(type){

      switch(type){
        case 'type':
          filterObj = {
          	"type": "filter",
            "subtype": "type",
            "operator": "inclusive",
            "content-types": []
          }
        break;
        case 'content':
          filterObj = {
          	"type": "filter",
            "subtype": "content",
            "operator": "inclusive",
            "content": ""
          }
        break;
        case 'relationship':
          filterObj = {
          	"type": "filter",
            "subtype": "relationship",
            "content-types": [],
            "relationship": "child"
          }
        break;
        case 'distance':
          filterObj = {
          	"type": "filter",
            "subtype": "distance",
            "quantity": 5,
            "units": "kilometers"
          }
        break;
        case 'quantity':
          filterObj = {
          	"type": "filter",
            "subtype": "quantity",
            "quantity": 5
          }
        break;
        case 'metadata':
          filterObj = {
            "type":"filter",
            "subtype":"metadata"

          }
        break;
        case 'visitdate':
          filterObj = {
            "type":"filter",
            "subtype":"visit-date"
          }
        break;

      }
      return filterObj

    }

    // add type filter form
    ScalarLenses.prototype.addTypeFilterForm = function(container, filterObj){

      container.empty();
      let element = $(`
        <div class="filterByType">
          <p>Allow any items through that</p>
          <div class="btn-group">
            <button id="operator-button" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              is a<span class="caret"></span>
            </button>
            <ul id="operator-list" class="dropdown-menu"></ul>
          </div>
          <div class="btn-group">
            <button id="content-type-button" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Select type(s)<span class="caret"></span>
            </button>
            <ul id="content-type-list" class="dropdown-menu"></ul>
          </div>
        </div>
      `).appendTo(container);

      if (!filterObj) filterObj = this.getDefaultFilter('type');
      let me = this;
      let onClick = function() { me.updateTypeFilterForm(); };

      this.populateDropdown($('#operator-button'), $('#operator-list'), filterObj.operator, onClick,
        '<li><a></a></li>',
        [
          {label: "are", value: "inclusive"},
          {label: "are not", value: "exclusive"}
        ]);

      this.populateDropdown($('#content-type-button'), $('#content-type-list'), filterObj['content-types'], onClick,
        '<li><a></a></li>',
        [
          {label: "pages", value: "page"},
          {label: "media files", value: "media"},
          {label: "paths", value: "path"},
          {label: "tags", value: "tag"},
          {label: "annotations", value: "annotation"},
          {label: "comments", value: "comment"}
        ]);

      return element;
    }

    // update type filter form
    ScalarLenses.prototype.updateTypeFilterForm = function() {
      let option;

      // update operator menu
      let operatorButton = $('#operator-button');
      option = operatorButton.data('option');
      if (!option) { // if nothing selected yet, pull the option from the first item
        option = $('#operator-list').find('li').eq(0).data('option');
        operatorButton.data('option', option);
      }
      operatorButton.text(option.label).append('<span class="caret"></span>');

      // update content type menu
      let contentTypeButton = $('#content-type-button');
      option = contentTypeButton.data('option');
      if (!option) { // if nothing selected yet, create a placeholder option
        option = {label: 'Select type(s)', value: null};
      }
      contentTypeButton.text(option.label).append('<span class="caret"></span>');
    }

    // add content filter
    ScalarLenses.prototype.addContentFilterForm = function(container, filterObj) {

      container.empty();
      let element = $(`
        <div class="filterByContent">
          <p>Allow any items through that</p>
          <div class="row">
            <div class="btn-group">
              <button id="operator-button" type="button" class="btn btn-default btn-md dropdown-toggle content-operator" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                include<span class="caret"></span>
              </button>
              <ul id="operator-list" class="dropdown-menu filter-by-content"></ul>
              <span style="margin-left:10px;vertical-align:middle;"> this text:</span>
            </div>
          </div>
          <div class="row">
            <input id="content-input" type="text" class="form-control" aria-label="..." placeholder="Enter text" style="max-width:300px;margin:10px auto 0;">
          </div>
        </div>
      `).appendTo(container);

      if (!filterObj) filterObj = this.getDefaultFilter('content');
      let me = this;
      let onClick = function() { me.updateContentFilterForm(); };

      this.populateDropdown($('#operator-button'), $('#operator-list'), filterObj.operator, onClick,
        '<li><a></a></li>',
        [
          {label: "include", value: "inclusive"},
          {label: "don’t include", value: "exclusive"}
        ]);

      $('#content-input').val(filterObj.content);

      return element;
    }

    // update content filter
    ScalarLenses.prototype.updateContentFilterForm = function() {
      // update operator menu
      let operatorButton = $('#operator-button');
      let option = operatorButton.data('option');
      if (!option) { // if nothing selected yet, pull the option from the first item
        option = $('#operator-list').find('li').eq(0).data('option');
        operatorButton.data('option', option);
      }
      operatorButton.text(option.label).append('<span class="caret"></span>');
    }

    // add relationship filter
    ScalarLenses.prototype.addRelationshipFilterForm = function(container, filterObj){

      container.empty();
      let element = $(`
        <div class="filterByRelationship">
          <p>Add any items that are</p>
          <div class="btn-group"><button type="button" id="relationship-content-button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
              Select type..<span class="caret"></span></button>
            <ul id="relationship-content-list" class="dropdown-menu"></ul>
          </div>
          <div class="btn-group"><button id="relationship-type-button" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
              Select relationship...<span class="caret"></span></button>
            <ul id="relationship-type-list" class="dropdown-menu"></ul>
          </div>
          <p id="human-readable-text">(i.e. <span class="human-readable-relationship"></span>) any of these <span class="relationship-quantity"></span> items</p>
        </div>

        `).appendTo(container);

        if (!filterObj) filterObj = this.getDefaultFilter('relationship');
        let me = this;
        let onClick = function() { me.updateRelationshipFilterForm(); };

        this.populateDropdown($('#relationship-content-button'), $('#relationship-content-list'), filterObj['content-types'], onClick,
          '<li><a></a></li>',
          [
            {label: "(all types)", value: "all-types"},
            {label: "path", value: "path"},
            {label: "tag", value: "tag"},
            {label: "annotation", value: "annotation"},
            {label: "comment", value: "comment"}
          ]);

          this.populateDropdown($('#relationship-type-button'), $('#relationship-type-list'), filterObj.relationship, onClick,
            '<li><a></a></li>',
            [
              {label: "(any relationship)", value: "any-relationship"},
              {label: "parents", value: "parent"},
              {label: "children", value: "child"}
            ]);

        return element
    }

    // update relationship filter
    ScalarLenses.prototype.updateRelationshipFilterForm = function (){

      let option;

      // update relationship content type menu
      let relationshipContentButton = $('#relationship-content-button');
      option = relationshipContentButton.data('option');
      if (!option) { // if nothing selected yet, create a placeholder option
        option = {label: 'Select type(s)', value: null};
      }
      relationshipContentButton.text(option.label).append('<span class="caret"></span>');
      let relationshipContent = relationshipContentButton.text();


      // update relationship type menu
      let relationshipTypeButton = $('#relationship-type-button');
      option = relationshipTypeButton.data('option');
      if (!option) { // if nothing selected yet, pull the option from the first item
        option = $('#relationship-type-list').find('li').eq(0).data('option');
        relationshipTypeButton.data('option', option);
      }
      relationshipTypeButton.text(option.label).append('<span class="caret"></span>');
      let relationshipType = relationshipTypeButton.text()


      // update human-readable-text
      let humanReadableText = $('.human-readable-relationship');

      if(relationshipContent == '(all types)' && relationshipType == 'parents') {
        humanReadableText.text('that are parents of');
      }
      if(relationshipContent == '(all types)' && relationshipType == 'children') {
        humanReadableText.text('that are children of');
      }
      if(relationshipContent == 'path' && relationshipType == 'parents') {
        humanReadableText.text('that contain');
      }
      if(relationshipContent == 'path' && relationshipType == 'children') {
        humanReadableText.text('that are contained by');
      }
      if(relationshipContent == 'tag' && relationshipType == 'parents') {
        humanReadableText.text('that tag');
      }
      if(relationshipContent == 'tag' && relationshipType == 'children') {
        humanReadableText.text('that are tagged by');
      }
      if(relationshipContent == 'annotation' && relationshipType == 'parents') {
        humanReadableText.text('that annotate');
      }
      if(relationshipContent == 'annotation' && relationshipType == 'children') {
        humanReadableText.text('that are annotated by');
      }
      if(relationshipContent == 'comment' && relationshipType == 'parents') {
        humanReadableText.text('that comment on');
      }
      if(relationshipContent == 'comment' && relationshipType == 'children') {
        humanReadableText.text('that are commented on by');
      }





    }

    // add distance filter form
    ScalarLenses.prototype.addDistanceFilterForm = function(container, filterObj){

      container.empty();
      let element = $(`
        <div class="filterByDistance">
          <p>Add any items that are within</p>
           <div class="row filterByDistance">
             <input type="text" id="distanceFilterQuantity" class="form-control" aria-label="..." placeholder="Enter distance" style="max-width:115px;float:left;">
             <div class="btn-group" style="min-width:109px;">
               <button type="button" id="distance-units-button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
                 Select unit...<span class="caret"></span></button>
               <ul id="distance-units-dropdown" class="dropdown-menu"></ul>
             </div>
           </div>
           <p class="quantity-description">of these <span class="filter-quantity base ">0</span> items</p>
        </div>
        `).appendTo(container);

        if (!filterObj) filterObj = this.getDefaultFilter('distance');
        let me = this;
        let onClick = function() { me.updateDistanceFilterForm(); };

        $('#distanceFilterQuantity').val(filterObj.quantity)

        this.populateDropdown($('#distance-units-button'), $('#distance-units-dropdown'), filterObj.units, onClick,
          '<li><a></a></li>',
          [
            {label: "miles", value: "miles"},
            {label: "kilometers", value: "kilometers"}
          ]);

        return element

    }

    // update distance filter form
    ScalarLenses.prototype.updateDistanceFilterForm = function(){

      let option;

      // update distance units menu
      let distanceUnitsButton = $('#distance-units-button');
      option = distanceUnitsButton.data('option');
      if (!option) { // if nothing selected yet, create a placeholder option
        option = {label: 'Select unit(s)', value: null};
      }
      distanceUnitsButton.text(option.label).append('<span class="caret"></span>');

    }

    // add quantity filter form
    ScalarLenses.prototype.addQuantityFilterForm = function(container, filterObj){

      container.empty();
      let element = $(`
        <div class="filterByQuantity">
          <p>Allow no more than</p>
          <div class="row" style="max-width:175px;margin:0 auto;">
           <input id="filterQuantityValue" type="text" required class="form-control" aria-label="..." placeholder="Enter quantity" style="max-width:118px;float:left;">
           <span style="vertical-align:middle"> items</span>
          </div>
        </div>
        `).appendTo(container);

        if (!filterObj) filterObj = this.getDefaultFilter('quantity');
        let me = this;
        let onClick = function() { me.updateQuantityFilterForm(); };

        $('#filterQuantityValue').val(filterObj.quantity)

      return element

    }

    // update quantity filter form
    ScalarLenses.prototype.updateQuantityFilterForm = function(){

      // let quantityInput = document.getElementById('filterQuantityValue');
      //
      // quantityInput.addEventListener('keyup', function(){
      //   var text = quantityInput.value;
      //   //console.log('New text is "' + text + '"');
      //
      //   if(isNaN(text) || text < 1 || text > 5) {
      //     //alert('please enter a number btwn 0 and 5');
      //     $('#filterByQuantity').find('.done').css({'pointer-events':'none'})
      //
      //   }
      //   // if($('#distanceFilterQuantity').val() == " "){
      //   //   $(this).css({'pointer-events':'none'});
      //   // }
      // });

    }

    // add metadata filter form
    ScalarLenses.prototype.addMetadataFilterForm = function(container, filterObj){

      container.empty();
      let element = $(`
        <div class="filterByMetadata">
          <p>Allow any item through that</p>
            <div class="row">
              <div class="btn-group"><button type="button" id="operator-button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
                  includes<span class="caret"></span></button>
                <ul id="operator-list" class="dropdown-menu"></ul>
                <span style="margin-left:10px;vertical-align:middle;"> this text:</span>
              </div>
            </div>
            <div class="row">
              <input type="text" id="metadata-content" type="number" min="0" max="5" class="form-control metadataContent" aria-label="..." placeholder="Enter text">
            </div>
            <div class="row" style="margin-top:10px;">
            <span style="margin-left:10px;vertical-align:middle;"> in this metadata field</span>
              <div class="btn-group"><button id="ontology-button" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
                  Select field...<span class="caret"></span></button>
                <ul id="ontology-list" class="dropdown-menu"></ul>
              </div>
              <div class="row" style="margin-top:10px;">
              <div class="btn-group"><button id="property-button" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
                  Select field...<span class="caret"></span></button>
                <ul id="property-list" class="dropdown-menu"></ul>
              </div>
            </div>
         </div>
        `).appendTo(container);

        if (!filterObj) filterObj = this.getDefaultFilter('metadata');
        let me = this;
        let onClick = function() { me.updateMetadataFilterForm(); };

        // operator dropdown
        this.populateDropdown($('#operator-button'), $('#operator-list'), filterObj.operator, onClick,
          '<li><a></a></li>',
          [
            {label: "includes", value: "inclusive"},
            {label: "does not include", value: "exclusive"}
          ]);

        // save metadata content value
        $('#metadata-content').val(filterObj.content)

        // ontology dropdown
        this.populateDropdown($('#ontology-button'), $('#ontology-list'), filterObj["metadata-field"], onClick,
          '<li><a></a></li>',
          [
            // list will be dynamic
            {label: "Dublin Core", value: "dublin-core"}

          ]);
        // property dropdown
        this.populateDropdown($('#property-button'), $('#property-list'), filterObj["metadata-field"], onClick,
          '<li><a></a></li>',
          [
            // list will be dynamic
            {label: "temporal", value: "temporal"}
          ]);

      return element

    }

    // update metadata filter form
    ScalarLenses.prototype.updateMetadataFilterForm = function(){

      let option;

      // update operator menu
      let operatorButton = $('#operator-button');
      option = operatorButton.data('option');
      if (!option) { // if nothing selected yet, pull the option from the first item
        option = $('#operator-list').find('li').eq(0).data('option');
        operatorButton.data('option', option);
      }
      operatorButton.text(option.label).append('<span class="caret"></span>');

      // update ontology button
      let ontologyButton = $('#ontology-button');
      option = ontologyButton.data('option');
      if (!option) { // if nothing selected yet, pull the option from the first item
        option = {label: 'Select ontology', value: null};
      }
      ontologyButton.text(option.label).append('<span class="caret"></span>');

      // update property button
      let propertyButton = $('#property-button');
      option = propertyButton.data('option');
      if (!option) { // if nothing selected yet, pull the option from the first item
        option = {label: 'Select property', value: null};
      }
      propertyButton.text(option.label).append('<span class="caret"></span>');


    }

    // add visitdate filter form
    ScalarLenses.prototype.addVisitDateFilterForm = function(container, filterObj){

      container.empty();
      let element = $(`
        <div class="filterByVisitDate">
          <p>Allow any items through that were visited up to</p>
           <div class="row" style="max-widtH:210px;margin:0 auto;">
             <input id="visitdate-quantity" class="form-control" aria-label="..." placeholder="Enter quantity">
             <div class="btn-group" style="min-width:83px;">
               <button id="visitdate-units-button" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
                 Select unit...<span class="caret"></span></button>
               <ul id="visitdate-units-list" class="dropdown-menu"></ul>
             </div>
            </div>
            <div class="row limitRow" style="margin-top:10px;">
            <span>before</span>
             <div class="btn-group">
               <button id="date-button" type="button" class="btn btn-default btn-md dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" value"">
                 now<span class="caret"></span></button>
               <ul id="date-list" class="dropdown-menu"></ul>
             </div>
             <input id="visitdate-input" type="datetime-local" class="form-control" aria-label="..." placeholder="Enter date: mm/dd/yyyy">
           </div>
        </div>
        `).appendTo(container);


        if (!filterObj) filterObj = this.getDefaultFilter('visit-date');
        let me = this;
        let onClick = function() { me.updateVisitDateFilterForm(); };


        $('#visitdate-quantity').val(filterObj.quantity)
        $('#visitdate-input').val(filterObj.datetime);


        if(filterObj.datetime == 'date'){
          $('#visitdate-input').css({'display':'block'});
        } else {
          $('#visitdate-input').css({'display':'none'});
        }

        // units dropdown
        this.populateDropdown($('#visitdate-units-button'), $('#visitdate-units-list'), filterObj.operator, onClick,
          '<li><a></a></li>',
          [
            {label: "hours", value: "hours"},
            {label: "days", value: "days"},
            {label: "weeks", value: "weeks"},
            {label: "years", value: "years"}
          ]);

        // date dropdown
        this.populateDropdown($('#date-button'), $('#date-list'), filterObj.operator, onClick,
          '<li><a></a></li>',
          [
            {label: "now", value: "now"},
            {label: "specific date", value: "date"}

          ]);

      return element

    }

    // update visitdate filter form
    ScalarLenses.prototype.updateVisitDateFilterForm = function() {

      let option;

      // update units button
      let unitsButton = $('#visitdate-units-button');
      option = unitsButton.data('option');
      if (!option) { // if nothing selected yet, pull the option from the first item
        option = $('#visitdate-units-list').find('li').eq(0).data('option');
        unitsButton.data('option', option);
      }
      unitsButton.text(option.label).append('<span class="caret"></span>');


      // update date button
      let dateButton = $('#date-button');
      option = dateButton.data('option');
      if (!option) { // if nothing selected yet, pull the option from the first item
        option = $('#date-list').find('li').eq(0).data('option');
        dateButton.data('option', option);
      }
      dateButton.text(option.label).append('<span class="caret"></span>');

      let visitdateInput = $('#visitdate-input');
      if(dateButton.text() == 'specific date'){
        visitdateInput.css({'display':'block'});
      } else {
        visitdateInput.css({'display':'none'});
      }

    }

    // populate a dropdown
    ScalarLenses.prototype.populateDropdown = function(buttonElement, listElement, currentData, onClick, markup, options) {
      options.forEach(option => {
        let listItem;
        switch (option.value) {

          case 'separator':
          $('<li role="separator" class="divider"></li>').appendTo(listElement);
          break;

          case 'delete':
          listItem = $('<li><a>' + option.label + '</a></li>').appendTo(listElement);
          listItem.data('option', option).on('click', onClick);
          break;

          default:
          listItem = $(markup).appendTo(listElement);
          this.getInnermostChild(listItem).text(option.label);
          listItem.data('option', option).on('click', function(evt){
            buttonElement.data('option', $(this).data('option'));
            onClick(evt);
          });
          if (currentData) {
            if (typeof(currentData) == 'array') {
              if (currentData.indexOf(option.value) != -1) {
                buttonElement.data('option', option);
              }
            } else if (currentData == option.value) {
              buttonElement.data('option', option);
            }
          }
          break;

        }
      });
    }

    ScalarLenses.prototype.getInnermostChild = function(element) {
      let target = element.children();
      while (target.length) {
        target = target.children();
      }
      return target.end();
    }

    // get Lens results
    ScalarLenses.prototype.getLensResults = function(){
      this.scalarLensObject.book_urn = 'urn:scalar:book:' + $('link#book_id').attr('href');
      let url = $('link#approot').attr('href').replace('application/','') + 'lenses';
      $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(this.scalarLensObject),
        async: true,
        context: this,
        success: function success(data) {
      	  if ('undefined' != typeof(data.error)) {
        		console.log('There was an error attempting to get Lens data: '+data.error);
        		return;
      	  };
          console.log('lens results:');
          console.log(JSON.stringify(data));
        },
        error: function error(response) {
    	     console.log('There was an error attempting to communicate with the server.');
    	     console.log(response);
        }
      });
    }

    // ajax call to post user lens selections
    ScalarLenses.prototype.saveLens = function(successHandler){
      this.baseURL = $('link#parent').attr('href');
      $.ajax({
        url: this.baseURL + "api/relate",
        type: "POST",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(this.scalarLensObject),
        async: true,
        context: this,
        success: successHandler,
        error: function error(response) {
          console.log(response);
        }
      });
    }

    // callback for content-selector
    ScalarLenses.prototype.handleContentSelected = function(nodes){

      if (nodes && nodes.length != 0) {
        //console.log(nodes);

        // extract the 'slug' property of each node and put into an array;
        // this gets stored in the "items" property
        let nodeTitles = nodes.map(node => node.title);

        // set JSON object value
        this.scalarLensObject.components[this.editedComponentIndex]["content-selector"].type = 'specific-items';
        this.scalarLensObject.components[this.editedComponentIndex]["content-selector"].items = nodeTitles;

        this.updateEditorDom();
        this.saveLens(this.getLensResults);

      }
    }

    // plugin wrapper around the constructor,
    // to prevent against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new ScalarLenses( this, options ));
            }
        });
    }



})( jQuery, window, document );
