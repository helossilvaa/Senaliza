'use client';
import "bootstrap-icons/font/bootstrap-icons.css";
import './header.css';
import { useSidebar } from '@/components/Header/sidebarContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActive = (href) => pathname === href;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      <nav id="sidebar" className={isExpanded ? 'open-sidebar' : ''}>
        <div id="sidebar_content">
          <div className="OpenClose d-flex justify-content-center align-items-center p-2">
            <div className="senaiLogo">
              {isExpanded && <Link href="/usuario/dashboard"><img src="/Senaliza.png" className="logo" alt="Logo" /></Link>}
            </div>
            <button id="open_btn" onClick={toggleSidebar}>
              <i id="open_btn_icon" className="bi bi-list" />
            </button>
          </div>

          <ul id="side_items">
            <li className={`side-item mt-4 ${isActive('/usuario/dashboard') ? 'active' : ''}`}>
              <Link href="/usuario/dashboard" className="d-flex align-items-center">
                <i className="bi bi-speedometer2" />
                <span className="item-description">Dashboard</span>
              </Link>
            </li>
            <li className={`side-item ${isActive('/usuario/notificacoes') ? 'active' : ''}`}>
              <Link href="/usuario/notificacoes" className="d-flex align-items-center">
                <i className="bi bi-bell" />
                <span className="item-description">Notificações</span>
              </Link>
            </li>
            <li className={`side-item ${isActive('/usuario/chamados') ? 'active' : ''}`}>
              <Link href="/usuario/chamados" className="d-flex align-items-center">
                <i className="bi bi-exclamation-circle-fill" />
                <span className="item-description">Chamados</span>
              </Link>
            </li>
            <li className={`side-item ${isActive('/usuario/novoChamado') ? 'active' : ''}`}>
              <Link href="/usuario/novoChamado" className="d-flex align-items-center">
                <i className="bi bi-telephone-plus" />
                <span className="item-description">Novo chamado</span>
              </Link>
            </li>

            <div className="personal">
              <div className='d-flex flex-column align-items-center mt-3'>
                <li className={`side-item ${isActive('/usuario/perfil') ? 'active' : ''}`}>
                  <Link href="/usuario/perfil" className="d-flex align-items-center">
                    <i className="bi bi-person-fill" />
                    <span className="item-description">Perfil</span>
                  </Link>
                </li>
                <li className="side-item">
                  <a href="#" className="d-flex align-items-center" onClick={handleLogout}>
                    <i className="text-danger bi bi-box-arrow-right" />
                    <span className="item-description">Sair</span>
                  </a>
                </li>
              </div>
            </div>
          </ul>
        </div>
      </nav>
    </>
  );
}
