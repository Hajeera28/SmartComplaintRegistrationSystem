const KEY = "auth_token";
const ROLE = "auth_role";
const USERNAME = "auth_username";

// Helper function to decode JWT token
function decodeToken(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export const tokenstore = {
  get(): string | null {
    return localStorage.getItem(KEY);
  },
  set(token: string) {
    localStorage.setItem(KEY, token);
  },
  setRole(role: string | null) {
    if (role) localStorage.setItem(ROLE, role);
    else localStorage.removeItem(ROLE);
  },
  getRole(): string | null {
    return localStorage.getItem(ROLE);
  },
  setUsername(username: string | null) {
    if (username) localStorage.setItem(USERNAME, username);
    else localStorage.removeItem(USERNAME);
  },
  getUsername(): string | null {
    return localStorage.getItem(USERNAME);
  },
  getUserId(): string | null {
    const token = this.get();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    const role = this.getRole();
    if (role === "Officer") {
      return decoded.OfficerId || null;
    } else if (role === "Citizen") {
      return decoded.CitizenId || null;
    }
    return null;
  },
  getOfficerRole(): number | null {
    const token = this.get();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    const role = this.getRole();
    if (role === "Officer") {
      return decoded.OfficerRole ? parseInt(decoded.OfficerRole) : null;
    }
    return null;
  },
  getNumericUserId(): number | null {
    const token = this.get();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded) return null;
    
    return decoded.UserId ? parseInt(decoded.UserId) : null;
  },
  clear() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(ROLE);
    localStorage.removeItem(USERNAME);
  }
};