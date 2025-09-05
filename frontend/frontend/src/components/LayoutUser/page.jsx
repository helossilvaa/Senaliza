'use client';
import Header from '@/components/Header/header';
import { SidebarProvider } from '@/components/Header/sidebarContext';
import styles from './page.module.css';

export default function LayoutUser({ children }) {
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