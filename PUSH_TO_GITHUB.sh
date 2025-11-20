#!/bin/bash

# Script to push xnpm to GitHub
# Replace YOUR_USERNAME with your actual GitHub username

echo "🚀 Pushing xnpm to GitHub..."
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists:"
    git remote get-url origin
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your GitHub username: " GITHUB_USERNAME
        git remote set-url origin "https://github.com/${GITHUB_USERNAME}/xnpm.git"
    else
        echo "Using existing remote..."
    fi
else
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    git remote add origin "https://github.com/${GITHUB_USERNAME}/xnpm.git"
fi

echo ""
echo "📝 Current branch:"
git branch --show-current

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository at: https://github.com/${GITHUB_USERNAME}/xnpm"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   1. Repository doesn't exist on GitHub - create it first"
    echo "   2. Authentication required - use Personal Access Token"
    echo "   3. Branch name mismatch - check if GitHub uses 'master' instead of 'main'"
    echo ""
    echo "See GITHUB_SETUP.md for detailed instructions."
fi

