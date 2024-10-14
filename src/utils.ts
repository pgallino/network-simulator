// modeManager.js
export type Mode = "navigate" | "router" | "connection";

export let mode: Mode = "navigate"; // El modo por defecto será "navegar"

export function setMode(newMode: Mode) {
    mode = newMode;
    console.log(`Modo: ${newMode}`);
}

export function getMode() {
    return mode;
}
