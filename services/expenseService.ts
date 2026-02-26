import { Sheet, ExpenseLine, SheetStatus } from '../types';

const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getSheets = async (): Promise<Sheet[]> => {
  try {
    const response = await fetch(`${API_URL}/sheets`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('auth_token');
        window.location.reload();
      }
      throw new Error('Failed to fetch sheets');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sheets:', error);
    return [];
  }
};

export const saveSheet = async (sheet: Sheet): Promise<Sheet> => {
  try {
    const response = await fetch(`${API_URL}/sheets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...sheet, last_modified: new Date().toISOString() }),
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('auth_token');
        window.location.reload();
      }
      throw new Error('Failed to save sheet');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving sheet:', error);
    throw error;
  }
};

export const createNewSheet = (number: string, amount: number, empId: string): Sheet => {
  return {
    id: `CUST-${Math.floor(Math.random() * 10000)}`,
    custody_number: number,
    custody_amount: amount,
    employee_id: empId,
    status: SheetStatus.OPEN,
    lines: [],
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };
};

// Check server health
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
