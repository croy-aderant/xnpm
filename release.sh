#!/bin/bash

# Release script for xnpm
# This script commits changes, creates a tag, and pushes to GitHub

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

echo -e "${GREEN}🚀 Releasing xnpm v${VERSION}${NC}"
echo ""

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on the main branch (currently on: $CURRENT_BRANCH)${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Staging changes...${NC}"
    git add package.json INSTALLATION_TROUBLESHOOTING.md RELEASE_NOTES_v*.md 2>/dev/null || true
    git add -u  # Add all modified tracked files
    
    echo ""
    echo -e "${YELLOW}📋 Files to be committed:${NC}"
    git status --short
    echo ""
    
    read -p "Commit these changes? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
    
    # Get commit message
    if [ -f "RELEASE_NOTES_v${VERSION}.md" ]; then
        COMMIT_MSG="Release v${VERSION}

$(head -20 RELEASE_NOTES_v${VERSION}.md | tail -n +2 | sed 's/^# //' | head -5)"
    else
        COMMIT_MSG="Release v${VERSION}"
    fi
    
    echo -e "${GREEN}💾 Committing changes...${NC}"
    git commit -m "$COMMIT_MSG" || {
        echo -e "${RED}❌ Commit failed${NC}"
        exit 1
    }
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# Check if tag already exists
if git rev-parse "v${VERSION}" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Tag v${VERSION} already exists${NC}"
    read -p "Delete and recreate? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag -d "v${VERSION}" || true
        git push origin ":refs/tags/v${VERSION}" 2>/dev/null || true
    else
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

# Create tag
echo -e "${GREEN}🏷️  Creating tag v${VERSION}...${NC}"
if [ -f "RELEASE_NOTES_v${VERSION}.md" ]; then
    TAG_MSG="Release v${VERSION}

$(cat RELEASE_NOTES_v${VERSION}.md)"
else
    TAG_MSG="Release v${VERSION}"
fi

git tag -a "v${VERSION}" -m "$TAG_MSG" || {
    echo -e "${RED}❌ Tag creation failed${NC}"
    exit 1
}

# Push to GitHub
echo -e "${GREEN}📤 Pushing to GitHub...${NC}"
git push origin main || {
    echo -e "${RED}❌ Push failed${NC}"
    exit 1
}

git push origin "v${VERSION}" || {
    echo -e "${RED}❌ Tag push failed${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Successfully released v${VERSION}!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Create a GitHub release at: https://github.com/croy-aderant/xnpm/releases/new"
echo "2. Select tag: v${VERSION}"
echo "3. Copy content from RELEASE_NOTES_v${VERSION}.md"
echo "4. Publish the release"
echo ""
echo -e "${GREEN}🎉 Done!${NC}"

