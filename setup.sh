#!/bin/bash

# Legal Agent SaaS - Automated Setup Script
# This script sets up the complete development environment

set -e  # Exit on error

echo "🚀 Legal Agent SaaS - Automated Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required (you have $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local file..."
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local with your API keys${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  .env.local already exists, skipping...${NC}"
    echo ""
fi

# Check if environment variables are set
if [ -f ".env.local" ]; then
    source .env.local
    
    MISSING_VARS=""
    
    if [ -z "$GOOGLE_API_KEY" ] || [ "$GOOGLE_API_KEY" = "your-google-gemini-api-key" ]; then
        MISSING_VARS="${MISSING_VARS}\n  - GOOGLE_API_KEY"
    fi
    
    if [ -z "$POSTGRES_URL" ] || [ "$POSTGRES_URL" = "postgres://user:password@host:5432/database" ]; then
        MISSING_VARS="${MISSING_VARS}\n  - POSTGRES_URL"
    fi
    
    if [ ! -z "$MISSING_VARS" ]; then
        echo -e "${YELLOW}⚠️  Missing or placeholder environment variables:${MISSING_VARS}${NC}"
        echo ""
        echo "Please update .env.local with your actual values:"
        echo "  1. Get Google Gemini API key from: https://aistudio.google.com/apikey"
        echo "  2. Set up PostgreSQL database (see README.md for options)"
        echo ""
    else
        echo -e "${GREEN}✅ Environment variables configured${NC}"
        echo ""
    fi
fi

# Offer to initialize database
read -p "Do you want to initialize the database schema now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ ! -z "$POSTGRES_URL" ] && [ "$POSTGRES_URL" != "postgres://..." ]; then
        echo "🗄️  Initializing database schema..."
        npm run db:push
        echo -e "${GREEN}✅ Database schema initialized${NC}"
        echo ""
    else
        echo -e "${RED}❌ Cannot initialize database: POSTGRES_URL not configured${NC}"
        echo ""
    fi
fi

# Build the application
echo "🔨 Building application..."
npm run build
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your API keys"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Open http://localhost:3000 in your browser"
echo "  4. Test the chatbot on the homepage"
echo ""
echo "For deployment:"
echo "  - See DEPLOYMENT.md for detailed instructions"
echo "  - Quick deploy to Vercel: vercel --prod"
echo ""
echo "Documentation:"
echo "  - README.md - Overview and features"
echo "  - DEPLOYMENT.md - Deployment guide"
echo "  - API docs at /api/docs (coming soon)"
echo ""
echo "Need help? Check the README or create an issue on GitHub"
echo "======================================"
