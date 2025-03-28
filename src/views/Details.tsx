import Avatar from '../components/Avatar';
import Navbar from '../components/Navbar';

function Details() {

    return (
        
        
        <div>
      <Navbar />

<p className="text-4xl font-bold text-left font-poppins mt-8 mb-8">
  My Hooks
</p>
<div className="grid grid-cols-2 gap-4 p-6 bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
  <div className="grid gap-4 p-4 bg-white rounded-lg shadow-md mx-auto max-w-sm">
    <img src="public/assets/img/gallery/hover1.png" alt="hook1" className="w-full h-auto rounded-lg" />
  </div>
  <div className="flex flex-col gap-3 mx-auto max-w-sm">
    <div className="flex items-center">
      <Avatar />
      <h2 className="font-bold ml-3 text-sm">morisnalgon</h2>
    </div>
    <button className="bg-black text-sm text-white rounded-full py-1 px-3 flex items-center gap-1 w-auto min-w-0">
      Give a hook <img src={"/Users/mirandag/Documents/GitHub/mixit/public/assets/img/gallery/hook2.png"} alt="Hook Icon" className="w-3 h-3" />
    </button>

    <div className="grid gap-3">
      <h3 className="text-lg font-semibold">Details</h3>
      <p className="text-sm text-left font-poppins">
        Today I was going to have a picnic date, so I decided to wear this outfit. I’m really happy with the result ^^ I hope you like it too.
      </p>
      <ul className="list-disc pl-5 text-sm">
        <li>Blouse: Bershka</li>
        <li>Skirt: Zara</li>
        <li>Bag: Aliexpress</li>
        <li>Shoes: Tianguis</li>
      </ul>
      <p className="text-sm">One comment</p>
      <input
        type="text"
        placeholder="Add a comment"
        className="w-full px-4 py-2 rounded-full bg-gray-200 text-gray-700 focus:outline-none text-sm"
      />
    </div>
  </div>
</div>

        </div>
      );

}


export default Details