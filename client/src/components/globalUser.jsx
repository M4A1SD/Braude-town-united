import React, { createContext, useState, useContext } from 'react';

// Create the context
const userInfoContext = createContext();

// Create a provider
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null); // Default: not logged in
  const [id , setId] = useState(null);

  return (
    <userInfoContext.Provider value={{ userInfo, setUserInfo, id, setId }}>
      {children}
    </userInfoContext.Provider>
  );
};
    
// Create a custom hook to access the context
export const useUserInfo = () => useContext(userInfoContext);
