#!/bin/bash
# ======================================
# Create Template PR Script
# ======================================
# Creates a PR to the template repository via GitHub CLI
# Used by GitHub Actions workflow after successful transformation
# Exit codes: 0 = PR created, 1 = error

set -e

# ======================================
# Configuration
# ======================================
TEMPLATE_REPO="MaksTinyWorkshop/Template_Portfolio"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ======================================
# Functions
# ======================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ======================================
# Parse Arguments
# ======================================
SOURCE_BRANCH=""
TARGET_BRANCH=""
STAGING_DIR=""
VALIDATION_STATUS="unknown"
WORKFLOW_RUN_URL=""
DRY_RUN=0

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Create a Pull Request to the template repository.

REQUIRED OPTIONS:
    -s, --source BRANCH     Source branch name (e.g., variante_BDD)
    -t, --target BRANCH     Target branch in template repo (e.g., database)
    -d, --dir PATH          Staging directory path

OPTIONAL:
    -v, --validation STATUS Validation status (passed/failed)
    -w, --workflow-url URL  GitHub Actions workflow run URL
    --dry-run              Print PR content without creating
    -h, --help             Show this help message

EXAMPLES:
    $0 -s variante_BDD -t database -d /tmp/staging -v passed
    $0 -s main -t main -d ../Template_Portfolio --dry-run

ENVIRONMENT:
    GITHUB_TOKEN or TEMPLATE_REPO_PAT must be set for authentication

EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--source)
            SOURCE_BRANCH="$2"
            shift 2
            ;;
        -t|--target)
            TARGET_BRANCH="$2"
            shift 2
            ;;
        -d|--dir)
            STAGING_DIR="$2"
            shift 2
            ;;
        -v|--validation)
            VALIDATION_STATUS="$2"
            shift 2
            ;;
        -w|--workflow-url)
            WORKFLOW_RUN_URL="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=1
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required arguments
if [[ -z "$SOURCE_BRANCH" ]] || [[ -z "$TARGET_BRANCH" ]] || [[ -z "$STAGING_DIR" ]]; then
    log_error "Missing required arguments"
    usage
fi

if [[ ! -d "$STAGING_DIR" ]]; then
    log_error "Staging directory does not exist: $STAGING_DIR"
    exit 1
fi

# Check for gh CLI
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) is not installed"
    log_error "Install with: brew install gh (macOS) or see https://cli.github.com/"
    exit 1
fi

# ======================================
# Generate PR Content
# ======================================
log_info "Generating PR content..."

# Date for title
PR_DATE=$(date +%Y-%m-%d)
PR_TITLE="sync: Update from $SOURCE_BRANCH ($PR_DATE)"

# Generate diff stats
cd "$STAGING_DIR"

# Initialize git if needed (for diff stats)
if [[ ! -d ".git" ]]; then
    log_warn "Not a git repository. Using file count instead of diff stats."
    FILE_COUNT=$(find . -type f ! -path "*/.git/*" ! -path "*/node_modules/*" ! -path "*/.next/*" | wc -l | tr -d ' ')
    DIFF_SUMMARY="📊 **$FILE_COUNT files** in staging directory"
    FILES_CHANGED=""
else
    # Get diff stats if git repo
    DIFF_STATS=$(git diff --stat 2>/dev/null || echo "No diff available")
    DIFF_SUMMARY=$(git diff --shortstat 2>/dev/null || echo "Stats not available")

    # Get list of changed files (top 20)
    FILES_CHANGED=$(git diff --name-only 2>/dev/null | head -20 || echo "")
fi

# Validation status badge
if [[ "$VALIDATION_STATUS" == "passed" ]]; then
    VALIDATION_BADGE="✅ **PASSED**"
elif [[ "$VALIDATION_STATUS" == "failed" ]]; then
    VALIDATION_BADGE="❌ **FAILED**"
else
    VALIDATION_BADGE="⚠️  **UNKNOWN**"
fi

# Build PR body
PR_BODY=$(cat <<EOF
## 🔄 Automated Template Sync

This PR synchronizes changes from the private portfolio repository.

### 📊 Summary

$DIFF_SUMMARY

### 🔒 Security Validation

**Quality Gates:** $VALIDATION_BADGE

- Gate 1: Pattern-based secret scan
- Gate 2: Gitleaks secret detection
- Gate 3: File count sanity check
- Gate 4: Critical files verification

EOF
)

