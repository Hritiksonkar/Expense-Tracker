import React from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const MobileMenuButton = ({ isOpen, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
            {isOpen ? (
                <FaTimes className="w-6 h-6" />
            ) : (
                <FaBars className="w-6 h-6" />
            )}
        </button>
    );
};

export default MobileMenuButton;
