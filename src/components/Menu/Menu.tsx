'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Calculator,
    Menu,
    X,
    TrendingUp,
    BarChart3,
} from 'lucide-react';

interface MenuItem {
    href: string;
    label: string;
    icon: React.ElementType;
    description?: string;
}

const menuItems: MenuItem[] = [
    {
        href: '/',
        label: 'Investments',
        icon: BarChart3,
        description: 'Overview of all positions'
    },
    {
        href: '/lp-tracker',
        label: 'Liquidity Pools',
        icon: Calculator,
        description: 'Track LP positions'
    },
    {
        href: '/price-indexes',
        label: 'Price Indexes',
        icon: TrendingUp,
        description: 'Check price indexes'
    },
];

const AppMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-6 left-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white transition-all duration-200"
                >
                    {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl z-40 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
        w-80
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    DeFi Tracker
                                </h1>
                                <p className="text-sm text-gray-500">Portfolio Management</p>
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
                        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden
                        ${active
                                                ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 shadow-sm border border-indigo-200/50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                                            }
                      `}
                                        >
                                            {active && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-full" />
                                            )}

                                            <div className={`
                        p-2 rounded-lg transition-all duration-200
                        ${active
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm'
                                                : 'bg-gray-100/50 group-hover:bg-gray-200/50'
                                            }
                      `}>
                                                <Icon className="w-4 h-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className={`font-medium truncate ${active ? 'text-indigo-700' : ''}`}>
                                                    {item.label}
                                                </div>
                                                {item.description && (
                                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>

                                            {active && (
                                                <div className="w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200/50">
                        <div className="text-xs text-gray-500 text-center">
                            <p>DeFi Portfolio Tracker</p>
                            <p className="mt-1">Version 1.0.0</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AppMenu;
