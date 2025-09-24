#!/bin/bash
echo "Setting up Virtual Advisory Board MCP Server"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r backend/requirements.txt

echo "MCP Server setup complete!"
echo ""
echo "To use with Claude Desktop:"
echo "1. Copy the content from claude_desktop_config.json"
echo "2. Add it to your Claude Desktop configuration"
echo "3. Set your OPENROUTER_API_KEY in the environment"
echo "4. Restart Claude Desktop"
echo ""
echo "Available MCP tools:"
echo "- chat_with_tony - Chat with Tony Robbins"
echo "- chat_with_alex - Chat with Alex Hormozi"
echo "- chat_with_mark - Chat with Mark Cuban"
echo "- chat_with_sara - Chat with Sara Blakely"
echo "- chat_with_seth - Chat with Seth Godin"
echo "- chat_with_robert - Chat with Robert Kiyosaki"
echo "- panel_discussion - Multi-advisor panel discussion"
echo "- list_advisors - List all available advisors"