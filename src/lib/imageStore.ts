const DB_NAME = "snapframe_images";
const DB_VERSION = 1;
const STORE_NAME = "blobs";

export const IMAGE_PREFIX = "idb://";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Store a blob in IndexedDB and return an `idb://<id>` reference key. */
export async function storeImage(blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  const key = `${IMAGE_PREFIX}${id}`;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => { db.close(); resolve(key); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/** Store a File (from file input) and return an `idb://<id>` reference key. */
export async function storeImageFile(file: File): Promise<string> {
  return storeImage(file);
}

/** Load a blob from IndexedDB by its `idb://<id>` key. Returns null if not found. */
export async function loadImageBlob(key: string): Promise<Blob | null> {
  if (!key.startsWith(IMAGE_PREFIX)) return null;
  const id = key.slice(IMAGE_PREFIX.length);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => { db.close(); resolve(req.result ?? null); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

/** Load an image blob and convert it to an object URL for rendering. */
export async function loadImageAsObjectURL(key: string): Promise<string | null> {
  const blob = await loadImageBlob(key);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/** Delete an image from IndexedDB by its `idb://<id>` key. */
export async function deleteImage(key: string): Promise<void> {
  if (!key.startsWith(IMAGE_PREFIX)) return;
  const id = key.slice(IMAGE_PREFIX.length);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/** Check if a URL is an IndexedDB reference. */
export function isIdbUrl(url: string | null): boolean {
  return !!url && url.startsWith(IMAGE_PREFIX);
}
