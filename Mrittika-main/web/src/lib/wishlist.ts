const STORAGE_KEY = "mrittika_wishlist";

function emitChange() {
  window.dispatchEvent(new Event("wishlist-updated"));
}

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWishlist(slug: string): void {
  const list = getWishlist();
  if (!list.includes(slug)) {
    list.push(slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    emitChange();
  }
}

export function removeFromWishlist(slug: string): void {
  const list = getWishlist().filter((s) => s !== slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  emitChange();
}

export function isInWishlist(slug: string): boolean {
  return getWishlist().includes(slug);
}

export function getWishlistCount(): number {
  return getWishlist().length;
}
