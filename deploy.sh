#!/bin/bash

echo "🚀 SmartFinancial AI - Deployment Script"
echo

echo "📦 Building production version..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo
echo "✅ Production build completed successfully!"
echo
echo "🌐 Choose your deployment platform:"
echo
echo "1. Vercel (Frontend + Serverless Backend) - FREE"
echo "2. Railway (Full-Stack) - FREE tier available"
echo "3. Render (Full-Stack) - FREE tier available"
echo "4. Heroku (Full-Stack) - \$7/month"
echo "5. Test locally first"
echo

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo
        echo "🚀 Deploying to Vercel..."
        echo "1. Install Vercel CLI: npm install -g vercel"
        echo "2. Run: vercel"
        echo "3. Follow the prompts"
        echo "4. Add TWELVE_API_KEY in Vercel dashboard"
        echo
        echo "📖 See DEPLOYMENT.md for detailed instructions"
        ;;
    2)
        echo
        echo "🚀 Deploying to Railway..."
        echo "1. Install Railway CLI: npm install -g @railway/cli"
        echo "2. Run: railway login"
        echo "3. Run: railway init"
        echo "4. Run: railway up"
        echo "5. Add TWELVE_API_KEY in Railway dashboard"
        echo
        echo "📖 See DEPLOYMENT.md for detailed instructions"
        ;;
    3)
        echo
        echo "🚀 Deploying to Render..."
        echo "1. Go to https://render.com"
        echo "2. Connect your GitHub repository"
        echo "3. Create new Web Service"
        echo "4. Use render.yaml configuration"
        echo "5. Add TWELVE_API_KEY in environment variables"
        echo
        echo "📖 See DEPLOYMENT.md for detailed instructions"
        ;;
    4)
        echo
        echo "🚀 Deploying to Heroku..."
        echo "1. Install Heroku CLI"
        echo "2. Run: heroku create your-app-name"
        echo "3. Run: git push heroku main"
        echo "4. Add TWELVE_API_KEY: heroku config:set TWELVE_API_KEY=your_key"
        echo
        echo "📖 See DEPLOYMENT.md for detailed instructions"
        ;;
    5)
        echo
        echo "🧪 Testing production build locally..."
        echo "Starting server on http://localhost:5000"
        echo "Press Ctrl+C to stop"
        echo
        npm start
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac

echo
echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"
echo "🔑 Don't forget to set your TWELVE_API_KEY in the deployment platform!"
echo
