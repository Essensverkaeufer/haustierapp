const STORAGE_KEY = "haustierapp:v1";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_DECAY_HOURS = 24;

const PETS = {
  parrot: {
    name: "Papagei",
    image: "assets/parrot.png",
    alt: "Roter Papagei",
    game: "echo",
    defaults: { hunger: 35, energy: 80, mood: 65, cleanliness: 70, bond: 20 },
    chatter: [
      "Papagei ist aktiv.",
      "Papagei ist aufmerksam.",
      "Papagei ist stabil."
    ],
    requests: [
      { type: "play", text: "Papagei: Echo ueben." },
      { type: "feed", text: "Papagei: Fuettern." },
      { type: "treat", text: "Papagei: Snack geben." },
      { type: "clean", text: "Papagei: Reinigen." }
    ]
  },
  cat: {
    name: "Katze",
    image: "assets/cat.png",
    alt: "Graue Katze",
    game: "chase",
    defaults: { hunger: 42, energy: 75, mood: 58, cleanliness: 82, bond: 16 },
    chatter: [
      "Katze ist ruhig.",
      "Katze ist aufmerksam.",
      "Katze ist stabil."
    ],
    requests: [
      { type: "sleep", text: "Katze: Schlafen." },
      { type: "treat", text: "Katze: Snack geben." },
      { type: "play", text: "Katze: Fang die Maus spielen." },
      { type: "feed", text: "Katze: Fuettern." }
    ]
  },
  dog: {
    name: "Hund",
    image: "assets/dog.png",
    alt: "Hund",
    game: "fetch",
    defaults: { hunger: 38, energy: 85, mood: 70, cleanliness: 62, bond: 24 },
    chatter: [
      "Hund ist aktiv.",
      "Hund ist aufmerksam.",
      "Hund ist stabil."
    ],
    requests: [
      { type: "play", text: "Hund: Apportieren spielen." },
      { type: "feed", text: "Hund: Fuettern." },
      { type: "clean", text: "Hund: Reinigen." },
      { type: "treat", text: "Hund: Snack geben." }
    ]
  }
};

const ITEMS = {
  treat: {
    name: "Snack",
    cost: 12,
    unlockLevel: 1,
    description: "Hunger -25, Laune +8, Bindung +4.",
    requestType: "treat",
    changes: { hunger: -25, mood: 8, bond: 4 },
    xp: 8,
    message: "Snack benutzt."
  },
  toy: {
    name: "Spielzeug",
    cost: 18,
    unlockLevel: 2,
    description: "Energie -7, Laune +22, Bindung +12.",
    requestType: "play",
    changes: { hunger: 5, energy: -7, mood: 22, bond: 12 },
    xp: 12,
    message: "Spielzeug benutzt."
  },
  shampoo: {
    name: "Pflege-Set",
    cost: 20,
    unlockLevel: 3,
    description: "Sauberkeit +35, Laune +3, Bindung +4.",
    requestType: "clean",
    changes: { cleanliness: 35, mood: 3, bond: 4 },
    xp: 10,
    message: "Pflege-Set benutzt."
  },
  blanket: {
    name: "Decke",
    cost: 24,
    unlockLevel: 4,
    description: "Energie +30, Laune +9, Bindung +6.",
    requestType: "sleep",
    changes: { hunger: 4, energy: 30, mood: 9, bond: 6 },
    xp: 10,
    message: "Decke benutzt."
  }
};

const ACHIEVEMENTS = [
  { id: "firstCare", title: "Erste Pflege" },
  { id: "firstSave", title: "Gesichert" },
  { id: "allPets", title: "Alle drei betreut" },
  { id: "level3", title: "Level 3" },
  { id: "level5", title: "Level 5" },
  { id: "pass5", title: "Battlepass 5" },
  { id: "passComplete", title: "Battlepass 12" },
  { id: "perfectDay", title: "Sehr guter Zustand" },
  { id: "dogGame", title: "Apportieren 5+" },
  { id: "catGame", title: "Maus 5+" },
  { id: "parrotGame", title: "Echo 4+" },
  { id: "coinStack", title: "100 Muenzen" }
];

