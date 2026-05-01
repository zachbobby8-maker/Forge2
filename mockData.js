// Mock data and generators for Iron Forge Network

const MOCK_NAMES = ["IronMark", "Sven_Lifts", "TarekPower", "DaveSquats", "Grip_Reaper", "ChalkMonster", "Bane_Bench", "DeadliftDan", "ThorBjorn", "Atlas_Shoulders", "MassiveMike", "KettlebellKen", "VikingLift", "Apex_Predator", "Iron_Vanguard"];
const REGIONS = ["US", "EU", "ME"];
const ROLES = ["Trainer", "Seeker"];
const BIOS_TRAINER = [
  "700lb deadlift club. Here to pass on the iron wisdom.",
  "20 years under the bar. Fix your form, grow your total.",
  "Specializing in raw powerlifting. No gear, just grit.",
  "Mentoring men who want to push past their physical limits.",
  "I've torn calluses older than you. Let's get to work."
];
const BIOS_SEEKER = [
  "Stuck at a 315 bench. Need a veteran to push me.",
  "Just started my powerlifting journey. Hungry to learn.",
  "Recovering from a back injury, looking to rebuild my squat safely.",
  "Want to compete next year. Need a serious mentor.",
  "Tired of commercial gyms. I need that raw strength advice."
];

// Generate 150 realistic users
window.mockUsers = Array.from({ length: 150 }, (_, i) => {
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];
  const bioList = role === "Trainer" ? BIOS_TRAINER : BIOS_SEEKER;
  const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)] + Math.floor(Math.random() * 99);
  return {
    id: `user_${i}`,
    name: name,
    role: role,
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    bio: bioList[Math.floor(Math.random() * bioList.length)],
    avatar: `https://ui-avatars.com/api/?name=${name}&background=1a1a1a&color=8b0000&bold=true`,
    lat: (Math.random() * 80) - 40, // Abstract radar coordinates
    lng: (Math.random() * 80) - 40
  };
});

// Chat message generator (combinatorics to create massive variety)
const CHAT_SUBJECTS = ["my deadlift", "the squat rack", "bench press", "my PR", "grip strength", "hook grip", "chalking up", "pre-workout", "CNS recovery", "lower back tightness", "breath work", "bracing", "valsalva maneuver", "diaphragmatic breathing"];
const CHAT_ACTIONS = ["smashed", "struggling with", "need advice on", "finally hit", "tore a callus doing", "plateaued on", "grinded through", "failed a rep on", "passed out doing"];
const CHAT_FRAGMENTS = [
  "Keep your chest up, bro.",
  "You need more chalk.",
  "Drive through the heels.",
  "It's all about central nervous system recovery.",
  "Eat more red meat.",
  "Switch to hook grip.",
  "Brace your core like you're about to take a punch.",
  "Drop the ego, fix the form.",
  "Light weight, baby!",
  "Nothing but peanuts.",
  "Embrace the grind.",
  "Focus on your breath work, fill that diaphragm.",
  "Big air before you unrack.",
  "Learn the Valsalva maneuver if you want to move real weight.",
  "Don't leak air at the bottom of the squat."
];

const LIFTING_PLACEHOLDERS = [
  "https://placehold.co/400x300/1a1a1a/8b0000?text=NEW+PR",
  "https://placehold.co/400x300/1a1a1a/8b0000?text=FORM+CHECK",
  "https://placehold.co/400x300/1a1a1a/8b0000?text=HEAVY+LIFT",
  "https://placehold.co/400x300/1a1a1a/8b0000?text=MEAT+AND+IRON",
  "https://placehold.co/400x300/1a1a1a/8b0000?text=CHALKED+UP"
];

window.generateSimulatedChat = (count) => {
  const messages = [];
  for (let i = 0; i < count; i++) {
    const user = window.mockUsers[Math.floor(Math.random() * window.mockUsers.length)];
    const isImage = Math.random() > 0.85; // 15% chance of image post
    
    let content = "";
    if (isImage) {
      content = `<img src="${LIFTING_PLACEHOLDERS[Math.floor(Math.random() * LIFTING_PLACEHOLDERS.length)]}" class="w-full max-w-sm rounded-lg border border-red-900/30 object-cover mt-2">`;
    } else {
      const type = Math.random();
      if (type < 0.4 && user.role === "Seeker") {
        content = `Bro, I'm ${CHAT_ACTIONS[Math.floor(Math.random() * CHAT_ACTIONS.length)]} ${CHAT_SUBJECTS[Math.floor(Math.random() * CHAT_SUBJECTS.length)]}. Any tips?`;
      } else if (type < 0.8 && user.role === "Trainer") {
        content = CHAT_FRAGMENTS[Math.floor(Math.random() * CHAT_FRAGMENTS.length)];
      } else {
        content = `Just ${CHAT_ACTIONS[Math.floor(Math.random() * CHAT_ACTIONS.length)]} ${Math.floor(Math.random() * 200 + 300)}lbs. ${CHAT_FRAGMENTS[Math.floor(Math.random() * CHAT_FRAGMENTS.length)]}`;
      }
    }
    
    messages.push({
      user,
      content,
      time: new Date(Date.now() - (count - i) * 1000 * 60 * 5) // spread over time
    });
  }
  return messages;
};