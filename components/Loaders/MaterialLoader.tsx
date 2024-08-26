import React from "react";

const MaterialLoader = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="flex h-36 w-full rounded-lg bg-bground2 p-2"
        >
          <div className="h-full w-24 animate-pulse rounded-lg bg-bground3"></div>
          <div className="ml-4 flex flex-1 flex-col justify-between py-1">
            <div className="h-6 w-full animate-pulse rounded-lg bg-bground3"></div>
            <div className="h-4 w-3/4 animate-pulse rounded-lg bg-bground3"></div>
            <div className="h-4 w-3/4 animate-pulse rounded-lg bg-bground3"></div>
            <div className="h-4 w-1/2 animate-pulse rounded-lg bg-bground3"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialLoader;