const BATTLEPASS_SEASON = "Saison 1: Haustierverwaltung";
const BATTLEPASS_XP_PER_TIER = 90;
const BATTLEPASS_TIERS = [
  { tier: 1, name: "Basisfreigabe", reward: { coins: 20 } },
  { tier: 2, name: "Snack-Protokoll", reward: { items: { treat: 1 } } },
  { tier: 3, name: "Kleines Budget", reward: { coins: 25 } },
  { tier: 4, name: "Pflegefreigabe", reward: { items: { shampoo: 1 } } },
  { tier: 5, name: "Inventarpruefung", reward: { items: { toy: 1 } } },
  { tier: 6, name: "Mittleres Budget", reward: { coins: 35 } },
  { tier: 7, name: "Ruhephase", reward: { items: { blanket: 1 } } },
  { tier: 8, name: "Materialpaket", reward: { items: { treat: 1, shampoo: 1 } } },
  { tier: 9, name: "Grosses Budget", reward: { coins: 50 } },
  { tier: 10, name: "Spielpaket", reward: { items: { toy: 1, blanket: 1 } } },
  { tier: 11, name: "Saisonreserve", reward: { coins: 75 } },
  { tier: 12, name: "Abschlussbericht", reward: { coins: 100, items: { treat: 2, toy: 1, shampoo: 1, blanket: 1 } } }
];
const BATTLEPASS_MISSIONS = [
  { id: "care3", type: "care", label: "3 Pflegeaktionen", target: 3, rewardXp: 35 },
  { id: "game1", type: "game", label: "1 Minispiel abschliessen", target: 1, rewardXp: 45 },
  { id: "task2", type: "task", label: "2 Aufgaben erledigen", target: 2, rewardXp: 50 }
];

const el = id => document.getElementById(id);
const clamp = value => Math.max(0, Math.min(100, Math.round(value)));

let state = createDefaultState();
let messageOverride = "";
let activeGame = null;

function createDefaultState() {
  const createdAt = Date.now();
  return {
    version: 1,
    selectedPet: "parrot",
    coins: 30,
    streak: 0,
    lastCareDate: null,
    inventory: { treat: 1, toy: 0, shampoo: 0, blanket: 0 },
    achievements: {},
    battlepass: createBattlepassState(),
    pets: {
      parrot: createPetState("parrot", createdAt),
      cat: createPetState("cat", createdAt),
      dog: createPetState("dog", createdAt)
    }
  };
}

function createPetState(species, createdAt) {
  const meta = PETS[species];
  return {
    species,
    name: meta.name,
    hunger: meta.defaults.hunger,
    energy: meta.defaults.energy,
    mood: meta.defaults.mood,
    cleanliness: meta.defaults.cleanliness,
    bond: meta.defaults.bond,
    xp: 0,
    level: 1,
    careCount: 0,
    lastCaredAt: createdAt,
    request: { ...meta.requests[0] },
    bestScores: { fetch: 0, chase: 0, echo: 0 }
  };
}

function createBattlepassState() {
  return {
    season: BATTLEPASS_SEASON,
    xp: 0,
    claimed: {},
    dailyKey: localDateKey(Date.now()),
    missions: createDailyMissions()
  };
}

function createDailyMissions() {
  return BATTLEPASS_MISSIONS.map(mission => ({
    id: mission.id,
    type: mission.type,
    label: mission.label,
    target: mission.target,
    rewardXp: mission.rewardXp,
    progress: 0,
    completed: false
  }));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    state = normalizeState(saved);
  } catch {
    state = createDefaultState();
  }

  applyOfflineDecay();
  Object.keys(PETS).forEach(species => ensureRequest(state.pets[species]));
  saveState();
  render();
}

function normalizeState(saved) {
  const fresh = createDefaultState();

  if (!saved || typeof saved !== "object") {
    return fresh;
  }

  const normalized = {
    ...fresh,
    selectedPet: PETS[saved.selectedPet] ? saved.selectedPet : fresh.selectedPet,
    coins: numberOrDefault(saved.coins, fresh.coins),
    streak: numberOrDefault(saved.streak, fresh.streak),
    lastCareDate: saved.lastCareDate || fresh.lastCareDate,
    achievements: { ...fresh.achievements, ...(saved.achievements || {}) },
    inventory: { ...fresh.inventory },
    battlepass: normalizeBattlepass(saved.battlepass)
  };

  Object.keys(ITEMS).forEach(id => {
    normalized.inventory[id] = numberOrDefault(saved.inventory?.[id], fresh.inventory[id]);
  });

  Object.keys(PETS).forEach(species => {
    const base = createPetState(species, Date.now());
    const rawPet = saved.pets?.[species] || {};
    normalized.pets[species] = {
      ...base,
      ...rawPet,
      species,
      name: PETS[species].name,
      hunger: clamp(numberOrDefault(rawPet.hunger, base.hunger)),
      energy: clamp(numberOrDefault(rawPet.energy, base.energy)),
      mood: clamp(numberOrDefault(rawPet.mood, base.mood)),
      cleanliness: clamp(numberOrDefault(rawPet.cleanliness, base.cleanliness)),
      bond: clamp(numberOrDefault(rawPet.bond, base.bond)),
      xp: Math.max(0, numberOrDefault(rawPet.xp, base.xp)),
      level: Math.max(1, numberOrDefault(rawPet.level, base.level)),
      careCount: Math.max(0, numberOrDefault(rawPet.careCount, base.careCount)),
      lastCaredAt: numberOrDefault(rawPet.lastCaredAt, base.lastCaredAt),
      request: normalizeRequest(species, rawPet.request),
      bestScores: { ...base.bestScores, ...(rawPet.bestScores || {}) }
    };
  });

  return normalized;
}

