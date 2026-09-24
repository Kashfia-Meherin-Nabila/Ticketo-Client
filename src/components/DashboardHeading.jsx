import React from "react";

const DashboardHeading = ({ title, description }) => {
  return (
    <div className="border-b border-white/5 pb-5">
      <h1 className="text-3xl font-semibold text-white">{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default DashboardHeading;
