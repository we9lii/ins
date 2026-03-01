import { UserInfo } from '../types';

const API_URL = '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface UserRow extends UserInfo {
    email: string;
    created_at: string;
}

export const getUsers = async (): Promise<UserRow[]> => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const updateUserRole = async (userId: string, targetRole: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ role: targetRole }),
        });
        if (!response.ok) {
            throw new Error('Failed to update user role');
        }
        return true;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

export const createUser = async (userData: any): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Failed to create user');
        return true;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (userId: string, userData: any): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