function numberOrDefault(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function normalizeRequest(species, request) {
  if (!request?.type) {
    return { ...PETS[species].requests[0] };
  }

  const currentRequest = PETS[species].requests.find(item => item.type === request.type);
  return { ...(currentRequest || PETS[species].requests[0]) };
}

function normalizeBattlepass(rawPass) {
  const today = localDateKey(Date.now());
  const pass = rawPass && typeof rawPass === "object" ? rawPass : {};
  const resetMissions = pass.dailyKey !== today;

  return {
    season: BATTLEPASS_SEASON,
    xp: Math.max(0, numberOrDefault(pass.xp, 0)),
    claimed: { ...(pass.claimed || {}) },
    dailyKey: today,
    missions: resetMissions ? createDailyMissions() : normalizeBattlepassMissions(pass.missions)
  };
}

function normalizeBattlepassMissions(rawMissions = []) {
  return BATTLEPASS_MISSIONS.map(template => {
    const saved = Array.isArray(rawMissions)
      ? rawMissions.find(mission => mission.id === template.id)
      : null;

    const progress = Math.min(template.target, Math.max(0, numberOrDefault(saved?.progress, 0)));
    return {
      id: template.id,
      type: template.type,
      label: template.label,
      target: template.target,
      rewardXp: template.rewardXp,
      progress,
      completed: Boolean(saved?.completed) || progress >= template.target
    };
  });
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    messageOverride = "Speichern im Browser ist blockiert.";
  }
}

function currentPet() {
  return state.pets[state.selectedPet];
}

function currentMeta() {
  return PETS[state.selectedPet];
}

function xpTarget(level) {
  return 50 + level * 10;
}

function applyOfflineDecay() {
  const now = Date.now();

  Object.values(state.pets).forEach(pet => {
    const elapsedHours = Math.min(
      MAX_DECAY_HOURS,
      Math.max(0, (now - numberOrDefault(pet.lastCaredAt, now)) / HOUR_MS)
    );

    if (elapsedHours < 0.05) {
      return;
    }

    applyStatChanges(pet, {
      hunger: elapsedHours * 2.3,
      energy: elapsedHours * -1.2,
      mood: elapsedHours * -1.1,
      cleanliness: elapsedHours * -1.5
    });
    pet.lastCaredAt = now;
  });
}

function applyStatChanges(pet, changes) {
  ["hunger", "energy", "mood", "cleanliness", "bond"].forEach(key => {
    if (Object.prototype.hasOwnProperty.call(changes, key)) {
      pet[key] = clamp(pet[key] + changes[key]);
    }
  });
}

function render() {
  const pet = currentPet();
  const meta = currentMeta();

  el("petSelect").value = state.selectedPet;
  el("petName").textContent = pet.name;
  el("petImage").src = meta.image;
  el("petImage").alt = meta.alt;
  el("petImage").className = `pet-image ${state.selectedPet}`;

  el("coinsValue").textContent = state.coins;
  el("streakValue").textContent = `${state.streak} Tag${state.streak === 1 ? "" : "e"}`;
  el("levelValue").textContent = pet.level;
  el("xpValue").textContent = `${pet.xp}/${xpTarget(pet.level)}`;
  el("passSummaryValue").textContent = battlepassLevel();
  el("requestText").textContent = pet.request?.text || "Keine Aufgabe offen.";

  setValue("hunger", pet.hunger);
  setValue("energy", pet.energy);
  setValue("mood", pet.mood);
  setValue("cleanliness", pet.cleanliness);
  setValue("bond", pet.bond);

  el("message").textContent = messageOverride || deriveMessage(pet, meta);
  renderBattlepass();
  renderItems();
  renderAchievements();
}

function setValue(key, value) {
  const id = key === "cleanliness" ? "cleanliness" : key;
  el(`${id}Value`).textContent = value;
  el(`${id}Bar`).style.width = `${value}%`;
}

function deriveMessage(pet, meta) {
  const wellness = ((100 - pet.hunger) + pet.energy + pet.mood + pet.cleanliness + pet.bond) / 5;

  if (pet.hunger > 82) return `${pet.name} braucht Futter.`;
  if (pet.energy < 24) return `${pet.name} ist muede.`;
  if (pet.cleanliness < 25) return `${pet.name} braucht Pflege.`;
  if (pet.mood < 28) return `${pet.name} braucht Aufmerksamkeit.`;
  if (wellness > 84) return `${pet.name}: sehr guter Zustand.`;

  const index = (pet.level + state.streak + Math.floor(pet.mood / 20)) % meta.chatter.length;
  return meta.chatter[index];
}

