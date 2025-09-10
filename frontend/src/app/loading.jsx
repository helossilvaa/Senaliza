"use client";

import { Hourglass } from 'ldrs/react';
import 'ldrs/react/Hourglass.css';

export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Hourglass
        size={40}       
        bgOpacity={0.1} 
        speed={1.75}     
        color="red"    
      />
    </div>
  );
}
