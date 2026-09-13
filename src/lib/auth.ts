import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  tier: 'All-Access Studio Pass' | 'Founder Member' | 'Standard Member';
  isLifetimeVIP: boolean;
  subscriptionStatus: 'active' | 'trial' | 'none';
  ownedPlugins: string[];
  licenseKey: string;
  authorizedMachines: string[];
  createdAt: string;
  lastLoginAt: string;
  resetToken?: string | null;
  resetTokenExpiry?: number | null;
}

export interface UserSafeProfile {
  id: string;
  email: string;
  displayName: string;
  tier: string;
  isLifetimeVIP: boolean;
  subscriptionStatus: string;
  ownedPlugins: string[];
  licenseKey: string;
  authorizedMachines: string[];
  createdAt: string;
}

// Store users database in a persistent server directory
const DB_DIR = path.join(process.cwd(), 'data', 'db');
const DB_FILE = path.join(DB_DIR, 'users.json');

function ensureDbExists(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    // Initialize with a default admin/founder account
    const defaultSalt = crypto.randomBytes(16).toString('hex');
    const defaultHash = hashPassword('PluggedIn2026!', defaultSalt);
    const initialUsers: UserRecord[] = [
      {
        id: 'usr_founder_001',
        email: 'dylan@pluggedin.studio',
        displayName: 'Dylan (Founder)',
        passwordHash: defaultHash,
        salt: defaultSalt,
        tier: 'All-Access Studio Pass',
        isLifetimeVIP: true,
        subscriptionStatus: 'active',
        ownedPlugins: ['ALL_15_PLUGINS'],
        licenseKey: 'PLUG-VIP-9999-STUDIO',
        authorizedMachines: ['DESKTOP-STUDIO-MAIN', 'MACBOOK-PRO-M3'],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
  }
}

function readUsers(): UserRecord[] {
  ensureDbExists();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read users database:', e);
    return [];
  }
}

function writeUsers(users: UserRecord[]): void {
  ensureDbExists();
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateLicenseKey(): string {
  const seg1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const seg2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const seg3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `PLUG-${seg1}-${seg2}-${seg3}`;
}

export function toSafeProfile(user: UserRecord): UserSafeProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    tier: user.tier,
    isLifetimeVIP: user.isLifetimeVIP,
    subscriptionStatus: user.subscriptionStatus,
    ownedPlugins: user.ownedPlugins,
    licenseKey: user.licenseKey,
    authorizedMachines: user.authorizedMachines,
    createdAt: user.createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser(data: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<{ user: UserSafeProfile; token: string }> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(data.password, salt);
  const now = new Date().toISOString();

  const newUser: UserRecord = {
    id: 'usr_' + crypto.randomBytes(6).toString('hex'),
    email: normalizedEmail,
    displayName: data.displayName?.trim() || normalizedEmail.split('@')[0],
    passwordHash,
    salt,
    tier: 'All-Access Studio Pass',
    isLifetimeVIP: false,
    subscriptionStatus: 'active',
    ownedPlugins: ['ALL_15_PLUGINS'],
    licenseKey: generateLicenseKey(),
    authorizedMachines: ['PRIMARY-STUDIO-DEVICE'],
    createdAt: now,
    lastLoginAt: now,
  };

  users.push(newUser);
  writeUsers(users);

  const token = createSessionToken(newUser.id, newUser.email);
  return { user: toSafeProfile(newUser), token };
}

export async function verifyUserLogin(
  email: string,
  pass: string
): Promise<{ user: UserSafeProfile; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('No account found with this email address.');
  }

  const testHash = hashPassword(pass, user.salt);
  if (testHash !== user.passwordHash) {
    throw new Error('Incorrect password. Please try again or click Forgot Password.');
  }

  user.lastLoginAt = new Date().toISOString();
  writeUsers(users);

  const token = createSessionToken(user.id, user.email);
  return { user: toSafeProfile(user), token };
}

export async function createPasswordResetToken(email: string): Promise<{ token: string; email: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('No account found with that email address.');
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  const expiry = Date.now() + 1000 * 60 * 60; // 1 hour

  user.resetToken = resetToken;
  user.resetTokenExpiry = expiry;
  writeUsers(users);

  return { token: resetToken, email: user.email };
}

export async function resetPasswordWithToken(
  token: string,
  newPass: string
): Promise<{ success: boolean; message: string }> {
  if (!token || !newPass || newPass.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const users = readUsers();
  const user = users.find(
    (u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > Date.now()
  );

  if (!user) {
    throw new Error('Reset link is invalid or has expired. Please request a new one.');
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  user.salt = newSalt;
  user.passwordHash = hashPassword(newPass, newSalt);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  writeUsers(users);

  return { success: true, message: 'Password has been successfully reset! You can now sign in.' };
}

const SESSION_SECRET = 'pluggedin_studio_secret_key_2026_launch';

export function createSessionToken(userId: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, email, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): { userId: string; email: string } | null {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;

    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    if (expectedSig !== sig) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && data.exp < Date.now()) return null;

    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}

export async function grantUserAccess(
  userId: string,
  grant: {
    tier?: 'All-Access Studio Pass' | 'Founder Member' | 'Standard Member';
    pluginId?: string;
    isLifetime?: boolean;
  }
): Promise<UserSafeProfile> {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (grant.tier) {
    user.tier = grant.tier;
    user.subscriptionStatus = 'active';
    if (!user.ownedPlugins.includes('ALL_15_PLUGINS')) {
      user.ownedPlugins.push('ALL_15_PLUGINS');
    }
  }

  if (grant.pluginId) {
    if (!user.ownedPlugins.includes(grant.pluginId)) {
      user.ownedPlugins.push(grant.pluginId);
    }
  }

  if (grant.isLifetime) {
    user.isLifetimeVIP = true;
  }

  writeUsers(users);
  return toSafeProfile(user);
}

