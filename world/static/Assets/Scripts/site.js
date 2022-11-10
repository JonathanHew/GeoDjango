
var HOST = location.protocol + "//" + location.host;
var locationMarker;
var circle;
$("#map").css({
    "width": "100%",
    "height": $(document).height() - ($("#header").height() + $("#footer").height() + 45)
});

function map_init_basic(map, options) {
    let pos;
    map.setView([53.5, -8.5], 11);
    updateLocation(map);
    map.on('touchstart click dblclick ', function () {
        updateLocation(map);
    });
}
function updateLocation(map) {
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            setMapToCurrentLocation(map, pos);
            update_db(pos);
        },
        function (err) {

        },
        {
            enableHighAccuracy: true,
            timeout: 3000
        }
    );
};

function setMapToCurrentLocation(map, pos) {
    console.log("In setMapToCurrentLocation.");
    let myLatLon = L.latLng(pos.coords.latitude, pos.coords.longitude);
    map.flyTo(myLatLon, 16);
    if (locationMarker) {
        map.removeLayer(locationMarker);
    }
    locationMarker = L.marker(myLatLon).addTo(map);
    if (circle) {
        map.removeLayer(circle);
    }
    circle = L.circle(myLatLon, {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3,
        radius: pos.coords.accuracy
    }).addTo(map);
    $(".toast-body").html("Found location<br>Lat: " + myLatLon.lat + " Lon: " + myLatLon.lng);
    $(".toast").toast('show');
    locationMarker.bindPopup("<b>Hello!</b><br>You are located at: <br> Lat: " + myLatLon.lat + "<br> Lon: " + myLatLon.lng).openPopup();
}

function update_db(pos) {
    let locString = pos.coords.longitude + ", " + pos.coords.latitude;
    $.ajax({
        type: "POST",
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        url: HOST + "/updatedb/",
        data: {
            point: locString
        }
    }).done(function (data, status, xhr) {
        console.log(data["message"]);
        let originalMsg = $(".toast-body").html();
        $(".toast-body").html(originalMsg + "<br/>Updated database<br/>" + data["message"]);
    }).fail(function (xhr, status, error) {
            console.log(error);
            let originalMsg = $(".toast-body").html();
            $(".toast-body").html(originalMsg + "<br/>" + error);
    }).always(function () {
        console.log("find_loc_ed finished");
        $(".toast").toast('show');
    });
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}