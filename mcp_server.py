#!/usr/bin/env python3
"""
Virtual Advisory Board MCP Server
Provides Claude Desktop access to all advisors through MCP protocol
"""

import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from pathlib import Path

from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.types import (
    Resource, Tool, TextContent, ImageContent, EmbeddedResource
)
import mcp.types as types

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our unified backend
import sys
sys.path.append(str(Path(__file__).parent / "backend"))
from app import ADVISOR_PROFILES, OpenRouterClient

class VirtualAdvisoryBoardMCP:
    """MCP Server for Virtual Advisory Board system"""

    def __init__(self):
        self.server = Server("virtual-advisory-board")
        self.openrouter = OpenRouterClient()

        # Setup tool handlers
        self._setup_tools()

    def _setup_tools(self):
        """Setup MCP tools for advisor interactions"""

        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """List available advisor tools"""
            tools = []

            # Individual advisor chat tools
            for advisor_id, profile in ADVISOR_PROFILES.items():
                tools.append(Tool(
                    name=f"chat_with_{advisor_id}",
                    description=f"Have a conversation with {profile['name']} - {profile['description']}",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "message": {
                                "type": "string",
                                "description": "Your message to the advisor"
                            },
                            "context": {
                                "type": "array",
                                "description": "Previous conversation context (optional)",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "user": {"type": "string"},
                                        "advisor": {"type": "string"}
                                    }
                                },
                                "default": []
                            }
                        },
                        "required": ["message"]
                    }
                ))

            # Panel discussion tool
            tools.append(Tool(
                name="panel_discussion",
                description="Start a panel discussion with multiple advisors on a topic",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "The topic for discussion"
                        },
                        "advisors": {
                            "type": "array",
                            "description": "List of advisor IDs to include (optional - defaults to all)",
                            "items": {"type": "string"},
                            "default": None
                        }
                    },
                    "required": ["topic"]
                }
            ))

            # List advisors tool
            tools.append(Tool(
                name="list_advisors",
                description="Get information about all available advisors",
                inputSchema={
                    "type": "object",
                    "properties": {},
                    "additionalProperties": False
                }
            ))

            return tools

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Optional[Dict[str, Any]]) -> List[types.TextContent]:
            """Handle tool calls"""

            try:
                if name.startswith("chat_with_"):
                    # Extract advisor ID
                    advisor_id = name.replace("chat_with_", "")
                    return await self._chat_with_advisor(advisor_id, arguments)

                elif name == "panel_discussion":
                    return await self._panel_discussion(arguments)

                elif name == "list_advisors":
                    return await self._list_advisors()

                else:
                    return [types.TextContent(
                        type="text",
                        text=f"Unknown tool: {name}"
                    )]

            except Exception as e:
                logger.error(f"Tool call error: {e}")
                return [types.TextContent(
                    type="text",
                    text=f"Error executing tool {name}: {str(e)}"
                )]

    async def _chat_with_advisor(self, advisor_id: str, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle individual advisor chat"""

        if advisor_id not in ADVISOR_PROFILES:
            return [types.TextContent(
                type="text",
                text=f"Advisor '{advisor_id}' not found. Available advisors: {', '.join(ADVISOR_PROFILES.keys())}"
            )]

        message = arguments.get("message", "")
        context = arguments.get("context", [])

        profile = ADVISOR_PROFILES[advisor_id]

        # Build conversation context
        context_text = ""
        if context:
            context_text = "Recent conversation:\n"
            for msg in context[-3:]:  # Last 3 messages
                context_text += f"User: {msg.get('user', '')}\n"
                context_text += f"{profile['name']}: {msg.get('advisor', '')}\n"

        # Build system prompt
        system_prompt = f"{profile['personality']}\n\n{context_text}"

        try:
            # Get AI response
            response_text = await self.openrouter.complete(system_prompt, message)

            return [types.TextContent(
                type="text",
                text=f"**{profile['name']}:** {response_text}"
            )]

        except Exception as e:
            logger.error(f"Chat error with {advisor_id}: {e}")
            return [types.TextContent(
                type="text",
                text=f"Error getting response from {profile['name']}: {str(e)}"
            )]

    async def _panel_discussion(self, arguments: Dict[str, Any]) -> List[types.TextContent]:
        """Handle panel discussion"""

        topic = arguments.get("topic", "")
        selected_advisors = arguments.get("advisors") or list(ADVISOR_PROFILES.keys())

        # Validate advisors
        invalid_advisors = [a for a in selected_advisors if a not in ADVISOR_PROFILES]
        if invalid_advisors:
            return [types.TextContent(
                type="text",
                text=f"Invalid advisors: {', '.join(invalid_advisors)}. Available: {', '.join(ADVISOR_PROFILES.keys())}"
            )]

        responses = []

        # Get responses from each advisor
        for advisor_id in selected_advisors:
            profile = ADVISOR_PROFILES[advisor_id]

            system_prompt = f"{profile['personality']}\n\nYou are participating in a panel discussion on: {topic}\n\nProvide your perspective on this topic."

            try:
                response_text = await self.openrouter.complete(system_prompt, topic)
                responses.append(f"**{profile['name']}:** {response_text}")

            except Exception as e:
                logger.error(f"Panel discussion error for {advisor_id}: {e}")
                responses.append(f"**{profile['name']}:** [Error getting response]")

        # Format panel discussion
        result = f"# Panel Discussion: {topic}\n\n" + "\n\n---\n\n".join(responses)

        return [types.TextContent(
            type="text",
            text=result
        )]

    async def _list_advisors(self) -> List[types.TextContent]:
        """List all available advisors"""

        advisor_list = []
        for advisor_id, profile in ADVISOR_PROFILES.items():
            advisor_list.append(f"**{advisor_id}** - {profile['name']}: {profile['description']}")

        result = "# Available Advisors\n\n" + "\n\n".join(advisor_list)

        return [types.TextContent(
            type="text",
            text=result
        )]

    async def run(self):
        """Run the MCP server"""

        # Initialize server options
        init_options = InitializationOptions(
            server_name="virtual-advisory-board",
            server_version="1.0.0",
            capabilities=self.server.get_capabilities(
                notification_options=NotificationOptions(),
                experimental_capabilities={}
            )
        )

        async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                init_options
            )


async def main():
    """Main entry point"""
    logger.info("Starting Virtual Advisory Board MCP Server")

    server = VirtualAdvisoryBoardMCP()
    await server.run()


if __name__ == "__main__":
    asyncio.run(main())