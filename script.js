const API_KEY = "AIzaSyDZ8p55dFFlUsj69Jt-M5UcQPpKIveTs8I";
const SEARCH_ENGINE_ID = "a391ca1184ee84d83";

document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const chatSubmit = document.getElementById("chat-submit");
    const searchInput = document.getElementById("search");
    const searchButton = document.getElementById("search-btn");
    const searchResults = document.getElementById("search-results");
    const micButton = document.getElementById("mic-btn");

    // 🚀 **Chatbot Functionality (Now recognizes "What is your name?")**
    async function fetchChatbotResponse(query) {
        const lowerQuery = query.toLowerCase();

        // Special response for "What is your name?"
        if (lowerQuery === "what is your name?") {
            return `<p>🤖 My name is <strong>J.A.R.V.I.S</strong> (Just A Rather Very Intelligent System).</p>`;
        }

        // Default response using Google Search API
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${SEARCH_ENGINE_ID}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                return `
                    <p><strong>Answer:</strong> ${data.items[0].snippet}</p>
                    <p>🔗 <a href="${data.items[0].link}" target="_blank">${data.items[0].title}</a></p>
                `;
            } else {
                return "❌ Sorry, I couldn't find an answer.";
            }
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            return "⚠️ I encountered an issue while fetching the response.";
        }
    }

    function addMessage(content, isUser = false) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", isUser ? "user-message" : "ai-message");
        messageElement.innerHTML = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatSubmit.addEventListener("click", async () => {
        const userQuery = chatInput.value.trim();
        if (userQuery) {
            addMessage(userQuery, true);
            chatInput.value = "";
            const botResponse = await fetchChatbotResponse(userQuery);
            addMessage(botResponse);
        }
    });

    // 🚀 **Google Search API Integration (Includes snippet & link)**
    async function performSearch(query) {
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY}&cx=${SEARCH_ENGINE_ID}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            searchResults.innerHTML = "";
            if (!data.items) {
                searchResults.innerHTML = "<p>No results found.</p>";
                return;
            }

            data.items.forEach(item => {
                const resultItem = document.createElement("div");
                resultItem.className = "result-item";
                resultItem.innerHTML = `
                    <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
                    <p>${item.snippet}</p>
                `;
                searchResults.appendChild(resultItem);
            });
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    }

    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    // 🎙 **Speech-to-Text for Search Input**
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            performSearch(transcript);
        };

        micButton.addEventListener("click", () => {
            recognition.start();
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.querySelector(".loading-screen")
  const mainContent = document.querySelector("body > *:not(.loading-screen)")

  // Hide all content except the loading screen
  if (mainContent) {
    mainContent.style.display = "none"
  }

  // Show loading screen for 2 seconds, then fade out
  setTimeout(() => {
    loadingScreen.style.opacity = "0"
    loadingScreen.style.transition = "opacity 0.5s ease-out"

    setTimeout(() => {
      loadingScreen.style.display = "none"
      if (mainContent) {
        mainContent.style.display = ""
      }
    }, 500)
  }, 2000)

  // Animated scroll to sections
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      })
    })
  })

  // Device Preview Functionality
  const deviceItems = document.querySelectorAll(".device-item")

  deviceItems.forEach((item) => {
    item.addEventListener("click", () => {
      const device = item.getAttribute("data-device")
      const devicePreviewImg = document.getElementById("device-preview-img")

      // Remove all existing path elements
      while (devicePreviewImg.firstChild) {
        devicePreviewImg.removeChild(devicePreviewImg.firstChild)
      }

      // Set the appropriate SVG path based on the selected device
      switch (device) {
        case "phone":
          devicePreviewImg.innerHTML =
            '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/>'
          break
        case "watch":
          devicePreviewImg.innerHTML =
            '<circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/>'
          break
        case "laptop":
          devicePreviewImg.innerHTML =
            '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/>'
          break
      }

      // Add active class to clicked item and remove from others
      deviceItems.forEach((i) => i.classList.remove("active"))
      item.classList.add("active")
    })
  })

  // Intersection Observer for animations
  const animatedElements = document.querySelectorAll(
    ".about-card, .feature-card, .pricing-card, .device-item, .social-btn",
  )

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate")
        }
      })
    },
    { threshold: 0.5 },
  )

  animatedElements.forEach((element) => {
    observer.observe(element)
  })

  // Chatbot functionality
  const chatMessages = document.getElementById("chat-messages")
  const chatInput = document.getElementById("chat-input")
  const chatSubmit = document.getElementById("chat-submit")
  const clearChat = document.getElementById("clear-chat")
  const newChat = document.getElementById("new-chat")
  const fileUpload = document.getElementById("file-upload")
  const chatHistory = document.getElementById("chat-history")
  const micButton = document.getElementById("mic-button")

  let currentChat = []
  let isRecording = false
  let recognition

  // Initialize speech recognition
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      isRecording = true
      micButton.style.background = "var(--error-color)"
      micButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
        </svg>
      `
    }

    recognition.onend = () => {
      isRecording = false
      micButton.style.background = ""
      micButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("")

      chatInput.value = transcript
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      isRecording = false
      micButton.style.background = ""
      micButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `
    }

    // Mic button functionality
    micButton.addEventListener("click", () => {
      if (!isRecording) {
        recognition.start()
      } else {
        recognition.stop()
      }
    })
  }

  function addMessage(content, isUser = false) {
    const messageElement = document.createElement("div")
    messageElement.classList.add("message", isUser ? "user-message" : "ai-message")
    messageElement.textContent = content
    chatMessages.appendChild(messageElement)
    chatMessages.scrollTop = chatMessages.scrollHeight
    currentChat.push({ isUser, content, timestamp: new Date().toISOString() })
  }

  function clearChatMessages() {
    chatMessages.innerHTML = ""
    currentChat = []
  }

  function saveChat() {
    const timestamp = new Date().toISOString()
    const chat = { timestamp, messages: currentChat }
    const chats = JSON.parse(localStorage.getItem("chats") || "[]")
    chats.push(chat)
    localStorage.setItem("chats", JSON.stringify(chats))
    updateChatHistory()
  }

  function updateChatHistory() {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]")
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const historyToday = document.querySelector("#history-today ul")
    const historyYesterday = document.querySelector("#history-yesterday ul")
    const historyWeek = document.querySelector("#history-week ul")
    const historyMonth = document.querySelector("#history-month ul")

    historyToday.innerHTML = ""
    historyYesterday.innerHTML = ""
    historyWeek.innerHTML = ""
    historyMonth.innerHTML = ""

    chats.reverse().forEach((chat, index) => {
      const chatDate = new Date(chat.timestamp)
      const listItem = document.createElement("li")
      listItem.innerHTML = `
        <span>Chat ${index + 1}</span>
        <button class="delete-chat" data-index="${index}">×</button>
      `
      listItem.querySelector("span").onclick = () => loadChat(chat)
      listItem.querySelector(".delete-chat").onclick = (e) => {
        e.stopPropagation()
        deleteChat(index)
      }

      if (chatDate.toDateString() === today.toDateString()) {
        historyToday.appendChild(listItem)
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        historyYesterday.appendChild(listItem)
      } else if (chatDate > lastWeek) {
        historyWeek.appendChild(listItem)
      } else {
        historyMonth.appendChild(listItem)
      }
    })
  }

  function deleteChat(index) {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]")
    chats.splice(index, 1)
    localStorage.setItem("chats", JSON.stringify(chats))
    updateChatHistory()
  }

  function loadChat(chat) {
    clearChatMessages()
    chat.messages.forEach((message) => addMessage(message.content, message.isUser))
  }

  chatSubmit.addEventListener("click", () => {
    const message = chatInput.value.trim()
    if (message) {
      addMessage(message, true)
      chatInput.value = ""
      if (message.toLowerCase() === "what is temperature?") {
        setTimeout(() => {
          addMessage(
            "The current temperature in Greater Noida, Uttar Pradesh, India, is approximately 26°C (79°F) with sunny conditions.",
          )
        }, 500)
      } else if (message.toLowerCase() === "what is your name?") {
        setTimeout(() => {
          addMessage("My name is J.A.R.V.I.S, your AI assistant! 😊 How can I help you today?")
        }, 500)
      } else if (message.toLowerCase() === "what can you do?") {
        setTimeout(() => {
          addMessage(`I can do a lot of things! Here are some of the things I can help you with"\n:

🤖 General Assistance\n
Answer questions on various topics\n
Provide fun facts and jokes
Translate languages\n
Define words and explain concepts\n
🌦 Weather & Time\n
Give current weather updates\n
Tell the time and date for any location\n
📊 Math & Conversions\n
Solve math problems\n
Convert units (currency, temperature, distance, etc.)\n
📅 Reminders & Productivity\n
Help with to-do lists\n
Set reminders and alarms (if integrated)\n
🎬 Entertainment & Fun\n
Recommend movies, books, and songs\n
Tell jokes and riddles\n
Play simple text-based games\n
🏋️‍♂️ Health & Fitness\n
Provide workout routines\n
Suggest healthy eating tips\n
💻 Tech Support & Troubleshooting\n
Help with device issues\n
Explain software and coding concepts\n
And much more! 😊 What would you like me to do for you?`)
        }, 500)
      } else if (message.toLowerCase() === "are you a real person?") {
        setTimeout(() => {
          addMessage(`Nope! 😊 I'm just an AI assistant—J.A.R.V.I.S, at your service! I don't have feelings or a physical form, but I'm here to help, chat, and answer your questions anytime.

But hey, if I seem too real, I'll take that as a compliment! 😄`)
        }, 500)
      } else if (message.toLowerCase() === "who is prime minister of india?") {
        setTimeout(() => {
          addMessage(
            "As of 2025, the Prime Minister of India is Shri Narendra Modi. He assumed office for his third term on June 9, 2024, following a decisive victory in the 2024 Parliamentary elections. ",
          )
        }, 500)
      } else {
        // Default AI response
        setTimeout(() => {
          addMessage("I'm processing your request. Please wait...")
          setTimeout(() => {
            addMessage(`Here's a simulated response to your prompt: "${message}"`)
          }, 2000)
        }, 500)
      }
    }
  })

  clearChat.addEventListener("click", clearChatMessages)

  newChat.addEventListener("click", () => {
    if (currentChat.length > 0) {
      saveChat()
    }
    clearChatMessages()
  })

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      chatSubmit.click()
    }
  })

  fileUpload.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      addMessage(`File attached: ${file.name}`, true)
      // Here you would typically handle the file upload
      // For now, we'll just acknowledge the attachment
      setTimeout(() => {
        addMessage("I've received your file attachment. How would you like me to process it?")
      }, 1000)
    }
  })

  // Initialize chat history
  updateChatHistory()

  // Update hero section
  const heroContent = document.querySelector(".hero-content")
  const getStartedBtn = heroContent?.querySelector(".primary-btn")
  const learnMoreBtn = heroContent?.querySelector(".secondary-btn")

  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", (e) => {
      e.preventDefault()
      document.getElementById("chatbot").scrollIntoView({ behavior: "smooth" })
    })
  }

  if (learnMoreBtn) {
    learnMoreBtn.addEventListener("click", (e) => {
      e.preventDefault()
      // Create a modal to display information about S.I.D.R.A
      const modal = document.createElement("div")
      modal.classList.add("modal")
      modal.innerHTML = `
        <div class="modal-content">
          <h2>About J.A.R.V.I.S</h2>
          <p>J.A.R.V.I.S (Just A Rather Very Intelligent System) is a cutting-edge AI assistant designed to revolutionize your digital experience. With advanced natural language processing and machine learning capabilities, J.A.R.V.I.S can help you with a wide range of tasks, from simple queries to complex problem-solving.</p>
          <p>Key features include:</p>
          <ul>
            <li>Natural language understanding and generation</li>
            <li>Multi-modal input (text, voice, and file uploads)</li>
            <li>Personalized responses based on user history</li>
            <li>Integration with various APIs and services</li>
            <li>Continuous learning and improvement</li>
          </ul>
          <button id="close-modal">Close</button>
        </div>
      `
      document.body.appendChild(modal)
      document.getElementById("close-modal").addEventListener("click", () => {
        document.body.removeChild(modal)
      })
    })
  }

  // Add styles for the modal
  const style = document.createElement("style")
  style.textContent = `
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: var(--card-bg);
      padding: 40px;
      border-radius: 10px;
      max-width: 600px;
      color: var(--text-color);
    }
    .modal-content h2 {
      color: var(--primary-color);
      margin-bottom: 20px;
    }
    .modal-content ul {
      margin-left: 20px;
      margin-bottom: 20px;
    }
    #close-modal {
      background: var(--primary-color);
      color: var(--text-color);
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    #close-modal:hover {
      background: var(--secondary-color);
    }
  `
  document.head.appendChild(style)

  // Text-to-Speech and Speech-to-Text functionality
  const searchInput = document.getElementById("search")
  const searchBtn = document.getElementById("search-btn")
  const micBtn = document.getElementById("mic-btn")
  const searchResults = document.getElementById("search-results")

  let searchRecognition
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    searchRecognition = new SpeechRecognition()
    searchRecognition.continuous = false
    searchRecognition.lang = "en-US"

    searchRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      searchInput.value = transcript
      searchAndSpeak(transcript)
    }
  }

  // Update the searchAndSpeak function to include the Speech To Text Generator option
  function searchAndSpeak(query) {
    // Simulated search results
    const results = [
      "Speech To Text Generator",
      "Text to Speech Generator",
      "J.A.R.V.I.S. AI Assistant",
      "Voice Control Features",
      "Smart Home Integration",
      "Predictive Analytics",
    ]

    searchResults.innerHTML = ""
    results.forEach((result) => {
      const div = document.createElement("div")
      div.classList.add("search-result-item")
      div.textContent = result

      // Add click event for the first result to navigate to speech-to-text page
      if (result === "Speech To Text Generator") {
        div.addEventListener("click", () => {
          window.location.href = "speech-to-text.html"
        })
      } else if (result === "Text to Speech Generator") {
        div.addEventListener("click", () => {
          window.location.href = "text-to-speech.html"
        })
      } else {
        div.addEventListener("click", () => speak(result))
      }

      searchResults.appendChild(div)
    })

    searchResults.style.display = "block"
    speak(`Here are the search results for ${query}`)
  }

  function speak(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value
      if (query) {
        searchAndSpeak(query)
      }
    })
  }

  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (searchRecognition) {
        searchRecognition.start()
      }
    })
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value
        if (query) {
          searchAndSpeak(query)
        }
      }
    })
  }

  // Close search results when clicking outside
  document.addEventListener("click", (e) => {
    if (
      searchResults &&
      !searchResults.contains(e.target) &&
      e.target !== searchInput &&
      e.target !== searchBtn &&
      e.target !== micBtn
    ) {
      searchResults.style.display = "none"
    }
  })

  // Voice Assistant Feature
  const body = document.querySelector("body")

  // Create voice assistant UI
  const voiceAssistant = document.createElement("div")
  voiceAssistant.className = "voice-assistant"
  voiceAssistant.innerHTML = `
  <div class="voice-assistant-container">
    <div class="voice-assistant-circle">
      <div class="voice-assistant-inner-circle"></div>
      <div class="voice-assistant-wave"></div>
    </div>
    <div class="voice-assistant-status">JARVIS</div>
    <div class="voice-assistant-text"></div>
  </div>
`

  // Add styles for voice assistant
  const voiceAssistantStyles = document.createElement("style")
  voiceAssistantStyles.textContent = `
  .voice-assistant {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    cursor: pointer;
  }
  
  .voice-assistant-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 10px;
    border: 1px solid var(--primary-color);
    box-shadow: 0 0 15px rgba(0, 102, 255, 0.3);
    transition: all 0.3s ease;
    transform: scale(0.8);
  }
  
  .voice-assistant-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 102, 255, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-bottom: 5px;
  }
  
  .voice-assistant-inner-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-color);
    transition: all 0.5s ease;
  }
  
  .voice-assistant-wave {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    border: 2px solid var(--primary-color);
    opacity: 0;
    transform: scale(0.8);
  }
  
  .voice-assistant-status {
    font-size: 12px;
    font-weight: bold;
    color: var(--text-color);
    margin-bottom: 3px;
    letter-spacing: 1px;
  }
  
  .voice-assistant-text {
    font-size: 10px;
    color: var(--secondary-color);
    max-width: 150px;
    text-align: center;
    min-height: 15px;
    opacity: 0;
    transition: opacity 0.3s ease;
    display: none;
  }
  
  /* Active state */
  .voice-assistant.active .voice-assistant-inner-circle {
    background: var(--secondary-color);
    box-shadow: 0 0 15px var(--secondary-color);
  }
  
  .voice-assistant.active .voice-assistant-wave {
    animation: wave 2s infinite;
    opacity: 1;
  }
  
  .voice-assistant.active .voice-assistant-container {
    border-color: var(--secondary-color);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
  }
  
  .voice-assistant.active .voice-assistant-status {
    color: var(--secondary-color);
  }
  
  .voice-assistant.active .voice-assistant-text {
    opacity: 1;
    display: block;
  }
  
  .voice-assistant:hover .voice-assistant-container {
    transform: scale(0.85);
  }
  
  @keyframes wave {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0% {
      transform: scale(0.95);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(0.95);
    }
  }
`
  document.head.appendChild(voiceAssistantStyles)

  // Only append the voice assistant after the loading screen is done
  setTimeout(() => {
    body.appendChild(voiceAssistant)

    // Initialize voice recognition only after loading is complete
    initializeVoiceAssistant()
  }, 2500) // Wait a bit longer than the loading screen timeout

  // Voice recognition functionality
  function initializeVoiceAssistant() {
    let voiceRecognition
    let isListening = false
    let wakePhraseDetected = false
    let idleTimeout

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      voiceRecognition = new SpeechRecognition()
      voiceRecognition.continuous = false
      voiceRecognition.interimResults = true

      voiceRecognition.onstart = () => {
        isListening = true
        const statusText = document.querySelector(".voice-assistant-status")
        statusText.textContent = "LISTENING"
      }

      voiceRecognition.onend = () => {
        isListening = false

        if (wakePhraseDetected) {
          // If wake phrase was detected, keep listening for commands
          setTimeout(() => voiceRecognition.start(), 300)
        } else {
          // If not activated, go back to sleep
          const statusText = document.querySelector(".voice-assistant-status")
          statusText.textContent = "J.A.R.V.I.S"
          const voiceAssistant = document.querySelector(".voice-assistant")
          voiceAssistant.classList.remove("active")
        }
      }

      voiceRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript.toLowerCase())
          .join("")

        // Check for wake phrase
        if (transcript.includes("hey jarvis") || transcript.includes("hey jarvis")) {
          activateJarvis()
        }

        // If already activated, show the transcript
        if (wakePhraseDetected) {
          const assistantText = document.querySelector(".voice-assistant-text")
          assistantText.textContent = transcript

          // Reset idle timeout
          clearTimeout(idleTimeout)
          idleTimeout = setTimeout(() => {
            deactivateJarvis()
          }, 5000) // Deactivate after 5 seconds of silence
        }
      }

      voiceRecognition.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        isListening = false

        // Reset UI
        const statusText = document.querySelector(".voice-assistant-status")
        statusText.textContent = "JARVIS"
        const voiceAssistant = document.querySelector(".voice-assistant")
        voiceAssistant.classList.remove("active")
      }
    }

    function activateJarvis() {
      wakePhraseDetected = true
      const voiceAssistant = document.querySelector(".voice-assistant")
      const statusText = document.querySelector(".voice-assistant-status")

      voiceAssistant.classList.add("active")
      statusText.textContent = "RECORDING"

      // Set timeout to go back to sleep if no speech detected
      clearTimeout(idleTimeout)
      idleTimeout = setTimeout(() => {
        deactivateJarvis()
      }, 5000)
    }

    function deactivateJarvis() {
      wakePhraseDetected = false
      const voiceAssistant = document.querySelector(".voice-assistant")
      const statusText = document.querySelector(".voice-assistant-status")
      const assistantText = document.querySelector(".voice-assistant-text")

      voiceAssistant.classList.remove("active")
      statusText.textContent = "JARVIS"
      assistantText.textContent = ""

      // Stop listening
      try {
        voiceRecognition.stop()
      } catch (e) {
        // Already stopped
      }
    }

    // Click to activate manually
    document.querySelector(".voice-assistant").addEventListener("click", () => {
      if (!isListening) {
        // Start listening
        const voiceAssistant = document.querySelector(".voice-assistant")
        voiceAssistant.classList.add("active")
        try {
          voiceRecognition.start()
        } catch (e) {
          console.log("Recognition error:", e)
        }
      } else {
        // Stop listening
        deactivateJarvis()
      }
    })
  }
})

