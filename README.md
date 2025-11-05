# Aura Voice Agent
Aura Voice Agent is a real-time AI-powered voice assistant that enables seamless conversational experiences. It leverages LiveKit for live audio streaming, Deepgram for speech-to-text (STT) and text-to-speech (TTS), Groq LLaMA for language understanding, and Silero VAD for detecting active speech.

## Features
1.Real-time voice interactions.🎙️
2.Speech-to-text conversion via Deepgram STT.🔊
3.Intelligent conversational responses .🧠
4.Text-to-speech output using Deepgram TTS.🔊
5.Voice Activity Detection (VAD) using Silero.
6.React.js frontend with minimal, user-friendly interface.⚛️
7.Extendable Flask backend for integrating additional AI models.🧩

## 🧩 Tech Stack

| Layer     | Technology                   | Purpose                                 |
| --------- | ---------------------------- | --------------------------------------- |
| Frontend  | React.js, LiveKit Client SDK | User interface & audio streaming        |
| Backend   | Flask (Python)               | API, token generation, AI orchestration |
| Speech    | Deepgram STT / TTS           | Voice to text & text to voice           |
| AI Engine | Groq (LLaMA Model)           | Natural language generation             |
| Realtime  | LiveKit Cloud                | Audio rooms, media streaming            |
| VAD       | Silero / Deepgram built-in   | Detects when user is speaking           |
| Hosting   | LiveKit Cloud 				       | Deployment & scalability                |

## Data Flow

🎙️ User Speaks
   ↓
🎧 LiveKit Cloud streams audio frames to backend
   ↓
🗣️ Deepgram STT transcribes speech into text
   ↓
🧠 Groq (LLaMA) generates contextually aware response
   ↓
🔊 Deepgram TTS converts text into realistic audio
   ↓
🔁 Audio is streamed back to LiveKit and played to the user

## ⚙️ Architecture Flow 

Frontend (React + LiveKit SDK)
      │
      ├── Requests token → Backend (Flask)
      │
      ├── Streams audio → LiveKit Cloud
      │
      ├──→ Deepgram (STT) → Groq (LLM) → Deepgram (TTS)
      │
      └── Plays back synthesized voice → User
			
## Design Tradeoff

| Aspect                | Design Choice               | Tradeoff                                                          |
| --------------------- | --------------------------- | ----------------------------------------------------------------- |
| **Real-Time Audio**   | LiveKit Cloud               | Requires stable network; potential latency on slow connections    |
| **STT/TTS Provider**  | Deepgram (Aura models)      | Free API access, but ensures low-latency + high fidelity         |
| **LLM Choice**        | Groq LLaMA 3.1-8B           | Fast inference, but limited long-term memory (no persistence yet) |
| **Backend Framework** | Flask                       | Simple and lightweight, but not ideal for large-scale concurrency |


## Core Livekit Components

| Component              | Description                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`Agent`**            | The core conversational logic unit that defines the assistant’s behavior, response style, and interaction flow.  |
| **`AgentSession`**     | Manages the entire live session — connecting speech recognition, text generation, and voice output in real time. |
| **`JobContext`**       | Provides runtime metadata like the connected room, participants, and execution environment.                      |
| **`WorkerOptions`**    | Configures agent behavior and connects the assistant to the LiveKit cloud environment.                           |
| **`cli.run_app()`**    | Bootstraps the agent worker, enabling seamless integration with LiveKit’s event-driven backend.                  |
| **`ChatContext`**      | Maintains a conversation memory to ensure context-aware, natural responses over multiple turns.                  |
| **`RoomInputOptions`** | Controls room-level audio and video input behaviors (e.g., closing on disconnect, voice events, etc.).           |

### Components 
Deepgram STT:model="nova-2"
Deepgram TTS:model="aura-luna-en"
Groq LLaMA:model="llama-3.1-8b-instant"
Silero VAD:Detects voice activity for precise speech capture



## ⚙️ Setup Instructions
### 🔧 Prerequisites
Python ≥ 3.10
LiveKit Cloud account → [cloud.livekit](cloud.livekit.io)
Deepgram API key → [deepgram](deepgram.com)
Groq API key → [groq](groq.com)
### Set environment variables:
'LIVEKIT_API_KEY=your_livekit_key'
'LIVEKIT_API_SECRET=your_livekit_secret'
'DEEPGRAM_API_KEY=your_deepgram_key'
'GROQ_API_KEY=your_groq_key'
### Create Virtual Environment
'python -m venv .venv'
'source .venv/bin/activate'      
'.venv\Scripts\activate'  
### Install Packages of Compatible Version you want 
livekit-agents==1.2.17
livekit-plugins-silero==1.2.8
livekit-plugins-deepgram==1.0.0
livekit-plugins-groq==1.2.17
python-dotenv==1.0.0
### Livekit Room Connect
'python livekit_voice_agent.py connect --room test-room'
		### RoomIO` -> `AgentSession` -> `TranscriptSynchronizer` -> `RoomIO
