'use client';

import { usePathname } from 'next/navigation';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      <Navigation />
      <div className="pt-20 min-h-[70vh]">{children}</div>
      {!isAdminPage && <Footer />}
    </>
  );
} 