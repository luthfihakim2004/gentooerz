export const config = {
  spam: true,
  urlScan: true,
};

export function enableModule(name) {
  if (config.hasOwnProperty(name)) {
    config[name] = true;
  }
}

export function disableModule(name) {
  if (config.hasOwnProperty(name)) {
    config[name] = false;
  }
}

export function switchState(name) {
  config[name] = !config[name];
}
export function getConfig() {
  return {...config};
}
