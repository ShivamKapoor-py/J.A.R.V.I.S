document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded")
    console.log("Checking for required elements:")
    console.log("- Assistant interface:", document.querySelector(".assistant-interface"))
    console.log("- Mic toggle button:", document.getElementById("mic-toggle"))
    console.log("- Clear transcript button:", document.getElementById("clear-transcript"))
  
    // DOM Elements
    const assistantInterface = document.querySelector(".assistant-interface")
    const statusDot = document.querySelector(".status-dot")
    const statusText = document.querySelector(".status-text")
    const statusDetails = document.querySelector(".status-details")
    const transcript = document.getElementById("transcript")
    const micToggle = document.getElementById("mic-toggle")
    const clearTranscriptBtn = document.getElementById("clear-transcript")
    const notification = document.getElementById("notification")
    const notificationMessage = document.querySelector(".notification-message")
    const currentTimeEl = document.getElementById("current-time")
    const systemUptimeEl = document.getElementById("system-uptime")
    const systemStatusEl = document.getElementById("system-status")
    const visualizationBars = document.querySelectorAll(".visualization-spectrum .bar")
  
    // State variables
    let isListening = false
    let wakePhraseDetected = false
    let recognition
    const speechSynthesis = window.speechSynthesis
    const startTime = new Date()
    let processingTimeout
    let speakingTimeout
  
    // Initialize speech recognition
    function initSpeechRecognition() {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        showNotification("Speech recognition not supported in this browser.")
        return false
      }
  
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = "en-US"
  
      recognition.onstart = () => {
        isListening = true
        updateStatus("LISTENING", "Listening for commands...")
  
        if (micToggle) {
          micToggle.classList.add("active")
          const btnText = micToggle.querySelector(".btn-text")
          if (btnText) {
            btnText.textContent = "LISTENING"
          }
        }
  
        if (assistantInterface) {
          assistantInterface.classList.add("listening")
          assistantInterface.classList.remove("processing", "speaking")
  
          // Animate visualization bars when listening
          visualizationBars.forEach((bar) => {
            if (bar) {
              bar.style.animationPlayState = "running"
              bar.style.animationDuration = "0.5s"
            }
          })
        } else {
          console.warn("Assistant interface element not found")
        }
      }
  
      recognition.onend = () => {
        isListening = false
  
        if (wakePhraseDetected) {
          // If wake phrase was detected but we're not processing or speaking,
          // go back to standby
          if (assistantInterface) {
            if (
              !assistantInterface.classList.contains("processing") &&
              !assistantInterface.classList.contains("speaking")
            ) {
              updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
              assistantInterface.classList.remove("listening", "processing", "speaking")
            }
          }
  
          // Reset wake phrase detection after a delay
          setTimeout(() => {
            wakePhraseDetected = false
  
            // Start listening again if not speaking
            if (assistantInterface && !assistantInterface.classList.contains("speaking")) {
              startListening()
            }
          }, 1000)
        } else {
          updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
          if (micToggle) {
            micToggle.classList.remove("active")
            const btnText = micToggle.querySelector(".btn-text")
            if (btnText) {
              btnText.textContent = "ACTIVATE"
            }
          }
  
          if (assistantInterface) {
            assistantInterface.classList.remove("listening", "processing", "speaking")
  
            // Slow down visualization bars when not listening
            visualizationBars.forEach((bar) => {
              if (bar) {
                bar.style.animationPlayState = "running"
                bar.style.animationDuration = "1.5s"
              }
            })
          }
        }
      }
  
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript.toLowerCase())
          .join("")
  
        // Check for wake phrase
        if (transcript.includes("hey jarvis") || transcript.includes("hey jarvis")) {
          wakePhraseDetected = true
          handleWakePhrase()
        }
  
        // If already activated, process the command
        if (wakePhraseDetected && !transcript.includes("hey jarvis")) {
          processCommand(transcript)
        }
      }
  
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        showNotification(`Recognition error: ${event.error}`)
  
        isListening = false
        updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
        micToggle.classList.remove("active")
        micToggle.querySelector(".btn-text").textContent = "ACTIVATE"
        assistantInterface.classList.remove("listening", "processing", "speaking")
      }
  
      return true
    }
  
    // Start listening for voice commands
    function startListening() {
      console.log("Attempting to start listening...")
  
      if (!recognition && !initSpeechRecognition()) {
        console.error("Failed to initialize speech recognition")
        showNotification("Speech recognition not available or failed to initialize.")
        return
      }
  
      try {
        recognition.start()
        console.log("Recognition started successfully")
      } catch (e) {
        console.error("Recognition error:", e)
        showNotification("Failed to start voice recognition: " + e.message)
  
        // Try to reinitialize
        setTimeout(() => {
          console.log("Attempting to reinitialize speech recognition...")
          if (initSpeechRecognition()) {
            console.log("Reinitialization successful")
          }
        }, 1000)
      }
    }
  
    // Stop listening for voice commands
    function stopListening() {
      if (recognition) {
        try {
          recognition.stop()
        } catch (e) {
          console.error("Error stopping recognition:", e)
        }
      }
    }
  
    // Handle wake phrase detection
    function handleWakePhrase() {
      addToTranscript("USER", "Hey Jarvis")
  
      // Stop current recognition to reset
      stopListening()
  
      // Play activation sound
      playSound("activation")
  
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
        speakText(response)
        addToTranscript("ASSISTANT", response)
      }, 500)
    }
  
    // Process voice command
    function processCommand(command) {
      // Clear any existing timeouts
      clearTimeout(processingTimeout)
      clearTimeout(speakingTimeout)
  
      // Update status to processing
      updateStatus("PROCESSING", "Processing your request...")
      assistantInterface.classList.add("processing")
      assistantInterface.classList.remove("listening", "speaking")
  
      // Add user command to transcript
      addToTranscript("USER", command)
  
      // Simulate processing time
      processingTimeout = setTimeout(() => {
        // Generate response based on command
        const response = generateResponse(command)
  
        // Speak the response
        speakText(response)
  
        // Add assistant response to transcript
        addToTranscript("ASSISTANT", response)
  
        // Update status to speaking
        updateStatus("SPEAKING", "Speaking...")
        assistantInterface.classList.add("speaking")
        assistantInterface.classList.remove("listening", "processing")
  
        // After speaking, go back to listening
        speakingTimeout = setTimeout(() => {
          if (wakePhraseDetected) {
            startListening()
          } else {
            updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
            assistantInterface.classList.remove("listening", "processing", "speaking")
          }
        }, calculateSpeakingTime(response))
      }, 1000)
    }
  
    // Generate response based on command
    function generateResponse(command) {
      command = command.toLowerCase()
  
      if (command.includes("what time is it") || command.includes("tell me the time")) {
        const now = new Date()
        return `The current time is ${now.toLocaleTimeString()}.`
      } else if (command.includes("what day is it") || command.includes("what is today")) {
        const now = new Date()
        return `Today is ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.`
      } else if (command.includes("who are you") || command.includes("what are you")) {
        return "I am J.A.R.V.I.S, Just A Rather Very Intelligent System. I'm designed to assist you with various tasks."
      } else if (command.includes("thank you") || command.includes("thanks")) {
        return "You're welcome. Is there anything else I can help you with?"
      } else if (command.includes("weather") || command.includes("temperature")) {
        return "I'm sorry, I don't have access to real-time weather data at the moment."
      } else if (command.includes("joke") || command.includes("tell me a joke")) {
        const jokes = [
          "Why don't scientists trust atoms? Because they make up everything!",
          "Why did the scarecrow win an award? Because he was outstanding in his field!",
          "I told my wife she was drawing her eyebrows too high. She looked surprised.",
          "What do you call a fake noodle? An impasta!",
          "How does a computer get drunk? It takes screenshots!",
        ]
        return jokes[Math.floor(Math.random() * jokes.length)]
      } else if (command.includes("hello") || command.includes("hi there")) {
        return "Hello! How can I assist you today?"
      } else if (command.includes("goodbye") || command.includes("bye")) {
        return "Goodbye! Call me when you need assistance."
      } else {
        return "I'm not sure how to respond to that. Is there something specific you'd like help with?"
      }
    }
  
    // Speak text using speech synthesis
    function speakText(text) {
      if (!speechSynthesis) {
        showNotification("Speech synthesis not supported in this browser.")
        return
      }
  
      // Cancel any ongoing speech
      speechSynthesis.cancel()
  
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
  
      // Get available voices and set a good one if available
      let voices = speechSynthesis.getVoices()
      if (voices.length === 0) {
        // Voice list not loaded yet, wait and try again
        speechSynthesis.onvoiceschanged = () => {
          voices = speechSynthesis.getVoices()
          setVoice()
        }
      } else {
        setVoice()
      }
  
      function setVoice() {
        // Try to find a good voice
        const preferredVoices = ["Google UK English Male", "Microsoft David - English (United States)", "Alex", "Daniel"]
  
        for (const name of preferredVoices) {
          const voice = voices.find((v) => v.name === name)
          if (voice) {
            utterance.voice = voice
            break
          }
        }
  
        // If no preferred voice found, try to use any English male voice
        if (!utterance.voice) {
          const englishVoice = voices.find((v) => v.lang.includes("en") && v.name.includes("Male"))
          if (englishVoice) {
            utterance.voice = englishVoice
          }
        }
  
        speechSynthesis.speak(utterance)
      }
  
      // Stop listening while speaking to prevent feedback loop
      stopListening()
    }
  
    // Calculate approximate speaking time based on text length
    function calculateSpeakingTime(text) {
      // Average speaking rate is about 150 words per minute
      // So each word takes about 400ms
      const words = text.split(" ").length
      return words * 400 + 1000 // Add 1 second buffer
    }
  
    // Play sound effects
    function playSound(type) {
      console.log(`Playing sound: ${type}`)
      const audio = new Audio()
  
      switch (type) {
        case "activation":
          audio.src =
            "data:audio/mp3;base64,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"
          break
        default:
          console.log(`Unknown sound type: ${type}`)
          return
      }
  
      audio.play().catch((e) => {
        console.error("Error playing sound:", e)
      })
    }
  
    // Add message to transcript
    function addToTranscript(sender, message) {
      if (!transcript) return
  
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
      transcript.appendChild(line)
  
      // Scroll to bottom
      transcript.scrollTop = transcript.scrollHeight
    }
  
    // Update status display
    function updateStatus(status, details) {
      console.log(`Status update: ${status} - ${details}`)
  
      if (statusText) {
        statusText.textContent = status
      } else {
        console.warn("Status text element not found")
      }
  
      if (statusDetails) {
        statusDetails.textContent = details
      } else {
        console.warn("Status details element not found")
      }
  
      if (statusDot) {
        // Change color based on status
        switch (status) {
          case "LISTENING":
            statusDot.style.backgroundColor = "var(--secondary-color)"
            break
          case "PROCESSING":
            statusDot.style.backgroundColor = "var(--warning-color)"
            break
          case "SPEAKING":
            statusDot.style.backgroundColor = "var(--accent-color)"
            break
          default:
            statusDot.style.backgroundColor = "var(--primary-color)"
        }
      } else {
        console.warn("Status dot element not found")
      }
    }
  
    // Show notification
    function showNotification(message) {
      console.log(`Notification: ${message}`)
  
      if (!notification || !notificationMessage) {
        console.warn("Notification elements not found")
        return
      }
  
      notificationMessage.textContent = message
      notification.classList.add("show")
  
      // Hide after 5 seconds
      setTimeout(() => {
        notification.classList.remove("show")
      }, 5000)
    }
  
    // Update time display
    function updateTime() {
      if (currentTimeEl) {
        const now = new Date()
        currentTimeEl.textContent = now.toLocaleTimeString()
      }
  
      if (systemUptimeEl) {
        const uptime = new Date(new Date() - startTime)
        const hours = uptime.getUTCHours().toString().padStart(2, "0")
        const minutes = uptime.getUTCMinutes().toString().padStart(2, "0")
        const seconds = uptime.getUTCSeconds().toString().padStart(2, "0")
        systemUptimeEl.textContent = `${hours}:${minutes}:${seconds}`
      }
  
      requestAnimationFrame(updateTime)
    }
  
    // Initialize
    function init() {
      console.log("Initializing J.A.R.V.I.S...")
  
      // Log element status
      console.log("micToggle element:", micToggle)
      console.log("clearTranscriptBtn element:", clearTranscriptBtn)
      console.log("transcript element:", transcript)
      console.log("assistantInterface element:", assistantInterface)
  
      // Start time updates
      updateTime()
  
      // Add system message to transcript
      if (transcript) {
        addToTranscript("SYSTEM", "J.A.R.V.I.S online and ready.")
      } else {
        console.error("Transcript element not found!")
      }
  
      // Set initial status
      updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
  
      // Set up event listeners
      if (micToggle) {
        micToggle.addEventListener("click", () => {
          console.log("Mic toggle clicked, current state:", isListening)
          if (!isListening) {
            startListening()
          } else {
            stopListening()
          }
        })
        console.log("Mic toggle button initialized")
      } else {
        console.error("Mic toggle button not found!")
      }
  
      if (clearTranscriptBtn) {
        clearTranscriptBtn.addEventListener("click", () => {
          console.log("Clear transcript button clicked")
          if (transcript) {
            transcript.innerHTML = ""
            addToTranscript("SYSTEM", "Transcript cleared.")
          }
        })
        console.log("Clear transcript button initialized")
      } else {
        console.error("Clear transcript button not found!")
      }
  
      // Initialize settings button if it exists
      const settingsButton = document.getElementById("settings-button")
      if (settingsButton) {
        settingsButton.addEventListener("click", () => {
          console.log("Settings button clicked")
          // Toggle settings panel visibility if it exists
          const settingsPanel = document.querySelector(".settings-panel")
          if (settingsPanel) {
            settingsPanel.classList.toggle("show")
          }
        })
        console.log("Settings button initialized")
      } else {
        console.log("Settings button not found (this may be normal if not implemented)")
      }
  
      // Try to initialize speech recognition
      if (!recognition) {
        const success = initSpeechRecognition()
        console.log("Speech recognition initialization:", success ? "successful" : "failed")
      }
    }
  
    // Start the application
    init()
  })
  
  // Add a window load event to double-check initialization
  window.addEventListener("load", () => {
    console.log("Window loaded - checking J.A.R.V.I.S initialization")
  
    // Check if key elements exist
    const elements = {
      assistantInterface: document.querySelector(".assistant-interface"),
      statusDot: document.querySelector(".status-dot"),
      statusText: document.querySelector(".status-text"),
      statusDetails: document.querySelector(".status-details"),
      transcript: document.getElementById("transcript"),
      micToggle: document.getElementById("mic-toggle"),
      clearTranscriptBtn: document.getElementById("clear-transcript"),
    }
  
    // Log missing elements
    let missingElements = false
    for (const [name, element] of Object.entries(elements)) {
      if (!element) {
        console.error(`Missing element: ${name}`)
        missingElements = true
      }
    }
  
    if (missingElements) {
      console.error("Some required elements are missing. J.A.R.V.I.S may not function correctly.")
    } else {
      console.log("All required elements found. J.A.R.V.I.S should be functioning correctly.")
    }
  })
  
  