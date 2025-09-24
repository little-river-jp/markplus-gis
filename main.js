
    const map = new maplibregl.Map({
        container: 'map',
        center: [139.660344139425916, 35.876171956184599],
        zoom:18,
        style: {
            version: 8,
            glyphs: './fonts/{fontstack}/{range}.pbf', 
            sources: {
                osm: {
                    type: 'raster',
                    tiles: [
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    maxzoom: 19,
                    attribution: 'OpenStreetMap',
                },

                photo: {
                    type: 'raster',
                    tiles: [
                        'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'
                    ],
                    tileSize: 256,
                    maxzoom: 19,
                    attribution: '地理院航空写真',
                },

                
                polygon: {
                    type: 'geojson',
                    data: './polygon.geojson',
                    attribution: '地番データ'
                },

                point:{
                    type: 'geojson',
                    data: './point.geojson',
                    attribution: '座標データ'
                }

            },

            layers:[
                {
                    id: 'osm-layer',
                    source: 'osm',
                    type: 'raster',
                },

                {
                    id: 'photo-layer',
                    source: 'photo',
                    type: 'raster',
                    layout: {visibility: 'none',},
                },

                {
                    id: 'point-layer',
                    source: 'point',
                    type: 'circle',
                    paint: {
                            'circle-color': 'red',
                    },
                },


                                {
                    id: 'point-label-layer', // 学校名を表示するレイヤー
                    source: 'point',
                    type: 'symbol', // フォントはsymbolとして表示する
                    minzoom: 12,
                    layout: {
                        'text-field': ['get', "CONAME"], // P29_004=学校名
                        'text-offset': [0, 0.5], // フォントの位置調整
                        'text-anchor': 'top', // フォントの位置調整
                        'text-font': ['Noto Sans CJK JP Bold'], // glyphsのフォントデータに含まれるフォントを指定
                        'text-size': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            10, // ズームレベル10のときに
                            8, // フォントサイズ8
                            14, // ズームレベル14のときに
                            14, // フォントサイズ14
                        ],
                        visibility: 'visible',
                    },
                    paint: {
                        'text-halo-width': 1,
                        'text-halo-color': '#fff',
                    },
                },

                {
                    id: 'polygon-layer',
                    source: 'polygon',
                    type: 'fill',
                    paint: {
                        'fill-color': '#FF0000',
                        'fill-opacity': 0.2,
                        'fill-outline-color' : 'blue',
                    },
                    layout: {visibility: 'none',},
                },


                {
                    id: 'polygon-label-layer', // 地番データを表示するレイヤー
                    source: 'polygon',
                    type: 'symbol',
                    minzoom: 12,
                    layout: {
                        'text-field': ['get', "GRNAME"], // GRNAME=地番
                        'text-offset': [0, 0], // フォントの位置調整
                        'text-anchor': 'center', // フォントの位置調整
                        'text-font': ['Noto Sans CJK JP Bold'], // glyphsのフォントデータに含まれるフォントを指定
                        'text-size': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            10, // ズームレベル10のときに
                            8, // フォントサイズ8
                            14, // ズームレベル14のときに
                            14, // フォントサイズ14
                        ],
                        visibility: 'none',
                    },
                    paint: {
                        'text-halo-width': 1,
                        'text-halo-color': '#fff',
                    },
                },

            ],
        },
    });

    document.querySelectorAll('.raster').forEach((v, i)=>{
        v.addEventListener('click', (e)=> {
            switch (e.currentTarget.value) {
            case 'osm-layer':
                map.setLayoutProperty('photo-layer', 'visibility', 'none');
                map.setLayoutProperty('osm-layer', 'visibility', 'visible');
                break;
            case 'photo-layer':
                map.setLayoutProperty('photo-layer', 'visibility', 'visible');
                map.setLayoutProperty('osm-layer', 'visibility', 'none');
                break;
            default:
                console.log(e.currentTarget.value);
            }
        });
    });

    document.querySelectorAll('.vector').forEach((v, i)=>{
        v.addEventListener('click', (e)=> {
            switch (e.currentTarget.value) {
            case 'polygon-layer':
                map.setLayoutProperty('point-layer', 'visibility', 'none');
                map.setLayoutProperty('polygon-layer', 'visibility', 'visible');
                map.setLayoutProperty('polygon-label-layer', 'visibility', 'visible');
                map.setLayoutProperty('point-label-layer', 'visibility', 'none');
                break;
            case 'point-layer':
                map.setLayoutProperty('point-layer', 'visibility', 'visible');
                map.setLayoutProperty('polygon-layer', 'visibility', 'none');
                map.setLayoutProperty('polygon-label-layer', 'visibility', 'none');
                map.setLayoutProperty('point-label-layer', 'visibility', 'visible');
                break;
            default:
                console.log(e.currentTarget.value);
            }
        });
    });


    let userLocation = null; 

    const geolocationControl = new maplibregl.GeolocateControl({
        trackUserLocation: true,
    });
    map.addControl(geolocationControl, 'bottom-right');
    geolocationControl.on('geolocate', (e) => {
        userLocation = [e.coords.longitude, e.coords.latitude];
    });


map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
        layers: [
            'point-layer',
        ],
    });
    if (features.length === 0) return; 
    console.log(features[0]);

    const feature = features[0];
    const popup = new maplibregl.Popup()
        .setLngLat(feature.geometry.coordinates) 
        .setHTML(
            `\
    <div style="font-weight:900; font-size: 1.2rem;">${
        feature.properties.CONAME
    }</div>\
    <div>X座標：${feature.properties.COX}</div>\
    <div>Y座標：${feature.properties.COY}</div>\
    <div>${feature.properties.CONOTE1 ?? ''}</div>\
    <div>${feature.properties.CONOTE2 ?? ''}</div>\
    </div>`,
        )
        .setMaxWidth('400px')
        .addTo(map);
});



    map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
        layers: [
            'polygon-layer',
        ],
    });
    if (features.length === 0) return; 
    console.log(features[0]);

    
    const feature = features[0];
    const popup = new maplibregl.Popup()
        .setLngLat(feature.geometry.coordinates[0][1]) 
        .setHTML(
            `\
    <div style="font-weight:900; font-size: 1.2rem;">地番：${
        feature.properties.GRNAME
    }</div>\
    <div>地積：${feature.properties.GRNOTE1 ?? ''}㎡</div>\
    <div>地目：${feature.properties.GRNOTE2 ?? ''}</div>\
    </div>`,
        )
        .setMaxWidth('400px')
        .addTo(map);
});