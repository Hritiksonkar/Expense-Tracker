import React from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';

const Notification = ({ notifications, onClose, budgetLimit }) => {
    const formatMessage = (message) => {
        return message.split('\n').map((line, i) => (
            <p key={i} className="text-sm text-gray-600">{line}</p>
        ));
    };

    return (
        <div className="fixed top-20 right-4 w-[90vw] max-w-xs sm:max-w-sm md:max-w-md z-50 bg-white rounded-lg shadow-xl border border-gray-200 animate-fadeIn">
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <span className="text-sm text-gray-500">{notifications.length} messages</span>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No notifications</p>
                    ) : (
                        notifications.map((notification, index) => (
                            <div
                                key={index}
                                className={`mb-3 p-3 bg-gray-50 rounded-lg border-l-4 transition-all duration-200 ${notification.type === 'warning' ? 'border-yellow-500' :
                                    notification.type === 'alert' ? 'border-red-500' :
                                        notification.type === 'info' ? 'border-blue-500' :
                                            'border-gray-500'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                        <FaBell className={`mt-1 mr-2 ${notification.type === 'warning' ? 'text-yellow-500' :
                                            notification.type === 'alert' ? 'text-red-500' :
                                                notification.type === 'info' ? 'text-blue-500' :
                                                    'text-gray-500'
                                            }`} />
                                        <div>
                                            <h4 className="font-medium">{notification.title}</h4>
                                            {formatMessage(notification.message)}
                                            {notification.category && (
                                                <span className="text-xs text-gray-500 mt-1 inline-block bg-gray-100 px-2 py-1 rounded">
                                                    {notification.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onClose(index)}
                                        className="text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-[#af8978] rounded transition-all duration-200"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notification;
