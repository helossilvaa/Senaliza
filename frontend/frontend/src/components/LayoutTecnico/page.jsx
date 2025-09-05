'use client';
import Header from '@/components/HeaderTecnico/headerTecnico';
import { SidebarProvider } from '@/components/Header/sidebarContext';
import styles from './page.module.css';

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className={styles.container}>
        <Header />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}