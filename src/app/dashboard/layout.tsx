'use client';
import DashboardLayout from './DashboardLayout';

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  // Determine active tab from pathname (optional improvement)
  // For now, let each page pass its own active prop
  return children;
} 