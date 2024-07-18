import React, { useState,useEffect } from 'react';
import moment from 'moment';
import { doc, onSnapshot, collection, query,getDocs, collectionGroup } from "firebase/firestore";
import {firestore} from '../config/firebase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { CSVLink } from 'react-csv';
const ArtifactsScreen = () => {
  const [artifacts,setArtifacts] = useState([])
  const [totalArtifacts,setTotalArtifacts] = useState(0)
  const [rawData,setRawData] = useState(0)
  const [ripeMin,setRipeMin] = useState()
  const [ripeMax,setRipeMax] = useState()
  const [underripeMin,setUnderripeMin] = useState()
  const [underripeMax,setUnderripeMax] = useState()
  const [overripeMin,setOverripeMin] = useState()
  const [overripeMax,setOverripeMax] = useState()
  const [countryStats,setCountryStats] = useState([])
  const [countryList,setCountryList] = useState([])
  const [fromDate,setFromDate] = useState()
  const [toDate,setToDate] = useState()
  const [filterCountry,setFilterCountry] = useState()
  const [initialRun,setInitialRun] = useState(false)

  const formatInternalDate = (strDate) => {
    return moment(new Date(strDate)).format('YYYY/MM/DD HH:mm')
  }

  const formatDate = (strDate) => {
    return moment(new Date(strDate)).format('DD/MM/YYYY HH:mm')
  }

  const csvLink = {
    filename:'cherie-report.csv',
    data:artifacts
  }


  const structureData = (datas) => {
    let country = {}
    let artifactsData = []
    let countries_ = []
    datas.forEach((doc) => {
      let data = doc.data()
      let region = data.region
      // get countries list only on initial run
      if(countries_.indexOf(region) < 0){
        countries_.push(region)
      }

      if(filterCountry && region != filterCountry){
        // console.log("skip", data)
        return null;
      };

      // filter ripeness
      if(underripeMin && data.underripe < underripeMin){
        return null;
      }
      if(underripeMax && data.underripe > underripeMax){
        return null;
      }
      if(ripeMin && data.ripe < ripeMin){
        return null;
      }
      if(ripeMax && data.ripe > ripeMax){
        return null;
      }
      if(overripeMin && data.overripe < overripeMin){
        return null;
      }
      if(overripeMax && data.overripe > overripeMax){
        return null;
      }

      if(fromDate && formatInternalDate(data.predictedAt) < formatInternalDate(fromDate)){
        return null;
      }

      if(toDate && formatInternalDate(data.predictedAt) > formatInternalDate(toDate)){
        return null;
      }
      artifactsData.push(data)

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
      setCountryStats(country)
    })
    setCountryList(countries_)

    if(filterCountry || fromDate || toDate){
        const filteredArtifacts = applyFilters(artifactsData)
        setArtifacts(filteredArtifacts)
        setTotalArtifacts(filteredArtifacts.length)
    }
    else{
        setArtifacts(artifactsData)
        setTotalArtifacts(artifactsData.length)
    }
    
  }
  
  const getArtifacts = async () => {
    const querySnapshot = await getDocs(collectionGroup(firestore, "predictions"));
    setRawData(querySnapshot)
    structureData(querySnapshot)
    setInitialRun(true)
  }
  const applyFilters = (artifactsData) => {
    return artifactsData.filter((data) => {
      if (filterCountry && data.region !== filterCountry) {
        return false;
      }
  
      if (fromDate && moment(data.predictedAt).isBefore(fromDate)) {
        return false;
      }
      if (toDate && moment(data.predictedAt).isAfter(toDate)) {
        return false;
      }
  
      return true;
    });
  };

  const refreshTable = () => {
    setFilterCountry()
    setFromDate()
    setToDate()
  }

  const paginatorLeft = <Button onClick={()=>refreshTable()} type="button" icon="pi pi-refresh" text />;
  const paginatorRight = <CSVLink {...csvLink}><Button type="button" icon="pi pi-download" text /></CSVLink>;

  useEffect(() => {
    getArtifacts()
  },[filterCountry,fromDate,toDate])

  return (
    <main class="artifacts contsdainer-fluid">
    <div class="row mt-5 mx-3">
      <div class="col-4">
        <h3 class="mb-3">Coffee cherry artifacts</h3>
        <div class="alert alert-warning text-center" role="alert">
                <p class="fw-bolder text-black fs-4">Total : {totalArtifacts}</p>
        </div>
      </div>
      <div class="col-6">
      <div class="row"  style={{paddingLeft:100}}>
          <div class="col-4">
            <h4 class="mb-3">Country</h4>
            <label class="form-label">Filter a specific country</label>
            <select onChange={(e)=>setFilterCountry(e.target.value)} class="form-select" name="country" >
              <option value="">Select Country</option>
              {countryList.map(country =>
              <option value={country}>{country}</option>
                )}
            </select>
          </div>
          <div class="col-6 mb-4">
            <h4 class="mb-3">Period</h4>
            <div class="row">
              <div class="col-md-6">
                <label class="form-label">From</label>
                <input onChange={(e)=>setFromDate(e.target.value)} name="from_date" type="date" max="100"  class="form-control"/>
              </div>
              <div class="col-md-6">
                <label class="form-label">To</label>
                <input onChange={(e)=>setToDate(e.target.value)} name="to_date" type="date" max="100" class="form-control"/>
              </div>
            </div>
          </div>
          

        </div>
      </div>
        
      <div class="col-12" style={{borderRadius:10,boxShadow: '2px 2px 10px 0px rgba(0, 0, 0, 0.5)'}}>
        <DataTable value={artifacts} var="artifact" paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} tableStyle={{ minWidth: '50rem' }}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}" paginatorLeft={paginatorLeft} paginatorRight={paginatorRight}>
            <Column field="region" header="Region" ></Column>
            <Column
                field="ripe"
                header="Ripe"
                body={(rowData) =>Math.round(rowData.ripe)}
            ></Column>
            <Column
                field="underripe"
                header="Underripe"
                body={(rowData) =>Math.round(rowData.underripe)}
            ></Column>
            <Column
                field="overripe"
                header="Overripe"
                body={(rowData) =>Math.round(rowData.overripe)}
            ></Column>
            <Column
                field="rating"
                header="Rating"
                body={(rowData) =>rowData.rating? `${rowData.rating * 20}%`:"-"}
            ></Column>
            <Column
                field="predictedAt"
                header="Predicted At"
                body={(rowData) =>formatDate(rowData.predictedAt)}
            ></Column>
            <Column
                field="imageUri"
                header="View"
                body={(rowData) =>
                    <a href={rowData.imageUri} className='btn btn-primary' target="_blank">View</a>
                }
            ></Column>
        </DataTable>
      </div>
    </div>

  </main>
  )
}

export default ArtifactsScreen;