
import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, buttonText, onButtonClick }) => {
    return (
        <div className="text-center bg-gray-50/80 p-8 rounded-lg border-2 border-dashed border-gray-200">
            <div className="mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-gray-500 mt-2 mb-6">{message}</p>
            {buttonText && onButtonClick && (
                <button
                    onClick={onButtonClick}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-full shadow-md hover:scale-105 transform transition-transform duration-200"
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
