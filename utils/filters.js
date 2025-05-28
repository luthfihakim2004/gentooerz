import fs from 'fs';

const path = './config/filter.json';

let filters = { whitelist: [], blacklist: [] };
try {
  filters = JSON.parse(fs.readFileSync(path));
} catch {
  filters = { whitelist: [], blacklist: [] };
  fs.writeFileSync(path, JSON.stringify(filters, null, 2));
}

function save() {
  fs.writeFileSync(path, JSON.stringify(filters, null, 2));
}

export function getWhitelist() {
  return filters.whitelist;
}

export function getBlacklist() {
  return filters.blacklist;
}

export function addToWhitelist(url) {
  url = normalize(url);
  if (!filters.whitelist.includes(url)) {
    filters.whitelist.push(url);
    save();
  }
}

export function removeFromWhitelist(url) {
  url = normalize(url);
  filters.whitelist = filters.whitelist.filter(u => u !== url);
  save();
}

export function addToBlacklist(url) {
  url = normalize(url);
  if (!filters.blacklist.includes(url)) {
    filters.blacklist.push(url);
    save();
  }
}

export function removeFromBlacklist(url) {
  url = normalize(url);
  filters.blacklist = filters.blacklist.filter(u => u !== url);
  save();
}

export function normalize(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname.replace(/\/+$/, ''); // remove trailing slashes
  } catch {
    return url.trim().toLowerCase();
  }
}
