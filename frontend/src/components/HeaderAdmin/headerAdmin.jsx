'use client';
import { useSidebar } from '@/components/HeaderAdmin/sidebarContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import "bootstrap-icons/font/bootstrap-icons.css";
import './headerAdmin.css';

export default function HeaderAdmin() {
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
              {isExpanded && <img src="/Senaliza.png" className="logo" alt="Logo" />}
            </div>
            <button id="open_btn" onClick={toggleSidebar}>
              <i id="open_btn_icon" className="bi bi-list" />
            </button>
          </div>

          <ul id="side_items">
            <li className={`side-item mt-4 ${isActive('/admin/dashboard') ? 'active' : ''}`}>
              <Link href="/admin/dashboard" className="d-flex align-items-center">
                <i className="bi bi-speedometer2" />
                <span className="item-description">Dashboard</span>
              </Link>
            </li>
            <li className={`side-item ${isActive('/admin/relatorios') ? 'active' : ''}`}>
              <Link href="/admin/relatorios" className="d-flex align-items-center">
                <i className="bi bi-file-bar-graph" />
                <span className="item-description">Relatórios</span>
              </Link>
            </li>
            <li className={`side-item ${isActive('/admin/gerenciamento') ? 'active' : ''}`}>
              <Link href="/admin/gerenciamento" className="d-flex align-items-center">
                <i className="bi bi-eye-fill" />
                <span className="item-description">Gerenciamento</span>
              </Link>
            </li>

            <div className="personal">
              <div className="d-flex flex-column align-items-center mt-3">
                <li className={`side-item ${isActive('/admin/perfil') ? 'active' : ''}`}>
                  <Link href="/admin/perfil" className="d-flex align-items-center">
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
