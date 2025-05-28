export const config = {
  passive: false, // initial state
};

export function setPassiveMode(value) {
  config.passive = value;
}

export function getPassiveMode() {
  return config.passive;
}