function renderItems() {
  el("itemList").innerHTML = Object.entries(ITEMS).map(([id, item]) => {
    const owned = state.inventory[id] || 0;
    const levelLocked = currentPet().level < item.unlockLevel;
    const buyDisabled = levelLocked || state.coins < item.cost;
    const useDisabled = owned <= 0;
    const unlockText = levelLocked ? `ab Level ${item.unlockLevel}` : `${item.cost} Muenzen`;

    return `
      <div class="item-row">
        <div>
          <span class="item-name">${item.name}</span>
          <span class="item-desc">${item.description}</span>
        </div>
        <div class="item-meta">${unlockText}<br>Besitz: ${owned}</div>
        <button data-buy="${id}" ${buyDisabled ? "disabled" : ""}>Kaufen</button>
        <button data-use="${id}" ${useDisabled ? "disabled" : ""}>Benutzen</button>
      </div>
    `;
  }).join("");
}

function renderAchievements() {
  el("achievementList").innerHTML = ACHIEVEMENTS.map(achievement => {
    const unlocked = Boolean(state.achievements[achievement.id]);
    return `<span class="badge ${unlocked ? "" : "locked"}">${unlocked ? achievement.title : "???"}</span>`;
  }).join("");
}

function battlepassLevel() {
  return Math.min(
    BATTLEPASS_TIERS.length,
    Math.floor(state.battlepass.xp / BATTLEPASS_XP_PER_TIER) + 1
  );
}

function renderBattlepass() {
  ensureBattlepassDaily();

  const level = battlepassLevel();
  const maxLevel = BATTLEPASS_TIERS.length;
  const levelStartXp = (level - 1) * BATTLEPASS_XP_PER_TIER;
  const levelProgress = level >= maxLevel
    ? BATTLEPASS_XP_PER_TIER
    : state.battlepass.xp - levelStartXp;
  const progressPercent = Math.min(100, Math.round((levelProgress / BATTLEPASS_XP_PER_TIER) * 100));

  el("passSubtitle").textContent = `${state.battlepass.season}. Fortschritt gilt fuer alle Haustiere.`;
  el("passLevelBadge").textContent = `Stufe ${level}`;
  el("passXpValue").textContent = level >= maxLevel
    ? "Max"
    : `${levelProgress}/${BATTLEPASS_XP_PER_TIER}`;
  el("passBar").style.width = `${progressPercent}%`;

  el("passMissionList").innerHTML = state.battlepass.missions.map(mission => {
    const done = mission.completed;
    return `
      <div class="mission-row ${done ? "completed" : ""}">
        <span>${mission.label}</span>
        <strong>${mission.progress}/${mission.target}</strong>
        <em>${done ? "erledigt" : `+${mission.rewardXp} XP`}</em>
      </div>
    `;
  }).join("");

  el("battlepassTrack").innerHTML = BATTLEPASS_TIERS.map(tier => {
    const claimed = Boolean(state.battlepass.claimed[tier.tier]);
    const unlocked = level >= tier.tier;
    const stateLabel = claimed ? "Eingeloest" : unlocked ? "Einloesen" : "Gesperrt";
    const className = claimed ? "claimed" : unlocked ? "claimable" : "locked";

    return `
      <div class="pass-tier ${className}">
        <strong>Stufe ${tier.tier}</strong>
        <span>${tier.name}</span>
        <span>${rewardLabel(tier.reward)}</span>
        <button data-claim-pass="${tier.tier}" ${claimed || !unlocked ? "disabled" : ""}>${stateLabel}</button>
      </div>
    `;
  }).join("");
}

function rewardLabel(reward) {
  const parts = [];

  if (reward.coins) {
    parts.push(`${reward.coins} Muenzen`);
  }

  if (reward.items) {
    Object.entries(reward.items).forEach(([id, amount]) => {
      parts.push(`${ITEMS[id]?.name || id} x${amount}`);
    });
  }

  return parts.join(", ");
}

function notify(text, animation = "pulse") {
  messageOverride = text;
  render();

  const frame = el("petFrame");
  frame.classList.remove("pulse", "sleepy");
  void frame.offsetWidth;
  frame.classList.add(animation);
  window.setTimeout(() => frame.classList.remove(animation), 760);
}

function feedPet() {
  const pet = currentPet();
  const changes = {
    parrot: { hunger: -18, mood: 6, cleanliness: -4, bond: 2 },
    cat: { hunger: -19, mood: 7, cleanliness: -3, bond: 3 },
    dog: { hunger: -24, mood: 6, cleanliness: -5, bond: 3 }
  }[state.selectedPet];

  applyStatChanges(pet, changes);
  const notes = finalizeCare("feed", 8, 3);
  notify(`Gefuettert. ${notes.join(" ")}`.trim());
}

