import {create} from "zustand"

const useThemeStore = create((set) => ({
    theme: localStorage.getItem('theme') ?? 'light',
    user: JSON.parse(localStorage.getItem('user')) ?? null,

    // Actions to update the state
    setTheme: (value) => set({ theme: value}),
    setCredentials: (user) => set({ user}),
    Logout: () => set({ user: null}),
    
    // clearTheme: () => set({ theme: 'light' }),
    // clearCredentials: () => set({ user: null }),
}));

export default useThemeStore;