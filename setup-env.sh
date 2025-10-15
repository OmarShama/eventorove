#!/bin/bash

echo "🔧 Setting up environment files for MonoNestNext..."

# Create server .env file if it doesn't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating server/.env file..."
    cat > server/.env << EOF
NODE_ENV=production
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=stagea
DB_SCHEMA=stagea_local
DB_SYNC=false
JWT_SECRET=your-secure-jwt-secret-key-change-this-in-production
PORT=3001
SESSION_SECRET=your-session-secret-key-change-this-in-production
EOF
    echo "✅ server/.env created"
else
    echo "ℹ️  server/.env already exists"
fi

# Create client .env.local file if it doesn't exist
if [ ! -f client/.env.local ]; then
    echo "📝 Creating client/.env.local file..."
    cat > client/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    echo "✅ client/.env.local created"
else
    echo "ℹ️  client/.env.local already exists"
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "⚠️  IMPORTANT: Please update the following in your environment files:"
echo "   - JWT_SECRET in server/.env (use a strong, random secret)"
echo "   - SESSION_SECRET in server/.env (use a strong, random secret)"
echo "   - Database credentials if different from defaults"
echo ""
echo "You can now run:"
echo "  docker-compose up --build"
