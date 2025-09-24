"""
Research Agent Module with Human Approval Required
Uses OpenRouter to access GPT-4 or other models for research tasks
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import aiohttp
from datetime import datetime

class ResearchStatus(Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    DENIED = "denied"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class ResearchRequest:
    id: str
    query: str
    original_context: str
    advisor_suggestions: List[Dict[str, str]]
    refined_query: Optional[str] = None
    status: ResearchStatus = ResearchStatus.PROPOSED
    created_at: datetime = None
    approved_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    results: Optional[Dict] = None
    cost_estimate: Optional[float] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

class ResearchAgent:
    """
    Research Agent that requires human approval before executing any research
    Uses OpenRouter to access GPT-4 or other advanced models
    """

    def __init__(self, openrouter_api_key: str):
        self.api_key = openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.pending_requests: Dict[str, ResearchRequest] = {}

        # Model configuration - using latest models available on OpenRouter
        # Top tier research models:
        # - "openai/gpt-5" - OpenAI's most advanced model
        # - "openai/gpt-5-codex" - Specialized for code/technical research
        # - "anthropic/claude-opus-4.1" - Anthropic's flagship model
        # - "anthropic/claude-opus-4" - Best for coding tasks
        # - "anthropic/claude-sonnet-4" - Balance of capability and efficiency

        self.research_model = "openai/gpt-5-nano"  # Using GPT-5 Nano for cost-effective research
        self.cost_per_1k_tokens = 0.008  # Estimate for GPT-5 Nano

    async def propose_research(
        self,
        query: str,
        context: str,
        advisor_suggestions: List[Dict[str, str]]
    ) -> ResearchRequest:
        """
        Create a research proposal that requires human approval
        """
        import uuid

        request_id = str(uuid.uuid4())

        # Compile advisor suggestions into a refined query proposal
        refined_query = await self._refine_query_with_suggestions(
            query, context, advisor_suggestions
        )

        # Estimate the cost
        estimated_tokens = len(refined_query.split()) * 3  # Rough estimate
        cost_estimate = (estimated_tokens / 1000) * self.cost_per_1k_tokens

        # Create the request
        request = ResearchRequest(
            id=request_id,
            query=query,
            original_context=context,
            advisor_suggestions=advisor_suggestions,
            refined_query=refined_query,
            cost_estimate=cost_estimate
        )

        self.pending_requests[request_id] = request

        return request

    async def _refine_query_with_suggestions(
        self,
        query: str,
        context: str,
        suggestions: List[Dict[str, str]]
    ) -> str:
        """
        Combine advisor suggestions into a refined research query
        """
        suggestion_text = "\n".join([
            f"- {s['advisor']}: {s['suggestion']}"
            for s in suggestions
        ])

        refinement_prompt = f"""
        Original Research Query: {query}

        Discussion Context: {context}

        Advisor Suggestions for Refinement:
        {suggestion_text}

        Create a comprehensive, refined research query that incorporates the best ideas from all advisors.
        Make it specific, actionable, and focused on getting high-quality information.

        Refined Query:
        """

        # For now, return a combined version
        # In production, this could use a lighter model to refine
        refined = f"{query}\n\nSpecific areas to investigate based on advisor input:\n"
        for suggestion in suggestions:
            refined += f"- {suggestion['suggestion']}\n"

        return refined

    def approve_research(self, request_id: str) -> bool:
        """
        Human approves the research request
        """
        if request_id not in self.pending_requests:
            return False

        request = self.pending_requests[request_id]
        if request.status != ResearchStatus.PROPOSED:
            return False

        request.status = ResearchStatus.APPROVED
        request.approved_at = datetime.now()
        return True

    def deny_research(self, request_id: str, reason: Optional[str] = None) -> bool:
        """
        Human denies the research request
        """
        if request_id not in self.pending_requests:
            return False

        request = self.pending_requests[request_id]
        if request.status != ResearchStatus.PROPOSED:
            return False

        request.status = ResearchStatus.DENIED
        if reason:
            request.results = {"denial_reason": reason}
        return True

    async def execute_approved_research(self, request_id: str) -> Dict[str, Any]:
        """
        Execute research only after human approval
        """
        if request_id not in self.pending_requests:
            raise ValueError(f"Request {request_id} not found")

        request = self.pending_requests[request_id]

        if request.status != ResearchStatus.APPROVED:
            raise ValueError(f"Request {request_id} is not approved. Status: {request.status}")

        request.status = ResearchStatus.IN_PROGRESS

        try:
            # Execute the research using OpenRouter
            research_results = await self._conduct_research(request.refined_query)

            request.status = ResearchStatus.COMPLETED
            request.completed_at = datetime.now()
            request.results = research_results

            return {
                "status": "success",
                "request_id": request_id,
                "results": research_results,
                "execution_time": (request.completed_at - request.approved_at).total_seconds()
            }

        except Exception as e:
            request.status = ResearchStatus.FAILED
            request.results = {"error": str(e)}
            return {
                "status": "failed",
                "request_id": request_id,
                "error": str(e)
            }

    async def _conduct_research(self, query: str) -> Dict[str, Any]:
        """
        Actually conduct the research using GPT-4 via OpenRouter
        """
        research_prompt = f"""
        You are a world-class research assistant. Conduct comprehensive research on the following topic:

        {query}

        Provide:
        1. Key Facts and Data (with sources when possible)
        2. Current Trends and Developments
        3. Expert Opinions and Perspectives
        4. Potential Implications and Considerations
        5. Recommended Actions or Next Steps

        Format your response as a structured research brief with clear sections and bullet points.
        Be specific, cite examples, and provide actionable insights.
        """

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://virtual-advisory-board.com",
            "X-Title": "Virtual Advisory Board Research Agent"
        }

        data = {
            "model": self.research_model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert research analyst providing comprehensive, actionable research briefs."
                },
                {
                    "role": "user",
                    "content": research_prompt
                }
            ],
            "temperature": 0.3,  # Lower temperature for more focused, factual research
            "max_tokens": 2000
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(self.base_url, headers=headers, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    research_content = result['choices'][0]['message']['content']

                    return {
                        "research": research_content,
                        "model_used": self.research_model,
                        "timestamp": datetime.now().isoformat(),
                        "tokens_used": result.get('usage', {})
                    }
                else:
                    error_text = await response.text()
                    raise Exception(f"Research API error: {error_text}")

    def get_pending_requests(self) -> List[ResearchRequest]:
        """
        Get all pending research requests awaiting approval
        """
        return [
            req for req in self.pending_requests.values()
            if req.status == ResearchStatus.PROPOSED
        ]

    def get_request_status(self, request_id: str) -> Optional[ResearchRequest]:
        """
        Get the status of a specific research request
        """
        return self.pending_requests.get(request_id)