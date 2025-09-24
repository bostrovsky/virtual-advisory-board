# Virtual Advisory Board - Railway Production Deployment

A unified AI-powered Virtual Advisory Board system with 6 expert advisors powered by OpenRouter and Claude Sonnet.

## Features

- **6 Expert Advisors**: Tony Robbins, Alex Hormozi, Mark Cuban, Sara Blakely, Seth Godin, and Robert Kiyosaki
- **Real AI Conversations**: Powered by OpenRouter with Claude Sonnet for authentic responses
- **Web Interface**: Next.js frontend with WhatsApp-style chat interface
- **MCP Server**: Direct integration with Claude Desktop for seamless advisor access
- **Panel Discussions**: Multi-advisor conversations on any topic
- **Unified Deployment**: Single Railway deployment serving both frontend and backend

## Architecture

- **Frontend**: Next.js 15 with static export, served by FastAPI backend
- **Backend**: FastAPI with OpenRouter integration
- **AI Integration**: OpenRouter API with Claude Sonnet
- **MCP Server**: Model Context Protocol for Claude Desktop integration
- **Deployment**: Railway platform with automatic builds

## Local Development

1. **Clone and setup**:
   ```bash
   cd railway-production
   python3 -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt
   ```

2. **Build frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Run locally**:
   ```bash
   cd ..
   source venv/bin/activate
   OPENROUTER_API_KEY=your_key_here python backend/app.py
   ```

## Railway Deployment

1. **Build Command**: `npm run railway:build`
2. **Start Command**: `npm run railway:start`
3. **Environment Variables**:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `NODE_ENV=production`
   - `PYTHON_ENV=production`

## MCP Server Setup

For Claude Desktop integration:

1. **Setup MCP server**:
   ```bash
   ./setup_mcp.sh
   ```

2. **Configure Claude Desktop**:
   - Copy content from `claude_desktop_config.json`
   - Add to your Claude Desktop configuration
   - Set `OPENROUTER_API_KEY` in environment
   - Restart Claude Desktop

3. **Available MCP Tools**:
   - `chat_with_tony` - Chat with Tony Robbins
   - `chat_with_alex` - Chat with Alex Hormozi
   - `chat_with_mark` - Chat with Mark Cuban
   - `chat_with_sara` - Chat with Sara Blakely
   - `chat_with_seth` - Chat with Seth Godin
   - `chat_with_robert` - Chat with Robert Kiyosaki
   - `panel_discussion` - Multi-advisor panel discussion
   - `list_advisors` - List all available advisors

## API Endpoints

- `GET /` - Web interface
- `GET /api/health` - Health check
- `GET /api/advisors` - List all advisors
- `POST /api/chat` - Chat with individual advisor
- `POST /api/panel` - Panel discussion with multiple advisors

## Advisor Personalities

Each advisor has authentic personality profiles with:
- Core philosophy and beliefs
- Key knowledge areas and expertise
- Communication style and signature phrases
- Real quotes and frameworks from their actual work

## Testing

Successful local testing verified:
- ✅ Frontend builds and serves correctly
- ✅ Backend API endpoints functional
- ✅ OpenRouter integration configured
- ✅ Static file serving working
- ✅ All 6 advisors available and configured
- ✅ MCP server interface complete

## Next Steps

Ready for Railway deployment with:
- OpenRouter API key configuration
- Automatic build and deployment pipeline
- Production-ready unified architecture