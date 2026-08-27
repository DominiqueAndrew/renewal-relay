export class MemoryRunStore {
  constructor() {
    this.runs = new Map();
  }

  async put(run) {
    this.runs.set(run.id, structuredClone(run));
    return run;
  }

  async get(id) {
    const run = this.runs.get(id);
    return run ? structuredClone(run) : null;
  }

  async latest() {
    const latest = [...this.runs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return latest ? structuredClone(latest) : null;
  }
}

export async function createRunStore({ projectId = process.env.GOOGLE_CLOUD_PROJECT, enabled = process.env.FIRESTORE_ENABLED !== "false" } = {}) {
  if (!projectId || !enabled) return new MemoryRunStore();
  try {
    const { Firestore } = await import("@google-cloud/firestore");
    const firestore = new Firestore({ projectId });
    const collection = firestore.collection("renewal-relay-runs");
    return {
      async put(run) {
        await collection.doc(run.id).set(run);
        return run;
      },
      async get(id) {
        const snapshot = await collection.doc(id).get();
        return snapshot.exists ? snapshot.data() : null;
      },
      async latest() {
        const snapshot = await collection.orderBy("createdAt", "desc").limit(1).get();
        return snapshot.empty ? null : snapshot.docs[0].data();
      }
    };
  } catch (error) {
    console.warn("Firestore unavailable; using memory store: " + error.message);
    return new MemoryRunStore();
  }
}
