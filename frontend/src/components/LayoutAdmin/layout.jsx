'use client';
import HeaderAdmin from '@/components/HeaderAdmin/headerAdmin';
import { SidebarProvider } from '@/components/HeaderAdmin/sidebarContext';
import styles from './layout.module.css';
import VerifyRole from '@/components/verifyRole/verifyRole';

export default function layoutAdmin({ children }) {
  return (
    <VerifyRole permitido={['admin']}>
    <SidebarProvider>
      <div className={styles.container}>
        <HeaderAdmin />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </SidebarProvider>
    </VerifyRole>
  );
}