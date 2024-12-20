import React, { useState } from 'react';
import { useUserInfo } from './globalUser';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';





export default function ProfilePage() {
 
  
  const navigate = useNavigate();

  const { userInfo, id, setId } = useUserInfo();
  const [customId, setCustomId] = useState('');

  

  useEffect(()=>{
    console.log("profilePage.jsx: routing based on email and id",userInfo,id);
    !userInfo?navigate('/login'):null; //if userInfo is not logged in, navigate to login page
    if(id!=null){
      console.log("profilePage.jsx: id exists, routing to home",id);
      navigate('/');
    }
  },[userInfo,id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setId(customId);
    axios.post(process.env.SERVER_URL+'/api/createUser', {
      email: userInfo.email,
      id: customId
    }).then((response) => {
      console.log(response.data);
    }).catch((error) => {
      console.error('Error creating user:', error);
    });
    navigate('/');
  };



  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email (from login)
          </label>
          <input
            className="shadow-none border-none w-full py-2 px-3 text-gray-700 leading-tight bg-transparent cursor-default focus:outline-none focus:shadow-outline"
            type="text"
            value={userInfo?.email || ''}
            disabled
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customId">
            Choose Your Car Plate Number
          </label>
          <input
            pattern="[0-9]{6,8}"
            maxLength={8}
            minLength={6}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="customId"
            type="text"
            placeholder="1010010"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Save ID
          </button>
        </div>
      </form>
    </div>
  );
}
