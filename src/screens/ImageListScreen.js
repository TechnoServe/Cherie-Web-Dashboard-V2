// ImageTable.js
import React, { useState,useEffect } from 'react';
import '../css/ImageTable.css'; 
import useStore from "../store";
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query,getDocs, collectionGroup, addDoc } from "firebase/firestore";
import { ref as storageRef, getDownloadURL, uploadBytes, getStorage } from "firebase/storage"
import {firestore} from '../config/firebase';


const storage = getStorage();

const ImageListScreen = () => {
  const { setImageUrl } = useStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageData, setImageData] = useState([]);
  const [imageData_, setImageData_] = useState([]);

  const navigate = useNavigate();
  // Sample image data
 

  const handlePreviewClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsLoading(true);

    const image = new Image();
    image.src = imageUrl;

    image.onload = () => {
      setIsLoading(false);
    };
  };

  const closePreview = () => {
    setSelectedImage(null);
  };

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }



  const importAll = (r) => {
    return r.keys().map((key) => key.replace(/^.*[\\/]/, ''));
  }


  const createDoc = async(fileName) => {
    const imageData = { imageUrl: `https://firebasestorage.googleapis.com/v0/b/cherie-323217.appspot.com/o/new-images%2FEthiopia%2F${fileName}?alt=media&token=ba416cdc-5e1a-4eb2-9fab-4257407d88ba`, country:"Ethiopia",annotated:false };

        // Add the document to the collection
        try {
          const docRef = await addDoc(collection(firestore,"countries/Ethiopia/images"),imageData);
          console.log(`Document added with ID: ${docRef.id}`);
        } catch (error) {
          console.error('Error adding document:', error);
        }
  }

  const readFilesInFolder = async () => {
    try {
      const files = importAll(require.context('./ethiopia-images', false, /\.(png|jpe?g|svg)$/));
      console.log(files)
      // Iterate through each file in the folder
      files.forEach(async (file) => {
        createDoc(file)
        
      });
    } catch (error) {
      console.error('Error reading folder:', error);
    }
  };

  const filter = (country) => {
    if(country=="" || country=="All"){
      setImageData(imageData_)
    }
    else{
      setImageData(imageData_.filter(image => image.country === country))
    }
  }

  useEffect(() => {
    const testFunc = async ()=>{
      const q = await getDocs(collectionGroup(firestore, "images"))
      console.log(q)
      let images =[]
      q.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        images.push(doc.data())
      });
      setImageData(images)
      setImageData_(images)
    }
    testFunc()
  }, []);

  return (
    <div className='images'>
     
    <div className='table-container'>
      <h1>Image Gallery</h1>
      <select onChange={(e)=>filter(e.target.value)} className='form-control mb-5' style={{width:'40%'}}>
        <option value="">Select country</option>
        <option value="All">All</option>
        <option value="Rwanda">Rwanda</option>
        <option value="Guatemala">Guatemala</option>
      </select>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Image Name</th>
            <th>Country</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {imageData.map((image, index) => (
            <tr key={index}>
              <td>{"image-"+(index+1)}</td>
              <td>{image.country}</td>
              <td>
                <button className="btn btn-primary" onClick={() => handlePreviewClick(image.imageUrl)}>Preview</button>
                <button className="btn" style={{marginLeft:10,background:'orange'}} onClick={() =>{ setImageUrl(image.imageUrl);navigate('/annotation-screen')}}>Annotate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedImage && (
        <div className="image-preview-overlay" onClick={closePreview}>
          <div className="image-popup">
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (<>
              <img src={selectedImage} alt="Preview" />
            <button className="btn btn-info" onClick={closePreview}>Close</button>
            </>
            )}
          </div>
        </div>
      )}
    </div>
    <button onClick={()=>readFilesInFolder()}>click me</button>
    </div>
  );
};

export default ImageListScreen;
