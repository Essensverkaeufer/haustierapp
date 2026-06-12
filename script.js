const SUPABASE_URL = "https://yrcodmwahedzifumawjq.supabase.co";
const SUPABASE_KEY = "sb_publishable_IPbGsipyQWlS-6Cgeu9ufQ_avADTemZ";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let pet = {
  pet_key: "main",
  name: "Papagei",
  species: "parrot",
  hunger: 35,
  energy: 80,
  mood: 65,
  cleanliness: 70
};

const pets = {
  parrot: {
    name: "Papagei",
    drawing: "  __\n (o )>\n /|\\\n / \\",
  },
  cat: {
    name: "Katze",
    drawing: " /\\_/\\\n( o.o )\n > ^ <",
  },
  dog: {
    name: "Hund",
    drawing: " / \__/ \\\n(  o  o )\n \   -- /",
  }
};

const clamp = value => Math.max(0, Math.min(100, value));
const el = id => document.getElementById(id);

function updateUI() {
  const currentPet = pets[pet.species] || pets.parrot;

  el("petName").textContent = pet.name;
  el("petDrawing").textContent = currentPet.drawing;

  el("hungerValue").textContent = pet.hunger;
  el("energyValue").textContent = pet.energy;
  el("moodValue").textContent = pet.mood;
  el("cleanlinessValue").textContent = pet.cleanliness;

  el("hungerBar").style.width = pet.hunger + "%";
  el("energyBar").style.width = pet.energy + "%";
  el("moodBar").style.width = pet.mood + "%";
  el("cleanlinessBar").style.width = pet.cleanliness + "%";

  el("petSelect").value = pet.species;

  if (pet.hunger > 75) {
    el("message").textContent = "Ich habe Hunger.";
  } else if (pet.energy < 30) {
    el("message").textContent = "Ich bin muede.";
  } else if (pet.cleanliness < 30) {
    el("message").textContent = "Ich bin schmutzig.";
  } else if (pet.mood > 75) {
    el("message").textContent = "Ich bin gluecklich.";
  } else {
    el("message").textContent = "Mir geht es gut.";
  }
}

async function loadPet() {
  const { data, error } = await db
    .from("pet_state")
    .select("*")
    .eq("pet_key", "main")
    .single();

  if (!error && data) {
    pet = data;
  }

  updateUI();
}

async function savePet() {
  pet.updated_at = new Date().toISOString();

  const { error } = await db
    .from("pet_state")
    .upsert(pet, { onConflict: "pet_key" });

  el("message").textContent = error
    ? "Speichern fehlgeschlagen."
    : "Gespeichert.";
}

function changeStats(changes) {
  pet.hunger = clamp(pet.hunger + (changes.hunger || 0));
  pet.energy = clamp(pet.energy + (changes.energy || 0));
  pet.mood = clamp(pet.mood + (changes.mood || 0));
  pet.cleanliness = clamp(pet.cleanliness + (changes.cleanliness || 0));
  updateUI();
}

el("feedBtn").addEventListener("click", () => {
  changeStats({ hunger: -20, mood: 5, cleanliness: -5 });
});

el("playBtn").addEventListener("click", () => {
  changeStats({ energy: -18, hunger: 10, mood: 18 });
});

el("sleepBtn").addEventListener("click", () => {
  changeStats({ energy: 25, hunger: 8, mood: 5 });
});

el("cleanBtn").addEventListener("click", () => {
  changeStats({ cleanliness: 25, mood: 5 });
});

el("saveBtn").addEventListener("click", savePet);

el("resetBtn").addEventListener("click", () => {
  pet = {
    pet_key: "main",
    name: "Papagei",
    species: "parrot",
    hunger: 35,
    energy: 80,
    mood: 65,
    cleanliness: 70
  };
  updateUI();
});

el("petSelect").addEventListener("change", event => {
  pet.species = event.target.value;
  pet.name = pets[pet.species].name;
  updateUI();
});

loadPet();
