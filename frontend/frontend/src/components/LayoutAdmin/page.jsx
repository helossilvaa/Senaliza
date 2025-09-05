'use client';
import Header from '@/components/HeaderAdmin/headerAdmin';
import { SidebarProvider } from '@/components/Header/sidebarContext';
import styles from './page.module.css';

export default function LayoutAdmin({ children }) {
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