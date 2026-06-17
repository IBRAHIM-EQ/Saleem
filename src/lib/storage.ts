/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const USERS_STORAGE_KEY = "saleem_users";
export const CURRENT_USER_KEY = "saleem_current_user";
export const ACTIVITIES_STORAGE_KEY = "saleem_activities";

export const storage = {
  get: (key: string, fallback: any = null) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key: string, val: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

export const getUserStorage = () => {
  try {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    // Seed admin user as requested
    if (!users["admin@saleem.com"]) {
      users["admin@saleem.com"] = {
        password: "SaleemAdmin2026",
        profile: {
          firstName: "Saleem",
          lastName: "Admin",
          email: "admin@saleem.com",
          role: "Admin",
          onboardingComplete: true,
          allergens: []
        },
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    
    return users;
  } catch {
    return {};
  }
};

export const getActivities = () => {
  return storage.get(ACTIVITIES_STORAGE_KEY, []);
};

export const logActivity = (userEmail: string, action: string, target: string) => {
  const activities = getActivities();
  const newActivity = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    userEmail,
    action,
    target,
  };
  const updatedActivities = [newActivity, ...activities].slice(0, 150); // Keep last 150
  storage.set(ACTIVITIES_STORAGE_KEY, updatedActivities);
  return updatedActivities;
};

export const saveUser = (username: string, password: any, profileData: any) => {
  const users = getUserStorage();
  users[username] = {
    password: password,
    profile: profileData || {
      allergens: [],
      onboardingComplete: false,
    },
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const validateUser = (username: string, password: any) => {
  const users = getUserStorage();
  const user = users[username];
  return user && user.password === password ? user : null;
};

export const setCurrentUser = (username: string) => {
  localStorage.setItem(CURRENT_USER_KEY, username);
};

export const getCurrentUser = () => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

export const logoutCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const updateUserInfo = (oldUsername: string, newUsername: string, newPassword?: string, newProfileData?: any) => {
  const users = getUserStorage();
  const userData = users[oldUsername];
  if (!userData) return false;

  // If changing username, check if new one is taken
  if (newUsername !== oldUsername && users[newUsername]) {
    return false;
  }

  // Merge profile data
  const updatedProfile = { 
    ...(userData.profile || {}), 
    ...(newProfileData || {}) 
  };

  const updatedUser = {
    ...userData,
    password: newPassword || userData.password,
    profile: updatedProfile
  };

  if (newUsername !== oldUsername) {
    delete users[oldUsername];
  }
  users[newUsername] = updatedUser;

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  if (newUsername !== oldUsername) {
    setCurrentUser(newUsername);
  }
  return true;
};
