import React, { createContext, useState, useContext } from 'react';

// Create the context
const userInfoContext = createContext();

// Create a provider
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null); // Default: not logged in
  const [LoggedInUserPlateNumber , setLoggedInUserPlateNumber] = useState(null);
  const [serverUrl, setServerUrl] = useState(import.meta.env.VITE_SERVER_URL);
  if(serverUrl=="deploy"){
    setServerUrl("");
  }

  return (
    <userInfoContext.Provider value={{ userInfo, setUserInfo, LoggedInUserPlateNumber, setLoggedInUserPlateNumber, serverUrl, setServerUrl }}>
      {children}
    </userInfoContext.Provider>
  );
};
    
// Create a custom hook to access the context
export const useUserInfo = () => useContext(userInfoContext);
