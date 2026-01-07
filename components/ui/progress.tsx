import { memo, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
} as const;

const VARIANT_CLASSES = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
} as const;

interface ProgressProps {
    value: number;
    className?: string;
    size?: keyof typeof SIZE_CLASSES;
    variant?: keyof typeof VARIANT_CLASSES;
}

export const Progress = memo(({
    value = 0,
    className,
    size = 'md',
    variant = 'default'
}: ProgressProps) => {

    const clampedValue = useMemo(
        () => Math.min(Math.max(value, 0), 100),
        [value]
    );
    
    const progressStyle = useMemo(
        () => ({ width: `${clampedValue}%` } as ViewStyle),
        [clampedValue]
    );

    return (
        <View
            className={cn(
                'w-full rounded-full overflow-hidden bg-neutral-800',
                SIZE_CLASSES[size],
                className
            )}
        >
            <View
                className={cn(
                    'h-full rounded-full transition-all duration-300 ease-out',
                    VARIANT_CLASSES[variant]
                )}
                style={progressStyle}
            />
        </View>
    );
});