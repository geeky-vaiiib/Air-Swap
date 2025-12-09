import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
    variant?: 'full' | 'icon' | 'wordmark';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    animated?: boolean;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({
    variant = 'full',
    size = 'md',
    animated = true,
    className = '',
}) => {
    // Size mapping
    const sizes = {
        sm: { height: 24, fontSize: 'text-lg', gap: 'gap-1.5' },
        md: { height: 32, fontSize: 'text-2xl', gap: 'gap-2' },
        lg: { height: 48, fontSize: 'text-4xl', gap: 'gap-3' },
        xl: { height: 64, fontSize: 'text-5xl', gap: 'gap-4' },
    };

    const currentSize = sizes[size];

    // Animation variants
    const iconVariants = {
        initial: { rotate: 0 },
        hover: {
            rotate: 360,
            transition: { duration: 0.8, ease: "easeInOut" }
        }
    };

    const pathVariants = {
        initial: { pathLength: 1, opacity: 1 },
        hover: {
            pathLength: [1, 0.8, 1],
            opacity: [1, 0.8, 1],
            transition: { duration: 1.5, repeat: Infinity }
        }
    };

    return (
        <motion.div
            className={`flex items-center ${currentSize.gap} ${className} select-none`}
            initial="initial"
            whileHover={animated ? "hover" : "initial"}
        >
            {(variant === 'full' || variant === 'icon') && (
                <motion.div
                    variants={iconVariants}
                    style={{ width: currentSize.height, height: currentSize.height }}
                    className="relative"
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" /> {/* brand-nature */}
                                <stop offset="100%" stopColor="#06b6d4" /> {/* brand-primary */}
                            </linearGradient>
                        </defs>

                        {/* Left Curve: Smooth and organic (Leaf-like) */}
                        <motion.path
                            d="M50 20 C30 20, 10 40, 10 70 C10 85, 25 90, 50 90"
                            stroke="url(#brand-gradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            fill="none"
                            variants={pathVariants}
                        />

                        {/* Right Curve: Segmented or geometric (Block-like) */}
                        <motion.path
                            d="M50 80 C70 80, 90 60, 90 30 C90 15, 75 10, 50 10"
                            stroke="url(#brand-gradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="1 15"
                            fill="none"
                            variants={pathVariants}
                        />
                        {/* Center Connection */}
                        <circle cx="50" cy="50" r="8" fill="url(#brand-gradient)" />
                    </svg>
                </motion.div>
            )}

            {(variant === 'full' || variant === 'wordmark') && (
                <div className={`font-display tracking-tight flex items-baseline ${currentSize.fontSize}`}>
                    <span className="font-light text-brand-primary">Air</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-nature to-brand-primary">
                        Swap
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default Logo;
