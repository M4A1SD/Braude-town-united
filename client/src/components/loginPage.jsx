import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginScreen from './GoogleAuth';
// npm install @react-oauth/google@latest
import { useUserInfo } from './globalUser';
import { useEffect } from 'react';


export default function LoginPage() {
  const { userInfo } = useUserInfo();
  const navigate = useNavigate();
  useEffect(()=>{
    console.log("loginPage.jsx: routing based on email and id",userInfo);
    userInfo?navigate('/profile'):null; //if userInfo is not logged in, navigate to login page
  },[]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Welcome</h1>
      <p className="mb-8">Sign in to use the application</p>
      
      <GoogleOAuthProvider clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID}>
        <LoginScreen />
      </GoogleOAuthProvider>
    </div>
  );
}
