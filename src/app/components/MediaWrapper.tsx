import React from "react"

export const ImageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full relative pt-[100%]" >
      <figure className="absolute inset-0 overflow-hidden" > {children} </figure>
    </div>
  );
};

export const RectVideoWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full relative" >
      <figure className="inset-0 overflow-hidden" > {children} </figure>
    </div>
  );
};


export const SquareVideoWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full relative pt-[100%]" >
      <figure className="absolute inset-0 overflow-hidden" > {children} </figure>
    </div>
  );
}