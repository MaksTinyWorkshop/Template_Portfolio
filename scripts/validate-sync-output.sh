#!/bin/bash
# ======================================
# Validate Sync Output Script
# ======================================
# Scanne les fichiers transformés pour valider l'absence de secrets
# Utilisé par le workflow GitHub Actions après transformation
# Exit codes: 0 = clean, 1 = secrets found

set -e

# ======================================
# Configuration
# ======================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/.template-sync-config"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
# Load Configuration
# ======================================
if [[ ! -f "$CONFIG_FILE" ]]; then
    log_error "Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Source config to get SECRET_PATTERNS
source "$CONFIG_FILE"

# ======================================
# Parse Arguments
# ======================================
STAGING_DIR=""
VERBOSE=0
USE_GITLEAKS=1

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Validate transformed files for secret leakage.

OPTIONS:
    -d, --dir PATH          Directory to scan (required)
    -v, --verbose           Verbose output
    --no-gitleaks          Skip gitleaks scan (use only pattern matching)
    -h, --help             Show this help message

EXAMPLES:
    $0 --dir /tmp/template-staging
    $0 --dir ../Template_Portfolio --verbose

EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir)
            STAGING_DIR="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        --no-gitleaks)
            USE_GITLEAKS=0
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
if [[ -z "$STAGING_DIR" ]]; then
    log_error "Staging directory is required. Use --dir option."
    exit 1
fi

if [[ ! -d "$STAGING_DIR" ]]; then
    log_error "Staging directory does not exist: $STAGING_DIR"
    exit 1
fi

# ======================================
# Main Validation
# ======================================
log_info "Starting validation of: $STAGING_DIR"
log_info "Loaded ${#SECRET_PATTERNS[@]} secret patterns from config"

SECRETS_FOUND=0
TOTAL_FILES_SCANNED=0

# ======================================
# Gate 1: Pattern-based Secret Detection
# ======================================
log_info ""
log_info "=== Gate 1: Pattern-based Secret Scan ==="

# Create temp file for results
PATTERN_RESULTS=$(mktemp)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if [[ $VERBOSE -eq 1 ]]; then
        log_info "Scanning for pattern: $pattern"
    fi

    # Scan all files (excluding .git, node_modules, etc.)
    find "$STAGING_DIR" -type f \
        ! -path "*/.git/*" \
        ! -path "*/node_modules/*" \
        ! -path "*/.next/*" \
        ! -path "*/coverage/*" \
        ! -path "*/build/*" \
        -exec grep -l -E "$pattern" {} \; >> "$PATTERN_RESULTS" 2>/dev/null || true
done

# Check results
if [[ -s "$PATTERN_RESULTS" ]]; then
    log_error "❌ Secrets detected by pattern matching!"
    echo ""
    echo "Files containing potential secrets:"
    sort -u "$PATTERN_RESULTS" | while read -r file; do
        echo "  - $file"
        SECRETS_FOUND=$((SECRETS_FOUND + 1))

        # Show matching lines if verbose
        if [[ $VERBOSE -eq 1 ]]; then
            for pattern in "${SECRET_PATTERNS[@]}"; do
                grep -n -E "$pattern" "$file" 2>/dev/null | sed 's/^/      /' || true
            done
        fi
    done
    echo ""
else
    log_info "✅ Gate 1 PASSED: No secrets found by pattern matching"
fi

rm -f "$PATTERN_RESULTS"

# ======================================
# Gate 2: Gitleaks Scan (if available)
# ======================================
if [[ $USE_GITLEAKS -eq 1 ]]; then
    log_info ""
    log_info "=== Gate 2: Gitleaks Secret Scan ==="

    # Check if gitleaks is available
    if command -v gitleaks &> /dev/null; then
        GITLEAKS_REPORT=$(mktemp)

        # Run gitleaks
        if gitleaks detect --source "$STAGING_DIR" --report-path "$GITLEAKS_REPORT" --report-format json --no-git --exit-code 0 2>&1 | grep -q "Finding:"; then
            log_error "❌ Secrets detected by gitleaks!"
            echo ""
            echo "Gitleaks findings:"
            cat "$GITLEAKS_REPORT" | jq -r '.[] | "  - \(.File):\(.StartLine) - \(.Description)"' 2>/dev/null || cat "$GITLEAKS_REPORT"
            echo ""
            SECRETS_FOUND=$((SECRETS_FOUND + 1))
        else
            log_info "✅ Gate 2 PASSED: No secrets found by gitleaks"
        fi

        rm -f "$GITLEAKS_REPORT"
    else
        log_warn "⚠️  Gate 2 SKIPPED: gitleaks not installed"
        log_warn "    Install with: brew install gitleaks (macOS) or see https://github.com/gitleaks/gitleaks"
    fi
fi

# ======================================
# Gate 3: File Count Sanity Check
# ======================================
log_info ""
log_info "=== Gate 3: Sanity Checks ==="

# Count files in staging
FILE_COUNT=$(find "$STAGING_DIR" -type f \
    ! -path "*/.git/*" \
    ! -path "*/node_modules/*" \
    ! -path "*/.next/*" | wc -l | tr -d ' ')

log_info "Files in staging directory: $FILE_COUNT"

if [[ $FILE_COUNT -eq 0 ]]; then
    log_error "❌ Gate 3 FAILED: No files found in staging directory!"
    exit 1
fi

if [[ $FILE_COUNT -lt 50 ]]; then
    log_warn "⚠️  Warning: Only $FILE_COUNT files found. Expected ~200-300 for portfolio project."
    log_warn "    This might indicate an incomplete sync."
fi

log_info "✅ Gate 3 PASSED: File count sanity check OK"

# ======================================
# Gate 4: Critical Files Check
# ======================================
log_info ""
log_info "=== Gate 4: Critical Files Check ==="

CRITICAL_FILES=(
    "package.json"
    "README.md"
    ".env.example"
)

MISSING_FILES=0

for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$STAGING_DIR/$file" ]]; then
        if [[ $VERBOSE -eq 1 ]]; then
            log_info "✓ Found: $file"
        fi
    else
        log_warn "⚠️  Missing: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [[ $MISSING_FILES -gt 0 ]]; then
    log_warn "⚠️  Gate 4: $MISSING_FILES critical files missing"
else
    log_info "✅ Gate 4 PASSED: All critical files present"
fi

# ======================================
# Final Report
# ======================================
echo ""
echo "======================================"
echo "VALIDATION SUMMARY"
echo "======================================"
echo "Staging directory: $STAGING_DIR"
echo "Files scanned: $FILE_COUNT"
echo "Secret patterns checked: ${#SECRET_PATTERNS[@]}"
echo ""

if [[ $SECRETS_FOUND -gt 0 ]]; then
    log_error "❌ VALIDATION FAILED: Secrets detected!"
    echo ""
    echo "Action required:"
    echo "  1. Review the files listed above"
    echo "  2. Update transformation rules to replace the secrets"
    echo "  3. Re-run the sync process"
    echo ""
    exit 1
else
    log_info "✅ VALIDATION PASSED: No secrets detected"
    echo ""
    echo "Next steps:"
    echo "  - Review the staged files manually if needed"
    echo "  - Create PR to template repository"
    echo "  - Merge after final review"
    echo ""
    exit 0
fi
