import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const imageGroups = [
  ["/assets/img/gallery/outfit1.jpg", "/assets/img/gallery/outfit2.png", "/assets/img/gallery/outfit3.jpg"],
  ["/assets/img/gallery/outfit4.jpg", "/assets/img/gallery/outfit5.jpg", "/assets/img/gallery/outfit6.jpg"],
  ["/assets/img/gallery/outfit7.jpg", "/assets/img/gallery/outfit8.jpg", "/assets/img/gallery/outfit9.jpg"],
  ["/assets/img/gallery/outfit10.jpg", "/assets/img/gallery/outfit11.jpg", "/assets/img/gallery/outfit12.jpg"],
  ["/assets/img/gallery/outfit13.jpg", "/assets/img/gallery/outfit14.jpg", "/assets/img/gallery/outfit15.jpg"],
  ["/assets/img/gallery/outfit16.jpg", "/assets/img/gallery/outfit17.jpg", "/assets/img/gallery/outfit18.jpg"],
  ["/assets/img/gallery/outfit19.jpg", "/assets/img/gallery/outfit20.jpg", "/assets/img/gallery/outfit21.jpg"],
  ["/assets/img/gallery/outfit22.jpg", "/assets/img/gallery/outfit23.jpg", "/assets/img/gallery/outfit24.jpg"],
  ["/assets/img/gallery/outfit25.jpg", "/assets/img/gallery/outfit26.jpg", "/assets/img/gallery/outfit27.jpg"],
];

const delays = [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

interface ImageCarouselProps {
  images: string[]; 
  delay: number;
}

const ImageCarousel = ({ images, delay }: ImageCarouselProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, delay);
    return () => clearInterval(interval);
  }, [images, delay]);

  return (
    <motion.div
      className="w-full h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.img
        key={images[index]} 
        src={images[index]}
        alt="gallery image"
        className="w-full h-full object-cover rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      />
    </motion.div>
  );
};

const Gallery = () => {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-3 grid-rows-3 gap-4 max-w-6xl w-full">
        {imageGroups.map((imageSet, index) => (
          <div key={index} className="w-[130px] h-[150px] md:w-[250px] md:h-[300px] lg:w-[250px] lg:h-[300px] overflow-hidden rounded-lg">
            <ImageCarousel images={imageSet} delay={delays[index % delays.length]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
