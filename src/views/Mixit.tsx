function Mixit() {
  const imgSrc = `${import.meta.env.VITE_IMG_SERVICE_URI}/1de29880b3a130c1047b94f9a8585cd4c1ecd2b34a40c53e1b45707a311710f5`;

  return (
    <div className="grid grid-cols-3 grid-rows-4 gap-4 mx-auto">
      {" "}
      {/* Removed fixed width and height */}
      {/* Top */}
      <img
        className="row-start-1 col-span-3 w-full" /* Added w-full, removed fixed w/h, justify-self-center redundant with w-full */
        src={imgSrc}
      />
      {/* Bag */}
      <img
        className="row-start-2 col-start-1 self-start w-full" /* Added w-full, removed fixed w/h, place-self-start becomes self-start as w-full handles horizontal */
        src={imgSrc}
      />
      {/* Boots */}
      <img
        className="row-start-2 col-start-3 self-end w-full" /* Added w-full, removed fixed w/h, place-self-end becomes self-end as w-full handles horizontal */
        src={imgSrc}
      />
      {/* Bottom */}
      <img
        className="row-start-3 col-span-3 w-full" /* Added w-full, removed fixed w/h, justify-self-center redundant with w-full */
        src={imgSrc}
      />
      {/* Accessory */}
      <img
        className="row-start-4 col-start-3 self-end w-full" /* Added w-full, removed fixed w/h, place-self-end becomes self-end as w-full handles horizontal */
        src={imgSrc}
      />
    </div>
  );
}

export default Mixit;
