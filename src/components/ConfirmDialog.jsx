import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({
  show,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  onConfirm,
  onCancel,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    }
  }, [show]);

  const handleClose = (confirmed = false) => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (confirmed) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(false);
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case "danger":
        return "confirm-danger";
      case "warning":
        return "confirm-warning";
      case "info":
        return "confirm-info";
      default:
        return "confirm-danger";
    }
  };

  if (!isVisible) return null;

  return (
    <div className="confirm-overlay" onClick={handleOverlayClick}>
      <div
        className={`confirm-dialog ${getTypeClass()} ${isAnimating ? "confirm-enter" : "confirm-exit"}`}
      >
        <div className="confirm-header">
          <button
            onClick={() => handleClose(false)}
            className="confirm-close-btn"
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="confirm-main">
          <div className="confirm-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="confirm-content">
            <h3 className="confirm-title">{title}</h3>
            <p className="confirm-message">{message}</p>
          </div>
        </div>

        <div className="confirm-actions">
          <button
            onClick={() => handleClose(false)}
            className="btn-cancel"
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={() => handleClose(true)}
            className="btn-confirm"
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
