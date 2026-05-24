interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, unit, icon, color = 'bg-zinc-800', sub }: StatCardProps) {
  return (
    <div className={`${color} rounded-2xl p-4 flex flex-col gap-2`}>
      {icon && <div className="text-zinc-400">{icon}</div>}
      <div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          {unit && <span className="text-sm text-zinc-400 mb-0.5">{unit}</span>}
        </div>
        <p className="text-xs text-zinc-400">{label}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
