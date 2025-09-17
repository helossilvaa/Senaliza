'use client';
import HeaderTecnico from '@/components/HeaderTecnico/headerTecnico';
import { SidebarProvider } from '@/components/HeaderTecnico/sidebarContext';
import styles from './layout.module.css';
import VerifyRole from '@/components/verifyRole/verifyRole';

export default function LayoutTecnico({ children }) {
  return (
     <VerifyRole permitido={['tecnico']}>
    <SidebarProvider>
      <div className={styles.container}>
        <div className={styles.sidebar}>
        <HeaderTecnico />
        </div>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </SidebarProvider>
    </VerifyRole>
  );
}