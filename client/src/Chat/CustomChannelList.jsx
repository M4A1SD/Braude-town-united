import React from 'react';
import { ChannelList } from 'stream-chat-react';
import { useState } from 'react';
import ChatApp from './Capp';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import { Navigate, useNavigate } from 'react-router-dom';
import "stream-chat-react/dist/css/v2/index.css"; // Adjust as needed
import { useUserInfo } from '../components/globalUser';

const CustomChannelList = ({setActiveChannel}) => {
  const navigate = useNavigate();
  const { userInfo, id, setId } = useUserInfo();

  const userEmail = userInfo.email.split('@')[0]; 
  console.log("showing channel list for user ", userEmail);
  const filters = { 
    type: "messaging",
    members: { $in: [userEmail] },
  };
  
  const sort = { last_message_at: -1 };
  
  const options = {
    limit: 10,
  };

  return (
    <div className="channel-list">
      <ChannelList 
        filters={filters} 
        sort={sort} 
        options={options}

        Preview={(previewProps) => {
          const { channel } = previewProps;
          return (
            <div 
              onClick={() => {
                setActiveChannel(channel);


              }}
              style={{ 
                cursor: 'pointer',
                padding: '10px',
                borderBottom: '1px solid #eee',
                backgroundColor: '#fff',
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}><div>
            
              
                {channel.data.name || 'Unnamed Channel'}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default CustomChannelList;
