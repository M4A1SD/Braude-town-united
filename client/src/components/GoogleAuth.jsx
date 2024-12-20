import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
// npm install @react-oauth/google@latest
import { useUserInfo } from './globalUser';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
//npm install axios


function SignIn() {
    const navigate = useNavigate();
    const { setUserInfo, userInfo, setLoggedInUserPlateNumber } = useUserInfo();
  // This function will be called upon a successful login
  const handleSuccess = async (credentialResponse) => {
    // If you are using the authorization code flow, you will receive a code to be exchanged for an access token
    // console.log(credentialResponse);
    // Send the authorization code to your backend server
    try {
      console.log("sending authorization code to server",process.env.SERVER_URL+'/api/auth/google');
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        });
        // save the email in the global variable, i could potentially already read database and look for ID
        
        //data is the Google user object
        const data = await response.json();
        console.log('Server response:', data);
        const UserEmail = data.user.email;
        setUserInfo({
          email: UserEmail
        });
        console.log("testing if server url is accessible",process.env.SERVER_URL+'/api/findUser');
        console.log(" and requesting without server url");
        axios.get('/api/findUser', {
            params: {
               email: UserEmail
            }
        }).then((response) => {
            console.log(
              "response.data: ",response.data
            );
            console.log("Checking if user is in mongoDB");
            if (response.data.success) {
              console.log("User is in mongoDB, his plate is registered: ",response.data.user.plateNumber);
              setLoggedInUserPlateNumber(response.data.user.plateNumber);
              console.log("have set the id to: ",id, "and navigating to home");
              navigate('/');
            }
            else{
              console.log("User is not in mongoDB, his plate is not registered: ",response.data.user);
              navigate('/profile');
            }

        }).catch((error) => {
            console.error('Error fetching user data:', error);
        });

        navigate('/');

      } catch (error) {
        console.error('Login error:', error);
      }
    };

  const handleError = (errorResponse) => {
    console.error('Google login failed', errorResponse);
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        flow="auth-code"
      />
    </div>
  );
}

export default SignIn;
