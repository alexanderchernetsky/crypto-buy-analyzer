'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, Menu, X, TrendingUp, BarChart3 } from 'lucide-react';

interface MenuItem {
    href: string;
    label: string;
    icon: React.ElementType;
    description?: string;
}

const menuItems: MenuItem[] = [
    { href: '/', label: 'Investments', icon: BarChart3, description: 'Overview of crypto investments' },
    { href: '/lp-tracker', label: 'Liquidity Pools', icon: Calculator, description: 'Track LP positions' },
    { href: '/price-indexes', label: 'Price Indexes', icon: TrendingUp, description: 'Check price indexes' },
];

const AppMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-6 left-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 bg-slate-800 border border-slate-700 rounded-xl shadow-lg hover:bg-slate-700 transition-all duration-200"
                >
                    {isOpen ? <X className="w-6 h-6 text-slate-200" /> : <Menu className="w-6 h-6 text-slate-200" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 shadow-2xl z-40 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen w-80
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg shadow-md">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-100">DeFi Tracker</h1>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`
                        group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative overflow-hidden
                        ${active
                                                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                                                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                                            }
                      `}
                                        >

                                            <div className={`
                        p-2 rounded-lg transition-all duration-200
                        ${active
                                                ? 'bg-gradient-to-br from-emerald-600 to-blue-600 text-white shadow-sm'
                                                : 'bg-slate-700/50 group-hover:bg-slate-600'
                                            }
                     `}>
                                                <Icon className="w-4 h-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className={`font-medium truncate ${active ? 'text-emerald-400' : ''}`}>{item.label}</div>
                                                {item.description && <div className="text-xs text-slate-500 truncate mt-0.5">{item.description}</div>}
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default AppMenu;
