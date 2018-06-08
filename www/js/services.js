/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

myApp.services = {

  /////////////////
  // Task Service //
  /////////////////
  projects: {

    create: function(data) {
      var projectItem = ons.createElement(
        '<ons-list-item tappable category="' + myApp.services.categories.parseId(data.category)+ '">' +
          '<div class="left"><div class="subProjectPadding" style="width: ' + data.timekeeper_projects_subprojectTier*10 + 'px;"></div>' + hoursMinutesSeconds(data.timekeeper_projects_totalTime, false, true, true, false) + '</div>' +
          '<div class="center">' +
            data.timekeeper_projects_name +
          '</div>' +
          '<div class="right">' +
          '<span class="notification">' + (data.SUBPROJECT_TOTAL_TIME >0 ? hoursMinutesSeconds(data.SUBPROJECT_TOTAL_TIME, false, true, true, false) : "") + '</span>' +
          '</div>' +
        '</ons-list-item>'

      );

      // Store data within the element.
      projectItem.data = data;

      // Add functionality to push 'details_project.html' page with the current element as a parameter.
      projectItem.querySelector('.center').onclick = function() {
        document.querySelector('#myNavigator')
          .pushPage('html/details_project.html',
            {
              animation: 'lift',
              data: {
                element: projectItem
              }
            }
          );
      };

      // Check if it's necessary to create new categories for this item.
      myApp.services.categories.updateAdd(projectItem.data.category);

      //if (projectItem.data.highlight) {
      //  projectItem.classList.add('highlight');
      //}

      document.querySelector('#project-list').insertBefore(projectItem,null);

      //insert sub projects
      if (data["SUBPROJECTS"]) {
          $.each( data["SUBPROJECTS"], function( key, value ) {
              //[projectData["PROJECTS-IDTOKEYMAP"]]
              myApp.services.projects.create(projectData["PROJECTS"][value]);
          });
      }

    },


    // Modifies the inner data and current view of an existing task.
    update: function(projectItem, data) {
      if (data.title !== projectItem.data.title) {
        // Update title view.
        projectItem.querySelector('.center').innerHTML = data.title;
      }

      if (data.category !== projectItem.data.category) {
        // Modify the item before updating categories.
        projectItem.setAttribute('category', myApp.services.categories.parseId(data.category));
        // Check if it's necessary to create new categories.
        myApp.services.categories.updateAdd(data.category);
        // Check if it's necessary to remove empty categories.
        myApp.services.categories.updateRemove(projectItem.data.category);

      }

      // Add or remove the highlight.
      projectItem.classList[data.highlight ? 'add' : 'remove']('highlight');

      // Store the new data within the element.
      projectItem.data = data;
    },

    // Deletes a task item and its listeners.
    remove: function(projectItem) {
      projectItem.removeEventListener('change', projectItem.data.onCheckboxChange);

      myApp.services.animators.remove(projectItem, function() {
        // Remove the item before updating the categories.
        projectItem.remove();
        // Check if the category has no items and remove it in that case.
        myApp.services.categories.updateRemove(projectItem.data.category);
      });
    }
  },
    sessions: {

        // Creates a new task and attaches it to the pending task list.
        create: function (data) {
            // Task item template.
            var sessionItem = ons.createElement(
                '<ons-list-item tappable category="' + myApp.services.categories.parseId(data.category) + '">' +
                '<div class="left">' + hoursMinutesSeconds(data.timekeeper_sessions_time, false, true, true, true) + '</div>' +
                '<div class="center">' +
                data.PROJECT.timekeeper_projects_name_short +
                '</div>' +
                '<div class="right">' +
                '<span class="notification">' + '</span>' +
                '</div>' +
                '</ons-list-item>'
            );

            // Store data within the element.
            sessionItem.data = data;

            // Add functionality to push 'details_session.html' page with the current element as a parameter.
            sessionItem.querySelector('.center').onclick = function () {
                document.querySelector('#myNavigator')
                    .pushPage('html/details_session.html',
                        {
                            animation: 'lift',
                            data: {
                                element: sessionItem
                            }
                        }
                    );
            };

            // Check if it's necessary to create new categories for this item.
            myApp.services.categories.updateAdd(sessionItem.data.category);

            //if (sessionItem.data.highlight) {
            //  sessionItem.classList.add('highlight');
            //}
            document.querySelector('#session-list').insertBefore(sessionItem, null);

        },
    },
  /////////////////////
  // Category Service //
  ////////////////////
  categories: {

    // Creates a new category and attaches it to the custom category list.
    create: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);

      // Category item template.
      var categoryItem = ons.createElement(
        '<ons-list-item tappable category-id="' + categoryId + '">' +
          '<div class="left">' +
            '<ons-radio name="categoryGroup" input-id="radio-'  + categoryId + '"></ons-radio>' +
          '</div>' +
          '<label class="center" for="radio-' + categoryId + '">' +
            (categoryLabel || 'No category') +
          '</label>' +
        '</ons-list-item>'
      );

      // Adds filtering functionality to this category item.
      myApp.services.categories.bindOnCheckboxChange(categoryItem);

      // Attach the new category to the corresponding list.
      document.querySelector('#custom-category-list').appendChild(categoryItem);
    },

    // On task creation/update, updates the category list adding new categories if needed.
    updateAdd: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);
      var categoryItem = document.querySelector('#menuPage ons-list-item[category-id="' + categoryId + '"]');

      if (!categoryItem) {
        // If the category doesn't exist already, create it.
        myApp.services.categories.create(categoryLabel);
      }
    },

    // On task deletion/update, updates the category list removing categories without tasks if needed.
    updateRemove: function(categoryLabel) {
      var categoryId = myApp.services.categories.parseId(categoryLabel);
      var categoryItem = document.querySelector('#tabbarPage ons-list-item[category="' + categoryId + '"]');

      if (!categoryItem) {
        // If there are no tasks under this category, remove it.
        myApp.services.categories.remove(document.querySelector('#custom-category-list ons-list-item[category-id="' + categoryId + '"]'));
      }
    },

    // Adds filtering functionality to a category item.
    bindOnCheckboxChange: function(categoryItem) {
      var categoryId = categoryItem.getAttribute('category-id');
      var allItems = categoryId === null;

      categoryItem.updateCategoryView = function() {
        var query = '[category="' + (categoryId || '') + '"]';

        var projectItems = document.querySelectorAll('#tabbarPage ons-list-item');
        for (var i = 0; i < projectItems.length; i++) {
          projectItems[i].style.display = (allItems || projectItems[i].getAttribute('category') === categoryId) ? '' : 'none';
        }
      };

      categoryItem.addEventListener('change', categoryItem.updateCategoryView);
    },

    // Transforms a category name into a valid id.
    parseId: function(categoryLabel) {
      return categoryLabel ? categoryLabel.replace(/\s\s+/g, ' ').toLowerCase() : '';
    }
  },

};
