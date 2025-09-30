'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Header />;
}