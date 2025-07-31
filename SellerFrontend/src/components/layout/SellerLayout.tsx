
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './SellerSidebar';
import AdminHeader from './SellerHeader';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
