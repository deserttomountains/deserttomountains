'use client';

import { usePathname } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isDashboardPage = pathname?.startsWith('/dashboard');

  return (
    <>
      {!isAdminPage && <Navigation />}
      <div className={`${!isAdminPage ? 'pt-20' : ''} min-h-[70vh]`}>{children}</div>
      {!isAdminPage && !isDashboardPage && <Footer />}
      <BackToTop />
    </>
  );
} 