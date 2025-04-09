
import { useEffect, useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const stats = ["Kracht", "Stamina", "VO2 Max", "Flexibiliteit", "Focus", "Intelligentie"];
const initialXP = Object.fromEntries(stats.map(stat => [stat, 0]));
const validationWindows = { Kracht: 14, Stamina: 7, "VO2 Max": 10, Flexibiliteit: 14, Focus: 3, Intelligentie: 30 };
const levelMilestones = {
  Kracht: ["10 pull-ups + 10 push-ups + 40kg bench", "15 pull-ups + 20 push-ups + 60kg bench", "20 pull-ups + 30 push-ups + 80kg bench", "25 pull-ups + 40 push-ups + 100kg bench", "Weighted pull-ups + 120kg bench", "1-arm push-up + 150kg deadlift", "1-arm pull-up + planche", "2x BW bench + 15 dips", "Muscle-up + 200kg DL", "Elite level (220kg bench + gymnast hold)"],
  Stamina: ["5k stappen + 20m wandelen", "10k stappen", "15k stappen + 30m jog", "20k stappen + 1u hike", "10km run", "15km loop + trappen", "25km hike", "Half-marathon", "30km loop / 50k stappen", "Ultramarathon"],
  "VO2 Max": ["1km run zonder hijgen", "Traplopen 5m", "5k in <35m", "5k in <28m", "10k in <60m", "10k + fietsen 30m", "1u circuit", "5k <22m + 100 burpees", "VO2 Max >60", "Sub 3u marathon"],
  Flexibiliteit: ["Tenen raken + shoulder flex", "Palmen vloer", "2m deep squat + shoulder flow", "Volledige squat (heels down)", "L-sit + pigeon", "Bridge + lunges", "Lotus 30s", "Pancake stretch", "Split + bridge pulses", "Full split + scorpion"],
  Focus: ["2u onafgeleid", "3 dagen geen social", "3u/day focus", "7 dagen schema", "10 dagen Pomodoro", "7 dagen monk mode", "3 dagen zonder telefoon", "5u deep work", "12u extreme focusdag", "CEO mentaliteit"],
  Intelligentie: ["5 dagen lezen", "1 boek uit", "3 boeken + notities", "Zettelkasten of Obsidian", "30 dagen 45m/dag leren", "Skill masteren", "Samenvat & teach", "Nieuwe skill toepassen", "Snel lezen + onthouden", "Polyglot level 🧠"]
};

export default function ACEApp() {
  const [xp, setXp] = useState(() => JSON.parse(localStorage.getItem("xp")) || initialXP);
  const [lastCheck, setLastCheck] = useState(() => JSON.parse(localStorage.getItem("lastCheck")) || Object.fromEntries(stats.map(s => [s, new Date()])));

  useEffect(() => {
    localStorage.setItem("xp", JSON.stringify(xp));
    localStorage.setItem("lastCheck", JSON.stringify(lastCheck));
  }, [xp, lastCheck]);

  const resetTracker = () => {
    setXp(initialXP);
    setLastCheck(Object.fromEntries(stats.map(stat => [stat, new Date()])));
    localStorage.removeItem("xp");
    localStorage.removeItem("lastCheck");
  };

  const getLevel = stat => Math.min(99, Math.floor((xp[stat] || 0) / 100) + 1);
  const getMilestone = stat => {
    const level = getLevel(stat);
    const index = Math.floor(level / 10) - 1;
    return levelMilestones[stat][index] || "Max level bereikt";
  };
  const validateStat = stat => (new Date() - new Date(lastCheck[stat])) / (1000 * 60 * 60 * 24) < validationWindows[stat];
  const getAverageLevel = () => Math.min(99, Math.round(stats.reduce((a, s) => a + getLevel(s), 0) / stats.length));
  const addXP = (stat, amt) => {
    setXp(p => ({ ...p, [stat]: p[stat] + amt }));
    setLastCheck(p => ({ ...p, [stat]: new Date() }));
  };

  const radarData = {
    labels: stats,
    datasets: [{
      label: "Stat Levels",
      data: stats.map(getLevel),
      backgroundColor: "rgba(34,211,238,0.3)",
      borderColor: "#22d3ee",
      borderWidth: 2,
    }],
  };
  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, color: "#fff" },
        grid: { color: "#333" },
        angleLines: { color: "#444" },
        pointLabels: { color: "#fff", font: { size: 14 } },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <h1 className="text-3xl font-bold text-cyan-400 text-center mb-2 drop-shadow">ACE v4 Superhuman Tracker</h1>
      <p className="text-center text-lg mb-4 text-cyan-200">ACE LEVEL {getAverageLevel()}</p>
      <div className="max-w-xl mx-auto"><Radar data={radarData} options={radarOptions} /></div>
      <div className="text-center mt-6">
        <button onClick={resetTracker} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">🔄 Reset Tracker</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {stats.map(stat => (
          <div key={stat} className="bg-zinc-900 p-4 rounded-xl border border-cyan-700">
            <h3 className="text-xl font-bold text-cyan-300">{stat}</h3>
            <div className="h-2 bg-zinc-700 mt-2 rounded">
              <div className="h-full bg-cyan-400 rounded" style={{ width: `${(xp[stat] % 100)}%` }}></div>
            </div>
            <p className="text-sm mt-1">Level {getLevel(stat)} / 99</p>
            <p className="text-xs mt-1 text-cyan-400">{getMilestone(stat)}</p>
            {!validateStat(stat) && <p className="text-red-500 text-xs mt-1">⚠️ Niet gevalideerd - herhaal prestatie</p>}
            <button className="mt-2 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => addXP(stat, 10)}>+10 XP</button>
          </div>
        ))}
      </div>
    </div>
  );
}