function sleepPet() {
  const pet = currentPet();
  const changes = {
    parrot: { hunger: 8, energy: 26, mood: 5, bond: 2 },
    cat: { hunger: 6, energy: 34, mood: 8, bond: 4 },
    dog: { hunger: 9, energy: 25, mood: 5, bond: 2 }
  }[state.selectedPet];

  applyStatChanges(pet, changes);
  const notes = finalizeCare("sleep", 8, 2);
  notify(`${pet.name} ruht sich aus. ${notes.join(" ")}`.trim(), "sleepy");
}

function cleanPet() {
  const pet = currentPet();
  const changes = {
    parrot: { cleanliness: 28, mood: 2, bond: 2 },
    cat: { cleanliness: 25, mood: -6, bond: 1 },
    dog: { cleanliness: 30, mood: 4, bond: 3 }
  }[state.selectedPet];

  applyStatChanges(pet, changes);
  const notes = finalizeCare("clean", 9, 2);
  const message = state.selectedPet === "cat"
    ? "Katze ist sauber. Laune leicht gesunken."
    : `${pet.name} ist sauber.`;
  notify(`${message} ${notes.join(" ")}`.trim());
}

function finalizeCare(kind, xp, coins) {
  const pet = currentPet();
  const notes = [];

  pet.careCount += 1;
  pet.lastCaredAt = Date.now();
  addDailyBonus(notes);

  if (coins > 0) {
    state.coins += coins;
    notes.push(`+${coins} Muenzen.`);
  }

  const levelNote = addXp(pet, xp);
  if (levelNote) notes.push(levelNote);

  addBattlepassXp(battlepassXpForCare(kind, xp), notes);
  updateBattlepassMission("care", 1, notes);
  completeRequest(kind, notes);
  checkAchievements(notes);
  saveState();
  render();
  return notes;
}

function addDailyBonus(notes) {
  const today = localDateKey(Date.now());
  if (state.lastCareDate === today) {
    return;
  }

  const yesterdayStreak = state.lastCareDate && daysBetween(state.lastCareDate, today) === 1;
  state.streak = yesterdayStreak ? state.streak + 1 : 1;
  state.lastCareDate = today;

  const bonus = 10 + Math.min(state.streak, 7);
  state.coins += bonus;
  notes.push(`Tagesbonus: +${bonus}.`);
}

function localDateKey(time) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(startKey, endKey) {
  const [startYear, startMonth, startDay] = startKey.split("-").map(Number);
  const [endYear, endMonth, endDay] = endKey.split("-").map(Number);
  const start = new Date(startYear, startMonth - 1, startDay).getTime();
  const end = new Date(endYear, endMonth - 1, endDay).getTime();
  return Math.round((end - start) / DAY_MS);
}

function addXp(pet, amount) {
  const startLevel = pet.level;
  pet.xp += Math.max(0, Math.round(amount));

  while (pet.xp >= xpTarget(pet.level)) {
    pet.xp -= xpTarget(pet.level);
    pet.level += 1;
    state.coins += 5 + pet.level;
  }

  return pet.level > startLevel ? `${pet.name} erreicht Level ${pet.level}.` : "";
}

function ensureBattlepassDaily() {
  const today = localDateKey(Date.now());

  if (!state.battlepass || state.battlepass.dailyKey !== today) {
    state.battlepass = {
      ...createBattlepassState(),
      xp: Math.max(0, numberOrDefault(state.battlepass?.xp, 0)),
      claimed: { ...(state.battlepass?.claimed || {}) }
    };
    return;
  }

  state.battlepass.missions = normalizeBattlepassMissions(state.battlepass.missions);
}

function battlepassXpForCare(kind, xp) {
  const base = kind === "play" ? 12 : 8;
  return Math.min(35, base + Math.round(xp / 4));
}

function addBattlepassXp(amount, notes = []) {
  ensureBattlepassDaily();

  const xp = Math.max(0, Math.round(amount));
  if (xp <= 0) {
    return;
  }

  const startLevel = battlepassLevel();
  state.battlepass.xp += xp;
  notes.push(`+${xp} Pass-XP.`);

  const nextLevel = battlepassLevel();
  if (nextLevel > startLevel) {
    notes.push(`Battlepass Stufe ${nextLevel} erreicht.`);
  }

  if (nextLevel >= 5) unlockAchievement("pass5", notes);
  if (nextLevel >= BATTLEPASS_TIERS.length) unlockAchievement("passComplete", notes);
}

function updateBattlepassMission(type, amount, notes = []) {
  ensureBattlepassDaily();

  state.battlepass.missions.forEach(mission => {
    if (mission.type !== type || mission.completed) {
      return;
    }

    mission.progress = Math.min(mission.target, mission.progress + amount);
    if (mission.progress >= mission.target) {
      mission.completed = true;
      addBattlepassXp(mission.rewardXp, notes);
      notes.push(`Tagesaufgabe abgeschlossen: ${mission.label}.`);
    }
  });
}

