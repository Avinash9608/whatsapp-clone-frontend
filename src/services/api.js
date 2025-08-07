const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const fetchConversations = async () => {
  const response = await fetch(`${API_BASE}/messages/conversations`);
  if (!response.ok) throw new Error('Failed to fetch conversations');
  return response.json();
};

export const fetchMessages = async (wa_id) => {
  const response = await fetch(`${API_BASE}/messages/${wa_id}`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

export const sendMessage = async (message) => {
  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message)
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};