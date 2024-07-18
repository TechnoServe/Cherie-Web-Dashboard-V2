import React from "react";
import { Image, Layer } from "react-konva";
import useImage from "use-image";
import { firestore } from '../config/firebase'
import useStore from "../store";

const IMAGE_NUMBER = 1 + Math.round(Math.random() * 1);

const BaseImage = ({layerRef}) => {
  const { setImageUrl } = useStore();
  const IMAGE_URL = useStore((state) => state.imageUrl);
  const [image] = useImage(IMAGE_URL);

  const setImageSize = useStore(state => state.setImageSize);
  const setScale = useStore(state => state.setScale);
  const setSize = useStore(state => state.setSize);
  const width = useStore(state => state.width);
  const height = useStore(state => state.height);

  const { brightness } = useStore();

  React.useEffect(() => {
    if (!image) {
      return;
    }
    const scale = Math.min(width / image.width, height / image.height);
    setScale(scale);
    setImageSize({ width: image.width, height: image.height });

    const ratio = image.width / image.height;
    setSize({
      width: width,
      height: width / ratio
    });
  }, [image, width, height, setScale, setImageSize, setSize]);

  

  React.useEffect(() => {
    const canvas = layerRef.current.getCanvas()._canvas;
    canvas.style.filter = `brightness(${(brightness + 1) * 100}%)`;
  }, [brightness]);

  React.useEffect(() => {
    fetch(IMAGE_URL)
  .then(result => result.blob())
  .then(blob => {
      const url = URL.createObjectURL(blob);
      setImageUrl(url)
   });
  }, []);

  return (
    <Layer ref={layerRef}>
      <Image image={image} />
    </Layer>
  );
};

export default BaseImage;