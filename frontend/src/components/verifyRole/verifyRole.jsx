'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Loader from '@/app/loading';
import styles from './403.module.css'

export default function VerifyRole({ permitido = [], children }) {
    
    const [tipoUser, setTipoUser] = useState(null);
    const [redirecionar, setRedirecionar] = useState('/');
    const router = useRouter();

    useEffect(() => {

        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);

            if (decoded.exp < Date.now() / 1000) {
                localStorage.removeItem('token');
                alert('Sessão expirada. Faça login novamente.');
                router.push('/login');
                return;
            }

            const funcao = decoded.funcao;
            setTipoUser(funcao);

            const redirecionamentos = {
                tecnico: '/tecnico/dashboard',
                usuario: '/usuario/dashboard',
                admin: '/admin/dashboard',
            };

            setRedirecionar(redirecionamentos[funcao] || '/');
        } catch (err) {
            console.error('Erro ao decodificar token:', err);
            localStorage.removeItem('token');
            router.push('/login');
        }
    }, [router]);

    if (tipoUser === null) return <Loader />;

    if (!permitido.includes(tipoUser)) {
        return (
            <div className={styles.container}>
                <div className={styles.img}>
                    <img className={styles.cadeado} src="/cadeado.png" alt="cadeado" />
                </div>
                <div className={styles.text}>
                    <div className={styles.number}>
                        <h1>403</h1>
                        <h3>Forbidden</h3>
                        <h5>Você não tem permissão para acessar essa página</h5>
                    </div>
                    <a className={styles.button} href={redirecionar}>
                        Voltar
                    </a>
                </div>
            </div>
        );

    }

    return <>{children}</>;
}