# Add files changed if available
if [[ -n "$FILES_CHANGED" ]]; then
    FILE_COUNT=$(echo "$FILES_CHANGED" | wc -l | tr -d ' ')
    PR_BODY+=$(cat <<EOF

### 📁 Files Changed ($FILE_COUNT)

\`\`\`
$FILES_CHANGED
\`\`\`

EOF
)
fi

# Add workflow run link if provided
if [[ -n "$WORKFLOW_RUN_URL" ]]; then
    PR_BODY+=$(cat <<EOF

### 🔗 Workflow Run

[View full workflow logs]($WORKFLOW_RUN_URL)

EOF
)
fi

# Add footer
PR_BODY+=$(cat <<EOF

---

### ✅ Next Steps

1. **Review** the changes in this PR
2. **Verify** no sensitive data leaked (double-check!)
3. **Merge** if everything looks good
4. **Close** if issues found (fix in private repo and re-sync)

### 📚 Documentation

For more information about the sync process, see [\`scripts/SYNC_TEMPLATE_README.md\`](../blob/$TARGET_BRANCH/scripts/SYNC_TEMPLATE_README.md) in the template repository.

---

🤖 **Automated sync** from \`$SOURCE_BRANCH\` branch • Generated on $PR_DATE
EOF
)

# ======================================
# Dry Run Mode
# ======================================
if [[ $DRY_RUN -eq 1 ]]; then
    echo ""
    echo "======================================"
    echo "DRY RUN MODE - PR Preview"
    echo "======================================"
    echo ""
    echo -e "${BLUE}Title:${NC}"
    echo "$PR_TITLE"
    echo ""
    echo -e "${BLUE}Body:${NC}"
    echo "$PR_BODY"
    echo ""
    echo -e "${BLUE}Target:${NC}"
    echo "Repository: $TEMPLATE_REPO"
    echo "Base branch: $TARGET_BRANCH"
    echo ""
    log_info "Dry run complete. No PR created."
    exit 0
fi

# ======================================
# Authenticate and Create PR
# ======================================
log_info "Authenticating with GitHub..."

# Use TEMPLATE_REPO_PAT if available, otherwise fall back to GITHUB_TOKEN
if [[ -n "$TEMPLATE_REPO_PAT" ]]; then
    export GH_TOKEN="$TEMPLATE_REPO_PAT"
    log_info "Using TEMPLATE_REPO_PAT for authentication"
elif [[ -n "$GITHUB_TOKEN" ]]; then
    export GH_TOKEN="$GITHUB_TOKEN"
    log_info "Using GITHUB_TOKEN for authentication"
else
    log_error "No authentication token found!"
    log_error "Set TEMPLATE_REPO_PAT or GITHUB_TOKEN environment variable"
    exit 1
fi

# Verify authentication
if ! gh auth status &>/dev/null; then
    log_error "GitHub authentication failed"
    log_error "Run 'gh auth login' or check your token"
    exit 1
fi

log_info "✓ Authenticated successfully"

# ======================================
# Create PR
# ======================================
log_info "Creating PR to $TEMPLATE_REPO (branch: $TARGET_BRANCH)..."

# Save PR body to temp file (gh CLI reads from file for multiline)
PR_BODY_FILE=$(mktemp)
echo "$PR_BODY" > "$PR_BODY_FILE"

# Create PR
if PR_URL=$(gh pr create \
    --repo "$TEMPLATE_REPO" \
    --base "$TARGET_BRANCH" \
    --head "$TARGET_BRANCH-sync-$(date +%s)" \
    --title "$PR_TITLE" \
    --body-file "$PR_BODY_FILE" 2>&1); then

    rm -f "$PR_BODY_FILE"

    echo ""
    log_info "✅ Pull Request created successfully!"
    echo ""
    echo "======================================"
    echo "PR Details"
    echo "======================================"
    echo "URL: $PR_URL"
    echo "Title: $PR_TITLE"
    echo "Target: $TEMPLATE_REPO ($TARGET_BRANCH)"
    echo ""
    echo "Next: Review the PR and merge when ready!"
    echo ""

    exit 0
else
    # PR creation failed
    rm -f "$PR_BODY_FILE"

    log_error "Failed to create PR"
    echo ""
    echo "Error output:"
    echo "$PR_URL"
    echo ""

    # Check common issues
    if echo "$PR_URL" | grep -q "already exists"; then
        log_warn "A PR for this branch may already exist"
        log_info "Check existing PRs: gh pr list --repo $TEMPLATE_REPO"
    elif echo "$PR_URL" | grep -q "permission"; then
        log_error "Permission denied. Check that TEMPLATE_REPO_PAT has 'repo' scope"
    fi

    exit 1
fi
