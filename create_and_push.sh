#!/bin/bash

# Script to create GitHub repository and push code
# For user: croy-aderant
# Repository: xnpm

echo "🚀 Creating GitHub repository and pushing code..."
echo ""

# Check if user is logged into GitHub CLI
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    echo "Creating repository croy-aderant/xnpm..."
    gh repo create croy-aderant/xnpm --public --source=. --remote=origin --push
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully created repository and pushed code!"
        echo "🌐 View at: https://github.com/croy-aderant/xnpm"
        exit 0
    fi
fi

echo "⚠️  GitHub CLI not available or authentication required"
echo ""
echo "Please create the repository manually:"
echo ""
echo "Option 1: Via GitHub Website (Easiest)"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: xnpm"
echo "3. Description: npm proxy with change summaries and security analysis"
echo "4. Choose: Public"
echo "5. DO NOT check 'Initialize with README' (we already have one)"
echo "6. Click 'Create repository'"
echo "7. Then run: git push -u origin main"
echo ""
echo "Option 2: Via GitHub CLI (if installed)"
echo "1. Run: gh auth login"
echo "2. Then run: gh repo create croy-aderant/xnpm --public --source=. --remote=origin --push"
echo ""
echo "Option 3: Create via API (requires token)"
echo "1. Get a GitHub Personal Access Token with 'repo' scope"
echo "2. Run:"
echo "   curl -X POST -H 'Authorization: token YOUR_TOKEN' \\"
echo "        -H 'Accept: application/vnd.github.v3+json' \\"
echo "        https://api.github.com/user/repos \\"
echo "        -d '{\"name\":\"xnpm\",\"description\":\"npm proxy with change summaries and security analysis\",\"private\":false}'"
echo "3. Then run: git push -u origin main"
echo ""

read -p "Have you created the repository on GitHub? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing code to GitHub..."
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 View at: https://github.com/croy-aderant/xnpm"
    else
        echo ""
        echo "❌ Push failed. Check:"
        echo "   1. Repository exists at https://github.com/croy-aderant/xnpm"
        echo "   2. You have push access"
        echo "   3. Authentication is set up (Personal Access Token or SSH)"
    fi
else
    echo "Please create the repository first, then run this script again or:"
    echo "  git push -u origin main"
fi

