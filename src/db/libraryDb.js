import { openDB } from "idb";

const DB_NAME = "raw-lms-db";
const DB_VERSION = 4; // ⬅ bumped

export const STORE_ISSUES = "issues";
export const STORE_INVENTORY = "inventory";

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_ISSUES)) {
        const store = db.createObjectStore(STORE_ISSUES, {
          keyPath: "id",
          autoIncrement: true
        });
        store.createIndex("ap_no", "ap_no");
        store.createIndex("status", "status");
        store.createIndex("issued_at", "issued_at");
        store.createIndex("returned_at", "returned_at");
      }

      if (!db.objectStoreNames.contains(STORE_INVENTORY)) {
        const inv = db.createObjectStore(STORE_INVENTORY, {
          keyPath: "ap_no"
        });
        inv.createIndex("ap_name", "ap_name");
      }
    }
  });
}
