export class TTLMap {
  constructor(defaultTTL = 60000) {
    this.map = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.map.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.map.get(key);
    if (!item) return undefined;

    if (Date.now() >= item.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    return item.value;
  }

  has(key) {
    const item = this.map.get(key);
    if (!item) return false;

    if (Date.now() >= item.expiresAt) {
      this.map.delete(key);
      return false;
    }
    return true;
  }

  delete(key) {
    return this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }

  size() {
    this.cleanup();
    return this.map.size;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.map.entries()) {
      if (item.expiresAt <= now) {
        this.map.delete(key);
      }
    }
  }
}
