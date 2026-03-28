#!/usr/bin/env bash
# One-time setup: Workload Identity Federation so GitHub Actions can deploy to Cloud Run
# without storing a long-lived JSON key.
#
# Usage:
#   export GITHUB_REPO="your-org/prompt-war"   # owner/repo matching this GitHub repo
#   bash scripts/setup-gcp-github-wif.sh
#
# Then add these GitHub repository Secrets (Settings → Secrets and variables → Actions):
#   GCP_WORKLOAD_IDENTITY_PROVIDER = (printed below)
#   GCP_SERVICE_ACCOUNT            = (printed below)
#
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-sanguine-tome-491605-m7}"
POOL_ID="${WIF_POOL_ID:-github}"
PROVIDER_ID="${WIF_PROVIDER_ID:-github-oidc}"
DEPLOY_SA_NAME="${DEPLOY_SA_NAME:-github-actions-deploy}"
GITHUB_REPO="${GITHUB_REPO:?Set GITHUB_REPO to owner/repo e.g. myorg/prompt-war}"

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
DEPLOY_SA_EMAIL="${DEPLOY_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
RUNTIME_SA_EMAIL="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Project: $PROJECT_ID ($PROJECT_NUMBER)"
echo "GitHub repo filter: $GITHUB_REPO"

# APIs
gcloud services enable iamcredentials.googleapis.com run.googleapis.com artifactregistry.googleapis.com --project="$PROJECT_ID"

# Pool + OIDC provider (idempotent-ish: may error if names exist)
gcloud iam workload-identity-pools describe "$POOL_ID" --location=global --project="$PROJECT_ID" 2>/dev/null || \
  gcloud iam workload-identity-pools create "$POOL_ID" \
    --project="$PROJECT_ID" \
    --location=global \
    --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --location=global --workload-identity-pool="$POOL_ID" --project="$PROJECT_ID" 2>/dev/null || \
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --project="$PROJECT_ID" \
    --location=global \
    --workload-identity-pool="$POOL_ID" \
    --display-name="GitHub Actions OIDC" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --attribute-condition="assertion.repository == '${GITHUB_REPO}'"

# Deploy service account
gcloud iam service-accounts describe "$DEPLOY_SA_EMAIL" --project="$PROJECT_ID" 2>/dev/null || \
  gcloud iam service-accounts create "$DEPLOY_SA_NAME" \
    --project="$PROJECT_ID" \
    --display-name="GitHub Actions Cloud Run deploy"

# Roles: push images, deploy Cloud Run, act as default compute SA for new revisions
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SA_EMAIL}" \
  --role="roles/artifactregistry.writer" \
  --quiet || true
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SA_EMAIL}" \
  --role="roles/run.admin" \
  --quiet || true

gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA_EMAIL" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser" \
  --quiet

# Allow WIF impersonation only for this repo
WIF_MEMBER="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${GITHUB_REPO}"

gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA_EMAIL" \
  --project="$PROJECT_ID" \
  --member="$WIF_MEMBER" \
  --role="roles/iam.workloadIdentityUser" \
  --quiet

PROVIDER_RESOURCE="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

echo ""
echo "=== Add these as GitHub Actions Secrets ==="
echo "GCP_WORKLOAD_IDENTITY_PROVIDER=${PROVIDER_RESOURCE}"
echo "GCP_SERVICE_ACCOUNT=${DEPLOY_SA_EMAIL}"
echo ""
echo "Optional secret for the app:"
echo "  GEMINI_API_KEY  (or configure Secret Manager on the Cloud Run service later)"
