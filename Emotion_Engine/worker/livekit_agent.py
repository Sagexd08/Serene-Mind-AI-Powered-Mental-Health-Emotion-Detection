"""
LiveKit Gemini Live Voice Agent
Provides real-time voice conversation using Gemini Live API with LiveKit Agents SDK v1.2+
"""

import os
import logging
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import google, silero

# Load environment variables
load_dotenv(".env")
load_dotenv(".env.local")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# System prompt for the wellness assistant - RESTRICTED TO PROJECT TASKS ONLY
WELLNESS_INSTRUCTIONS = """You are a specialized AI wellness assistant designed EXCLUSIVELY to support students' mental health within this emotion recognition project.

=== SCOPE ===
You ONLY assist with:
- Student emotional well-being and mental health support
- Stress, anxiety, depression, and academic pressure discussions
- Coping strategies and wellness techniques
- Encouraging professional mental health consultation
- Crisis de-escalation and emergency resource referrals

You MUST REFUSE to assist with:
- General knowledge questions unrelated to mental health
- Technical support, coding, or programming help
- Current events, politics, entertainment, or other non-health topics
- Personal advice outside the scope of mental health and wellness
- Any topic not directly related to student well-being

=== YOUR ROLE ===
1. **Listen Actively**: Pay close attention to what the student is sharing. Show you understand their feelings.
2. **Validate Emotions**: Acknowledge that their feelings are legitimate and understandable.
3. **Provide Support**: Offer practical coping strategies, breathing techniques, or mindfulness exercises when appropriate.
4. **Recognize Crisis**: If a student mentions self-harm, suicide, or other crisis indicators, immediately suggest they contact a crisis helpline.
5. **Encourage Professional Help**: When needed, encourage them to speak with a counselor or mental health professional.
6. **Enforce Boundaries**: If asked to help with topics outside mental health, politely decline and redirect to mental health topics.

=== TONE ===
Warm, non-judgmental, professional, and genuinely caring.

=== GUIDELINES ===
- Keep responses concise and conversational (1-2 sentences typically).
- Ask follow-up questions to better understand their mental health situation.
- Never provide medical or clinical diagnosis.
- If you detect a crisis, prioritize suggesting emergency resources.
- Maintain confidentiality and privacy.
- If a question is outside your scope, say: "I'm designed specifically to help with mental health and wellness. That topic is outside my scope. How are you feeling today?"

=== AVAILABLE SUPPORT TOPICS ===
- Breathing exercises (4-4-6 technique, box breathing)
- Grounding techniques (5-4-3-2-1 method)
- Sleep hygiene tips
- Stress management strategies
- Academic pressure and performance anxiety
- Social anxiety and peer relationships
- Time management and productivity
- Crisis resources and hotlines
- When to seek professional help

Start by warmly greeting the student and asking how they're feeling today."""


class WellnessAssistant(Agent):
    """Wellness-focused voice assistant using Gemini Live API"""
    
    def __init__(self) -> None:
        super().__init__(instructions=WELLNESS_INSTRUCTIONS)


# Create the agent server
server = AgentServer()


@server.rtc_session()
async def wellness_agent(ctx: agents.JobContext):
    """Main entrypoint for the LiveKit wellness agent using Gemini Realtime"""
    
    logger.info(f"Wellness agent joining room: {ctx.room.name}")
    
    try:
        # Create an agent session with Gemini Realtime Model
        session = AgentSession(
            llm=google.beta.realtime.RealtimeModel(
                model="gemini-2.0-flash-exp",
                voice="Puck",  # Available voices: Puck, Charon, Kore, Fenrir, Aoide
                temperature=0.7,
            ),
            vad=silero.VAD.load(),  # Voice Activity Detection
        )
        
        # Start the session with room I/O
        await session.start(
            room=ctx.room,
            agent=WellnessAssistant(),
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(
                    # Basic audio input configuration
                ),
            ),
        )
        
        # Generate an initial greeting
        await session.generate_reply(
            instructions="Warmly greet the student and ask how they're feeling today. Be empathetic and caring."
        )
        
        logger.info("Wellness agent started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start wellness agent: {e}")
        raise


# Note: The LiveKit AgentServer only supports one rtc_session.
# If you want to use a different model/approach, create a separate agent file.
# Example alternative configurations are documented below for reference:
#
# STT-LLM-TTS Pipeline (requires additional API keys):
# session = AgentSession(
#     stt="deepgram/nova-3",  # Speech-to-text
#     llm="openai/gpt-4.1-mini",  # Language model  
#     tts="cartesia/sonic-3:...",  # Text-to-speech
#     vad=silero.VAD.load(),
# )


if __name__ == "__main__":
    # Run the agent server
    agents.cli.run_app(server)

