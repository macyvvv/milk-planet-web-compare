"use client";

import * as React from "react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action, className = "", ...props }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50 ${className}`}
      {...props}
    >
      {icon && <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
