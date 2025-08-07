import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const PopUp = ({ show, message, type = "info", onClose, autoClose = 3000 }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      if (autoClose && type !== "error") {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);

        return () => clearTimeout(timer);
      }
    }
  }, [show, autoClose, type]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "warning":
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case "success":
        return "popup-success";
      case "error":
        return "popup-error";
      case "warning":
        return "popup-warning";
      default:
        return "popup-info";
    }
  };

  if (!isVisible) return null;

  return (
    <div className="popup-overlay">
      <div
        className={`popup-container ${getTypeClass()} ${isAnimating ? "popup-enter" : "popup-exit"}`}
      >
        <div className="popup-icon">{getIcon()}</div>

        <div className="popup-content">
          <p className="popup-message">{message}</p>
        </div>

        <button onClick={handleClose} className="popup-close-btn" type="button">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default PopUp;
