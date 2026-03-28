/**
 * Optional Google Cloud Translation API (v2) — normalizes free-text to English
 * before Gemini when ENABLE_CLOUD_TRANSLATE=true. Uses Application Default
 * Credentials (Cloud Run service account needs roles/cloudtranslate.user).
 */

export interface TranslateForModelResult {
  text: string;
  applied: boolean;
}

export async function maybeTranslateForModel(
  text: string,
): Promise<TranslateForModelResult> {
  if (process.env.ENABLE_CLOUD_TRANSLATE !== "true" || !text.trim()) {
    return { text, applied: false };
  }

  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCP_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.warn(
      "ENABLE_CLOUD_TRANSLATE is set but GOOGLE_CLOUD_PROJECT / GCP_PROJECT_ID / FIREBASE_PROJECT_ID is missing.",
    );
    return { text, applied: false };
  }

  try {
    const { v2 } = await import("@google-cloud/translate");
    const translate = new v2.Translate({ projectId });
    const [translated] = await translate.translate(text, "en");
    if (typeof translated !== "string") {
      return { text, applied: false };
    }
    if (translated === text) {
      return { text, applied: false };
    }
    return { text: translated, applied: true };
  } catch (err) {
    console.warn("Cloud Translation skipped, using original text:", err);
    return { text, applied: false };
  }
}
