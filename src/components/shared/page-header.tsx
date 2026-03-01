interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
      <div>
        <h1 className="text-3xl font-heading font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1.5 font-body">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