function claimBattlepassReward(tierNumber) {
  const tier = BATTLEPASS_TIERS.find(item => item.tier === tierNumber);

  if (!tier || battlepassLevel() < tier.tier || state.battlepass.claimed[tier.tier]) {
    notify("Battlepass-Belohnung nicht verfuegbar.");
    return;
  }

  const notes = [];
  applyBattlepassReward(tier.reward);
  state.battlepass.claimed[tier.tier] = true;

  if (tier.tier >= 5) unlockAchievement("pass5", notes);
  if (tier.tier >= BATTLEPASS_TIERS.length) unlockAchievement("passComplete", notes);

  saveState();
  notify(`Battlepass Stufe ${tier.tier} eingeloest: ${rewardLabel(tier.reward)}. ${notes.join(" ")}`.trim());
}

function applyBattlepassReward(reward) {
  if (reward.coins) {
    state.coins += reward.coins;
  }

  if (reward.items) {
    Object.entries(reward.items).forEach(([id, amount]) => {
      state.inventory[id] = (state.inventory[id] || 0) + amount;
    });
  }
}

function completeRequest(kind, notes) {
  const pet = currentPet();

  if (!pet.request || pet.request.type !== kind) {
    return;
  }

  applyStatChanges(pet, { mood: 5, bond: 4 });
  state.coins += 8;
  notes.push("Aufgabe erledigt: +8.");
  updateBattlepassMission("task", 1, notes);
  const levelNote = addXp(pet, 8);
  if (levelNote) notes.push(levelNote);
  pet.request = pickRequest(state.selectedPet, kind);
}

function pickRequest(species, avoidType) {
  const options = PETS[species].requests.filter(request => request.type !== avoidType);
  const source = options.length ? options : PETS[species].requests;
  return { ...source[Math.floor(Math.random() * source.length)] };
}

function ensureRequest(pet) {
  if (!pet.request || !pet.request.type) {
    pet.request = pickRequest(pet.species);
  }
}

function checkAchievements(notes = []) {
  const pets = Object.values(state.pets);
  const current = currentPet();

  if (pets.some(pet => pet.careCount > 0)) unlockAchievement("firstCare", notes);
  if (pets.every(pet => pet.careCount > 0)) unlockAchievement("allPets", notes);
  if (pets.some(pet => pet.level >= 3)) unlockAchievement("level3", notes);
  if (pets.some(pet => pet.level >= 5)) unlockAchievement("level5", notes);
  if (current.hunger <= 15 && current.energy >= 80 && current.mood >= 80 && current.cleanliness >= 80) {
    unlockAchievement("perfectDay", notes);
  }
  if (state.coins >= 100) unlockAchievement("coinStack", notes);
}

function unlockAchievement(id, notes = []) {
  if (state.achievements[id]) {
    return;
  }

  const achievement = ACHIEVEMENTS.find(item => item.id === id);
  state.achievements[id] = true;
  state.coins += 10;
  notes.push(`Erfolg: ${achievement?.title || id} +10.`);
}

function buyItem(id) {
  const item = ITEMS[id];
  const pet = currentPet();

  if (!item || pet.level < item.unlockLevel || state.coins < item.cost) {
    notify("Nicht genug Level oder Muenzen.");
    return;
  }

  state.coins -= item.cost;
  state.inventory[id] = (state.inventory[id] || 0) + 1;
  saveState();
  notify(`${item.name} gekauft.`);
}

function useItem(id) {
  const item = ITEMS[id];

  if (!item || (state.inventory[id] || 0) <= 0) {
    notify("Davon ist nichts im Inventar.");
    return;
  }

  state.inventory[id] -= 1;
  applyStatChanges(currentPet(), item.changes);
  const notes = finalizeCare(item.requestType, item.xp, 0);
  notify(`${item.message} ${notes.join(" ")}`.trim());
}

function startMinigame() {
  const pet = currentPet();

  if (pet.energy < 12) {
    notify(`${pet.name} ist zu muede fuer ein Minispiel.`, "sleepy");
    return;
  }

  if (currentMeta().game === "fetch") startFetchGame();
  if (currentMeta().game === "chase") startChaseGame();
  if (currentMeta().game === "echo") startEchoGame();
}

function openGame(title, help) {
  clearActiveGame();
  activeGame = { running: true, completed: false, raf: null, intervals: [], timeouts: [] };
  el("gameTitle").textContent = title;
  el("gameHelp").textContent = help;
  el("gameContent").onclick = null;
  el("gameActions").onclick = null;
  el("gameContent").innerHTML = "";
  el("gameActions").innerHTML = "";
  el("gameModal").classList.remove("hidden");
  el("gameModal").setAttribute("aria-hidden", "false");
}

