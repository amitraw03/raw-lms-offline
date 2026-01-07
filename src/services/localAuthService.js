import bcrypt from "bcryptjs";

const ADMINS_KEY = "raw_lms_admins";
const SESSION_KEY = "raw_lms_session";

const MASTER_KEY = import.meta.env.VITE_MASTER_KEY;


/* ---------- helpers ---------- */
function getAdmins() {
  return JSON.parse(localStorage.getItem(ADMINS_KEY) || "[]");
}

function saveAdmins(admins) {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

/* ---------- admin bootstrap ---------- */
export async function setupInitialAdmin(name, number, password) {
  const admins = getAdmins();
  if (admins.length > 0) {
    throw new Error("Admin already exists");
  }

  const hash = await bcrypt.hash(password, 10);
  admins.push({ name, number, hash });
  saveAdmins(admins);
}

/* ---------- login ---------- */
export async function login(number, password) {
  const admins = getAdmins();
  const admin = admins.find(a => a.number === number);

  if (!admin) {
    throw new Error("Admin not found");
  }

  const ok = await bcrypt.compare(password, admin.hash);
  if (!ok) {
    throw new Error("Invalid password");
  }

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      name: admin.name,
      number: admin.number
    })
  );
}

/* ---Reset Admin Password-- */
export async function resetAdminPassword(number, newPassword, masterKey) {
  if (masterKey !== MASTER_KEY) {
    throw new Error("Invalid master key");
  }

  const admins = getAdmins();
  const idx = admins.findIndex(a => a.number === number);

  if (idx === -1) {
    throw new Error("Admin not found");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  admins[idx].hash = hash;

  saveAdmins(admins);
}

/* --verify master key --*/
export function verifyMasterKey(input) {
  if (!MASTER_KEY) {
    throw new Error("Master key not configured");
  }
  return input === MASTER_KEY;
}



/* ---------- session ---------- */
export function isLoggedIn() {
  return !!sessionStorage.getItem(SESSION_KEY);
}

export function getCurrentAdmin() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

/* ---------- admin existence ---------- */
export function hasAnyAdmin() {
  return getAdmins().length > 0;
}
