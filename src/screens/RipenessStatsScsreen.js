import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { firestore } from '../config/firebase';
import { doc, onSnapshot, collection, query,getDocs, collectionGroup } from "firebase/firestore";
import '../css/RipenessStats.css'
import moment from 'moment'
import { Line } from 'react-chartjs-2';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

const RipenessStatsScsreen = () => {
    const {ripeness} = useParams();
    const [filterYear,setFilterYear] = useState()
    const [countryStats,setCountryStats] = useState([])
    const [totalArtifacts,setTotalArtifacts] = useState(0)
    const [periodStats,setPeriodStats] = useState({})
    const [countryPeriodStats,setCountryPeriodStats] = useState({})
    const [countryPeriodArtifactsCount,setCountryPeriodArtifactsCount] = useState({})
    const [yearStats,setYearStats] = useState({})
    const [chartData,setChartData] = useState()
    const [ripenessStats,setRipenessStats] = useState({
        ripe: 0,
        underripe: 0,
        overripe: 0,
    })
    const [chartOptions,setChartOptions] = useState(
        {
            responsive: true,
            lineTension: 0.4,
            radius: 6,
            elements: {
              point:{
                radius: 3
              }
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
        }
    )
    const getData = async () => {
        const querySnapshot = await getDocs(collectionGroup(firestore, "predictions"))
  
        let firebaseData = []
        querySnapshot.forEach((doc) => {
          let data = doc.data()
          firebaseData.push(data)
        })
  
        // Sort data
        firebaseData = firebaseData.sort((prevArtifact, currentArtifact) =>  prevArtifact.predictedAt-currentArtifact.predictedAt)
    
        structureData(firebaseData)
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
        let cpStats = {}
        let cpArtifactsCount = {}
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
  
          let year = formatYear(data.predictedAt)
          if(!yStats[year]){
            yStats[year] = 0
            setYearStats(yStats)
          }
  
          if(!cpStats[region]){
            cpStats[region] = {}
          }
  
          if(!cpArtifactsCount[region]){
            cpArtifactsCount[region] = {}
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
  
          // Period
          let month = formatMonthYear(data.predictedAt)
          
  
          if(!cpStats[region][month]){
            // initialize the period
            cpStats[region][month] = {
              ripe: 0,
              underripe: 0,
              overripe: 0,
            }
            
          }
  
          if(!cpArtifactsCount[region][month]){
            // initialize the period
            cpArtifactsCount[region][month] = 0
          }
  
          // Filter the year
          if((filterYear && filterYear == year) || !filterYear){
            cpStats[region][month].ripe+=data.ripe
            cpStats[region][month].underripe+=data.underripe
            cpStats[region][month].overripe+=data.overripe
  
            cpArtifactsCount[region][month] += 1
  
            if(!pStats[month]){
            // initialize the period
            pStats[month] = {
              ripe: 0,
              underripe: 0,
              overripe: 0,
            }
            pStats[month].ripe+=data.ripe
            pStats[month].underripe+=data.underripe
            pStats[month].overripe+=data.overripe
            setPeriodStats(pStats)
            setCountryPeriodStats(cpStats)
            setCountryPeriodArtifactsCount(cpArtifactsCount)
          }
          }
  
          
        })
        changeChartData(pStats,cpStats,cpArtifactsCount)
      }

      const changeChartData = (pStats,cpStats,cpArtifactsCount) => {
            let months = Object.keys(pStats);
            let datasets = []

            Object.keys(cpStats).forEach((country) => {
              let cData = cpStats[country]
      
              let color = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`;
      
              // loop through available months and get the data
              let countryData = []
              months.forEach(month => {
                let artifactsCount = cpArtifactsCount[country][month]??1
                let monthValue = (cData[month]?.[ripeness])??0
                countryData.push(monthValue/artifactsCount)
              })
      
              datasets.push({
                label: country,
                backgroundColor: color,
                borderColor: color,
                data: countryData
              })
            })
      
            let chartData_ = {
              labels: months,
              datasets: datasets
            }
      
            console.log(chartData_)
            setChartData(chartData_)
      }

      useEffect(()=>{
        getData();
      },[filterYear])
  return (
    <main class="contsdainer-fluid">
    <div class="row mt-5 mx-3 ripeness-stats">
      <div class="col-12">
        <h2 class="display-3 mb-4 text-capitalize">{ripeness} Statistics</h2>
      </div>
      
      <div class="col-md-3 sidebar-sum">
        <p class="text-muted">Below are country statistics for average <b class="text-capitalize">{ripeness}</b> cherry</p>
        <div class="card country-summary-card mb-3 p-3 shadow border-0">
          <table class="table">
            <tr class="border-bottom">
              <th>Country</th>
              <th class="text-capitalize">{ripeness}</th>
            </tr>
            {Object.keys(countryStats).map((stat)=>
            <tr>
            <td>{stat}</td>
            <td>{Math.round(countryStats[stat][ripeness]/countryStats[stat].artifacts)}%</td>
            </tr>
            )}
            
          </table>
        </div>
      </div>
      <div class="col-md-9">
        <div class="col-4">
          <select onChange={(e)=>setFilterYear(e.target.value)} class="form-select">
            <option value="">All time</option>
            {Object.keys(yearStats).map(year=>
            <option value={year}>{year}</option>
            )}
          </select>
        </div>
        {(chartData && Object.keys(periodStats))&&
        <div class="mt-4" style={{width:'100%',height:400}}>
        <Line data={chartData} options={chartOptions}/>
       </div>
        }
      </div>
    </div>
  </main>
  )
}

export default RipenessStatsScsreen;