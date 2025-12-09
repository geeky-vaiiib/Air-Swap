import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`flex items-center justify-center ${className}`}
        >
            <Logo variant="icon" size={size} animated={false} />
        </motion.div>
    );
};

export default LoadingSpinner;
