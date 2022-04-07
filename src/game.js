import { writable, get } from "svelte/store";

export const timer = writable(0);
setInterval(() => { timer.update((v)=>(v+1)%30); }, 1000/30);