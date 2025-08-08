import { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import CodeEditor from "./CodeEditor";

function StoreEditor({
  isOpen,
  onClose,
  storeData,
  selectedDb,
  selectedStore,
  onSave,
  darkMode = true,
}) {
  const [editedData, setEditedData] = useState(
    JSON.stringify(storeData, null, 2),
  );
  const [error, setError] = useState("");

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(editedData);
      onSave(parsedData);
      setError("");
      onClose();
    } catch (_err) {
      setError("Invalid JSON format. Please check your syntax.");
    }
  };

  const handleClose = () => {
    setEditedData(JSON.stringify(storeData, null, 2));
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="store-editor-overlay">
      <div className="store-editor-modal">
        <div className="store-editor-header">
          <div className="editor-title">
            <h3>
              Edit Store: {selectedDb} / {selectedStore}
            </h3>
            <p>
              Edit the entire store as JSON. Changes will replace all existing
              data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="close-btn"
            title="Close editor"
          >
            <X size={20} />
          </button>
        </div>

        <div className="store-editor-content">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <CodeEditor
            language="json"
            onChange={setEditedData}
            darkMode={darkMode}
            height="60vh"
            width="100%"
          >
            {editedData}
          </CodeEditor>
        </div>

        <div className="store-editor-footer">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoreEditor;
