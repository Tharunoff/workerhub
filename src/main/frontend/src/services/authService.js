// API service for authentication
const handleResponse = async (response) => {
  const text = await response.text();
  const data = text && JSON.parse(text);
  
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      responseData: data,
      responseText: text
    });
    throw new Error(error);
  }
  
  return data;
};

const login = async (email, password, type) => {
  try {
    console.log('Attempting login for:', email, 'as', type);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, type })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const register = async (userData) => {
  try {
    console.log('Attempting registration for:', userData.email);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const authService = {
  login,
  register
};