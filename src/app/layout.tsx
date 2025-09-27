// app/layout.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Menu from '@/components/Menu/Menu';
import "./globals.css";

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <html lang="en">
        <body className="bg-gray-50 overflow-hidden">
        <QueryClientProvider client={queryClient}>
            <div className="flex h-screen">
                {/* App Menu Sidebar */}
                <Menu />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto lg:pl-80 lg:pt-0">
                    <div className="min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </QueryClientProvider>
        </body>
        </html>
    );
}
