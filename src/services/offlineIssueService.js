import { getDb, STORE_ISSUES } from "../db/libraryDb";

/* ---------- ISSUE ---------- */
export async function issueBook(payload) {
  const db = await getDb();

  await db.add(STORE_ISSUES, {
    ...payload,
    status: "ISSUED",
    issued_at: new Date().toISOString(),
    returned_at: null
  });

  window.dispatchEvent(new Event("issues-updated"));
}

/* ---------- RETURN ---------- */
export async function returnBook(issueId) {
  const db = await getDb();
  const record = await db.get(STORE_ISSUES, issueId);

  if (!record || record.status !== "ISSUED") {
    throw new Error("Invalid return");
  }

  await db.put(STORE_ISSUES, {
    ...record,
    status: "RETURNED",
    returned_at: new Date().toISOString()
  });

  window.dispatchEvent(new Event("issues-updated"));
}

/* ---------- DELETE (ADMIN ONLY) ---------- */
export async function deleteIssuesByIds(ids = []) {
  if (!ids.length) return;

  const db = await getDb();
  const tx = db.transaction(STORE_ISSUES, "readwrite");

  for (const id of ids) {
    await tx.store.delete(id);
  }

  await tx.done;
  window.dispatchEvent(new Event("issues-updated"));
}

/* ---------- GET ---------- */
export async function getAllIssues() {
  const db = await getDb();
  return db.getAll(STORE_ISSUES);
}
