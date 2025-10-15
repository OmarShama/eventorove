#!/bin/bash

# Test your free deployment setup
echo "🧪 Testing your free deployment configuration..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
print_status "Checking deployment files..."

files_to_check=(
    "railway.json"
    "Procfile"
    "server/railway.json"
    "client/railway.json"
    "server/env.railway"
    "client/env.railway"
    "FREE_DEPLOYMENT_GUIDE.md"
)

all_files_exist=true

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file exists"
    else
        print_error "❌ $file missing"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    print_error "Some required files are missing. Please check the setup."
    exit 1
fi

# Check if Docker is available for local testing
if command -v docker &> /dev/null; then
    print_success "✅ Docker is available for local testing"
    
    # Test local deployment
    print_status "Testing local deployment..."
    if [ -f "docker-compose.local-test.yml" ]; then
        print_success "✅ Local test configuration exists"
        print_status "Run './scripts/test-local.sh' to test locally"
    else
        print_warning "⚠️  Local test configuration not found"
    fi
else
    print_warning "⚠️  Docker not found - you can still deploy to Railway/Render"
fi

# Check if Git is configured
if command -v git &> /dev/null; then
    print_success "✅ Git is available"
    
    # Check if we're in a git repository
    if [ -d ".git" ]; then
        print_success "✅ Git repository initialized"
        
        # Check if there are uncommitted changes
        if [ -n "$(git status --porcelain)" ]; then
            print_warning "⚠️  You have uncommitted changes"
            print_status "Consider running: git add . && git commit -m 'Ready for deployment'"
        else
            print_success "✅ No uncommitted changes"
        fi
    else
        print_warning "⚠️  Not in a git repository"
        print_status "Run: git init && git add . && git commit -m 'Initial commit'"
    fi
else
    print_warning "⚠️  Git not found - you'll need it for deployment"
fi

# Check package.json files
print_status "Checking package.json files..."

if [ -f "server/package.json" ]; then
    print_success "✅ Server package.json exists"
    
    # Check if start:prod script exists
    if grep -q '"start:prod"' server/package.json; then
        print_success "✅ Server has start:prod script"
    else
        print_warning "⚠️  Server missing start:prod script"
    fi
else
    print_error "❌ Server package.json missing"
fi

if [ -f "client/package.json" ]; then
    print_success "✅ Client package.json exists"
    
    # Check if build script exists
    if grep -q '"build"' client/package.json; then
        print_success "✅ Client has build script"
    else
        print_warning "⚠️  Client missing build script"
    fi
else
    print_error "❌ Client package.json missing"
fi

print_success "🎉 Free deployment setup check completed!"
print_status ""
print_status "Next steps:"
print_status "1. Read FREE_DEPLOYMENT_GUIDE.md for detailed instructions"
print_status "2. Set up Supabase database (free)"
print_status "3. Deploy to Railway or Render (both free)"
print_status "4. Test your live application"
print_status ""
print_status "Your app will be available at:"
print_status "  🌐 Frontend: https://your-client-app.railway.app"
print_status "  🔧 API: https://your-server-app.railway.app"
print_status ""
print_warning "Remember to update environment variables with your actual URLs!"
