import { writable } from 'svelte/store';

export const userStore = writable({ username: '', isLoggedIn: false });
