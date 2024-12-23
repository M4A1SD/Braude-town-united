import { useState } from 'react';

const SearchInput = ({ onSearch }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleChat = () => {
        if (value.length < 6) {
            setError('Please enter at least 6 digits');
            return;
        }
        setError('');
        console.log(value);
        onSearch(value);
    };

    return (    
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Let's Chat!
                    </h2>
                    <p className="text-gray-600">
                        Test it with this number: <span className="font-mono bg-gray-100 px-2 py-1 rounded">6116512</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            pattern="[0-9]{6,8}"
                            maxLength={8}
                            minLength={6}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg 
                                     text-gray-700 placeholder-gray-400 transition duration-200
                                     focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                            placeholder="Enter 6-8 digit plate number..."
                            value={value}
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                setValue(e.target.value);
                                setError('');
                            }}
                        />
                    </div>

                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 
                                 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                                 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleChat(value)}
                        disabled={!value}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                            </svg>
                            <span>Start Chat</span>
                        </div>
                    </button>

                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm bg-red-50 border border-red-200 
                                      rounded-lg text-red-600 animate-fadeIn">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchInput;

