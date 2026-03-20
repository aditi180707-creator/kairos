import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBR5IZ_fjuP0VeEhXRQJB9K0b4fjbS3zA0",
  authDomain: "kairos-7ca61.firebaseapp.com",
  databaseURL: "https://kairos-7ca61-default-rtdb.firebaseio.com",
  projectId: "kairos-7ca61",
  storageBucket: "kairos-7ca61.firebasestorage.app",
  messagingSenderId: "252317814217",
  appId: "1:252317814217:web:55bbc49ba27231e215ac18",
  measurementId: "G-PENX8787LW",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── Create a room in Firebase ─────────────────────────────────────────────────
export async function createRoom(roomCode, hostName) {
  await set(ref(db, `rooms/${roomCode}`), {
    host: hostName,
    createdAt: Date.now(),
    participants: { [hostName]: { name: hostName, isHost: true, joinedAt: Date.now() } },
    status: "waiting",
  });
}

// ── Join an existing room ─────────────────────────────────────────────────────
export async function joinRoom(roomCode, name) {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  if (!snap.exists()) return { error: "Room not found. Check the code and try again." };
  await update(ref(db, `rooms/${roomCode}/participants/${name}`), {
    name, isHost: false, joinedAt: Date.now(),
  });
  return { ok: true };
}

// ── Listen to room changes ────────────────────────────────────────────────────
export function listenRoom(roomCode, callback) {
  const r = ref(db, `rooms/${roomCode}`);
  return onValue(r, snap => callback(snap.val()));
}

// ── Host starts the booth (updates status) ────────────────────────────────────
export async function startRoom(roomCode) {
  await update(ref(db, `rooms/${roomCode}`), { status: "active" });
}