import localforage from "localforage";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export type Message = {
	id: string;
	chatId: string;
	senderId: string;
	senderName: string;
	content: string;
	timestamp: string;
	status: "sending" | "sent" | "error";
};

export type Chat = {
	id: string;
	name: string;
	members: string[];
	recruitmentStatus: string;
	messages: Message[];
	scheduledEvents: { id: string; title: string; date: string }[];
};

interface ChatContextType {
	chats: Chat[];
	sendMessage: (chatId: string, content: string) => Promise<void>;
	updateRecruitmentStatus: (chatId: string, status: string) => Promise<void>;
	addChat: (name: string, members: string[]) => Promise<Chat>;
	addEvent: (
		chatId: string,
		event: { id: string; title: string; date: string },
	) => Promise<void>;
	reload: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [chats, setChats] = useState<Chat[]>([]);
	const { user } = useAuth();

	useEffect(() => {
		localforage.getItem<Chat[]>("chats").then((storedChats) => {
			setChats(storedChats ?? []);
		});
	}, []);

	const saveChats = async (next: Chat[]) => {
		setChats(next);
		await localforage.setItem("chats", next);
	};

	const sendMessage = async (chatId: string, content: string) => {
		if (!user) return;
		const now = new Date().toISOString();
		const msg: Message = {
			id: Date.now().toString(),
			chatId,
			senderId: user.id,
			senderName: user.name,
			content,
			timestamp: now,
			status: "sent",
		};
		const updated = chats.map((c) =>
			c.id === chatId ? { ...c, messages: [...c.messages, msg] } : c,
		);
		await saveChats(updated);
	};

	const updateRecruitmentStatus = async (chatId: string, status: string) => {
		const updated = chats.map((c) =>
			c.id === chatId ? { ...c, recruitmentStatus: status } : c,
		);
		await saveChats(updated);
	};

	const addChat = async (name: string, members: string[]) => {
		const chat: Chat = {
			id: Date.now().toString(),
			name,
			members,
			recruitmentStatus: "Pending",
			messages: [],
			scheduledEvents: [],
		};
		const next = [...chats, chat];
		await saveChats(next);
		return chat;
	};

	const addEvent = async (
		chatId: string,
		event: { id: string; title: string; date: string },
	) => {
		const updated = chats.map((c) =>
			c.id === chatId
				? { ...c, scheduledEvents: [...c.scheduledEvents, event] }
				: c,
		);
		await saveChats(updated);
	};

	const reload = () => {
		localforage.getItem<Chat[]>("chats").then((storedChats) => {
			setChats(storedChats ?? []);
		});
	};

	return (
		<ChatContext.Provider
			value={{
				chats,
				sendMessage,
				updateRecruitmentStatus,
				addChat,
				addEvent,
				reload,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export function useChats() {
	const ctx = useContext(ChatContext);
	if (!ctx) throw new Error("useChats must be used within ChatProvider");
	return ctx;
}
