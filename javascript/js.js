let googleMapa;
let suradnice;
let vyhladavaie;
let busMarkers = [];

let zobrazenieVzdialenosti;


function myGoogleMapa()
{
    suradnice = new google.maps.LatLng(48.151854, 17.073344);

    const mapaNastavenia= {
        center: suradnice,
        zoom: 14.80
    };

    const streetViewNastavenia = {
        position: suradnice,
        pov: {heading: 10, pitch: 0},
        zoom: 1
    };

    googleMapa = new google.maps.Map(document.getElementById("googleMapa"),mapaNastavenia);
    let googleStreetView = new google.maps.StreetViewPanorama(document.getElementById("googleStreetView"), streetViewNastavenia);

    const vyhladaj = document.getElementById("miesto");
    vyhladavanie = new google.maps.places.SearchBox(vyhladaj);

    googleMapa.addListener('bounds_changed', function() {
        vyhladavanie.setBounds(googleMapa.getBounds());
    });
    nastavMarker();

}

function nastavFei(){
    return {
         url: 'resource/gps.png',
         scaledSize: new google.maps.Size(30, 30),
         origin: new google.maps.Point(0, 0),
         anchor: new google.maps.Point(20, 68),
         labelOrigin: new google.maps.Point(15, 40)
     };
}

function nastavPoziciuSkoly(markerIcon){
    return {
        position: suradnice,
        map: googleMapa,
        dragging: false,
        icon: markerIcon,
        title: "Fakulta elektrotechniky a informatiky",
        label: {
            text: 'FEI STU',
            color: 'blue',
            fontWeight: "bold",
            fontSize: '10px'
        }
    };
}

function nastavMarker(){

    let markerIcon = nastavFei();
    let poziciaSkoly = nastavPoziciuSkoly(markerIcon);
    const marker = new google.maps.Marker(poziciaSkoly);

    const infoWindow = new google.maps.InfoWindow({
        content: 'Zemepisná šírka: 48.15185320000001 <br>Zemepisná dĺžka: 17.073344700000007'
    });

    marker.addListener("click",function ()
    {
        infoWindow.open(googleMapa, marker);
    });
}

function ziskatSuradniceMiesta(){
    const miesta = vyhladavanie.getPlaces();


    const bounds = new google.maps.LatLngBounds();

    miesta.forEach(function(miesto)
    {
        if (!miesto.geometry)
            return;


        if (miesto.geometry.viewport)
            bounds.union(miesto.geometry.viewport);
        else
            bounds.extend(miesto.geometry.location);
    });

    return bounds.getCenter();
}

function vypocetVzdialenosti(){
    if(vyhladavanie.getPlaces()=== undefined)
        return;

    const suradniceMiesta =ziskatSuradniceMiesta();
    vymaz();

    vynuluj();


    const vyber = document.getElementById("auto");
    const directionsService = new google.maps.DirectionsService;
    zobrazenieVzdialenosti = new google.maps.DirectionsRenderer({
        map: googleMapa
    });
    if(vyber.checked === true)
    {
        directionsService.route({
            origin: suradniceMiesta,
            destination: suradnice,
            travelMode: google.maps.TravelMode.DRIVING
        }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK)
            {
                zobrazVzdialenost(response);            }
        });
    }
    else
    {
        directionsService.route({
            origin: suradniceMiesta,
            destination: suradnice,
            travelMode: google.maps.TravelMode.WALKING
        }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK)
            {
                zobrazVzdialenost(response);            }
        })
    }
}

function zobrazVzdialenost(response){
    zobrazenieVzdialenosti.setDirections(response);
    document.getElementById("km").innerHTML = "Vzdialenosť: " +  response.routes[0].legs[0].distance.value / 1000+"km";
}


function zobrazBus(miesto)
{
    let bus = {
        url: 'resource/front-of-bus.png',
        scaledSize: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20,68),
    };
    let marker = new google.maps.Marker({
        map: googleMapa,
        position: miesto.geometry.location,
        icon: bus,
    });
    busMarkers.push(marker);
    let infowindow2 = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
        infowindow2.setContent(miesto.name + '<br> Zemepisná šírka: ' + miesto.geometry.location.lat() + '<br> Zemepisná dĺžka: ' + miesto.geometry.location.lng());
        infowindow2.open(googleMapa, this);
    });
}


function vymaz() {
    for (let i = 0; i < busMarkers.length; i++) {
        busMarkers[i].setMap(null);
    }
    busMarkers = [];
}

function zobrazZastavky(){
    vymaz();
    vynuluj();
    document.getElementById("km").innerHTML = "";
    defaultBounds();
    let service = new google.maps.places.PlacesService(googleMapa);
    service.nearbySearch({
        location: suradnice,
        radius: '1000',
        type: ['transit_station']
    }, callback);
}

function callback(results, status)
{

    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < results.length; i++) {
            zobrazBus(results[i]);
        }
    }
}
function defaultBounds()
{
    googleMapa.setCenter(suradnice);
    googleMapa.setZoom(14.80);
}

function vynuluj(){
    if (zobrazenieVzdialenosti != null) {
        zobrazenieVzdialenosti.setMap(null);
        zobrazenieVzdialenosti = null;
    }
}