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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Graficos() {
  const [equipamentosPorSala, setEquipamentosPorSala] = useState({});
  const [tecnicos, setTecnicos] = useState([]);

  useEffect(() => {
   
    fetch('/relatorios/equipamentos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setEquipamentosPorSala(data.porSala || {});
      })
      .catch(err => console.error(err));

    
    fetch('/relatorios/tecnicos', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTecnicos(data || []))
      .catch(err => console.error(err));
  }, []);


  const dataTecnicos = {
    labels: tecnicos.map(t => t.nome),
    datasets: [
      {
        label: 'Chamados Resolvidos',
        data: tecnicos.map(t => t.totalChamadosResolvidos || 0),
        backgroundColor: 'rgba(168, 11, 0, 0.6)'
      }
    ]
  };


  const nomesEquipamentos = new Set();
  Object.values(equipamentosPorSala).forEach(lista =>
    lista.forEach(eq => nomesEquipamentos.add(eq.nome || eq.patrimonio || 'Sem nome'))
  );
  const labels = Array.from(nomesEquipamentos);

  const cores = [
    'rgba(209, 0, 0, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)'
  ];

  const datasetsSalas = Object.keys(equipamentosPorSala).map((sala, i) => ({
    label: `Sala ${sala}`,
    data: labels.map(lab => {
      const eq = (equipamentosPorSala[sala] || []).find(
        eq => (eq.nome || eq.patrimonio) === lab
      );
      return eq ? eq.totalChamados : 0;
    }),
    backgroundColor: cores[i % cores.length]
  }));

  const dataEquipamentosSalas = { labels, datasets: datasetsSalas };

  const optionsEquipamentosSalas = {
    responsive: true,
    indexAxis: 'y', 
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Chamados por Equipamento e Sala' }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gráfico de Técnicos</h2>
      {tecnicos.length > 0 ? (
        <Bar
          data={dataTecnicos}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Chamados Resolvidos por Técnico' }
            }
          }}
        />
      ) : (
        <p>Nenhum técnico registrado.</p>
      )}

      <h2 style={{ marginTop: '50px' }}>Equipamentos por Sala</h2>
      {labels.length > 0 ? (
        <Bar data={dataEquipamentosSalas} options={optionsEquipamentosSalas} />
      ) : (
        <p>Nenhum equipamento registrado.</p>
      )}
    </div>
  );
}
