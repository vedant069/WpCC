#!/bin/bash
# start.sh — Start WhatsApp AI Engineer in background

# Move to the script execution directory
cd "$(dirname "$0")" || exit 1

echo "🚀 Starting WhatsApp AI Engineer..."

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | tr -d '\r' | xargs)
    echo "✅ Loaded environment variables from .env"
else
    echo "⚠️  No .env file found! Make sure you copied .env.example"
fi

# Run npm install to ensure dependencies are up-to-date
if [ -f package.json ]; then
    echo "📦 Checking dependencies..."
    npm install --silent
fi

# Auto-sync Knowledge Base from GitHub if configured
if [ -n "$GITHUB_KB_URL" ]; then
    KB_PATH=${KB_DIR:-./kb}
    if [ ! -d "$KB_PATH/.git" ]; then
        echo "📥 Cloning Knowledge Base from $GITHUB_KB_URL to $KB_PATH..."
        git clone "$GITHUB_KB_URL" "$KB_PATH"
    else
        echo "🔄 Updating Knowledge Base in $KB_PATH..."
        git -C "$KB_PATH" pull
    fi
else
    echo "ℹ️  No GITHUB_KB_URL configured. Skipping Knowledge Base sync."
fi

# Kill any existing instance gently
echo "🛑 Stopping old instances..."
pkill -f "node index.js" 2>/dev/null || true
sleep 1

# Ensure a fresh log file exists
touch /tmp/wa-engineer.log
chmod 666 /tmp/wa-engineer.log

# Start in background with nohup
echo "🚀 Starting daemon..."
nohup node index.js > /tmp/wa-engineer.log 2>&1 &
echo "✅ Started PID=$!"

sleep 3
echo ""
echo "=== Last 20 log lines ==="
tail -20 /tmp/wa-engineer.log
echo "========================="
echo ""
echo "To monitor logs live, run: tail -f /tmp/wa-engineer.log"