### Livekit Console
'python livekit_voice_agent.py console' 
### Start of the Session
<img width="777" height="156" alt="image" src="https://github.com/user-attachments/assets/0d1a370c-b55b-405d-9c48-fd968faa0d3e" />

### Initiate AgentSession, ChatContext
<img width="826" height="405" alt="image" src="https://github.com/user-attachments/assets/9bb5941e-1062-453b-af84-b2da4865b7e9" />

### User Transcript
<img width="707" height="74" alt="image" src="https://github.com/user-attachments/assets/2d06b7c4-36a5-4f92-abf2-847cb968c246" />

<img width="1270" height="128" alt="image" src="https://github.com/user-attachments/assets/e84454f7-b638-47ab-bb33-697743554329" />

### End of the Session
<img width="872" height="101" alt="image" src="https://github.com/user-attachments/assets/5cb23b5e-2669-4140-9957-0a13cee8b596" />

## Improvement Plan

### Multi-language Support:
Expand STT and TTS to support multiple languages using Deepgram’s multilingual capabilities.
### Contextual Memory & RAG Integration:
Integrate LangChain and LlamaIndex to maintain context across conversations.
Use RAG (Retrieval-Augmented Generation) to provide answers based on external documents or PDFs, enhancing factual accuracy and knowledge depth.
### Custom TTS Voices:
Allow users to select different AI voices for personalized responses.
### UI/UX Enhancements:
Add waveform visualizations, interactive controls, and improved error notifications.
Include conversation history display for better user experience.
### Performance Optimization:
Reduce latency through optimized streaming, efficient VAD usage, and batch processing of AI requests.
### Secure API Keys & Tokens
Store API keys in secure environments or encrypted vaults. Rotate API keys periodically to minimize risk if a key is compromised.
### Encrypted Communication
Use HTTPS/TLS for all frontend-backend and backend-external service communications. Ensure WebRTC streams (LiveKit) are encrypted end-to-end to protect audio data.
### Knowledge Expansion:
Enable integration with external data sources (PDFs, knowledge bases, APIs) using RAG-powered pipelines, allowing the agent to answer domain-specific queries with high accuracy.
### Data Privacy & Storage
Avoid storing sensitive voice/audio data unless absolutely necessary.If storing conversation history or audio logs. Implement a data retention policy to automatically delete old audio/text logs.
### Future RAG & LangChain Security
Ensure that external knowledge sources integrated via RAG pipelines are verified and sanitized to prevent malicious content injection. Restrict sensitive data access through context-aware access controls when using LangChain/LlamaIndex.


## Deployment Flow

### LiveKit Cloud Setup (Real-Time Voice Layer)
LiveKit Cloud handles the real-time voice streaming, WebRTC connections, and room management.
### Flow:
### Project Setup:
	Create a project at cloud.livekit.io and obtain credentials:
	'LIVEKIT_URL' → WebSocket endpoint (e.g., wss://aura.livekit.cloud)
	'LIVEKIT_API_KEY'
	'LIVEKIT_API_SECRET'
### Secure Token Generation:
	The Flask backend generates temporary access tokens using these credentials.
	'token = AccessToken(API_KEY, API_SECRET, identity="user")'
	'token.add_grant(VideoGrant(room="aura-room"))'
	The frontend requests this token before joining a LiveKit room.
### Real-Time Communication:
	Once connected, all microphone input is routed through LiveKit Cloud, where:
	Voice activity detection (VAD) monitors speech activity.
	Audio frames are streamed to Deepgram (STT) for transcription.
	The transcribed text is passed to Groq (LLaMA) for response generation.
	The response is converted back to speech via Deepgram (TTS) and played through the LiveKit audio track.	

'User Mic → LiveKit → Deepgram STT → Groq (LLM) → Deepgram TTS → LiveKit → User Speaker'

### Major Challenges Faced
## 🔄 Dependency Compatibility Conflicts
Managing compatibility across multiple versions of livekit-agents, livekit-plugins, and external libraries like Deepgram, Silero, and Groq proved challenging. Each version offered its own advantages but occasionally introduced breaking changes, demanding careful version pinning and iterative debugging.

## 🎧 Slow Audio Generation and Emitter Flushing
During extended conversations, slower text-to-speech (TTS) responses caused the audio emitter to flush or desynchronize, interrupting playback. Optimization of buffer handling and voice stream timing helped minimize lag and ensure smooth, continuous speech output.

## 🌐 API Rate Limits and Response Delays
Using multiple external APIs (Deepgram and Groq) sometimes resulted in temporary throttling or delayed responses, especially under high concurrency. Caching mechanisms and adaptive retry logic were introduced to reduce perceived latency.

## ⏳ Limited Token Validity 
The generated LiveKit access tokens had only a short lifespan, requiring frequent regeneration to maintain active sessions. Implementing a secure and automated token renewal mechanism was essential to ensure uninterrupted connectivity for long-running voice sessions.
















## Additional Resources
LiveKit Agents documentation: [https://docs.livekit.io/agents/]
LiveKit Agents GitHub repository:[https://github.com/livekit/agents]






  





