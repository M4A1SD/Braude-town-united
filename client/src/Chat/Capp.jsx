import React, { useState, useEffect } from "react";
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
//npm install stream-chat-react


import { useUserInfo } from "../components/globalUser";

// import "./Clayout.css";
import "stream-chat-react/dist/css/v2/index.css"; // Adjust as needed
import axios from "axios";
// import { response } from "express"; 

// const serverUrl = process.env.SERVER_URL; 
// const serverUrl=import.meta.env.VITE_SERVER_URL;
//this is for the channel list
const sort = { last_message_at: -1 }; 

const options = {
  limit: 10,
};
let userToken;
export default function ChatApp() {
  //client state
  const [client, setClient] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  //channel state
  const [channel, setChannel] = useState(null); //need this because i innitiated a chat with someone

  const { userInfo, serverUrl } = useUserInfo();

  const filters = { 
    type: "messaging",
    members: { $in: [userInfo.email.split('@')[0]] },
  };

  useEffect(() => {
    async function getKey() {
      console.log("about to to ask the key, testing response time",serverUrl+'/key');
      const responeKey = await axios.get(`${serverUrl}/key`);
      setApiKey(responeKey.data);
      console.log(`got the key with axios , Censored`); 
    }
    getKey();
  }, []);


  useEffect(() => {
    async function initClient() {
      if (!apiKey) {
        console.log("API key not yet available");
        return;
      }

      const chatClient = StreamChat.getInstance(apiKey);

      //hardcoded email for testing
      console.log(
        `requesting this :${serverUrl}/user-token?email=${userInfo.email}`
      );
      const response = await axios.get(
        `${serverUrl}/user-token?email=${userInfo.email}`,
        {
          email: userInfo.email,
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
        const testUser = {
          id: userInfo.email.split('@')[0],
          name: "",
          email: userInfo.email
        }
        await chatClient.connectUser(
          testUser,
          userToken
        );
      
      } catch (error) {
        console.log("didnt connectUser: ", error);
      }
      //commit

      // channel type is always messaing. then chat ID [this should be incrementing int]. then the {name , members}
      // const channel = chatClient.channel("messaging", "3", {
      //   name: "new2",
      //   members: [userInfo.email.split('@')[0], "0"],
      // });

      setChannel(channel);

      const result = await channel.watch();

      setClient(chatClient);
    }
    initClient();
    //clean up user connection
    if (client)
      return () => {
        client.disconnectUser();
      };
  }, [apiKey]);

  //loading indicator
  if (!client) return <LoadingIndicator />;

  return (
    <Chat client={client} theme="str-chat__theme-dark">
      <ChannelList filters={filters} sort={sort} options={options} />
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}
