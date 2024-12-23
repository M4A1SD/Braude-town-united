import React, { useState } from 'react';
import ChatApp from './Capp';
import CustomChannelList from './ChannelListC';

export default function Main() {
    const [plateNumber, setPlateNumber] = useState('');
    const [error, setError] = useState('');

    const handleNewChat = () => {
        if (plateNumber.length < 6) {
            setError('Please enter at least 6 digits');
            return;
        }
        setError('');
        // Create new channel with this plate number user
        // You'll need to modify your ChatApp component to accept a prop
        // for creating new channels
    };

    return (
        <div className="flex h-screen">
            {/* Left sidebar with search and channel list */}
            <div className="w-1/4 border-r bg-gray-50 p-4">
                {/* Search section */}
                <div className="mb-6">
                    <input
                        type="text"
                        pattern="[0-9]{6,8}"
                        maxLength={8}
                        minLength={6}
                        className="w-full p-2 border rounded"
                        placeholder="Enter plate number..."
                        value={plateNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setPlateNumber(value);
                            setError(value.length < 6 ? 'Please enter at least 6 digits' : '');
                        }}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        className="w-full mt-2 bg-blue-500 text-white p-2 rounded"
                        onClick={handleNewChat}
                    >
                        Start New Chat
                    </button>
                </div>

                {/* Channel List */}
                <CustomChannelList />
            </div>

            {/* Main chat area */}
            <div className="flex-1">
                <ChatApp />
            </div>
        </div>
    );
}
