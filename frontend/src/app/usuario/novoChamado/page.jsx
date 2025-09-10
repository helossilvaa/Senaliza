'use client';
import { useEffect, useState } from 'react';
import './novo.css';
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import LayoutUser from '@/components/LayoutUser/layout';

export default function Chamados() {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipoId, setTipoId] = useState('');
    const [salaId, setSalaId] = useState('');
    const [equipamentoId, setEquipamentoId] = useState('');
    const [salas, setSalas] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);
    const [pools, setPools] = useState([]);
    const [chamados, setChamados] = useState([]);
    const [chamadoCriado, setChamadoCriado] = useState(null);
    const [error, setError] = useState('');
    const [equipamentosFiltrados, setEquipamentosFiltrados] = useState([]);
    const router = useRouter();

    const API_URL = 'http://localhost:8080';

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.funcao !== 'usuario') {
                router.push('/');
                return;
            }
            if (decoded.exp < Date.now() / 1000) {
                localStorage.removeItem("token");
                alert('Seu Login Expirou.');
                router.push('/login');
                return;
            }

            const id = decoded.id;
            fetch(`${API_URL}/usuarios/${id}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.json())
                .catch(err => console.error("Erro ao buscar usuário: ", err));
        } catch (error) {
            console.error("Token inválido:", error);
            localStorage.removeItem("token");
            router.push("/login");
        }

        const fetchData = async (endpoint, setter) => {
            try {
                const res = await fetch(`${API_URL}/${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setter(data);
            } catch (err) {
                console.error(`Erro /${endpoint}:`, err);
            }
        };

        fetchData("salas", setSalas);
        fetchData("equipamentos", setEquipamentos);
        fetchData("pools", setPools);
        fetchData("chamados", setChamados);
    }, []);

    
    useEffect(() => {
        if (!salaId) {
            setEquipamentosFiltrados([]);
            return;
        }

        const filtrados = equipamentos
            .filter(eq => eq?.sala_id && eq?.patrimonio && eq.sala_id.toString() === salaId)
            .map(eq => {
                const temChamado = chamados.some(
                    c => c.equipamento_id?.toString() === eq.patrimonio?.toString() && c.status !== 'concluído'
                );
                return { ...eq, temChamado };
            });

        setEquipamentosFiltrados(filtrados);
        setEquipamentoId('');
    }, [salaId, equipamentos, chamados]);

    // 🔹 Criar chamado
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setChamadoCriado(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Você precisa estar logado.');
                return;
            }

            const res = await fetch(`${API_URL}/chamados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    titulo,
                    descricao,
                    tipo_id: tipoId,
                    sala_id: salaId,
                    equipamento_id: equipamentoId
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.mensagem || 'Erro ao criar chamado');
            }

            const data = await res.json();
            setChamadoCriado(data.chamadoId);

            
            setTitulo('');
            setDescricao('');
            setTipoId('');
            setSalaId('');
            setEquipamentoId('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <LayoutUser>
            <div className="formWrapper">
                <div className="cardChamados p-4">
                    <div className="title">
                        <h2 className="fw-bold tituloo">Novo chamado</h2>
                    </div>

                    <form className="js-validate form-chamados" onSubmit={handleSubmit}>
                        <div className="row">
                           
                            <div className="col-sm-6 mb-4">
                                <label className="input-label titulo-input">Título</label>
                                <input
                                    type="text"
                                    className="form-control inputText"
                                    placeholder="Título do chamado"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    required
                                />
                            </div>

                           
                            <div className="col-sm-6 mb-4">
                                <label className="input-label titulo-input">Tipo de assistência</label>
                                <select
                                    className="form-select inputText"
                                    value={tipoId}
                                    onChange={(e) => setTipoId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione</option>
                                    {pools.map(p => (
                                        <option key={p.id} value={p.id}>{p.titulo}</option>
                                    ))}
                                </select>
                            </div>

                            
                            <div className="col-sm-6 mb-4">
                                <label className="input-label titulo-input">Sala</label>
                                <select
                                    className="form-select inputText"
                                    value={salaId}
                                    onChange={(e) => setSalaId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione</option>
                                    {salas.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome_sala}</option>
                                    ))}
                                </select>
                            </div>

                          
                            <div className="col-sm-6 mb-4">
                                <label className="input-label titulo-input">Equipamento</label>
                                <select
                                    className="form-select inputText"
                                    value={equipamentoId}
                                    onChange={(e) => setEquipamentoId(e.target.value)}
                                    required
                                    disabled={!salaId}
                                >
                                    <option value="">Selecione</option>
                                    {equipamentosFiltrados.map(eq => (
                                        <option
                                            key={eq.patrimonio}
                                            value={eq.patrimonio}
                                            disabled={eq.temChamado}
                                        >
                                            {eq.equipamento} (Patrimônio {eq.patrimonio}) {eq.temChamado ? '(já aberto)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        
                        <div className="js-form-message mb-6">
                            <label className="input-label titulo-input">Descrição</label>
                            <textarea
                                className="form-control inputText"
                                rows={4}
                                placeholder="Descreva aqui o problema"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                required
                            />
                        </div>


                        {error && <p className="text-danger">{error}</p>}
                        {chamadoCriado && <p className="text-success">Chamado criado com sucesso! ID: {chamadoCriado}</p>}

                        <button type="submit" className="btn btn-wide mb-4 enviar">Enviar</button>
                    </form>
                </div>
            </div>
        </LayoutUser>
    );
}