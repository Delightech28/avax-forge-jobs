export const API_BASE: string = (import.meta as any).env?.VITE_API_URL || '';

export const api = (path: string): string => `${API_BASE}${path}`;


