import { useState } from 'react';
import Navbar from '../components/Navbar';

function Moodboard() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    "public/assets/img/gallery/hover1.png",
    "public/assets/img/gallery/hover2.png",
    "public/assets/img/gallery/hover3.png"
  ];

 
  const openFullscreen = (imgSrc: string) => {
    setSelectedImage(imgSrc);
  };


  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  return (
    <div className="relative">
      <Navbar />
      <p className="text-4xl font-bold text-left font-poppins mt-8 mb-8 pl-4">
        Moodboard
      </p>
      <div className="flex items-center gap-2 mb-4 pl-4">
        <div className="relative w-72 border border-gray-300 rounded-lg overflow-hidden">
          <div className="flex items-center pl-6 pr-4 py-2">
            <span className="mr-2">📚</span>
            <input
              type="text"
              placeholder="uni"
              defaultValue="uni"
              className="outline-none w-full"
            />
          </div>
        </div>
        <div className="flex rounded-full overflow-hidden border border-gray-300">
          <button className="bg-black text-white py-2 px-6 flex items-center">
            <span className="mr-2">🔒</span>
            Private
          </button>
          <button className="bg-white text-black py-2 px-4 flex items-center">
            <span className="mr-2">🌎</span>
            Make Public
          </button>
        </div>
      </div>
      <div className="flex gap-4 p-4 overflow-x-auto">
        {images.map((imgSrc, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md w-80 h-80 flex-shrink-0 p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openFullscreen(imgSrc)}
          >
            <img
              src={imgSrc}
              alt={`hook${index+1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
        <div className="bg-gray-100 rounded-lg shadow-md w-80 h-80 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
          <div className="text-gray-400 text-6xl">+</div>
        </div>
      </div>

   
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/[0.6] flex items-center justify-center z-50 backdrop-blur-md"
          onClick={closeFullscreen}
        >
          <div className="relative p-4">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg shadow-lg"
            />
            <button
              className="absolute top-4 right-4 bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-white/30"
              onClick={closeFullscreen}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Moodboard;