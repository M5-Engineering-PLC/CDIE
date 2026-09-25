#!/usr/bin/env bash
# Connects the site to its services in one run: the Google Sheet (dashboard
# database), GitHub (sync workflow and uploads) and the admin sign-in.
#
# 2026-09-25: written so the values go straight from the person who holds them
# into Vercel and GitHub. Nothing is printed, logged or written to disk here.
#
# Needs: vercel (logged in, project linked in .vercel/), gh (logged in as a
# repository admin), node.
#
# Usage:
#   scripts/connect-services.sh path/to/service-account-key.json
#
# It asks for:
#   - the fine-grained GitHub token (this repository only, Contents read and write)
#   - the admin dashboard password
#   - a Web3Forms access key for the contact form (Enter to skip)

set -euo pipefail
export GH_PAGER=cat

KEY_FILE="${1:-}"
REPO="${REPO:-M5-Engineering-PLC/CDIE}"
SHEET_ID="${GOOGLE_SHEET_ID:-1YwW7t2l1w1Jp6_y7ENvOpf21XvEB6xH2eVvxEAX7Wg4}"

if [ -z "$KEY_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  echo "Give the service account's JSON key file: $0 path/to/key.json" >&2
  exit 1
fi
for tool in vercel gh node; do
  command -v "$tool" >/dev/null || { echo "$tool is not installed." >&2; exit 1; }
done

field() { node -e 'const k=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(k[process.argv[2]]||"")' "$KEY_FILE" "$1"; }
SA_EMAIL="$(field client_email)"
SA_KEY="$(field private_key)"
[ -n "$SA_EMAIL" ] && [ -n "$SA_KEY" ] || { echo "That file is not a service account key." >&2; exit 1; }

read -r -s -p "GitHub fine-grained token: " GH_PAT; echo
read -r -s -p "Admin dashboard password: " ADMIN_PW; echo
read -r -s -p "Web3Forms access key (Enter to skip): " W3F; echo
[ -n "$GH_PAT" ] && [ -n "$ADMIN_PW" ] || { echo "The token and the password are both required." >&2; exit 1; }
ADMIN_SECRET_VALUE="$(node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("hex"))')"

vercel_set() { # name value
  for target in production preview; do
    printf '%s' "$2" | vercel env add "$1" "$target" --force --yes >/dev/null 2>&1 \
      && echo "  Vercel $target: $1" \
      || echo "  Vercel $target: $1 FAILED, add it in Project Settings, Environment Variables"
  done
}
github_set() { # name value
  printf '%s' "$2" | gh secret set "$1" --repo "$REPO" >/dev/null && echo "  GitHub secret: $1"
}

echo "Vercel environment variables"
vercel_set GOOGLE_SHEET_ID "$SHEET_ID"
vercel_set GOOGLE_SERVICE_ACCOUNT_EMAIL "$SA_EMAIL"
vercel_set GOOGLE_PRIVATE_KEY "$SA_KEY"
vercel_set GITHUB_REPO "$REPO"
vercel_set GITHUB_TOKEN "$GH_PAT"
vercel_set ADMIN_AUTH "on"
vercel_set ADMIN_PASSWORD "$ADMIN_PW"
vercel_set ADMIN_SECRET "$ADMIN_SECRET_VALUE"
[ -n "$W3F" ] && vercel_set WEB3FORMS_ACCESS_KEY "$W3F"

echo "GitHub Actions secrets"
github_set GOOGLE_SHEET_ID "$SHEET_ID"
github_set GOOGLE_SERVICE_ACCOUNT_EMAIL "$SA_EMAIL"
github_set GOOGLE_PRIVATE_KEY "$SA_KEY"
github_set CMS_PUSH_TOKEN "$GH_PAT"

unset GH_PAT ADMIN_PW W3F SA_KEY ADMIN_SECRET_VALUE

echo
echo "Share the sheet with the service account as an Editor:"
echo "  https://docs.google.com/spreadsheets/d/$SHEET_ID/edit  (Share, add $SA_EMAIL, Editor)"
read -r -p "Press Enter once it is shared. " _

echo "Redeploying production so the site picks the values up"
LATEST="$(vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*\.vercel\.app' | head -1 || true)"
if [ -n "$LATEST" ]; then vercel redeploy "$LATEST" >/dev/null && echo "  Redeployed $LATEST"; else echo "  Redeploy from the Vercel dashboard."; fi

echo "Running the sync workflow once"
gh workflow run sync-cms.yml --repo "$REPO" && echo "  Started; see the Actions tab."

echo
echo "Done. Delete the key file now: $KEY_FILE"
