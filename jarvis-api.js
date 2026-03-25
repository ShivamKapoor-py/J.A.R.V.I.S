// API Integration for J.A.R.V.I.S
document.addEventListener("DOMContentLoaded", () => {
    console.log("J.A.R.V.I.S API Integration loaded")
  
    // Google Search API Key (replace with your own if needed)
    const API_KEY = "YOUR_API_KEY"
    const SEARCH_ENGINE_ID = "YOUR_SEARCH_ENGINE_ID"
  
    // Enhanced response generator
    async function enhancedResponse(command) {
      console.log("Processing command with enhanced API:", command)
  
      // Basic command handling
      command = command.toLowerCase()
  
      // Check for specific commands first
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
      }
  
      // For other queries, try to use Google Search API
      try {
        // Check if the command is a question or search query
        if (
          command.includes("what") ||
          command.includes("how") ||
          command.includes("why") ||
          command.includes("when") ||
          command.includes("where") ||
          command.includes("search")
        ) {
          // Clean up the command for search
          let searchQuery = command
          if (searchQuery.includes("search for")) {
            searchQuery = searchQuery.replace("search for", "").trim()
          }
          if (searchQuery.includes("tell me about")) {
            searchQuery = searchQuery.replace("tell me about", "").trim()
          }
  
          // Use Google Search API
          const response = await fetchSearchResults(searchQuery)
          if (response) {
            return response
          }
        }
  
        // Weather specific handling
        if (command.includes("weather") || command.includes("temperature")) {
          return "The current temperature in your area is approximately 22°C (72°F) with partly cloudy conditions. Please note this is simulated data as I don't have access to real-time weather services."
        }
  
        // Default response if no specific handler
        return "I'm not sure how to respond to that. Is there something specific you'd like help with?"
      } catch (error) {
        console.error("Error in enhanced response:", error)
        return "I encountered an issue while processing your request. Please try again."
      }
    }
  
    // Function to fetch search results
    async function fetchSearchResults(query) {
      try {
        console.log("Fetching search results for:", query)
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${SEARCH_ENGINE_ID}`
  
        const response = await fetch(url)
        const data = await response.json()
  
        if (data.items && data.items.length > 0) {
          // Format the response nicely
          return `Based on what I found: ${data.items[0].snippet}`
        } else {
          return "I couldn't find specific information about that. Is there something else you'd like to know?"
        }
      } catch (error) {
        console.error("Search API error:", error)
        return "I'm having trouble accessing external information right now. Let me answer with what I know."
      }
    }
  
    // Override the original generateResponse function
    window.addEventListener("load", () => {
      // Wait for the main script to load
      setTimeout(() => {
        // Check if the original function exists
        if (typeof window.generateResponse === "function") {
          console.log("Original generateResponse function found, overriding with enhanced version")
  
          // Store the original function
          const originalGenerateResponse = window.generateResponse
  
          // Override with our enhanced version
          window.generateResponse = async (command) => {
            console.log("Enhanced generateResponse called with:", command)
  
            // Try to get an enhanced response
            try {
              return await enhancedResponse(command)
            } catch (error) {
              console.error("Error in enhanced response, falling back to original:", error)
              // Fall back to the original function if our enhanced version fails
              return originalGenerateResponse(command)
            }
          }
  
          // Also patch the processCommand function to handle async responses
          if (typeof window.processCommand === "function") {
            const originalProcessCommand = window.processCommand
  
            window.processCommand = (command) => {
              // Clear any existing timeouts
              clearTimeout(window.processingTimeout)
              clearTimeout(window.speakingTimeout)
  
              // Update status to processing
              window.updateStatus("PROCESSING", "Processing your request...")
              document.querySelector(".assistant-interface").classList.add("processing")
              document.querySelector(".assistant-interface").classList.remove("listening", "speaking")
  
              // Add user command to transcript
              window.addToTranscript("USER", command)
  
              // Process with a slight delay to show the UI change
              window.processingTimeout = setTimeout(async () => {
                // Generate response based on command (now async)
                const response = await window.generateResponse(command)
  
                // Speak the response
                window.speakText(response)
  
                // Add assistant response to transcript
                window.addToTranscript("ASSISTANT", response)
  
                // Update status to speaking
                window.updateStatus("SPEAKING", "Speaking...")
                document.querySelector(".assistant-interface").classList.add("speaking")
                document.querySelector(".assistant-interface").classList.remove("listening", "processing")
  
                // After speaking, go back to listening
                window.speakingTimeout = setTimeout(() => {
                  if (window.wakePhraseDetected) {
                    window.startListening()
                  } else {
                    window.updateStatus("STANDBY", 'Say "Hey Jarvis" to activate')
                    document.querySelector(".assistant-interface").classList.remove("listening", "processing", "speaking")
                  }
                }, window.calculateSpeakingTime(response))
              }, 1000)
            }
          }
        } else {
          console.error("Original generateResponse function not found")
        }
      }, 1000) // Wait 1 second for the main script to initialize
    })
  
    // Make functions globally available
    window.enhancedResponse = enhancedResponse
    window.fetchSearchResults = fetchSearchResults
  })
  
  