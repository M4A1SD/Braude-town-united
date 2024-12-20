import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Await } from 'react-router-dom';
import { useUserInfo } from './globalUser';
import LoginPage from './loginPage'
import ProfilePage from './profilePage'
import { useNavigate } from 'react-router-dom';
import CustomChannelList from '../Chat/CustomChannelList';
import SearchInput from './inMain/SearchC';

import { StreamChat } from "stream-chat";
// npm install stream-chat
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  ChannelHeader,
  Thread,
  Window,
  LoadingIndicator,
  ChannelList,
} from "stream-chat-react";

import axios from "axios";

// const serverUrl = process.env.SERVER_URL;
const serverUrl="http://localhost:3000";



export default function MainPage() {

    const navigate = useNavigate();


    const { userInfo, LoggedInUserPlateNumber } = useUserInfo();

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            // grey out functionality
        } else if (!LoggedInUserPlateNumber) {
            navigate('/profile');
        }
        else{
            console.log("userInfo and id exist", userInfo, LoggedInUserPlateNumber);
        }
    }, [userInfo, LoggedInUserPlateNumber]);

    // console.log("userInfo and id are: ", userInfo, id);
    const userEmail = userInfo ? userInfo.email : null;
    // const plateNumber = id;

    const [activeChannel, setActiveChannel] = useState(null);

    //client state
    const [client, setClient] = useState(null);
    const [apiKey, setApiKey] = useState(null);

    
//this is for the channel list
const sort = { last_message_at: -1 }; 

console.log("the user should be email prefix: ", userInfo);
console.log("this could do nothing");
const filters = userInfo && LoggedInUserPlateNumber ? { 
  type: "messaging",
  members: { $in: [userInfo.email.split('@')[0]] },
} : {};
const options = {
  limit: 10,
};


    // get the api key
    useEffect(() => {
      console.log("dont start unless user is registered", userInfo, LoggedInUserPlateNumber);
      if(LoggedInUserPlateNumber){
        async function getKey() {
          console.log("about to to ask the key, testing response time");
          const responeKey = await axios.get(`${serverUrl}/key`);
          setApiKey(responeKey.data);
          console.log(`got the key with axios`); 
        }
        getKey();
      }
    }, [userInfo, LoggedInUserPlateNumber]);
    
    
      //stubbed
      useEffect(() => {
        console.log("dont start unless user is registered", userInfo, LoggedInUserPlateNumber);

        if(LoggedInUserPlateNumber){



        async function initClient() {
          if (!apiKey) {
            console.log("API key not yet available");
            return;
          }
    
          const chatClient = StreamChat.getInstance(apiKey);
    
          const emailSplitted = userEmail.split('@')[0];
          //hardcoded email for testing
          console.log(
            `requesting this :/user-token?email=${emailSplitted}`
          );
          const response = await axios.get(
            `${serverUrl}/user-token`,
            {
              params: {
                email: emailSplitted
              }
            }
          );
          console.log("response is: ", response);
          if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            console.error('Received HTML response instead of token');
            throw new Error('Invalid response format');
          }
          if (!response.data) {
            
            throw new Error("Failed to get user token");
          }
          const userToken = response.data;
    
          try {
            //wait for the response to arrive
            // console.log("got the token of the user:", userToken);
    
    
            console.log("connecting in the user");
            const parameterForUserConnection = {
              id: emailSplitted,
              name: "",

            }
            await chatClient.connectUser(
              parameterForUserConnection,
              userToken
            );
          
          } catch (error) {
            console.log("didnt connectUser: ", error);
          }
          //commit
          setClient(chatClient);
        }
        initClient();
        console.log("client is: ", client);
    // clean up user connection
    if (client)
      return () => {
        console.log("disconnecting user");
        client.disconnectUser();
      };
    }
  }, [apiKey, userInfo, LoggedInUserPlateNumber]);

    // --------------------


   
    const handleSearch = async (plateNumber) => {
        // const userId = plateNumber; // Assuming the plateNumber is the user ID you want to verify

        const response = await axios.get(`${serverUrl}/api/getUserByPlateNumber`, {
          params: {
            plateNumber: plateNumber
          }
        });
        console.log("response is: ", response);



        try{
            if (response.data.success) {
                console.log("User exists:", response.data.user.email);
                const recepientEmailSplit  = response.data.user.email.split('@')[0];
              
      
      
              try {
                const mutualChatId = async () => {
                  // id + plateNumber
                  if(LoggedInUserPlateNumber<plateNumber){
                    return LoggedInUserPlateNumber + 'and' + plateNumber;
                  }
                  else{
                    return plateNumber + 'and' + LoggedInUserPlateNumber;
                  }
                };
                console.log("mutualChatId is: ", mutualChatId());
                const channel = client.channel('messaging', await mutualChatId(), {
                  name: `Chat with ${plateNumber}`,
                  members: [client._user.id, recepientEmailSplit],
                });
          
                await channel.watch();
                setActiveChannel(channel);
              } catch (err) {
                console.error('Error starting chat:', err);
              }
            }
            else{
                console.log("user does not exist");
                alert("user does not exist yet :(");

            }
        }
        catch(error){
            console.log("Error checking user existence or creating channel:", error);
        }
    }
    
    const useOldChat = async (channel) => {
        setActiveChannel(channel);
    }

    if (!client) return <LoadingIndicator />;

    try{
      console.log("client is: ", client);
      console.log("extracted user id is: ", client._user.id);
    }
    catch(error){
      console.log("accessing client._user.id: ", error);
    }
    
    return (

        // if not logged in, grey out, and login button
        <Chat client={client}>
          {!activeChannel ? (
            <div>
                
              <SearchInput onSearch={handleSearch} />
              <CustomChannelList
                client={client}
                activeChannel={activeChannel}
                setActiveChannel={useOldChat}
                />

            </div>
          ) : (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              zIndex: 1000
            }}>
              <button 
                onClick={() => setActiveChannel(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  zIndex: 1001,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'rgba(0, 123, 255, 0.7)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Return
              </button>
              <Channel channel={activeChannel}>
                <Window>
                  <MessageList />
                  <MessageInput />
                </Window>
              </Channel>
            </div>
          )}
        </Chat>
      );
    };
    
    
