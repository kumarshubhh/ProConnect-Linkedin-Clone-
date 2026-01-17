#!/bin/bash

# 🔍 Environment Variables Verification Script
# This script verifies that all environment variables are properly configured

echo "🔍 Verifying Environment Variables Setup..."
echo ""

# Backend Verification
echo "📦 BACKEND VERIFICATION"
echo "======================="

if [ -f "backend/.env" ]; then
    echo "✅ backend/.env exists"
    
    # Check for required variables
    if grep -q "MONGODB_URI" backend/.env; then
        echo "✅ MONGODB_URI is defined"
    else
        echo "❌ MONGODB_URI is missing"
    fi
    
    if grep -q "ALLOWED_ORIGINS" backend/.env; then
        echo "✅ ALLOWED_ORIGINS is defined"
    else
        echo "❌ ALLOWED_ORIGINS is missing"
    fi
    
    if grep -q "PORT" backend/.env; then
        echo "✅ PORT is defined"
    else
        echo "❌ PORT is missing"
    fi
else
    echo "❌ backend/.env does not exist"
    echo "   Please create it from backend/.env.example"
fi

echo ""

# Frontend Verification
echo "🎨 FRONTEND VERIFICATION"
echo "========================"

if [ -f "frontend/.env.local" ]; then
    echo "✅ frontend/.env.local exists"
    
    if grep -q "NEXT_PUBLIC_API_BASE_URL" frontend/.env.local; then
        echo "✅ NEXT_PUBLIC_API_BASE_URL is defined"
    else
        echo "❌ NEXT_PUBLIC_API_BASE_URL is missing"
    fi
else
    echo "❌ frontend/.env.local does not exist"
    echo "   Please create it from frontend/.env.example"
fi

if [ -f "frontend/.env.production" ]; then
    echo "✅ frontend/.env.production exists"
else
    echo "⚠️  frontend/.env.production does not exist (needed for production)"
fi

echo ""

# Config Files Verification
echo "⚙️  CONFIG FILES VERIFICATION"
echo "============================="

if [ -f "frontend/src/config/api.js" ]; then
    echo "✅ frontend/src/config/api.js exists"
else
    echo "❌ frontend/src/config/api.js is missing"
fi

if [ -f "frontend/src/config/axios.js" ]; then
    echo "✅ frontend/src/config/axios.js exists"
else
    echo "❌ frontend/src/config/axios.js is missing"
fi

echo ""
echo "🎉 Verification Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Make sure all ✅ items are checked"
echo "2. Fix any ❌ items"
echo "3. Restart your development servers"
echo "4. Test API calls in development"
echo "5. Deploy to production with environment variables"
