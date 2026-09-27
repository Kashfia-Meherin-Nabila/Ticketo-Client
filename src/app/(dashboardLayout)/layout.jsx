"use client"

import DashboardSidebar from "@/components/DashboardSidebar";


const DashboardLayout = ({ children }) => {
   
  return (
    <div className="min-h-screen flex bg-[#080c16 overflow-x-hidden]">
      <div>
        <DashboardSidebar/>
      </div>
      <div className="px-6 py-10 max-w-7xl w-full min-w-0 mx-auto">{children}</div>
    </div>
  );
};

export default DashboardLayout;
