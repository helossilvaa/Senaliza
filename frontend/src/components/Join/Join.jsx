import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import style from './Join.module.css';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; 

export default function Join({ setChatVisibility, setSocket }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const fetchCurrentUser = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const decoded = jwtDecode(token);

        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('token');
          alert('Sua sessão expirou. Por favor, faça login novamente.');
          router.push('/login');
          return;
        }

        setUser(decoded);
      } catch (err) {
        console.error('Erro ao decodificar o token:', err);
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  const handleJoinChat = async () => {
    if (!user) {
      console.log('Usuário não validado.');
      return;
    }

    try {
      const socket = await io.connect('http://localhost:3000');
      socket.emit('set_username', user.username || 'Convidado'); 
      setSocket(socket);
      setChatVisibility(true);
    } catch (error) {
      console.error('Erro ao conectar ao socket:', error);
      alert('Não foi possível conectar ao chat.');
    }
  };

  
  if (loading) {
    return <p>Carregando...</p>;
  }


  return (
    <div className={style['page-wrapper']}>
      <div className={style['join-container']}>
        <h2>Bem-vindo, {user?.username}!</h2>
        <Button sx={{ mt: 2 }} onClick={handleJoinChat} variant="contained">
          Entrar no Chat
        </Button>
      </div>
    </div>
  );
}