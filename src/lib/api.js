// Next.js App Router mein hum relative path '/api' use kar sakte hain
const API_BASE_URL = '/api'; 

export const authApi = {
  register: async (data) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Error ko us format mein throw karna jo tumhare RegisterPage mein expect ho raha hai
      const error = new Error(result.error || 'Registration failed');
      error.response = { data: { message: result.error } };
      throw error;
    }

    return { data: result };
  },

  login: async (data) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data),
      credentials: 'include', // HttpOnly refresh token cookie ke liye zaroori hai
    });

    const result = await response.json();

    if (!response.ok) {
      const error = new Error(result.error || 'Login failed');
      error.response = { data: { message: result.error } };
      throw error;
    }

    return { data: result };
  },
};