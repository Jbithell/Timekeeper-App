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
    if (m) {
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
        url: 'https://jbithell.com/projects/timekeeper/api/v4/' + path + "?USERKEY=43233&USERSECRET=23453459", //TODO remove these tokens and use proper auth - these tokens are only used for this and they need to be revoked asap
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
            ons.notification.alert("Sorry, we are having issues connecting to the network. Please reload the page and try again");
        }
    });
}
var projectData;
document.addEventListener('init', function(event) {
  var page = event.target;

  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  if (page.id === 'menuPage' || page.id === 'projectListPage') {
    if (document.querySelector('#menuPage')
      && document.querySelector('#projectListPage')
      && !document.querySelector('#projectListPage ons-list-item')) {
        //Doc has been initialised and ready to go
        apicall("projects/list/", null, function(data) {
            projectData = data["data"];
            $.each( projectData["PROJECTS"], function( key, value ) {
                if (value['timekeeper_projects_subprojectTier'] == 0) {
                    myApp.services.projects.create(value);
                }
            });
            var previousDate = "";
            $.each( projectData["SESSIONS"], function( key, value ) {
                if (moment(value["timekeeper_sessions_start"]).format('Do MMM YYYY') != previousDate) {
                    document.querySelector('#session-list').innerHTML = document.querySelector('#session-list').innerHTML + '<ons-list-header>' + moment(value["timekeeper_sessions_start"]).format('dddd Do MMM YYYY') + '</ons-list-header>';
                    previousDate = moment(value["timekeeper_sessions_start"]).format('Do MMM YYYY');
                }
                if (value["THISUSER"]) {
                    myApp.services.sessions.create(value);
                }

            });

            apicall("productivity/get/", null, function(data) {
                var heatmapdata = [];
                $.each( data["data"], function( key, value ) {
                    var thisDay = {"date": moment(key).format(),"details": [],"total":0};
                    $.each( value, function( subKey, subValue ) {
                        thisDay.details.push({"name": projectData["PROJECTS"][projectData["PROJECTS-IDTOKEYMAP"][subKey]]["timekeeper_projects_name"],"date": moment(key).format() + " 00:00:00","value": subValue});
                        thisDay.total += subValue;
                    });
                    heatmapdata.push(thisDay);
                });
                console.log(heatmapdata);
                calendarHeatmap.init(heatmapdata,"heatmapContainer", '#f77e9d', 'month');
            });

        });

    }
    }
});
