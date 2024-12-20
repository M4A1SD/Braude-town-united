
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
    setValue(value);
    
};





return (    
<>
<div>
    <p className="text-lg font-medium text-gray-700 mb-4">
        wanna test it ? chat with me! 6116512
    </p>
    <div className="flex flex-col gap-2">
        <input
            type="text"
            pattern="[0-9]{6,8}"
            maxLength={8}
            minLength={6}
            className="shadow-lg appearance-none border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex-grow transition-all duration-200"
            placeholder="Enter 6-8 digit plate number..."
            value={value}
            onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                setValue(e.target.value);
                // setError(e.target.value.length < 6 ? 'Please enter at least 6 digits' : '');
            }}
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => onSearch(value)}
        >
            Chat
        </button>
    </div>
</div>
</>
)
}

export default SearchInput;

