export default function Avatar() {
    const avatar = 'public/assets/img/moris.jpg';
    const description = 'user name';
    return (
      <img
        className="avatar"
        src={avatar}
        alt={description}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #ccc'
        }}
      />
    );
  }