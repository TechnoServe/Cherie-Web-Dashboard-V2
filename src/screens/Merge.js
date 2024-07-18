import React, { useEffect, useRef } from 'react';

export const Merge = () => {
  const image1URL =
    'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80'; // Replace with the actual URL of your first image
  const image2URL =
    'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80';

  const MergeImages = ({ image1, image2 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const img1 = new Image();
      const img2 = new Image();

      img1.src = image1;
      img2.src = image2;
      img1.setAttribute('crossorigin', 'anonymous');
      img2.setAttribute('crossorigin', 'anonymous');
      img1.onload = () => {
        canvas.width = 2 * 512; // Set canvas width to accommodate both 512x512 images
        canvas.height = 512; // Set canvas height to match the image height

        // Draw the first image with a width and height of 512x512
        context.drawImage(img1, 0, 0, 512, 512);

        img2.onload = () => {
          // Draw the second image with a width and height of 512x512
          context.drawImage(img2, 512, 0, 512, 512);
          // Convert the merged image to a Blob
          canvas.toBlob((blob) => {
            // Create a URL for the Blob
            const blobUrl = URL.createObjectURL(blob);

            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = 'merged_image.png'; // Specify the file name
            downloadLink.textContent = 'Download Merged Image';

            // Append the download link to the DOM
            document.body.appendChild(downloadLink);

            // Trigger a click event on the download link to initiate the download
            downloadLink.click();

            // Remove the download link from the DOM
            document.body.removeChild(downloadLink);
          });
        };
      };
    }, [image1, image2]);

    return <canvas ref={canvasRef} />;
  };

  return (
    <div>
      <h1>Merged Images</h1>
      <MergeImages image1={image1URL} image2={image2URL} />
    </div>
  );
};
