import React, { cloneElement, isValidElement } from "react";

export const Button = ({ children, asChild = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
  if (asChild && isValidElement(children)) {
    return cloneElement(children, { ...props });
  }
  return <button {...props}>{children}</button>;
};
