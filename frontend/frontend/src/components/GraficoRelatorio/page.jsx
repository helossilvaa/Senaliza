'use client';

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Graficos() {
  const [tecnicos, setTecnicos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);

  useEffect(() => {
    // Buscar dados de técnicos
    fetch('/api/relatorios/tecnicos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTecnicos(data))
      .catch(err => console.error(err));

    // Buscar dados de equipamentos
    fetch('/api/relatorios/equipamentos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setEquipamentos(data.relatorio))
      .catch(err => console.error(err));
  }, []);

  // Dados para gráfico de técnicos
  const dataTecnicos = {
    labels: tecnicos.map(t => t.nome),
    datasets: [
      {
        label: 'Chamados Resolvidos',
        data: tecnicos.map(t => t.totalChamadosResolvidos),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
  };

  // Dados para gráfico de equipamentos
  const dataEquipamentos = {
    labels: equipamentos.map(eq => eq.nome),
    datasets: [
      {
        label: 'Total de Chamados',
        data: equipamentos.map(eq => eq.totalChamados),
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gráfico de Técnicos</h2>
      <Bar data={dataTecnicos} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />

      <h2 style={{ marginTop: '50px' }}>Gráfico de Equipamentos</h2>
      <Bar data={dataEquipamentos} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
    </div>
  );
}
