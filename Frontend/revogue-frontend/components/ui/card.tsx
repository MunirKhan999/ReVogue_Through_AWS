import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 font-bold text-lg">{children}</div>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-semibold leading-none tracking-tight">{children}</h3>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-2">{children}</div>;
}
