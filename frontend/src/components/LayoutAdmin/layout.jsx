'use client';
import HeaderAdmin from '@/components/HeaderAdmin/headerAdmin';
import { SidebarProvider } from '@/components/HeaderAdmin/sidebarContext';
import styles from './layout.module.css';

export default function layoutAdmin({ children }) {
  return (
    <SidebarProvider>
      <div className={styles.container}>
        <HeaderAdmin />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}