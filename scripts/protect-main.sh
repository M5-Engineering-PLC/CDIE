#!/usr/bin/env bash
# Protects main with a repository ruleset, run once by a repository admin.
#
# 2026-09-25: replaces the classic branch protection set earlier that day. The
# rules are the same (pull request with the "checks" CI job passing and the
# branch up to date, no force push, no deletion), with one difference:
# repository admins may bypass. That is what lets the site's GITHUB_TOKEN
# commit dashboard uploads and the sync workflow commit the content snapshot,
# both of which push straight to main with an admin's fine-grained token.
# GitHub does not accept the Actions bot itself as a bypass actor on a
# repository ruleset, so an admin token is the only way short of a GitHub App.

set -euo pipefail
REPO="${REPO:-M5-Engineering-PLC/CDIE}"

existing="$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name == "Protect main") | .id')"
method=POST; path="repos/$REPO/rulesets"
[ -n "$existing" ] && { method=PUT; path="repos/$REPO/rulesets/$existing"; }

gh api -X "$method" "$path" --input - --jq '"Ruleset \(.id): \(.enforcement), bypass \([.bypass_actors[] | .actor_type] | join(", ")), rules \([.rules[].type] | join(", "))"' <<'EOF'
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 0, "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false, "require_last_push_approval": false,
        "required_review_thread_resolution": false } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [{ "context": "checks" }] } }
  ]
}
EOF

# The classic protection has no bypass and would still block the admin token.
gh api -X DELETE "repos/$REPO/branches/main/protection" >/dev/null 2>&1 \
  && echo "Classic branch protection removed." \
  || echo "No classic branch protection to remove."
