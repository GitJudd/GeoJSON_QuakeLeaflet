mapboxgl.accessToken = 'pk.eyJ1IjoianVkZGYiLCJhIjoiY2tmb2ppN2J4MDBqeTJxbXIyaTR1MnFtbSJ9.0M8Tm7eytTyJImDx8_qnzg';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-80, 30],
        zoom: 1.8
    });

    var months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    function filterBy(month) {
        var filters = ['==', 'month', month];
        map.setFilter('earthquake-circles', filters);
        map.setFilter('earthquake-labels', filters);
        document.getElementById('month').textContent = months[month];
    }

    map.on('load', function () {
        // Data courtesy of http://earthquake.usgs.gov/
        // Query for significant earthquakes in 2015 URL request looked like this:
        // http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2015-01-01&endtime=2015-12-31&minmagnitude=4'
        //
        // Here we're using d3 to help us make the ajax request but you can use
        // Any request method (library or otherwise) you wish.
        d3.json(
            'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2016-01-01&endtime=2016-12-31&minmagnitude=5',
            function (err, data) {
                if (err) throw err;
                data.features = data.features.map(function (d) {
                    d.properties.month = new Date(d.properties.time).getMonth();
                    return d;
                });

                map.addSource('earthquakes', {
                    'type': 'geojson',
                    data: data
                });

                map.addLayer({
                    'id': 'earthquake-circles',
                    'type': 'circle',
                    'source': 'earthquakes',
                    'paint': {
                        'circle-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            5,'#EC7014',
                            6,'#CC4C02',
                            7,'#993404',
                            8,'#662506'
                        ],
                        'circle-opacity': 0.8,
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            5,5,
                            6,10,
                            7,20,
                            8,40
                        ]
                    }
                });

                map.addLayer({
                    'id': 'earthquake-labels',
                    'type': 'symbol',
                    'source': 'earthquakes',
                    'layout': {
                        'text-field': [
                            'concat',
                            ['to-string', ['get', 'mag']],
                            'm'
                        ],
                        'text-font': [
                            'Open Sans Bold',
                            'Arial Unicode MS Bold'
                        ],
                        'text-size': 10
                    },
                    'paint': {
                        'text-color': 'rgba(0,0,0,0.5)'
                    }
                });

                // Set filter to first month of the year
                // 0 = January
                filterBy(0);

                document
                    .getElementById('slider')
                    .addEventListener('input', function (e) {
                        var month = parseInt(e.target.value, 10);
                        filterBy(month);
                    });
            }
        );
    });
