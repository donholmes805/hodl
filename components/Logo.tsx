import React from 'react';

const Logo: React.FC = () => {
    return (
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
            </defs>
            {/* Outer circle representing the coin */}
            <path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                stroke="url(#logo-gradient)"
                strokeWidth="1.5"
            />
            {/* Up arrow for HODL */}
            <path
                d="M12 7L15.5 11H8.5L12 7Z"
                fill="url(#logo-gradient)"
            />
            {/* Down arrow for DUMP */}
            <path
                d="M12 17L8.5 13H15.5L12 17Z"
                fill="url(#logo-gradient)"
            />
        </svg>
    );
};

export default Logo;