function closeGame() {
  clearActiveGame();
  el("gameModal").classList.add("hidden");
  el("gameModal").setAttribute("aria-hidden", "true");
  render();
}

function clearActiveGame() {
  if (!activeGame) {
    return;
  }

  activeGame.running = false;
  if (activeGame.raf) cancelAnimationFrame(activeGame.raf);
  activeGame.intervals.forEach(clearInterval);
  activeGame.timeouts.forEach(clearTimeout);
  activeGame = null;
}

function stopGameTimers() {
  if (!activeGame) {
    return;
  }

  activeGame.running = false;
  if (activeGame.raf) cancelAnimationFrame(activeGame.raf);
  activeGame.intervals.forEach(clearInterval);
  activeGame.timeouts.forEach(clearTimeout);
  activeGame.raf = null;
  activeGame.intervals = [];
  activeGame.timeouts = [];
}

function gameTimeout(callback, delay) {
  const id = window.setTimeout(() => {
    if (activeGame) callback();
  }, delay);
  activeGame.timeouts.push(id);
  return id;
}

function gameInterval(callback, delay) {
  const id = window.setInterval(() => {
    if (activeGame) callback();
  }, delay);
  activeGame.intervals.push(id);
  return id;
}

function startFetchGame() {
  openGame("Apportieren", "Klicke, wenn die Markierung im gruenen Feld ist. Fuenf Runden.");

  let round = 1;
  let score = 0;
  let position = 0;
  let direction = 1;

  el("gameContent").innerHTML = `
    <div class="game-score" id="fetchScore">Runde 1/5 | Punkte 0</div>
    <div class="timing-track">
      <span class="target-zone"></span>
      <span class="timing-marker" id="timingMarker"></span>
    </div>
  `;
  el("gameActions").innerHTML = `<button id="catchBtn">Fangen</button>`;

  function animate() {
    if (!activeGame?.running) return;
    position += direction * 1.5;
    if (position >= 100 || position <= 0) direction *= -1;
    position = Math.max(0, Math.min(100, position));
    el("timingMarker").style.left = `${position}%`;
    activeGame.raf = requestAnimationFrame(animate);
  }

  el("catchBtn").addEventListener("click", () => {
    const distance = Math.abs(position - 50);
    const points = distance <= 8 ? 2 : distance <= 18 ? 1 : 0;
    score += points;
    round += 1;

    if (round > 5) {
      finishMinigame("fetch", score, `Apportieren abgeschlossen: ${score}/10 Punkte.`);
      return;
    }

    el("fetchScore").textContent = `Runde ${round}/5 | Punkte ${score}`;
  });

  animate();
}

function startChaseGame() {
  openGame("Fang die Maus", "Klicke das Ziel innerhalb der Zeit. Mehr Treffer geben mehr Punkte.");

  let score = 0;
  let timeLeft = 12;

  el("gameContent").innerHTML = `
    <div class="game-score" id="chaseScore">Zeit 12 | Treffer 0</div>
    <div class="cat-stage" id="catStage">
      <button class="mouse-target" id="mouseTarget">Maus</button>
    </div>
  `;

  function moveMouse() {
    const target = el("mouseTarget");
    target.style.left = `${Math.floor(Math.random() * 78) + 4}%`;
    target.style.top = `${Math.floor(Math.random() * 76) + 6}%`;
  }

  el("mouseTarget").addEventListener("click", () => {
    score += 1;
    el("chaseScore").textContent = `Zeit ${timeLeft} | Treffer ${score}`;
    moveMouse();

    if (score >= 10) {
      finishMinigame("chase", score, `Fang die Maus abgeschlossen: ${score} Treffer.`);
    }
  });

  gameInterval(() => {
    timeLeft -= 1;
    el("chaseScore").textContent = `Zeit ${timeLeft} | Treffer ${score}`;

    if (timeLeft <= 0) {
      finishMinigame("chase", score, `Zeit vorbei: ${score} Treffer.`);
    }
  }, 1000);

  gameInterval(moveMouse, 900);
  moveMouse();
}

