interface ButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Button = ({ label, isActive, onClick }: ButtonProps) => {
  return (
    <button
      className={`px-6 py-2 text-lg font-medium rounded-full transition-colors cursor-pointer active:scale-95 transform hover:shadow-md ${
        isActive
          ? "bg-black text-white"
          : "text-black border-2 border-solid-black bg-white hover:bg-black hover:text-white"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
