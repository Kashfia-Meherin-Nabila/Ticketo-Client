"use client"

import DashboardSidebar from "@/components/DashboardSidebar";


const DashboardLayout = ({ children }) => {
   
  return (
    <div className="min-h-screen flex bg-[#080c16]">
      <div>
        <DashboardSidebar/>
      </div>
      <div className="px-6 py-10 max-w-5xl w-full mx-auto">{children}</div>
    </div>
  );
};

export default DashboardLayout;
