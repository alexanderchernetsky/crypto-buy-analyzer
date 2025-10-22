import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
                                                      className = '',
                                                      width,
                                                      height,
                                                      variant = 'rectangular',
                                                  }) => {
    const baseClasses = 'bg-slate-600 animate-pulse';

    const variantClasses = {
        rectangular: 'rounded-md',
        circular: 'rounded-full',
        text: 'rounded',
    };

    const style: React.CSSProperties = {
        ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
        ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};
