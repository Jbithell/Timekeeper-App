// App logic.
window.myApp = {};
function hoursMinutesSeconds(time, d, h,m,s) {
    var output = '';
    if (typeof(d)==='undefined') d = false;
    if (typeof(h)==='undefined') h = true;
    if (typeof(m)==='undefined') m = true;
    if (typeof(s)==='undefined') s = false;
    if (time > 86400 && d) {
        days = Math.floor(time/86400);
        output += days;
        output += 'day' + (days != 1 ? 's' : '') + '';
        time -= days*86400;
    }
    if (time > 3600 && h) {
        hours = Math.floor(time/3600);
        output += hours + 'h' + '';
        time -= hours*3600;
    }
    if (time > 60 && m) {
        minutes = Math.floor(time/60);
        output += minutes + 'm' + '';
        time -= minutes*60;
    }
    if (s) {
        seconds = Math.round(time);
        output += seconds + 's';
        time -= seconds*60;
    }
    return output;
}
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
  if (page.id === 'menuPage' || page.id === 'projectListPage') {
    if (document.querySelector('#menuPage')
      && document.querySelector('#projectListPage')
      && !document.querySelector('#projectListPage ons-list-item')) {
        //TODO remove these tokens and use proper auth - these tokens are only used for this and they need to be revoked asap
        apicall("projects/list/?USERKEY=43233&USERSECRET=23453459", null, function(data) {
            $.each( data["PROJECTS"], function( key, value ) {
                myApp.services.projects.create(value);
            });
            var previousDate = "";
            $.each( data["SESSIONS"], function( key, value ) {
                if (moment(value["timekeeper_sessions_start"]).format('Do MMM YYYY') != previousDate) {
                    document.querySelector('#session-list').innerHTML = document.querySelector('#session-list').innerHTML + '<ons-list-header>' + moment(value["timekeeper_sessions_start"]).format('dddd Do MMM YYYY') + '</ons-list-header>';
                    previousDate = moment(value["timekeeper_sessions_start"]).format('Do MMM YYYY');
                }
                if (value["THISUSER"]) {
                    myApp.services.sessions.create(value);
                }

            });
        });
    }
  }
});
