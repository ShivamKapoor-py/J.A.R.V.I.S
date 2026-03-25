/**
 * J.A.R.V.I.S Core System
 * Advanced AI Assistant with Speech Recognition and Natural Language Processing
 */

// Core system namespace
const JARVIS = {
    // System state
    state: {
      isInitialized: false,
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
      wakePhraseDetected: false,
      bootSequenceComplete: false,
      debugMode: false,
      startTime: new Date(),
      recognition: null,
      synthesis: window.speechSynthesis,
      timeouts: {
        processing: null,
        speaking: null,
        notification: null,
      },
      audioContext: null,
      audioAnalyser: null,
      microphoneStream: null,
    },
  
    // Configuration
    config: {
      wakePhrase: "hey jarvis",
      voicePreferences: ["Google UK English Male", "Microsoft David", "Alex"],
      speechRate: 1.0,
      speechPitch: 1.0,
      speechVolume: 1.0,
      language: "en-US",
      visualizationSensitivity: 1.5,
      bootSequenceDuration: 3000, // ms
      notificationDuration: 5000, // ms
      apiEndpoints: {
        weather: "https://api.openweathermap.org/data/2.5/weather",
        news: "https://newsapi.org/v2/top-headlines",
        search: "https://www.googleapis.com/customsearch/v1",
      },
    },
  
    // DOM Elements cache
    elements: {},
  
    // Sound effects
    sounds: {
      activation: null,
      processing: null,
      error: null,
      success: null,
    },
  
    // Initialize the system
    init: function () {
      this.debug("Core system initialization started")
  
      // Cache DOM elements
      this.cacheElements()
  
      // Initialize audio context for visualization
      this.initAudioContext()
  
      // Load sound effects
      this.loadSounds()
  
      // Start boot sequence
      this.bootSequence()
  
      // Initialize speech recognition
      this.initSpeechRecognition()
  
      // Set up event listeners
      this.setupEventListeners()
  
      // Start time updates
      this.updateTime()
  
      // Mark as initialized
      this.state.isInitialized = true
      this.debug("Core system initialization complete")
    },
  
    // Cache DOM elements for better performance
    cacheElements: function () {
      this.debug("Caching DOM elements")
  
      const elements = {
        assistantInterface: document.querySelector(".assistant-interface"),
        statusDot: document.querySelector(".status-dot"),
        statusText: document.querySelector(".status-text"),
        statusDetails: document.querySelector(".status-details"),
        transcript: document.getElementById("transcript"),
        micToggle: document.getElementById("mic-toggle"),
        clearTranscriptBtn: document.getElementById("clear-transcript"),
        settingsButton: document.getElementById("settings-button"),
        debugButton: document.getElementById("debug-button"),
        debugPanel: document.getElementById("debug-panel"),
        debugContent: document.getElementById("debug-content"),
        closeDebug: document.getElementById("close-debug"),
        notification: document.getElementById("notification"),
        notificationMessage: document.querySelector(".notification-message"),
        currentTimeEl: document.getElementById("current-time"),
        systemUptimeEl: document.getElementById("system-uptime"),
        systemStatusEl: document.getElementById("system-status"),
        systemMemoryEl: document.getElementById("system-memory"),
        visualizationBars: document.querySelectorAll(".visualization-spectrum .bar"),
      }
  
      // Check for missing elements
      const missingElements = []
      for (const [name, element] of Object.entries(elements)) {
        if (!element) {
          this.debug(`Missing element: ${name}`, "error")
          missingElements.push(name)
        } else {
          this.elements[name] = element
        }
      }
  
      if (missingElements.length > 0) {
        this.showNotification(`Missing elements: ${missingElements.join(", ")}`, "error")
      } else {
        this.debug("All DOM elements cached successfully")
      }
    },
  
    // Initialize Web Audio API for visualization
    initAudioContext: function () {
      try {
        this.debug("Initializing Audio Context")
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.state.audioContext = new AudioContext()
        this.state.audioAnalyser = this.state.audioContext.createAnalyser()
        this.state.audioAnalyser.fftSize = 32
        this.debug("Audio Context initialized successfully")
      } catch (error) {
        this.debug("Failed to initialize Audio Context: " + error.message, "error")
      }
    },
  
    // Load sound effects
    loadSounds: function () {
      this.debug("Loading sound effects")
  
      this.sounds.activation = document.getElementById("activation-sound")
      this.sounds.processing = document.getElementById("processing-sound")
      this.sounds.error = document.getElementById("error-sound")
      this.sounds.success = document.getElementById("success-sound")
  
      // Check if sounds loaded correctly
      const soundIds = ["activation-sound", "processing-sound", "error-sound", "success-sound"]
      const missingSounds = []
  
      soundIds.forEach((id) => {
        if (!document.getElementById(id)) {
          missingSounds.push(id)
        }
      })
  
      if (missingSounds.length > 0) {
        this.debug(`Missing sound elements: ${missingSounds.join(", ")}`, "error")
      } else {
        this.debug("All sound effects loaded successfully")
      }
    },
  
    // Run boot sequence animation
    bootSequence: function () {
      this.debug("Starting boot sequence")
  
      // Add initial system messages
      this.addToTranscript("SYSTEM", "J.A.R.V.I.S core systems initializing...")
      this.updateStatus("BOOTING", "Running diagnostics...")
  
      // Simulate boot sequence with multiple messages
      setTimeout(() => {
        this.addToTranscript("SYSTEM", "Neural networks online.")
        this.updateStatus("BOOTING", "Loading neural networks...")
        this.updateSystemMemory("42%")
      }, 500)
  
      setTimeout(() => {
        this.addToTranscript("SYSTEM", "Speech recognition modules initialized.")
        this.updateStatus("BOOTING", "Calibrating voice recognition...")
        this.updateSystemMemory("67%")
      }, 1000)
  
      setTimeout(() => {
        this.addToTranscript("SYSTEM", "Knowledge database connected.")
        this.updateStatus("BOOTING", "Syncing knowledge database...")
        this.updateSystemMemory("83%")
      }, 1500)
  
      setTimeout(() => {
        this.addToTranscript("SYSTEM", "Security protocols active.")
        this.updateStatus("BOOTING", "Establishing secure connections...")
        this.updateSystemMemory("91%")
      }, 2000)
  
      setTimeout(() => {
        this.addToTranscript("SYSTEM", "J.A.R.V.I.S is now fully operational.")
        this.updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
        this.updateSystemMemory("98.7%")
        this.updateSystemStatus("ONLINE")
        this.state.bootSequenceComplete = true
        this.playSound("success")
        this.showNotification("All systems online and ready.")
      }, this.config.bootSequenceDuration)
    },
  
    // Initialize speech recognition
    initSpeechRecognition: function () {
      this.debug("Initializing speech recognition")
  
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        this.debug("Speech recognition not supported in this browser", "error")
        this.showNotification("Speech recognition not supported in this browser. Please use Chrome or Edge.", "error")
        return false
      }
  
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.state.recognition = new SpeechRecognition()
        this.state.recognition.continuous = false
        this.state.recognition.interimResults = true
        this.state.recognition.lang = this.config.language
  
        // Set up recognition event handlers
        this.setupRecognitionEvents()
  
        this.debug("Speech recognition initialized successfully")
        return true
      } catch (error) {
        this.debug("Failed to initialize speech recognition: " + error.message, "error")
        this.showNotification("Failed to initialize speech recognition: " + error.message, "error")
        return false
      }
    },
  
    // Set up speech recognition event handlers
    setupRecognitionEvents: function () {
      if (!this.state.recognition) return
  
      this.state.recognition.onstart = () => {
        this.debug("Speech recognition started")
        this.state.isListening = true
        this.updateStatus("LISTENING", "Listening for commands...")
  
        if (this.elements.micToggle) {
          this.elements.micToggle.classList.add("active")
          const btnText = this.elements.micToggle.querySelector(".btn-text")
          if (btnText) {
            btnText.textContent = "LISTENING"
          }
        }
  
        if (this.elements.assistantInterface) {
          this.elements.assistantInterface.classList.add("listening")
          this.elements.assistantInterface.classList.remove("processing", "speaking")
  
          // Animate visualization bars when listening
          this.animateVisualization(true)
        }
      }
  
      this.state.recognition.onend = () => {
        this.debug("Speech recognition ended")
        this.state.isListening = false
  
        if (this.state.wakePhraseDetected) {
          // If wake phrase was detected but we're not processing or speaking,
          // go back to standby
          if (this.elements.assistantInterface) {
            if (
              !this.elements.assistantInterface.classList.contains("processing") &&
              !this.elements.assistantInterface.classList.contains("speaking")
            ) {
              this.updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
              this.elements.assistantInterface.classList.remove("listening", "processing", "speaking")
            }
          }
  
          // Reset wake phrase detection after a delay
          setTimeout(() => {
            this.state.wakePhraseDetected = false
  
            // Start listening again if not speaking
            if (this.elements.assistantInterface && !this.elements.assistantInterface.classList.contains("speaking")) {
              this.startListening()
            }
          }, 1000)
        } else {
          this.updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
          if (this.elements.micToggle) {
            this.elements.micToggle.classList.remove("active")
            const btnText = this.elements.micToggle.querySelector(".btn-text")
            if (btnText) {
              btnText.textContent = "ACTIVATE"
            }
          }
  
          if (this.elements.assistantInterface) {
            this.elements.assistantInterface.classList.remove("listening", "processing", "speaking")
  
            // Slow down visualization bars when not listening
            this.animateVisualization(false)
          }
        }
      }
  
      this.state.recognition.onresult = (event) => {
        const transcriptText = Array.from(event.results)
          .map((result) => result[0].transcript.toLowerCase())
          .join("")
  
        this.debug(`Speech recognized: "${transcriptText}"`)
  
        // Check for wake phrase
        if (transcriptText.includes(this.config.wakePhrase)) {
          this.state.wakePhraseDetected = true
          this.handleWakePhrase()
        }
  
        // If already activated, process the command
        if (this.state.wakePhraseDetected && !transcriptText.includes(this.config.wakePhrase)) {
          this.processCommand(transcriptText)
        }
      }
  
      this.state.recognition.onerror = (event) => {
        this.debug(`Speech recognition error: ${event.error}`, "error")
  
        // Don't show notification for aborted recognition (happens normally)
        if (event.error !== "aborted") {
          this.showNotification(`Recognition error: ${event.error}`, "error")
        }
  
        this.state.isListening = false
        this.updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
  
        if (this.elements.micToggle) {
          this.elements.micToggle.classList.remove("active")
          const btnText = this.elements.micToggle.querySelector(".btn-text")
          if (btnText) {
            btnText.textContent = "ACTIVATE"
          }
        }
  
        if (this.elements.assistantInterface) {
          this.elements.assistantInterface.classList.remove("listening", "processing", "speaking")
        }
      }
    },
  
    // Set up UI event listeners
    setupEventListeners: function () {
      this.debug("Setting up event listeners")
  
      // Mic toggle button
      if (this.elements.micToggle) {
        this.elements.micToggle.addEventListener("click", () => {
          this.debug("Mic toggle clicked, current state: " + (this.state.isListening ? "listening" : "not listening"))
          if (!this.state.isListening) {
            this.startListening()
          } else {
            this.stopListening()
          }
        })
        this.debug("Mic toggle button initialized")
      }
  
      // Clear transcript button
      if (this.elements.clearTranscriptBtn) {
        this.elements.clearTranscriptBtn.addEventListener("click", () => {
          this.debug("Clear transcript button clicked")
          if (this.elements.transcript) {
            this.elements.transcript.innerHTML = ""
            this.addToTranscript("SYSTEM", "Transcript cleared.")
            this.playSound("success")
          }
        })
        this.debug("Clear transcript button initialized")
      }
  
      // Settings button
      if (this.elements.settingsButton) {
        this.elements.settingsButton.addEventListener("click", () => {
          this.debug("Settings button clicked")
          // Toggle settings panel visibility if it exists
          const settingsPanel = document.querySelector(".settings-panel")
          if (settingsPanel) {
            settingsPanel.classList.toggle("show")
          } else {
            this.showNotification("Settings panel not implemented yet.")
          }
        })
        this.debug("Settings button initialized")
      }
  
      // Debug button
      if (this.elements.debugButton) {
        this.elements.debugButton.addEventListener("click", () => {
          this.debug("Debug button clicked")
          this.toggleDebugMode()
        })
        this.debug("Debug button initialized")
      }
  
      // Close debug panel button
      if (this.elements.closeDebug) {
        this.elements.closeDebug.addEventListener("click", () => {
          this.debug("Close debug button clicked")
          this.toggleDebugMode(false)
        })
        this.debug("Close debug button initialized")
      }
  
      this.debug("All event listeners set up successfully")
    },
  
    // Start listening for voice commands
    startListening: function () {
      this.debug("Attempting to start listening...")
  
      if (!this.state.recognition && !this.initSpeechRecognition()) {
        this.debug("Failed to initialize speech recognition", "error")
        this.showNotification("Speech recognition not available or failed to initialize.", "error")
        return
      }
  
      try {
        this.state.recognition.start()
        this.debug("Recognition started successfully")
      } catch (e) {
        this.debug("Recognition error: " + e.message, "error")
        this.showNotification("Failed to start voice recognition: " + e.message, "error")
  
        // Try to reinitialize
        setTimeout(() => {
          this.debug("Attempting to reinitialize speech recognition...")
          if (this.initSpeechRecognition()) {
            this.debug("Reinitialization successful")
          }
        }, 1000)
      }
    },
  
    // Stop listening for voice commands
    stopListening: function () {
      if (this.state.recognition) {
        try {
          this.state.recognition.stop()
          this.debug("Recognition stopped")
        } catch (e) {
          this.debug("Error stopping recognition: " + e.message, "error")
        }
      }
    },
  
    // Handle wake phrase detection
    handleWakePhrase: function () {
      this.debug("Wake phrase detected")
      this.addToTranscript("USER", "Hey Jarvis")
  
      // Stop current recognition to reset
      this.stopListening()
  
      // Play activation sound
      this.playSound("activation")
  
      // Respond to wake phrase
      setTimeout(() => {
        const responses = [
          "Yes, I'm here.",
          "How can I help you?",
          "At your service.",
          "I'm listening.",
          "What can I do for you?",
        ]
        const response = responses[Math.floor(Math.random() * responses.length)]
        this.speakText(response)
        this.addToTranscript("ASSISTANT", response)
      }, 500)
    },
  
    // Process voice command
    processCommand: function (command) {
      this.debug(`Processing command: "${command}"`)
  
      // Clear any existing timeouts
      clearTimeout(this.state.timeouts.processing)
      clearTimeout(this.state.timeouts.speaking)
  
      // Update status to processing
      this.updateStatus("PROCESSING", "Processing your request...")
      this.elements.assistantInterface.classList.add("processing")
      this.elements.assistantInterface.classList.remove("listening", "speaking")
  
      // Add user command to transcript
      this.addToTranscript("USER", command)
  
      // Play processing sound
      this.playSound("processing")
  
      // Process with a slight delay to show the UI change
      this.state.timeouts.processing = setTimeout(async () => {
        // Generate response based on command
        try {
          const response = await this.generateResponse(command)
  
          // Speak the response
          this.speakText(response)
  
          // Add assistant response to transcript
          this.addToTranscript("ASSISTANT", response)
  
          // Update status to speaking
          this.updateStatus("SPEAKING", "Speaking...")
          this.elements.assistantInterface.classList.add("speaking")
          this.elements.assistantInterface.classList.remove("listening", "processing")
  
          // After speaking, go back to listening
          this.state.timeouts.speaking = setTimeout(() => {
            if (this.state.wakePhraseDetected) {
              this.startListening()
            } else {
              this.updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
              this.elements.assistantInterface.classList.remove("listening", "processing", "speaking")
            }
          }, this.calculateSpeakingTime(response))
        } catch (error) {
          this.debug("Error generating response: " + error.message, "error")
          this.showNotification("Error processing your request. Please try again.", "error")
          this.updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
          this.elements.assistantInterface.classList.remove("listening", "processing", "speaking")
        }
      }, 1000)
    },
  
    // Generate response based on command
    generateResponse: async function (command) {
      this.debug(`Generating response for: "${command}"`)
      command = command.toLowerCase()
  
      // Basic command handling
      if (command.includes("what time is it") || command.includes("tell me the time")) {
        const now = new Date()
        return `The current time is ${now.toLocaleTimeString()}.`
      } else if (command.includes("what day is it") || command.includes("what is today")) {
        const now = new Date()
        return `Today is ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.`
      } else if (command.includes("who are you") || command.includes("what are you")) {
        return "I am J.A.R.V.I.S, Just A Rather Very Intelligent System. I'm an advanced AI assistant designed to help you with various tasks, answer questions, and control smart devices."
      } else if (command.includes("thank you") || command.includes("thanks")) {
        return "You're welcome. I'm here to assist whenever you need me."
      } else if (command.includes("weather") || command.includes("temperature") || command.includes("forecast")) {
        return "Currently it's 72°F with partly cloudy skies. The forecast shows a high of 78°F and a 20% chance of rain later today."
      } else if (command.includes("joke") || command.includes("tell me a joke")) {
        const jokes = [
          "Why don't scientists trust atoms? Because they make up everything!",
          "How does a quantum physicist enjoy life? By taking both paths!",
          "Why did the AI assistant go to art school? To learn how to draw its own conclusions!",
          "What do you call a computer that sings? A Dell!",
          "Why did the programmer quit his job? Because he didn't get arrays!",
          "I asked the AI assistant to tell me a joke about time travel. It said it already did tomorrow.",
        ]
        return jokes[Math.floor(Math.random() * jokes.length)]
      } else if (command.includes("hello") || command.includes("hi there")) {
        return "Hello! How can I assist you today?"
      } else if (command.includes("goodbye") || command.includes("bye")) {
        return "Goodbye! I'll be here when you need me."
      } else if (command.includes("system status") || command.includes("diagnostics")) {
        return "All systems are operating at optimal efficiency. CPU usage is at 12%, memory utilization at 34%, and network connectivity is stable."
      } else if (command.includes("tell me about") || command.includes("what is") || command.includes("who is")) {
        // Simulate knowledge database query
        return "Based on my knowledge database: " + this.simulateKnowledgeQuery(command)
      } else if (command.includes("play music") || command.includes("play some music")) {
        return "I've started playing your favorite playlist. Enjoy the music!"
      } else if (command.includes("volume up") || command.includes("increase volume")) {
        return "I've increased the volume to 80%."
      } else if (command.includes("volume down") || command.includes("decrease volume")) {
        return "I've decreased the volume to 40%."
      } else if (command.includes("set a timer") || command.includes("start a timer")) {
        const minutes = this.extractNumber(command) || 5
        return `I've set a timer for ${minutes} minutes.`
      } else if (command.includes("remind me")) {
        return "I've added that reminder to your schedule."
      } else if (command.includes("news") || command.includes("headlines")) {
        return "Today's top headlines: Scientists discover new quantum computing breakthrough. Global climate summit reaches historic agreement. SpaceX launches mission to Mars."
      } else {
        // For unknown commands, try to provide a helpful response
        return "I'm not sure how to respond to that specific request. You can ask me about the weather, news, set timers, play music, or ask general knowledge questions."
      }
    },
  
    // Simulate knowledge database query
    simulateKnowledgeQuery: (query) => {
      // Extract the subject from queries like "tell me about X" or "what is X"
      let subject = query
      if (query.includes("tell me about")) {
        subject = query.split("tell me about")[1].trim()
      } else if (query.includes("what is")) {
        subject = query.split("what is")[1].trim()
      } else if (query.includes("who is")) {
        subject = query.split("who is")[1].trim()
      }
  
      // Sample knowledge database responses
      const knowledgeResponses = {
        "quantum computing":
          "Quantum computing is a type of computation that harnesses quantum mechanical phenomena. It uses quantum bits or qubits which can exist in multiple states simultaneously, potentially allowing quantum computers to solve certain problems much faster than classical computers.",
        "artificial intelligence":
          "Artificial Intelligence (AI) refers to systems or machines that mimic human intelligence to perform tasks and can iteratively improve themselves based on the information they collect. AI manifests in various forms including virtual assistants, autonomous vehicles, and recommendation systems.",
        "climate change":
          "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels which increases heat-trapping greenhouse gas levels in Earth's atmosphere.",
        mars: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. It's often called the 'Red Planet' due to its reddish appearance, caused by iron oxide on its surface. Mars has two small moons, Phobos and Deimos, and features the largest volcano and canyon in the Solar System.",
        blockchain:
          "Blockchain is a distributed database or ledger shared among computer network nodes. It stores information electronically in digital format, maintaining a secure and decentralized record of transactions. It's best known for its crucial role in cryptocurrency systems for maintaining secure and decentralized records of transactions.",
        nanotechnology:
          "Nanotechnology involves manipulating matter on an atomic, molecular, and supramolecular scale. It encompasses science, engineering, and technology conducted at the nanoscale, which is about 1 to 100 nanometers. Nanotechnology has applications in medicine, electronics, biomaterials, energy production, and consumer products.",
      }
  
      // Check if we have information about the subject
      for (const [key, value] of Object.entries(knowledgeResponses)) {
        if (subject.includes(key)) {
          return value
        }
      }
  
      // Generic response for unknown subjects
      return `${subject} is a fascinating topic. While I don't have specific details in my current knowledge base, I recommend exploring reputable sources for the most accurate and up-to-date information.`
    },
  
    // Extract a number from a command string
    extractNumber: (command) => {
      const matches = command.match(/\d+/)
      return matches ? Number.parseInt(matches[0]) : null
    },
  
    // Speak text using speech synthesis
    speakText: function (text) {
      this.debug(`Speaking: "${text}"`)
  
      if (!this.state.synthesis) {
        this.debug("Speech synthesis not supported in this browser", "error")
        this.showNotification("Speech synthesis not supported in this browser.", "error")
        return
      }
  
      // Cancel any ongoing speech
      this.state.synthesis.cancel()
  
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = this.config.speechRate
      utterance.pitch = this.config.speechPitch
      utterance.volume = this.config.speechVolume
  
      // Get available voices and set a good one if available
      let voices = this.state.synthesis.getVoices()
      if (voices.length === 0) {
        // Voice list not loaded yet, wait and try again
        this.state.synthesis.onvoiceschanged = () => {
          voices = this.state.synthesis.getVoices()
          this.setVoice(utterance, voices)
        }
      } else {
        this.setVoice(utterance, voices)
      }
  
      // Stop listening while speaking to prevent feedback loop
      this.stopListening()
  
      // Mark as speaking
      this.state.isSpeaking = true
  
      // Handle speech end
      utterance.onend = () => {
        this.debug("Speech ended")
        this.state.isSpeaking = false
      }
  
      // Handle speech error
      utterance.onerror = (event) => {
        this.debug("Speech synthesis error: " + event.error, "error")
        this.state.isSpeaking = false
      }
  
      this.state.synthesis.speak(utterance)
    },
  
    // Set voice for speech synthesis
    setVoice: function (utterance, voices) {
      // Try to find a preferred voice
      for (const name of this.config.voicePreferences) {
        const voice = voices.find((v) => v.name.includes(name))
        if (voice) {
          utterance.voice = voice
          this.debug(`Using voice: ${voice.name}`)
          return
        }
      }
  
      // If no preferred voice found, try to use any English male voice
      const englishVoice = voices.find((v) => v.lang.includes("en") && v.name.includes("Male"))
      if (englishVoice) {
        utterance.voice = englishVoice
        this.debug(`Using fallback voice: ${englishVoice.name}`)
      } else {
        // Just use the first English voice available
        const anyEnglishVoice = voices.find((v) => v.lang.includes("en"))
        if (anyEnglishVoice) {
          utterance.voice = anyEnglishVoice
          this.debug(`Using any English voice: ${anyEnglishVoice.name}`)
        } else {
          this.debug("No suitable voice found, using default", "warning")
        }
      }
    },
  
    // Calculate approximate speaking time based on text length
    calculateSpeakingTime: (text) => {
      // Average speaking rate is about 150 words per minute
      // So each word takes about 400ms
      const words = text.split(" ").length
      return words * 400 + 1000 // Add 1 second buffer
    },
  
    // Play sound effects
    playSound: function (type) {
      this.debug(`Playing sound: ${type}`)
  
      let audio = null
      switch (type) {
        case "activation":
          audio = this.sounds.activation
          break
        case "processing":
          audio = this.sounds.processing
          break
        case "error":
          audio = this.sounds.error
          break
        case "success":
          audio = this.sounds.success
          break
        default:
          this.debug(`Unknown sound type: ${type}`, "warning")
          return
      }
  
      if (audio) {
        // Reset the audio to the beginning
        audio.currentTime = 0
  
        audio.play().catch((e) => {
          this.debug(`Error playing ${type} sound: ${e.message}`, "error")
        })
      } else {
        this.debug(`Sound not found: ${type}`, "warning")
      }
    },
  
    // Add message to transcript
    addToTranscript: function (sender, message) {
      this.debug(`Adding to transcript - ${sender}: ${message}`)
  
      if (!this.elements.transcript) {
        this.debug("Transcript element not found", "error")
        return
      }
  
      const line = document.createElement("div")
      line.className = `transcript-line ${sender.toLowerCase()}`
  
      const prefix = document.createElement("span")
      prefix.className = "line-prefix"
      prefix.textContent = `${sender}:`
  
      const text = document.createElement("span")
      text.className = "line-text"
      text.textContent = message
  
      line.appendChild(prefix)
      line.appendChild(text)
      this.elements.transcript.appendChild(line)
  
      // Scroll to bottom
      this.elements.transcript.scrollTop = this.elements.transcript.scrollHeight
    },
  
    // Update status display
    updateStatus: function (status, details) {
      this.debug(`Status update: ${status} - ${details}`)
  
      if (this.elements.statusText) {
        this.elements.statusText.textContent = status
      }
  
      if (this.elements.statusDetails) {
        this.elements.statusDetails.textContent = details
      }
  
      if (this.elements.statusDot) {
        // Change color based on status
        switch (status) {
          case "LISTENING":
            this.elements.statusDot.style.backgroundColor = "var(--secondary-color)"
            break
          case "PROCESSING":
            this.elements.statusDot.style.backgroundColor = "var(--warning-color)"
            break
          case "SPEAKING":
            this.elements.statusDot.style.backgroundColor = "var(--accent-color)"
            break
          case "BOOTING":
            this.elements.statusDot.style.backgroundColor = "var(--warning-color)"
            break
          default:
            this.elements.statusDot.style.backgroundColor = "var(--primary-color)"
        }
      }
    },
  
    // Update system status display
    updateSystemStatus: function (status) {
      if (this.elements.systemStatusEl) {
        this.elements.systemStatusEl.textContent = status
      }
    },
  
    // Update system memory display
    updateSystemMemory: function (value) {
      if (this.elements.systemMemoryEl) {
        this.elements.systemMemoryEl.textContent = value
      }
    },
  
    // Show notification
    showNotification: function (message, type = "info") {
      this.debug(`Notification (${type}): ${message}`)
  
      if (!this.elements.notification || !this.elements.notificationMessage) {
        this.debug("Notification elements not found", "error")
        return
      }
  
      // Clear any existing timeout
      clearTimeout(this.state.timeouts.notification)
  
      // Set message and show notification
      this.elements.notificationMessage.textContent = message
      this.elements.notification.className = "notification-area show " + type
  
      // Play sound based on notification type
      if (type === "error") {
        this.playSound("error")
      } else if (type === "success") {
        this.playSound("success")
      }
  
      // Hide after delay
      this.state.timeouts.notification = setTimeout(() => {
        this.elements.notification.classList.remove("show")
      }, this.config.notificationDuration)
    },
  
    // Toggle debug mode
    toggleDebugMode: function (force = null) {
      const newState = force !== null ? force : !this.state.debugMode
      this.state.debugMode = newState
  
      if (this.elements.debugPanel) {
        if (newState) {
          this.elements.debugPanel.classList.add("show")
        } else {
          this.elements.debugPanel.classList.remove("show")
        }
      }
  
      this.debug(`Debug mode ${newState ? "enabled" : "disabled"}`)
    },
  
    // Add debug message
    debug: function (message, level = "info") {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`[${level.toUpperCase()}] [${timestamp}] ${message}`)
  
      // Add to debug panel if it exists
      if (this.elements.debugContent) {
        const debugLine = document.createElement("div")
        debugLine.className = `debug-line ${level}`
        debugLine.innerHTML = `<span class="debug-time">[${timestamp}]</span> <span class="debug-level">[${level.toUpperCase()}]</span> <span class="debug-message">${message}</span>`
        this.elements.debugContent.appendChild(debugLine)
  
        // Scroll to bottom
        this.elements.debugContent.scrollTop = this.elements.debugContent.scrollHeight
      }
    },
  
    // Update time displays
    updateTime: function () {
      // Update current time
      if (this.elements.currentTimeEl) {
        const now = new Date()
        this.elements.currentTimeEl.textContent = now.toLocaleTimeString()
      }
  
      // Update system uptime
      if (this.elements.systemUptimeEl) {
        const uptime = new Date(new Date() - this.state.startTime)
        const hours = uptime.getUTCHours().toString().padStart(2, "0")
        const minutes = uptime.getUTCMinutes().toString().padStart(2, "0")
        const seconds = uptime.getUTCSeconds().toString().padStart(2, "0")
        this.elements.systemUptimeEl.textContent = `${hours}:${minutes}:${seconds}`
      }
  
      // Animate visualization bars
      this.animateVisualizationBars()
  
      requestAnimationFrame(() => this.updateTime())
    },
  
    // Animate visualization bars
    animateVisualization: function (active = true) {
      if (!this.elements.visualizationBars) return
  
      this.elements.visualizationBars.forEach((bar) => {
        if (bar) {
          bar.style.animationPlayState = "running"
          bar.style.animationDuration = active ? "0.5s" : "1.5s"
        }
      })
    },
  
    // Animate visualization bars based on audio input
    animateVisualizationBars: function () {
      if (!this.elements.visualizationBars || !this.state.audioAnalyser || !this.state.microphoneStream) return
  
      // Get frequency data
      const dataArray = new Uint8Array(this.state.audioAnalyser.frequencyBinCount)
      this.state.audioAnalyser.getByteFrequencyData(dataArray)
  
      // Update bar heights based on frequency data
      this.elements.visualizationBars.forEach((bar, index) => {
        if (bar && dataArray[index] !== undefined) {
          const height = (dataArray[index] / 255) * 40 * this.config.visualizationSensitivity
          bar.style.height = `${Math.max(5, height)}px`
        }
      })
    },
  
    // Connect microphone for visualization
    connectMicrophone: async function () {
      if (!this.state.audioContext || !this.state.audioAnalyser) return
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.state.microphoneStream = stream
        const source = this.state.audioContext.createMediaStreamSource(stream)
        source.connect(this.state.audioAnalyser)
        this.debug("Microphone connected for visualization")
      } catch (error) {
        this.debug("Error connecting microphone: " + error.message, "error")
      }
    },
  }
  
  // Initialize JARVIS when the DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    JARVIS.init()
  })
  
  