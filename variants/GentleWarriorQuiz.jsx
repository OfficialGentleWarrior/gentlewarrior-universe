import { useState } from 'react';

// --- Locked Archetypes (15) ---
const ARCHETYPES = [
  "Ironbound Champion","Lumenforged Sentinel","Royal Verdant Guardian","Shadowbound Watcher","Stormforged Sentinel",
  "Frostforged Sentinel","Auroraforged Paladin","Runestone Guardian","Dustborne Wanderer","Oceanborn Tidemender",
  "Aetherborn Warden","Gaialune Healer","Ignara Flameheart","Umbrath Nightwarden","Solyndra Dawnkeeper"
];

// --- 10 Questions, 4 Answers each. Each answer maps to an archetype index (0-14) ---
const QUESTIONS = [
  { q: "When facing hardship, you usually…", a: [
      { t: "Endure silently", k: 0 }, { t: "Protect others first", k: 2 }, { t: "Analyze and observe", k: 3 }, { t: "Push forward with fire", k: 12 }
    ]},
  { q: "Your strength comes from…", a: [
      { t: "Discipline", k: 0 }, { t: "Hope", k: 14 }, { t: "Nature", k: 11 }, { t: "Wisdom", k: 7 }
    ]},
  { q: "In a team, you are the one who…", a: [
      { t: "Leads the charge", k: 6 }, { t: "Guards the back", k: 1 }, { t: "Heals the wounded", k: 11 }, { t: "Keeps watch", k: 13 }
    ]},
  { q: "What calms you most?", a: [
      { t: "Ocean", k: 9 }, { t: "Forest", k: 2 }, { t: "Stone", k: 7 }, { t: "Snow", k: 5 }
    ]},
  { q: "Your courage is best described as…", a: [
      { t: "Unbreakable", k: 0 }, { t: "Luminous", k: 1 }, { t: "Quiet", k: 8 }, { t: "Burning", k: 12 }
    ]},
  { q: "You prefer to help by…", a: [
      { t: "Teaching", k: 7 }, { t: "Healing", k: 11 }, { t: "Defending", k: 1 }, { t: "Guiding", k: 14 }
    ]},
  { q: "Your inner world feels like…", a: [
      { t: "Storm", k: 4 }, { t: "Dawn", k: 14 }, { t: "Night", k: 13 }, { t: "Earth", k: 2 }
    ]},
  { q: "When you fail, you…", a: [
      { t: "Rise again", k: 6 }, { t: "Reflect", k: 3 }, { t: "Adapt", k: 9 }, { t: "Endure", k: 8 }
    ]},
  { q: "Your presence gives others…", a: [
      { t: "Safety", k: 1 }, { t: "Warmth", k: 12 }, { t: "Peace", k: 11 }, { t: "Clarity", k: 7 }
    ]},
  { q: "You are most aligned with…", a: [
      { t: "Light", k: 14 }, { t: "Shadow", k: 3 }, { t: "Wind", k: 10 }, { t: "Stone", k: 7 }
    ]}
];

export default function GentleWarriorQuiz() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState(Array(15).fill(0));
  const [result, setResult] = useState(null);

  const choose = (k) => {
    const s = [...scores];
    s[k]++;
    setScores(s);
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else finalize(s);
  };

  const finalize = (s) => {
    const max = Math.max(...s);
    const idx = s.indexOf(max); // locked tie-break: first in order
    setResult(ARCHETYPES[idx]);
  };

  if (result) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Your Gentle Warrior Variant</h1>
        <p className="mt-4 text-xl">{result}</p>
        <p className="mt-2 italic">I am the {result} — Gentle Warrior</p>
      </div>
    );
  }

  const { q, a } = QUESTIONS[step];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-lg mb-4">Question {step + 1} / {QUESTIONS.length}</h2>
      <p className="mb-4 font-semibold">{q}</p>
      <div className="grid grid-cols-1 gap-2">
        {a.map((opt, i) => (
          <button
            key={i}
            className="border rounded p-3 hover:bg-gray-100"
            onClick={() => choose(opt.k)}
          >
            {opt.t}
          </button>
        ))}
      </div>
    </div>
  );
}

