import React from 'react';
import StatCard from './StatCard';

type DashboardGridProps = {
  children?: React.ReactNode;
};

export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
