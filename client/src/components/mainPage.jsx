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
const serverUrl="";



export default function MainPage() {

    const navigate = useNavigate();


    const { userInfo, id } = useUserInfo();

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            // grey out functionality
        } else if (!id) {
            navigate('/profile');
        }
        else{
            console.log("userInfo and id exist", userInfo, id);
        }
    }, [userInfo, id]);

    // console.log("userInfo and id are: ", userInfo, id);
    const userEmail = userInfo ? userInfo.email : null;
    // const plateNumber = id;

    const [activeChannel, setActiveChannel] = useState(null);

    //client state
    const [client, setClient] = useState(null);
    const [apiKey, setApiKey] = useState(null);

//this is for the channel list
const sort = { last_message_at: -1 }; 
const filters = userInfo && id ? { 
  type: "messaging",
  members: { $in: [id] },
} : {};
const options = {
  limit: 10,
};


    // get the api key
    useEffect(() => {
      console.log("dont start unless user is registered", userInfo, id);
      if(id){
        async function getKey() {
          console.log("about to to ask the key, testing response time");
          const responeKey = await axios.get(`/key`);
          setApiKey(responeKey.data);
          console.log(`got the key with axios , Censored`); 
        }
        getKey();
      }
    }, [userInfo, id]);
    
    
      //stubbed
      useEffect(() => {
        console.log("dont start unless user is registered", userInfo, id);

        if(id){



        async function initClient() {
          if (!apiKey) {
            console.log("API key not yet available");
            return;
          }
    
          const chatClient = StreamChat.getInstance(apiKey);
    
          const emailForIndetification = userEmail.split('@')[0];
          //hardcoded email for testing
          console.log(
            `requesting this :/user-token?email=${emailForIndetification}`
          );
          const response = await axios.get(
            `/user-token`,
            {
              params: {
                email: emailForIndetification
              }
            }
          );
    
          if (!response.data) {
            throw new Error("Failed to get user token");
          }
          const userToken = response.data;
    
          try {
            //wait for the response to arrive
            console.log("got the token of the user:", userToken);
    
    
            console.log("connecting in the user");
            const parameterForUserConnection = {
              id: emailForIndetification,
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
  }, [apiKey, userInfo, id]);

    // --------------------


   
    const handleSearch = async (plateNumber) => {
        const userId = plateNumber; // Assuming the plateNumber is the user ID you want to verify

        const response = await axios.get(`/api/getUserById`, {
          params: {
            id: userId
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
                  if(id<plateNumber){
                    return id + 'and' + plateNumber;
                  }
                  else{
                    return plateNumber + 'and' + id;
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
    
    
