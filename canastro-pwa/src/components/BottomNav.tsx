'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Dumbbell, Heart, Target, Moon, CheckSquare, FolderOpen
} from 'lucide-react';

const tabs = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { href: '/health', icon: Heart, label: 'Health' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/sleep', icon: Moon, label: 'Sleep' },
  { href: '/todos', icon: CheckSquare, label: 'Todos' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 pb-safe">
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0
                ${active ? 'text-orange-400' : 'text-zinc-500 active:text-zinc-300'}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] font-medium tracking-tight truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
