import React, { cloneElement, isValidElement } from "react";

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}
export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  return <div className="absolute bg-white border rounded shadow-md mt-2">{children}</div>;
}

export function DropdownMenuItem({ children, asChild = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  if (asChild && isValidElement(children)) {
    return cloneElement(children, { ...props });
  }
  return <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" {...props}>{children}</div>;
}
export function DropdownMenuSeparator() {
  return <hr className="my-1" />;
}
export function DropdownMenuTrigger({ children, asChild = false, ...props }: { children: React.ReactNode, asChild?: boolean }) {
  if (asChild && isValidElement(children)) {
    return cloneElement(children, { ...props });
  }
  return <button className="font-semibold" {...props}>{children}</button>;
}
