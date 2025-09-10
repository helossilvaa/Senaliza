'use client';
import HeaderTecnico from '@/components/HeaderTecnico/headerTecnico';
import { SidebarProvider } from '@/components/HeaderTecnico/sidebarContext';
import styles from './layout.module.css';

export default function LayoutTecnico({ children }) {
  return (
    <SidebarProvider>
      <div className={styles.container}>
        <HeaderTecnico />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}