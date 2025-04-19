import { useChats } from "../contexts/ChatContext";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function Charts() {
  const { chats } = useChats();
  const lineRef = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!lineRef.current || !pieRef.current) return;
    const allMessages = chats.flatMap(c => c.messages);
    const byDay: Record<string, number> = {};
    allMessages.forEach(msg => {
      const day = msg.timestamp.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    });
    const lineChart = new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: Object.keys(byDay),
        datasets: [{
          label: "Messages per Day",
          data: Object.values(byDay),
          borderColor: "#3b82f6",
          backgroundColor: "#bfdbfe",
        }],
      },
    });
    const statusCounts = chats.reduce((acc, c) => {
      acc[c.recruitmentStatus] = (acc[c.recruitmentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const pieChart = new Chart(pieRef.current, {
      type: "pie",
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          label: "Recruitment Status",
          data: Object.values(statusCounts),
          backgroundColor: ["#fbbf24", "#60a5fa", "#34d399", "#f87171", "#a78bfa", "#f472b6"],
        }],
      },
    });
    return () => {
      lineChart.destroy();
      pieChart.destroy();
    };
  }, [chats]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Message Activity</h3>
          <canvas ref={lineRef} height={200} />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Recruitment Status</h3>
          <canvas ref={pieRef} height={200} />
        </div>
      </div>
    </div>
  );
}