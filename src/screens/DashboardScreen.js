import React, {useState,useEffect,useRef} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'
import { Line } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css'
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import L from 'leaflet'
import icon from '../images/pin2.png'
import MarkerClusterGroup from "react-leaflet-cluster";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import boundaries from '../config/boundaries';
import { doc, onSnapshot, collection, query,getDocs, collectionGroup } from "firebase/firestore";
import {firestore} from '../config/firebase';
import '../css/Dashboard.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

export const DashboardScreen = () => {
    const [chartData,setChartData] = useState()
    const [filterYear,setFilterYear] = useState()
    const [filterCountry,setFilterCountry] = useState()
    const [rawData,setRawData] = useState([])
    const [totalArtifacts,setTotalArtifacts] = useState(1)
    const [countryStats,setCountryStats] = useState([])
    const [periodStats,setPeriodStats] = useState({})
    const [yearStats,setYearStats] = useState({})
    const [markers,setMarkers] = useState([])
    const [ripenessStats,setRipenessStats] = useState({
        ripe: 0,
        underripe: 0,
        overripe: 0,
    })
    const [chartOptions,setChartOptions] = useState({
        responsive: true,
        lineTension: 0.4,
        radius: 6,
        pointDotRadius: 1,
        elements: {
          point:{
            radius: 3
          }
        },
        interaction: {
          mode: 'point'
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            grid: {
              display: true
            },
            ticks:{
              callback: function(value, index, ticks) {
                return value + '%';
              }
            }
          }
        },
        maintainAspectRatio: false
    })

    const customIcon = new L.Icon({
        iconUrl: icon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

    const triggerPrint = () => {
        window.print()
    }

    const mapContainerRef = useRef(null);
    const layerRef = useRef(null);

    const getCountryBounds = (country) => {
        if (layerRef.current) {
          mapContainerRef.current.removeLayer(layerRef.current);
        }
    
        if (country === 'Ethiopia' || country === 'Honduras' || country === 'Guatemala') {
          try {
            const countryFeature = boundaries.features.find(
              (feature) => feature.properties.ADMIN === country
            );
    
            if (countryFeature) {
              const countryBounds = L.geoJSON(countryFeature.geometry).getBounds();
              const lastLayer = L.geoJSON(countryFeature).addTo(mapContainerRef.current);
              zoomToCountry(countryBounds);
              layerRef.current = lastLayer;
            }
          } catch (error) {
            console.error(error);
          }
        } else {
          mapContainerRef.current.fitWorld().setZoom(2);
        }
    };
    
    const zoomToCountry = (bounds) => {
      mapContainerRef.current.fitBounds(bounds);
    };

    const changeChartData = (pStats) => {
        setChartData({
            labels: Object.keys(pStats),
            datasets: [
              {
                label: 'Ripe',
                backgroundColor: '#75EFA6',
                pointColor: "#75EFA6",
                borderColor: "#75EFA6",
                data: Object.values(pStats).map(pred => pred.ripe)
              },
              {
                label: 'Under ripe',
                backgroundColor: '#FB896B',
                borderColor: "#FB896B",
                data: Object.values(pStats).map(pred => pred.underripe).reverse()
              },
              {
                label: 'Over ripe',
                backgroundColor: '#6956E5',
                borderColor: "#6956E5",
                data: Object.values(pStats).map(pred => pred.overripe).reverse()
              }
            ]
          })
      }

    const formatMonthYear = (strDate) => {
        return moment(new Date(strDate)).format('MMM YYYY')
      }

    const formatYear = (strDate) => {
        return moment(new Date(strDate)).format('YYYY')
    }

    const structureData = (datas) => {
        setTotalArtifacts(datas.length)
        let country = {};
        let stats = {
            underripe: 0,
            overripe: 0,
            ripe: 0,
        }
        let pStats = {}
        let yStats = {}
        datas.forEach((data) => {
          let region = data.region
  
          // Check if region exists in object
          if(!country[region]){
            country[region] = {
              artifacts: 0,
              underripe: 0,
              overripe: 0,
              ripe: 0,
            }
          } 
  
          country[region].artifacts += 1
          country[region].underripe += data.underripe
          country[region].overripe += data.overripe
          country[region].ripe += data.ripe
          // ripeness
          stats={
            ripe: stats.ripe + data.ripe,
            underripe: stats.underripe + data.underripe,
            overripe: stats.overripe + data.overripe,
          }
          setRipenessStats(stats)
        
          
          setCountryStats(country)
  
          let year = formatYear(data.predictedAt)
  
          if(!yStats[year]){
            yStats[year] = 0
            setYearStats(yStats)
          }
  
          // Period
          console.log(filterYear, year)
          if( ( (filterCountry && data.region == filterCountry) || (!filterCountry && filterYear )) && ( (filterYear && filterYear == year ) || (!filterYear && filterCountry) )){
            let month = formatMonthYear(data.predictedAt)
            console.log('matched')
            if(!pStats[month]){
              pStats[month] = {
                ripe: data.ripe,
                underripe: data.underripe,
                overripe: data.overripe,
              }
              setPeriodStats(pStats)
              
            }
          }else if(!filterCountry && !filterYear){
            let month = formatMonthYear(data.predictedAt)
            if(!pStats[month]){
                pStats[month] = {
                  ripe: data.ripe,
                  underripe: data.underripe,
                  overripe: data.overripe,
                }
                setPeriodStats(pStats)
                
              }
          }
        })
        console.log("test", periodStats)
        changeChartData(pStats)
      }

      const getData = async() => {
        const querySnapshot = await getDocs(collectionGroup(firestore, "predictions"));
        console.log(querySnapshot)
        let markers_ = []
        let firebaseData = []
        querySnapshot.forEach((doc) => {
          let data = doc.data()
          firebaseData.push(data)
          if(data.coordinates){
            var coordinates_ = data.coordinates.split(',').map(str => parseFloat(str));
            markers_.push(coordinates_)
          }
        })
        setMarkers(markers_)
        // Sort data
        firebaseData = firebaseData.sort((prevArtifact, currentArtifact) =>  prevArtifact.predictedAt-currentArtifact.predictedAt)
  
        setRawData(firebaseData)
        console.log(JSON.stringify(firebaseData))
        structureData(firebaseData)
  
      }

      useEffect(()=>{
        getData();
      },[filterCountry,filterYear])
  return (
    <main class="contsdainer-fluid">
    <div class="row mt-5 mx-3">
      <div class="col-md-12 mb-3">
        <div class="d-flex mb-3">

        
          <h3>Aggregate ripeness stats</h3>
          <div onClick={triggerPrint} class="ms-4 mt-1 nav-link btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
            </svg>
            Export
          </div>
        </div>
        <div class="row">
        <div class="col-sm-3">
            <Link to="/ripeness-stats-screen/ripe" class="text-reset text-decoration-none" >
              <div class="alert alert-ripe text-center" role="alert">
                <p class="fw-bolder text-black fs-4">{Math.round(ripenessStats.ripe/totalArtifacts)}  %</p>
                <p class="text-black">Ripe</p>
              </div>
            </Link>
          </div>
          <div class="col-sm-3">
            <Link to="/ripeness-stats-screen/underripe" class="text-reset text-decoration-none" >
              <div class="alert alert-under text-center" role="alert">
                <p class="fw-bolder text-black fs-4">{Math.round(ripenessStats.underripe/totalArtifacts)}%</p>
                <p class="text-black">Under ripe</p>
              </div>
            </Link>
          </div>
          <div class="col-sm-3">
            <Link to="/ripeness-stats-screen/overripe" class="text-reset text-decoration-none" >
              <div class="alert alert-over text-center" role="alert">
                <p class="fw-bolder text-black fs-4">{Math.round(ripenessStats.overripe/totalArtifacts)}%</p>
                <p class="text-black">Over Ripe</p>
              </div>
            </Link>
          </div>

          <div class="col-sm-3">
            <div class="alert alert-warning text-center" role="alert">
              <Link  class="text-reset text-decoration-none">
                <p class="fw-bolder text-black fs-4">{totalArtifacts}</p>
                <p class="text-black">Total Uploads</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 sidebar-sum">
        {Object.keys(countryStats).map(stat=>
            <div class="card country-summary-card mb-3 shadow border-0">
            <div class="card-body">
              <h4 class="mb-4">{stat} ({countryStats[stat].artifacts})</h4>
              <div class="table-responsive">
                <table>
                  <tr>
                    <th  className='border-bottom'>Ripe</th>
                    <th  className='border-bottom'>Underripe</th>
                    <th  className='border-bottom'>Overripe</th>
                  </tr>
                  <tr>
                    <td>{Math.round(countryStats[stat].ripe/countryStats[stat].artifacts)}%</td>
                    <td>{Math.round(countryStats[stat].underripe/countryStats[stat].artifacts)}%</td>
                    <td>{Math.round(countryStats[stat].overripe/countryStats[stat].artifacts)}%</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <div class="col-md-9">
        <div class="row">
          <div class="col-6">
            <select class="form-select" onChange={(e)=>{setFilterCountry(e.target.value);getCountryBounds(e.target.value)}} >
              <option value="">All Countries</option>
              {Object.keys(countryStats).map(country=>
              <option value={country}  >{country}</option>
              )}
            </select>
          </div>
          <div class="col-4 offset-2">
            <select class="form-select" onChange={(e)=>setFilterYear(e.target.value)}>
              <option value="">Lifetime</option>
              {Object.keys(yearStats).map(year=>
              <option value={year}  >{year}</option>
              )}
            </select>
          </div>
        </div>
        {(chartData && Object.keys(periodStats))&&
        <div class="mt-4" style={{width:'100%',height:400}}>
        <Line data={chartData} options={chartOptions}/>
       </div>
        }

        <div class="container">
          <h5>Map Representation</h5>
          <div id="mapid" class="container">
          <MapContainer
            ref={mapContainerRef}
            className="map"
            center={[0, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={19}
            maxBounds={[[-85.06, -180], [85.06, 180]]}
            scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
                url='https://api.maptiler.com/tiles/satellite-mediumres-2018/{z}/{x}/{y}.jpg?key=W7NyU19P3WEbW4bioxer'
            />
            {/* TODO: Add markers */}
            
            <MarkerClusterGroup>
                {markers.map((marker, index) => (
                <Marker key={index} position={marker} icon={customIcon}>
                    <Popup>content</Popup>
                </Marker>
                ))}
            </MarkerClusterGroup>

          </MapContainer>
          </div>
        </div>
      </div>
    </div>
  </main>
  )
}
