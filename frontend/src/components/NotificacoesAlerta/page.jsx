"use client";

import { useState } from "react";
import "./style.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const toastDetails = {
  timer: 5000,
  success: {
    icon: faCircleCheck,
    text: "Success: This is a success toast.",
  },
  error: {
    icon: faCircleXmark,
    text: "Error: This is an error toast.",
  },
  warning: {
    icon: faTriangleExclamation,
    text: "Warning: This is a warning toast.",
  },
  info: {
    icon: faCircleInfo,
    text: "Info: This is an information toast.",
  },
};

export default function ToastNotifications() {
  const [toasts, setToasts] = useState([]);

  const createToast = (type) => {
    const id = Date.now(); // Id único para cada toast
    const newToast = { id, type, ...toastDetails[type] };
    setToasts((prev) => [...prev, newToast]);

    // Remove automaticamente após o tempo definido
    setTimeout(() => removeToast(id), toastDetails.timer);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="toast-container">
      <ul className="notifications">
        {toasts.map((toast) => (
          <li key={toast.id} className={`toast ${toast.type}`}>
            <div className="column">
              <FontAwesomeIcon icon={toast.icon} />
              <span>{toast.text}</span>
            </div>
            <FontAwesomeIcon
              icon={faXmark}
              className="close-icon"
              onClick={() => removeToast(toast.id)}
            />
          </li>
        ))}
      </ul>

      <div className="buttons">
        {Object.keys(toastDetails)
          .filter((key) => key !== "timer")
          .map((key) => (
            <button
              key={key}
              className="btn"
              onClick={() => createToast(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
      </div>
    </div>
  );
}
