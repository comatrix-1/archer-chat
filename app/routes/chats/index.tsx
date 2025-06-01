import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useChats } from "../../contexts/ChatContext";
import { Button } from "~/components/ui/button";

export default function ChatList() {
  const { chats, addChat } = useChats();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [chatName, setChatName] = useState("");
  const [members, setMembers] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const memberIds = members
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (user && !memberIds.includes(user.id)) memberIds.push(user.id);
    const chat = await addChat(chatName, memberIds);
    setOpen(false);
    setChatName("");
    setMembers("");
    navigate(`/chats/${chat.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chats</h2>
        <Button className="btn btn-primary" onClick={() => setOpen(true)}>
          + New Chat
        </Button>
      </div>
      <ul className="space-y-2">
        {chats.map((chat) => (
          <li key={chat.id}>
            <Button
              className="w-full text-left p-3 bg-white rounded shadow hover:bg-gray-100 flex justify-between items-center"
              onClick={() => navigate(`/chats/${chat.id}`)}
            >
              <span>{chat.name}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">
                {chat.recruitmentStatus}
              </span>
            </Button>
          </li>
        ))}
      </ul>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded shadow w-full max-w-sm"
          >
            <h3 className="text-lg font-bold mb-2">New Chat</h3>
            <input
              className="input input-bordered w-full mb-2"
              placeholder="Chat name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              required
            />
            <input
              className="input input-bordered w-full mb-2"
              placeholder="Member IDs (comma separated)"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Create
              </button>
              <button
                type="button"
                className="btn flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
