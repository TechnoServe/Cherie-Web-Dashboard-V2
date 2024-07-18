import React,{useState} from "react";
import '../css/Annotation.css'
import Canvas from "../component/Canvas";
import RegionsList from "../component/RegionsList";
import { useNavigate } from "react-router-dom";
import useStore from "../store";

const AnnotationScreen = () => {
  const { setBrightness, setColor } = useStore();
  const [cherieColor,setCherieColor] = useState('red')

  const navigate = useNavigate();
  return (
    <div className="annotation">
      
      <div className="myapp">
        <div className="left-panel">
          Brigthess
          <input
            id="slider"
            type="range"
            min="-1"
            max="1"
            step="0.05"
            defaultValue="0"
            onChange={e => {
              setBrightness(parseFloat(e.target.value));
            }}
          />
            <label style={{width:75,marginTop:50}}>Ripe</label>
            <input style={{width:75}} name='color' value="red" onChange={(e)=>{setCherieColor(e.target.value);setColor(e.target.value)}} type="radio" checked={cherieColor=='red'}/>
            <label style={{width:75}}>Underripe</label>
            <input style={{width:75}} name='color' value="#74FF33" onChange={(e)=>{setCherieColor(e.target.value);setColor(e.target.value)}} type="radio" checked={cherieColor=='#74FF33'}/>
            <label style={{width:75}}>Overripe</label>
            <input style={{width:75}} name='color' value="blue" onChange={(e)=>{setCherieColor(e.target.value);setColor(e.target.value)}} type="radio" checked={cherieColor=='blue'}/>
          <RegionsList />
        </div>
        <div className="right-panel">
        <h2>Annotate this image</h2>
          <Canvas />
        </div>
      </div>
    </div>
  );
};

export default AnnotationScreen;