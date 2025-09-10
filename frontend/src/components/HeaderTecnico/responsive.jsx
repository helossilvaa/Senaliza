import {useSidebar} from '@/components/HeaderTecnico/sidebarContext';


export default function ResponsiveTecnico(){
    
  const {toggleSidebar} = useSidebar();

return(
    <header className="mobile-header">
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>
      <img src="/Senalisa.png" href="/tecnico/dashboard" className="logo" alt="Logo" style={{width:'73px', height:'35px'}}/>
    </header>
)

}