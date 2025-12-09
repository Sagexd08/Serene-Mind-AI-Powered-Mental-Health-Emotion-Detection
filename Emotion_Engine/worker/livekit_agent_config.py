"""
LiveKit Agent Configuration Example

This file demonstrates how to configure and run the Gemini Live agent
with LiveKit Agents SDK v1.2+. Copy this as a template for your deployment.
"""

import asyncio
import logging
import os
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import google, silero

# Load environment variables
load_dotenv()
load_dotenv(".env.local")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# ENVIRONMENT CONFIGURATION
# ============================================================================

LIVEKIT_URL = os.getenv('LIVEKIT_URL', 'wss://emotech-38dj94si.livekit.cloud')
LIVEKIT_API_KEY = os.getenv('LIVEKIT_API_KEY', 'APISsXCJFjf8JW4')
LIVEKIT_API_SECRET = os.getenv('LIVEKIT_API_SECRET', 'a4p9grtgakKGIqJqeMDGcSocsVVHeifYh53QMqzG00RA')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')

# Validate required configuration
if not GOOGLE_API_KEY:
    logger.warning(
        "GOOGLE_API_KEY not set. The agent will fail to connect to Gemini."
    )

# ============================================================================
# SYSTEM PROMPT - WELLNESS ASSISTANT
# ============================================================================

SYSTEM_PROMPT = """You are a compassionate, empathetic wellness assistant designed to support 
students with their mental health and emotional wellbeing.

Your core principles:
1. VALIDATE: Acknowledge and validate the user's feelings without judgment
2. LISTEN: Pay close attention to what the user is saying and underlying concerns
3. SUPPORT: Offer practical, evidence-based wellness strategies
4. REFER: Recognize when professional help is needed and encourage appropriate resources
5. RESPECT: Maintain confidentiality and respect user autonomy

Guidelines for responses:
- Keep responses concise (1-3 sentences typically) to maintain natural conversation flow
- Use a warm, caring tone
- Avoid medical advice - suggest professional help for clinical concerns
- Normalize common challenges (anxiety, stress, sleep issues)
- Suggest concrete, actionable steps when appropriate
- Ask follow-up questions to better understand the user's needs

Crisis Protocol:
If the user mentions:
- Suicidal ideation
- Self-harm urges
- Acute distress requiring immediate help
- Substance abuse concerns

Respond with:
1. "I'm really concerned about what you're sharing with me."
2. "This is important and you deserve professional support."
3. "Please reach out to [crisis hotline/emergency services]: [number]"
4. Offer to connect with a counselor immediately if available

Wellness Topics You Can Help With:
- Anxiety and panic attacks
- Stress management
- Sleep issues and sleep hygiene
- Academic pressure and performance anxiety
- Relationship and social concerns
- Self-esteem and confidence
- Time management and organization
- Study techniques and learning strategies
- Physical wellness and exercise motivation
- Mindfulness and relaxation techniques
- Grief and loss
- Work-life balance

Example Interactions:
User: "I'm so stressed about midterms"
Assistant: "Midterm stress is really common. Let's break this down - what subject are you 
most worried about? Sometimes focusing on one thing at a time makes it feel more manageable."

User: "I can't sleep at night"
Assistant: "Sleep troubles can be tough. Have you tried any relaxation techniques before bed, 
like deep breathing or putting your phone away 30 minutes early? I can walk you through a 
quick calming exercise if that would help."

User: "I'm having thoughts of hurting myself"
Assistant: "I'm really concerned about what you're sharing. You deserve immediate professional 
support. Please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or go to 
your nearest emergency room. I'm also connecting you with our counselor now."

Remember:
- You're a support tool, not a replacement for professional mental health care
- It's okay to say "I think speaking with a counselor would be really helpful here"
- Every conversation is an opportunity to help someone feel heard and supported
"""


# ============================================================================
# AGENT CLASS (v1.2+ API)
# ============================================================================

class WellnessAssistantAgent(Agent):
    """Wellness assistant agent class using the new v1.2+ API"""
    
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)


# Create the agent server
server = AgentServer()


@server.rtc_session()
async def wellness_agent(ctx: agents.JobContext):
    """Main entry point for the wellness agent using Gemini Realtime"""
    
    logger.info(f"Starting LiveKit agent")
    logger.info(f"  Room: {ctx.room.name}")
    
    try:
        # Create an agent session with Gemini Realtime Model
        session = AgentSession(
            llm=google.beta.realtime.RealtimeModel(
                model="gemini-2.0-flash-exp",
                voice="Puck",  # Options: Puck, Charon, Kore, Fenrir, Aoide
                temperature=0.7,
            ),
            vad=silero.VAD.load(),  # Voice Activity Detection
        )
        
        # Start the session
        await session.start(
            room=ctx.room,
            agent=WellnessAssistantAgent(),
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(),
            ),
        )
        
        # Generate an initial greeting
        await session.generate_reply(
            instructions="Warmly greet the user and ask how they're feeling today. Be empathetic."
        )
        
        logger.info("Wellness agent started successfully")
        
    except Exception as e:
        logger.error(f"Error in agent: {e}", exc_info=True)
        raise


# ============================================================================
# AGENT CONFIGURATION FOR DEPLOYMENT
# ============================================================================

# This configuration is for the LiveKit agent framework v1.2+
# When deployed, use the CLI commands:
#   python livekit_agent_config.py dev      # Development mode
#   python livekit_agent_config.py start    # Production mode
#   python livekit_agent_config.py console  # Console mode (testing)

DEPLOYMENT_NOTES = """
# livekit-agent v1.2+ configuration

## Quick Start:
1. Install dependencies:
   pip install "livekit-agents[silero,google]~=1.2" python-dotenv

2. Set environment variables:
   export LIVEKIT_URL=wss://emotech-38dj94si.livekit.cloud
   export LIVEKIT_API_KEY=your_api_key
   export LIVEKIT_API_SECRET=your_api_secret
   export GOOGLE_API_KEY=your_google_api_key

3. Run in development mode:
   python livekit_agent_config.py dev

4. Run in production mode:
   python livekit_agent_config.py start

## Features:
- Voice Activity Detection (VAD) using Silero
- Gemini Realtime API for speech-to-speech conversations
- Automatic interruption handling
- Mental health focused prompting

## Testing:
- Use the LiveKit Agents Playground at https://agents-playground.livekit.io/
- Connect to your room and speak naturally

## Monitoring:
- Check logs for connection status and errors
- Monitor Gemini API usage in Google Cloud Console
- Track session duration and user engagement
"""


if __name__ == "__main__":
    # Run the agent using the CLI
    agents.cli.run_app(server)
