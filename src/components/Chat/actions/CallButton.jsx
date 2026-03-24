import { Phone } from "lucide-react";

export default function CallButton(){

  const handleClick = () => {
    alert("📞 Voice call feature coming soon.");
  };

  return (
    <button className="call-btn" onClick={handleClick}>
      <Phone size={18}/>
      <span className="header-tooltip">Call</span>
    </button>
  );
}