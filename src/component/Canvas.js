import React, {useState,useRef} from 'react';
import Konva from 'konva';
import { Stage } from 'react-konva';

import Regions from './Regions';
import BaseImage from './BaseImage';

import useStore from '../store';
import AWS from 'aws-sdk';
import { SyncLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

AWS.config.update({
  accessKeyId: 'AKIAQYDJFN5YVHCP5552',
  secretAccessKey: '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',
  region: 'us-east-2',
});

const image1URL =
    'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80'; // Replace with the actual URL of your first image
  const image2URL =
    'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80';


let id = 1;

function getRelativePointerPosition(node) {
    // the function will return pointer position relative to the passed node
    const transform = node.getAbsoluteTransform().copy();
    // to detect relative position we need to invert transform
    transform.invert();

    // get pointer (say mouse or touch) position
    const pos = node.getStage().getPointerPosition();

    // now we find relative point
    return transform.point(pos);
}

function zoomStage(stage, scaleBy) {
    const oldScale = stage.scaleX();

    const pos = {
        x: stage.width() / 2,
        y: stage.height() / 2,
    };
    const mousePointTo = {
        x: pos.x / oldScale - stage.x() / oldScale,
        y: pos.y / oldScale - stage.y() / oldScale,
    };

    const newScale = Math.max(0.05, oldScale * scaleBy);

    const newPos = {
        x: -(mousePointTo.x - pos.x / newScale) * newScale,
        y: -(mousePointTo.y - pos.y / newScale) * newScale,
    };

    const newAttrs = limitAttributes(stage, { ...newPos, scale: newScale });

    stage.to({
        x: newAttrs.x,
        y: newAttrs.y,
        scaleX: newAttrs.scale,
        scaleY: newAttrs.scale,
        duration: 0.1,
    });
}

function limitAttributes(stage, newAttrs) {
    const box = stage.findOne('Image').getClientRect();
    const minX = -box.width + stage.width() / 2;
    const maxX = stage.width() / 2;

    const x = Math.max(minX, Math.min(newAttrs.x, maxX));

    const minY = -box.height + stage.height() / 2;
    const maxY = stage.height() / 2;

    const y = Math.max(minY, Math.min(newAttrs.y, maxY));

    const scale = Math.max(0.05, newAttrs.scale);

    return { x, y, scale };
}

const Canvas = () => {
    const [loading, setLoading] = useState(false)
    const stageRef = React.useRef();
    const layerRef = React.useRef(null);
    const { width, height } = useStore((s) => ({
        width: s.width,
        height: s.height,
    }));

    const canvasRef = useRef(null);
    
    const mergeImages = (file1, file2) => {
        const imageName = new Date().toString()
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img1 = new Image();
          const img2 = new Image();
          // Create object URLs for the File objects
        //   const url1 = URL.createObjectURL(file1);
        //   const url2 = URL.createObjectURL(file2);
          

          fetch(file1)
          .then((response) => response.blob())
          .then((blob) => {
            // Create a Data URL from the Blob
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataURL = event.target.result;
              img1.src = dataURL;
          img2.src = file2;
        //   console.log(file1,file2)
          img1.setAttribute('crossorigin', 'anonymous');
          img2.setAttribute('crossorigin', 'anonymous');
          img1.onload = () => {
            canvas.width = 2 * 512; // Set canvas width to accommodate both 512x512 images
            canvas.height = 512; 
      
            ctx.drawImage(img1, 0, 0, 512, 512);
      
            img2.onload = () => {
                // Draw the second image with a width and height of 512x512
                ctx.drawImage(img2, 512, 0, 512, 512);
                // Convert the merged image to a Blob
                canvas.toBlob((blob) => {
                    var convertedFile = new File([blob], "image",{type:`image/png`});

                    const s3 = new AWS.S3();
      const params = {
        Bucket: 'training.env',
        Key: `Rwanda/merged-images/${imageName}.png`,
        Body: convertedFile,
        ACL: 'public-read', // Adjust permissions as needed
      };

      s3.upload(params, (err, data) => {
        if (err) {
          alert(err);
          setLoading(false)
        } else {
            alert('Image successfully uploaded')
        }
      })
                  
                });
              };
          };
            };
            reader.readAsDataURL(blob);
          })

          
      
          


          
      
      };

    const navigate = useNavigate()
    const setSize = useStore((s) => s.setSize);
    const scale = useStore((state) => state.scale);
    const isDrawing = useStore((state) => state.isDrawing);
    const toggleDrawing = useStore((state) => state.toggleIsDrawing);

    const regions = useStore((state) => state.regions);
    const color = useStore((state) => state.color);
    const setRegions = useStore((state) => state.setRegions);
    const brightness = useStore((state) => state.brightness);

    const selectRegion = useStore((s) => s.selectRegion);

    const handleDownload =  () => {
        setLoading(true)
        const stage = stageRef.current;
        let file1;
        // Get the BaseImage from the layer
        const baseImage = layerRef.current.children[0];
      
        // Create a new canvas for the modified image
        const modifiedCanvas = document.createElement('canvas');
        modifiedCanvas.width = width;
        modifiedCanvas.height = height;
      
        const modifiedContext = modifiedCanvas.getContext('2d');
      
        // Draw the BaseImage onto the modified canvas with the brightness filter
        modifiedContext.filter = `brightness(${(brightness + 1) * 100}%)`;
        modifiedContext.drawImage(baseImage.image(), 0, 0, width, height);
        
        // Draw the Regions onto the main canvas
        const mainCanvas = stage.toCanvas();
      
        // Create a new image element from the modified canvas
        const modifiedImage = new Image();
        modifiedImage.src = modifiedCanvas.toDataURL();
        const imageName = new Date().toString()
        // After the modified image is loaded, draw it onto the main canvas
        modifiedImage.onload = async () => {
          const mainContext = mainCanvas.getContext('2d');
      
          // Clear the main canvas
          mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      
          // Draw the modified image onto the main canvas
          mainContext.drawImage(modifiedImage, 0, 0, width, height);
      
          // Draw the Regions onto the main canvas
          regions.forEach(region => {
            mainContext.beginPath();
            region.points.forEach((point, index) => {
              const { x, y } = point;
              if (index === 0) {
                mainContext.moveTo(x*scale, y*scale);
              } else {
                mainContext.lineTo(x*scale, y*scale);
              }
            });
            mainContext.closePath();
            mainContext.fillStyle = region.color;
            mainContext.fill();
          });
          // Convert the modified main canvas to data URL
          const modifiedDataURL = mainCanvas.toDataURL();

          var response = await fetch(baseImage.image().src)
          var blob = response.blob()
            // Create a File object
          file1 = new File([blob], "image",{type:`image/png`});

           mainCanvas.toBlob((blob)=>{
             mergeImages(baseImage.image().src, modifiedDataURL);
          })

          
          

          
       
        };
    };
      
      






    React.useEffect(() => {
        function checkSize() {
            const container = document.querySelector('.right-panel');
            setSize({
                width: container.offsetWidth,
                height,
            });
        }
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);
    return (
        <React.Fragment>
            <Stage
                ref={stageRef}
                width={width}
                height={height}
                scaleX={scale}
                scaleY={scale}
                className="canvas"
                onClick={(e) => {
                    const clickedNotOnRegion = e.target.name() !== 'region';
                    if (clickedNotOnRegion) {
                        selectRegion(null);
                    }
                }}
                onWheel={(e) => {
                    e.evt.preventDefault();
                    const stage = stageRef.current;

                    const dx = -e.evt.deltaX;
                    const dy = -e.evt.deltaY;
                    const pos = limitAttributes(stage, {
                        x: stage.x() + dx,
                        y: stage.y() + dy,
                        scale: stage.scaleX(),
                    });
                    stageRef.current.position(pos);
                }}
                onMouseDown={(e) => {
                    toggleDrawing(true);
                    const point = getRelativePointerPosition(e.target.getStage());
                    const region = {
                        id: id++,
                        color: color,
                        points: [point],
                    };
                    setRegions(regions.concat([region]));
                }}
                onMouseMove={(e) => {
                    if (!isDrawing) {
                        return;
                    }
                    const lastRegion = { ...regions[regions.length - 1] };
                    const point = getRelativePointerPosition(e.target.getStage());
                    lastRegion.points = lastRegion.points.concat([point]);
                    regions.splice(regions.length - 1, 1);
                    setRegions(regions.concat([lastRegion]));
                }}
                onMouseUp={(e) => {
                    if (!isDrawing) {
                        return;
                    }
                    const lastRegion = regions[regions.length - 1];
                    if (lastRegion.points.length < 3) {
                        regions.splice(regions.length - 1, 1);
                        setRegions(regions.concat());
                    }
                    toggleDrawing();
                }}
            >
                <BaseImage layerRef={layerRef} />
                <Regions />
            </Stage>
            <div className="zoom-container">
                <button
                    style={{border:'none',borderRadius:5,backgroundColor:'#bc6c25',color:'white'}}
                    onClick={() => {
                        zoomStage(stageRef.current, 1.2);
                    }}
                >
                    +
                </button>
                <button
                style={{border:'none',borderRadius:5,backgroundColor:'#bc6c25',color:'white'}}
                    onClick={() => {
                        zoomStage(stageRef.current, 0.8);
                    }}
                >
                    -
                </button>

                <button
                style={{border:'none',borderRadius:5,backgroundColor:'#bc6c25',color:'white'}}
                    onClick={() => {
                        handleDownload()
                    }}
                >
                {loading?
                <SyncLoader
                color={'white'}
                loading={loading}
                cssOverride={override}
                size={10}
                aria-label="Loading Spinner"
                data-testid="loader"
              />:"Upload"
              }
                    
                </button>
            </div>
        </React.Fragment>
    );
};

export default Canvas;