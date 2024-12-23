import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Await } from 'react-router-dom';
import { useUserInfo } from './globalUser';
import { useNavigate } from 'react-router-dom';
import CustomChannelList from '../Chat/ChannelListC';
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





export default function MainPage() {

    const navigate = useNavigate();


    const { userInfo, LoggedInUserPlateNumber, serverUrl } = useUserInfo();

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
        try {
            // Check if user exists
            const response = await axios.get(`${serverUrl}/api/getUserByPlateNumber`, {
                params: { plateNumber }
            });

            if (!response.data.success) {
                console.log("user does not exist");
                alert("user does not exist yet :(");
                return;
            }

            const recipientEmailSplit = response.data.user.email.split('@')[0];
            
            // Generate mutual chat ID
            const mutualChatId = LoggedInUserPlateNumber < plateNumber 
                ? `${LoggedInUserPlateNumber}and${plateNumber}`
                : `${plateNumber}and${LoggedInUserPlateNumber}`;

            // Create and watch channel
            const channel = client.channel('messaging', mutualChatId, {
                name: `Chat with ${plateNumber}`,
                members: [client._user.id, recipientEmailSplit],
            });
    
            await channel.watch();
            setActiveChannel(channel);

        } catch (error) {
            console.error("Error in handleSearch:", error);
            alert("An error occurred while searching for the user");
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
              zIndex: 1000,
              height: '100vh',
              width: '100vw',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
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
                  <div style={{
                    height: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <MessageList 
                      style={{ 
                        flex: 1,
                        overflow: 'auto',
                        paddingBottom: '60px',
                        width: '100%',
                        height: 'calc(100vh - 60px)'
                      }} 
                    />
                    <div style={{
                      position: 'fixed',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderTop: '1px solid #eee',
                      width: '100%',
                      height: '60px'
                    }}>
                      <MessageInput 
                        style={{ 
                          width: '100%',
                          height: '100%',
                          maxWidth: '100vw'
                        }} 
                      />
                    </div>
                  </div>
                </Window>
              </Channel>
            </div>
          )}
        </Chat>
      );
    };
    
    
