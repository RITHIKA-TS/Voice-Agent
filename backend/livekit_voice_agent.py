"""
LiveKit Voice Agent with Deepgram TTS
======================================
- Groq (LLaMA 3.1-8B) for LLM
- Deepgram (nova-2) for STT
- Silero for VAD
- Deepgram (aura-asteria-en) for TTS
- All free tier compatible
"""

import os
import logging
from dotenv import load_dotenv
load_dotenv()
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    ChatContext,
)
from livekit.agents import RoomInputOptions
from livekit.plugins import deepgram, silero
from livekit.plugins import groq

# ===== CONFIGURATION =====
#load_dotenv(".env")
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)



# ===== ASSISTANT CLASS =====
class Assistant(Agent):
    """
    Conversational voice assistant with Deepgram TTS.
    Maintains conversation history and provides natural responses.
    """

    def __init__(self, chat_ctx=None):
        """
        Initialize the assistant with optional chat context.
        
        Args:
            chat_ctx: ChatContext for maintaining conversation history
        """
        super().__init__(
            instructions="""You are a helpful and conversational AI assistant.
            
Your behavior:
- Speak naturally and conversationally, like a real person
- Keep answers concise but informative (2-3 sentences typically)
- Be friendly, warm, and engaging
- Listen carefully to what the user asks
- Provide accurate, relevant, and useful responses
- Ask clarifying questions if needed
- Maintain context across the conversation

Communication style:
- Use natural language, not robotic responses
- Show personality and warmth
- Be patient and helpful
- Adapt your tone to the user's needs""",
        chat_ctx=chat_ctx)
    async def say(self, text):
        logger.info(f"Assistant.say() called with text: {text}")
        await self.session.say(text)  # TTS and audio playback
        

    async def on_enter(self):
        """Called when the conversation session starts."""
        logger.info("=" * 60)
        logger.info("🎤 Session started - Welcome!")
        logger.info("=" * 60)
        await self.session.say("Hello! How can I help you today?")

    async def on_exit(self):
        """Called when the conversation session ends."""
        logger.info("=" * 60)
        logger.info("👋 Session ended - Thank you for chatting!")
        logger.info("=" * 60)


# ===== MAIN ENTRYPOINT =====
async def entrypoint(ctx: JobContext):
    
    """
    Initialize and start the LiveKit voice agent session.
    
    This function:
    1. Sets up Speech-to-Text (STT)
    2. Sets up Voice Activity Detection (VAD)
    3. Sets up Text-to-Speech (TTS)
    4. Sets up Large Language Model (LLM)
    5. Creates an agent session
    6. Starts the conversation
    
    Args:
        ctx: JobContext from LiveKit
    """
    room_name = os.getenv("ROOM", "test-room")
    logger.info("=" * 60)
    logger.info("🚀 Starting LiveKit Voice Agent")
    logger.info(f"📍 Room: {ctx.room.name}")
    logger.info("=" * 60)
   

    # ===== SPEECH-TO-TEXT (STT) =====
    try:
        stt = deepgram.STT(
            model="nova-2",
            language="en"
        )
        logger.info("✅ STT initialized: Deepgram nova-2")
    except Exception as e:
        logger.error(f"❌ STT initialization failed: {e}")
        raise

    # ===== VOICE ACTIVITY DETECTION (VAD) =====
    try:
        vad = silero.VAD.load()
        logger.info("✅ VAD initialized: Silero")
    except Exception as e:
        logger.error(f"❌ VAD initialization failed: {e}")
        raise

    # ===== TEXT-TO-SPEECH (TTS) =====
    try:
        tts = deepgram.TTS(
            model="aura-luna-en",  # Natural, expressive voice
            # Available models: aura-asteria-en, aura-luna-en, aura-stella-en, aura-athena-en, etc.
            api_key=os.getenv("DEEPGRAM_API_KEY")
        )
        logger.info("✅ TTS initialized: Deepgram aura-asteria-en")
    except Exception as e:
        logger.error(f"❌ TTS initialization failed: {e}")
        raise

    # ===== LARGE LANGUAGE MODEL (LLM) =====
    try:
        llm = groq.LLM(
            model="llama-3.1-8b-instant",
            api_key=os.getenv("GROQ_API_KEY")
        )
        logger.info("✅ LLM initialized: Groq LLaMA 3.1-8B")
    except Exception as e:
        logger.error(f"❌ LLM initialization failed: {e}")
        raise

        # ===== ROOM OPTIONS =====
    room_options = RoomInputOptions()
    room_options.close_on_disconnect = False
    # ===== CREATE AGENT SESSION =====
    try:
        session = AgentSession(
            stt=stt,
            llm=llm,
            tts=tts,
            vad=vad,
            
            
        )
        logger.info("✅ AgentSession created")
    except Exception as e:
        logger.error(f"❌ AgentSession creation failed: {e}")
        raise

    # ===== INITIALIZE CHAT CONTEXT =====
    try:
        chat_ctx = ChatContext()
        chat_ctx.add_message(
            role="system",
            content="""You are a helpful, friendly AI assistant. 
        Respond naturally and concisely. 
        Maintain context across the conversation.
        Be warm and engaging while being professional."""
        )
        logger.info("✅ Chat context initialized with system prompt")
    except Exception as e:
        logger.error(f"❌ Chat context initialization failed: {e}")
        raise

    # ===== CREATE ASSISTANT INSTANCE =====
    try:
        assistant = Assistant(chat_ctx=chat_ctx)
        logger.info("✅ Assistant instance created")
    except Exception as e:
        logger.error(f"❌ Assistant creation failed: {e}")
        raise

    # ===== START SESSION =====
    try:
        logger.info("=" * 60)
        logger.info("🎙️  Voice agent session starting...")
        logger.info("Speak naturally - the agent is listening!")
        logger.info("=" * 60)
        
        await session.start(
            room=ctx.room,
            agent=assistant,
            room_input_options=room_options   # <- pass it here correctly
        )
    except Exception as e:
        logger.error(f"❌ Session start failed: {e}")
        raise

# ===== ENTRY POINT =====
if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("LiveKit Voice Agent - Deepgram Edition")
    logger.info("All components are free-tier compatible")
    logger.info("=" * 60)
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))