import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import '../App.css';
import AWS from 'aws-sdk';


AWS.config.update({
  accessKeyId: 'AKIAQYDJFN5YVHCP5552',
  secretAccessKey: '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',
  region: 'us-east-2',
});

const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 600 * 1024; // 20KB in bytes
const MAX_IMAGES_LIMIT = 1;




const UploadScreen = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('');

 

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter((file) => {
      // Check if the file size is within the limit
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`${file.name} exceeds the maximum allowed size of 20KB.`);
        return false;
      }
      return ALLOWED_IMAGE_FORMATS.includes(file.type);
    });

    if (validFiles.length === 0) {
      setError('No valid images were uploaded.');
      return;
    }

    setError('');

    // Check if the total number of images will exceed the limit
    if (uploadedImages.length + validFiles.length > MAX_IMAGES_LIMIT) {
      window.alert(`You can only upload a maximum of ${MAX_IMAGES_LIMIT} image.`);
      return;
    }

    const newUploadedImages = validFiles.map((file) => ({
      id: file.name + file.lastModified, // Adding a unique ID for each image
      name: file.name,
      preview: URL.createObjectURL(file),
    }));

    setUploadedImages((prevUploadedImages) => [
      ...prevUploadedImages,
      ...newUploadedImages,
    ]);
  }, [uploadedImages]);

  const removeImage = (id) => {
    setUploadedImages((prevUploadedImages) =>
      prevUploadedImages.filter((image) => image.id !== id)
    );
  };

  const onSubmit = () => {

    if(country && uploadedImages.length>0){

      uploadedImages.forEach((file) => {
        fetch(file.preview)
      .then(response => response.blob())
      .then(blob => {
      // Create a File object
      var convertedFile = new File([blob], file.name,{type:`image/${file.name.split('.')[1]}`});

      // Now you have a File object that you can use
      console.log("Converted File:", convertedFile);

      const s3 = new AWS.S3();
      const params = {
        Bucket: 'training.env',
        Key: `${country}/${new Date().toString()}.${file.name.split('.')[1]}`,
        Body: convertedFile,
        ACL: 'public-read', // Adjust permissions as needed
      };

      s3.upload(params, (err, data) => {
        if (err) {
          alert(err);
        } else {
          alert('Image uploaded successfully:', data.Location);
        }
      });
      })
      .catch(error => {
        console.error("Error fetching file data:", error);
      });
      });

      setCountry('');
      setUploadedImages([])

    }else{
      alert('You have to select a country before uploading!')
    }
    
    
  };

  useEffect(() => {
    // Clean up the image previews when the component unmounts
    return () => {
      uploadedImages.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [uploadedImages]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ALLOWED_IMAGE_FORMATS.join(','),
    multiple: true,
  });

  return (
    <div className="app-container">
      <div className="header" style={{ backgroundColor: '#ad1457' }}>
        <h1>Cherie Collector</h1>
      </div>

      <select className="dark-select" value={country} onChange={(e)=>setCountry(e.target.value)}>
      <option value="">Select country</option>
      <option value="Rwanda">Rwanda</option>
      <option value="Spain">Spain</option>
    </select>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag 'n' drop some images here, or click to select images</p>
        {error && <p className="error-message">{error}</p>}
      </div>

      {uploadedImages.length>0 && 
      <div className="preview-container">
      {uploadedImages.map((image) => (
        <div key={image.id} className="image-preview">
          <img src={image.preview} alt={image.name} />
          <p>{image.name}</p>
          <button onClick={() => removeImage(image.id)}>Remove</button>
        </div>
      ))}
    </div>
      }

      <button onClick={onSubmit} className="submit-button">
        Submit
      </button>
    </div>
  );
};

export default UploadScreen;
