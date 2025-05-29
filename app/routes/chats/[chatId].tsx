import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useChats } from "../../contexts/ChatContext";

const statuses = [
	"Pending",
	"Screening",
	"Interview",
	"Offer",
	"Rejected",
	"Hired",
];

export default function ChatWindow() {
	const { chatId } = useParams();
	const { chats, sendMessage, updateRecruitmentStatus, addEvent } = useChats();
	const { user } = useAuth();
	const chat = chats.find((c) => c.id === chatId);
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [status, setStatus] = useState(chat?.recruitmentStatus || "Pending");

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chat?.messages]);

	if (!chat) return <div className="p-8">Chat not found.</div>;

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;
		setSending(true);
		setError("");
		try {
			await sendMessage(chat.id, input);
			setInput("");
		} catch (err) {
			setError("Failed to send message");
		} finally {
			setSending(false);
		}
	};

	const handleStatusChange = async (
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		setStatus(e.target.value);
		await updateRecruitmentStatus(chat.id, e.target.value);
	};

	return (
		<div className="max-w-2xl mx-auto p-4">
			<div className="flex justify-between items-center mb-2">
				<h2 className="font-bold text-lg">{chat.name}</h2>
				{user?.role === "recruiter" && (
					<select
						value={status}
						onChange={handleStatusChange}
						className="border rounded px-2 py-1 text-sm"
					>
						{statuses.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
				)}
				{user?.role !== "recruiter" && (
					<span className="text-xs bg-gray-200 px-2 py-1 rounded">
						{status}
					</span>
				)}
			</div>
			<div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto flex flex-col gap-2">
				{chat.messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex flex-col ${msg.senderId === user?.id ? "items-end" : "items-start"}`}
					>
						<div
							className={`rounded px-3 py-2 max-w-xs ${msg.senderId === user?.id ? "bg-blue-500 text-white" : "bg-white border"}`}
						>
							<span>{msg.content}</span>
						</div>
						<span className="text-xs text-gray-500 mt-1">
							{msg.senderId === user?.id ? "You" : msg.senderName} ·{" "}
							{format(new Date(msg.timestamp), "HH:mm, MMM d")}
						</span>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>
			<form onSubmit={handleSend} className="flex gap-2 mt-4">
				<input
					className="input input-bordered flex-1"
					placeholder="Type a message..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
					disabled={sending}
				/>
				<button type="submit" className="btn btn-primary" disabled={sending}>
					{sending ? "Sending..." : "Send"}
				</button>
			</form>
			{error && <div className="text-red-500 mt-2">{error}</div>}
		</div>
	);
}