function startEchoGame() {
  openGame("Echo", "Merke dir die Reihenfolge und klicke sie nach. Sechs richtige Runden gewinnen das Spiel.");

  const keys = ["red", "blue", "yellow", "green"];
  const labels = { red: "Rot", blue: "Blau", yellow: "Gelb", green: "Gruen" };
  let sequence = [];
  let inputIndex = 0;
  let acceptingInput = false;
  let score = 0;

  el("gameContent").innerHTML = `
    <div class="game-score" id="echoScore">Runde 0 | Bestwert ${currentPet().bestScores.echo}</div>
    <p id="echoStatus">Bereit.</p>
    <div class="echo-grid">
      ${keys.map(key => `<button class="echo-btn" data-echo="${key}">${labels[key]}</button>`).join("")}
    </div>
  `;
  el("gameActions").innerHTML = `<button id="startEchoBtn">Start</button>`;

  function nextRound() {
    acceptingInput = false;
    inputIndex = 0;
    sequence.push(keys[Math.floor(Math.random() * keys.length)]);
    el("echoScore").textContent = `Runde ${sequence.length} | Bestwert ${currentPet().bestScores.echo}`;
    el("echoStatus").textContent = "Merken...";
    flashStep(0);
  }

  function flashStep(index) {
    if (index >= sequence.length) {
      acceptingInput = true;
      el("echoStatus").textContent = "Nachmachen.";
      return;
    }

    const button = document.querySelector(`[data-echo="${sequence[index]}"]`);
    button.classList.add("active");
    gameTimeout(() => {
      button.classList.remove("active");
      gameTimeout(() => flashStep(index + 1), 220);
    }, 470);
  }

  el("startEchoBtn").addEventListener("click", () => {
    el("gameActions").innerHTML = "";
    nextRound();
  });

  el("gameContent").onclick = event => {
    const button = event.target.closest("[data-echo]");
    if (!button || !acceptingInput) {
      return;
    }

    const choice = button.dataset.echo;
    button.classList.add("active");
    gameTimeout(() => button.classList.remove("active"), 130);

    if (choice !== sequence[inputIndex]) {
      finishMinigame("echo", score, `Echo abgeschlossen: ${score} richtige Runde${score === 1 ? "" : "n"}.`);
      return;
    }

    inputIndex += 1;
    if (inputIndex === sequence.length) {
      score = sequence.length;

      if (score >= 6) {
        finishMinigame("echo", score, "Echo abgeschlossen: 6 Runden geschafft.");
        return;
      }

      acceptingInput = false;
      el("echoStatus").textContent = "Richtig.";
      gameTimeout(nextRound, 650);
    }
  };
}

function finishMinigame(gameKey, score, resultText) {
  if (!activeGame || activeGame.completed) {
    return;
  }

  activeGame.completed = true;
  stopGameTimers();

  const pet = currentPet();
  const rewardCoins = 8 + score * 3;
  const rewardXp = 10 + score * 6;
  const moodGain = Math.min(30, 8 + score * 3);
  const bondGain = Math.min(24, 4 + score * 2);

  applyStatChanges(pet, {
    hunger: 8,
    energy: -12,
    mood: moodGain,
    bond: bondGain
  });
  pet.bestScores[gameKey] = Math.max(pet.bestScores[gameKey] || 0, score);

  const notes = finalizeCare("play", rewardXp, rewardCoins);
  updateBattlepassMission("game", 1, notes);
  if (gameKey === "fetch" && score >= 5) unlockAchievement("dogGame", notes);
  if (gameKey === "chase" && score >= 5) unlockAchievement("catGame", notes);
  if (gameKey === "echo" && score >= 4) unlockAchievement("parrotGame", notes);
  checkAchievements(notes);
  saveState();

  el("gameContent").innerHTML = `
    <div class="game-score">${resultText}</div>
    <p>${notes.join(" ")}</p>
  `;
  el("gameActions").innerHTML = `<button id="doneGameBtn">Fertig</button>`;
  el("doneGameBtn").addEventListener("click", closeGame);
  notify(resultText);
}

el("feedBtn").addEventListener("click", feedPet);
el("playBtn").addEventListener("click", startMinigame);
el("sleepBtn").addEventListener("click", sleepPet);
el("cleanBtn").addEventListener("click", cleanPet);

el("saveBtn").addEventListener("click", () => {
  const notes = [];
  unlockAchievement("firstSave", notes);
  saveState();
  notify(`Gespeichert. ${notes.join(" ")}`.trim());
});

el("resetBtn").addEventListener("click", () => {
  if (!window.confirm("Spielstand wirklich zuruecksetzen?")) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  state = createDefaultState();
  messageOverride = "Neues Spiel gestartet.";
  saveState();
  render();
});

el("petSelect").addEventListener("change", event => {
  state.selectedPet = event.target.value;
  ensureRequest(currentPet());
  messageOverride = "";
  saveState();
  render();
});

el("itemList").addEventListener("click", event => {
  const buyButton = event.target.closest("[data-buy]");
  const useButton = event.target.closest("[data-use]");

  if (buyButton) buyItem(buyButton.dataset.buy);
  if (useButton) useItem(useButton.dataset.use);
});

el("battlepassTrack").addEventListener("click", event => {
  const claimButton = event.target.closest("[data-claim-pass]");

  if (claimButton) {
    claimBattlepassReward(Number(claimButton.dataset.claimPass));
  }
});

el("closeGameBtn").addEventListener("click", closeGame);

window.addEventListener("keydown", event => {
  if (event.key === "Escape" && !el("gameModal").classList.contains("hidden")) {
    closeGame();
  }
});

loadState();
