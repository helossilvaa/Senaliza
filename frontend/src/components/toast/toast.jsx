// components/Toast.jsx
'use client';

import { useEffect } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Toast({ tipo = 'success', mensagem = 'Operação realizada com sucesso!' }) {
  useEffect(() => {
    
    switch (tipo) {
      case 'success':
        toast.success(mensagem);
        break;
      case 'error':
        toast.error(mensagem);
        break;
      case 'info':
        toast.info(mensagem);
        break;
      case 'warning':
        toast.warning(mensagem);
        break;
      default:
        toast(mensagem); 
    }
  }, [tipo, mensagem]);

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  );
}
