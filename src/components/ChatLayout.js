"use client";
import React, { useState } from "react";

export const ChatLayout = () => {
  const [conversations, setConversations] = useState([
    { id: 1, name: "Alice", lastMessage: "Hey!" },
    { id: 2, name: "Bob", lastMessage: "gm" },
  ]);
  const [selectedConversation, setSelectedConversation] = useState(
    conversations[0]
  );

  return (
    <div className="flex h-full w-full apple-glass">
      <div className="w-1/3 border-r border-white/10 p-4">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <ul>
          {conversations.map((convo) => (
            <li
              key={convo.id}
              className={`p-2 rounded-lg cursor-pointer ${
                selectedConversation?.id === convo.id
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
              onClick={() => setSelectedConversation(convo)}
            >
              <p className="font-semibold">{convo.name}</p>
              <p className="text-sm text-gray-400">{convo.lastMessage}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 flex flex-col">
        <div className="border-b border-white/10 p-4">
          <h2 className="text-xl font-bold">
            {selectedConversation?.name || "Select a conversation"}
          </h2>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Messages will go here */}
        </div>
        <div className="border-t border-white/10 p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full bg-black/20 p-3 rounded-full border border-white/10 focus:ring-2 focus:ring-blue-400/50 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
