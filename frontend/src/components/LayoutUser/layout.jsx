'use client';
import Header from '@/components/Header/header';
import { SidebarProvider } from '@/components/Header/sidebarContext';
import styles from './layout.module.css';
import VerifyRole from '@/components/verifyRole/verifyRole';

export default function LayoutUser({ children }) {
  return (
     <VerifyRole permitido={['usuario']}>
    <SidebarProvider>
      <div className={styles.container}>
        <Header />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </SidebarProvider>
    </VerifyRole>
  );
}