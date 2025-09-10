'use client';
import { createContext, useState, useContext } from 'react';
 
const SidebarContext = createContext();
 
export function SidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
 
  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };
 
  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}
 
export function useSidebar() {
  return useContext(SidebarContext);
}