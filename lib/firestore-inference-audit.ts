/**
 * Optional Firestore audit trail for hackathon / production GCP alignment.
 * Enable with ENABLE_FIRESTORE_LOG=true and Application Default Credentials
 * (Cloud Run service account with datastore.user on the Firebase/GCP project).
 * Logs no user content — only scenario, modalities, timing, and outcome metadata.
 */

export interface InferenceAuditPayload {
  scenario: string;
  ok: boolean;
  httpStatus: number;
  latencyMs: number;
  modalities: { text: boolean; file: boolean; audio: boolean };
  model?: string;
  errorKind?: string;
}

const COLLECTION = "intent_bridge_audit";

export async function logInferenceAudit(
  payload: InferenceAuditPayload,
): Promise<void> {
  if (process.env.ENABLE_FIRESTORE_LOG !== "true") {
    return;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCP_PROJECT_ID;

  if (!projectId) {
    console.warn("ENABLE_FIRESTORE_LOG is set but no FIREBASE_PROJECT_ID / GOOGLE_CLOUD_PROJECT.");
    return;
  }

  try {
    const { initializeApp, getApps, applicationDefault } = await import(
      "firebase-admin/app"
    );
    const { getFirestore, FieldValue } = await import("firebase-admin/firestore");

    if (getApps().length === 0) {
      initializeApp({
        projectId,
        credential: applicationDefault(),
      });
    }

    const db = getFirestore();
    await db.collection(COLLECTION).add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      service: "intent-bridge",
    });
  } catch (err) {
    console.warn("Firestore inference audit skipped:", err);
  }
}
