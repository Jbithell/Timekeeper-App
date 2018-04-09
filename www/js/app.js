// App logic.
window.myApp = {};
function apicall(path, data, callback) {
    if (data !== null) var senddata = data;
    else var senddata = {};
    $.ajax({
        url: 'https://jbithell.com/projects/timekeeper/api/v4/' + path,
        type : "GET",
        data : senddata,
        cache : false,
        success: function (result) {
            console.log(result);
            if (result == 'AUTHFAIL') {
                console.log("HANDLE AUTH FAIL")
            } else if (result.result) {
                if (typeof callback === "function") {
                    callback(result);
                }
            }
            return false;
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(jqXHR);
            console.log(jqXHR['responseText']);
            console.log(errorThrown);
            alert("Sorry, we are having issues connecting to the network. Please reload the page and try again");
        }
    });
}

document.addEventListener('init', function(event) {
  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  // Fill the lists with initial data when the pages we need are ready.
    // This only happens once at the beginning of the app.
  if (page.id === 'menuPage' || page.id === 'pendingTasksPage') {
    if (document.querySelector('#menuPage')
      && document.querySelector('#pendingTasksPage')
      && !document.querySelector('#pendingTasksPage ons-list-item')) {
        //TODO remove these tokens and use proper auth - these tokens are only used for this and they need to be revoked asap
        apicall("projects/list/?USERKEY=43233&USERSECRET=23453459", null, function(data) {
            $.each( data["PROJECTS"], function( key, value ) {
                myApp.services.projects.create(value);
            });
        });
    }
  }
});
