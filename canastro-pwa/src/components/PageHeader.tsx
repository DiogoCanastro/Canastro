interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between px-4 pt-14 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
