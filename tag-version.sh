#!/bin/bash

# to execute this script:	(Change version to number)
# ./tag-version.sh 1.1.1

# To save: Ctrl + O, Enter, Ctrl + X

# Helper script to tag versions and update CHANGELOG.md

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if version is provided
if [ "$#" -ne 1 ]; then
    echo -e "${RED}Error: Version number required${NC}"
    echo "Usage: $0 <version>"
    echo "Example: $0 1.0.1"
    exit 1
fi

VERSION=$1

# Validate semantic versioning format (x.y.z)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Error: Version must follow semantic versioning format (x.y.z)${NC}"
    exit 1
fi

# Changelog file path
CHANGELOG="CHANGELOG.md"

# Check if CHANGELOG.md exists
if [ ! -f "$CHANGELOG" ]; then
    echo -e "${RED}Error: CHANGELOG.md file not found${NC}"
    exit 1
fi

# Check if this version already exists in the changelog
if grep -q "## \[$VERSION\]" "$CHANGELOG"; then
    echo -e "${YELLOW}Warning: Version $VERSION already exists in CHANGELOG.md${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if this version already exists as a git tag
if git tag | grep -q "^v$VERSION$"; then
    echo -e "${YELLOW}Warning: Git tag v$VERSION already exists${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current date in YYYY-MM-DD format
DATE=$(date +"%Y-%m-%d")

# Open editor to create changelog entry
TEMP_FILE=$(mktemp)
cat > "$TEMP_FILE" << EOF
## [$VERSION] - $DATE

### Added
- 

### Changed
- 

### Fixed
- 

### Security
- 

### Removed
- 

EOF

# Determine which editor to use
if [ -n "$EDITOR" ]; then
    $EDITOR "$TEMP_FILE"
elif command -v nano > /dev/null; then
    nano "$TEMP_FILE"
elif command -v vim > /dev/null; then
    vim "$TEMP_FILE"
else
    echo -e "${YELLOW}No editor found. Please edit the file manually:${NC} $TEMP_FILE"
    read -p "Press enter when done editing..."
fi

# Read the temporary file content
NEW_ENTRY=$(cat "$TEMP_FILE")

# Update CHANGELOG.md
awk -v new_entry="$NEW_ENTRY" 'NR==4{print new_entry "\n"}1' "$CHANGELOG" > "${CHANGELOG}.new"
mv "${CHANGELOG}.new" "$CHANGELOG"

# Clean up temp file
rm "$TEMP_FILE"

# Commit and tag
echo -e "${GREEN}Updating package.json version...${NC}"
# Use npm version to update package.json, but don't let it create the git tag
npm --no-git-tag-version version "$VERSION"

echo -e "${GREEN}Committing changes...${NC}"
git add "$CHANGELOG" package.json
git commit -m "Release v$VERSION"

echo -e "${GREEN}Creating tag v$VERSION...${NC}"
git tag -a "v$VERSION" -m "Version $VERSION"

echo 
echo -e "${GREEN}Version $VERSION has been tagged and CHANGELOG.md has been updated.${NC}"
echo "To push changes and tags to remote repository, run:"
echo -e "  ${YELLOW}git push && git push --tags${NC}"