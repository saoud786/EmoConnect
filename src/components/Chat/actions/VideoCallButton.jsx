import { Video } from "lucide-react";

export default function VideoCallButton(){

  const handleClick = () => {
    alert("🎥 Video call feature coming soon.");
  };

  return (
    <button className="video-btn" onClick={handleClick}>
      <Video size={18}/>
      <span className="header-tooltip">Video Call</span>
    </button>
  );
}