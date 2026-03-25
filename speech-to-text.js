document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.querySelector(".loading-screen")
  const mainContent = document.querySelector("body > *:not(.loading-screen)")
  const startRecordingBtn = document.getElementById("start-recording-btn")
  const playBtn = document.getElementById("play-btn")
  const downloadBtn = document.getElementById("download-btn")
  const copyBtn = document.getElementById("copy-btn")
  const inputLanguage = document.getElementById("input-language")
  const outputLanguage = document.getElementById("output-language")
  const maleVoice = document.getElementById("male-voice")
  const femaleVoice = document.getElementById("female-voice")
  const visualizerBars = document.querySelectorAll(".visualizer-bar")
  const visualizerTime = document.querySelector(".visualizer-time")
  const sttResult = document.getElementById("stt-result")
  const historyList = document.querySelector(".history-list")

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

  // Speech recognition variables
  let recognition
  let isRecording = false
  let recordingStartTime
  let recordingInterval
  let currentTranscript = ""
  let originalLanguage = "" // To store detected language
  let audioContext = null
  let analyser = null
  let dataArray = null
  let mediaRecorder = null
  let audioChunks = []
  let audioBlob = null
  let audioUrl = null
  let animationInterval
  let ttsText

  // Create audio context for visualization
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) {
    console.error("Web Audio API is not supported in this browser")
  }

  // Initialize speech synthesis
  const synth = window.speechSynthesis
  let voices = []

  // Voice gender classification patterns
  const femalePatterns = [
    /female/i,
    /femenina/i,
    /femme/i,
    /weiblich/i,
    /donna/i,
    /mujer/i,
    /mulher/i,
    /женский/i,
    /女性/i,
    /여성/i,
    /女/i,
    /\bfem\b/i,
    /\bwoman\b/i,
    /\bwomen\b/i,
    /\bgirl\b/i,
    /\bfemale\b/i,
    /\bfemale voice\b/i,
    /\bfeminine\b/i,
  ]

  const malePatterns = [
    /\bmale\b/i,
    /\bman\b/i,
    /\bmen\b/i,
    /masculin/i,
    /männlich/i,
    /uomo/i,
    /hombre/i,
    /homem/i,
    /мужской/i,
    /男性/i,
    /남성/i,
    /男/i,
    /\bmasc\b/i,
    /\bboy\b/i,
    /\bmale voice\b/i,
    /\bmasculine\b/i,
  ]

  // Add specific voice name patterns for common voice providers
  const knownFemaleVoices = [
    /\bzira\b/i,
    /\belsa\b/i,
    /\bhazel\b/i,
    /\bheera\b/i,
    /\bpaulina\b/i,
    /\bsabina\b/i,
    /\btracy\b/i,
    /\byasmeen\b/i,
    /\balice\b/i,
    /\bjoanna\b/i,
    /\bkendra\b/i,
    /\bsalli\b/i,
    /\bamy\b/i,
    /\bnicole\b/i,
    /\bsamantha\b/i,
    /\bvictoria\b/i,
    /\bivona\b/i,
    /\bjoana\b/i,
    /\blotte\b/i,
    /\bnathalie\b/i,
    /\bpenelope\b/i,
    /\bveena\b/i,
    /\bceline\b/i,
    /\blea\b/i,
    /\bcarla\b/i,
    /\bines\b/i,
    /\blisa\b/i,
    /\bmozilla-tts-female\b/i,
  ]

  const knownMaleVoices = [
    /\bdavid\b/i,
    /\bmark\b/i,
    /\bgeorge\b/i,
    /\bravi\b/i,
    /\bpablo\b/i,
    /\bstefan\b/i,
    /\brichard\b/i,
    /\bbrian\b/i,
    /\bmatthew\b/i,
    /\bjustin\b/i,
    /\bjoey\b/i,
    /\brussell\b/i,
    /\bhans\b/i,
    /\bjan\b/i,
    /\bkristian\b/i,
    /\bmiguel\b/i,
    /\benrique\b/i,
    /\bchristoph\b/i,
    /\bhenri\b/i,
    /\bsergio\b/i,
    /\bthomas\b/i,
    /\bmozilla-tts-male\b/i,
  ]

  // Language name mapping for better display
  const languageNames = {
    en: "English",
    es: "Spanish (Español)",
    fr: "French (Français)",
    de: "German (Deutsch)",
    it: "Italian (Italiano)",
    ja: "Japanese (日本語)",
    ko: "Korean (한국어)",
    zh: "Chinese (中文)",
    ru: "Russian (Русский)",
    ar: "Arabic (العربية)",
    hi: "Hindi (हिन्दी)",
    pt: "Portuguese (Português)",
    nl: "Dutch (Nederlands)",
    pl: "Polish (Polski)",
    tr: "Turkish (Türkçe)",
    sv: "Swedish (Svenska)",
    fi: "Finnish (Suomi)",
    da: "Danish (Dansk)",
    no: "Norwegian (Norsk)",
    cs: "Czech (Čeština)",
    hu: "Hungarian (Magyar)",
    el: "Greek (Ελληνικά)",
    he: "Hebrew (עברית)",
    th: "Thai (ไทย)",
    vi: "Vietnamese (Tiếng Việt)",
    id: "Indonesian (Bahasa Indonesia)",
    ms: "Malay (Bahasa Melayu)",
    ro: "Romanian (Română)",
    sk: "Slovak (Slovenčina)",
    uk: "Ukrainian (Українська)",
    ca: "Catalan (Català)",
    bg: "Bulgarian (Български)",
    hr: "Croatian (Hrvatski)",
    sr: "Serbian (Српски)",
    sl: "Slovenian (Slovenščina)",
    et: "Estonian (Eesti)",
    lv: "Latvian (Latviešu)",
    lt: "Lithuanian (Lietuvių)",
  }

  // Populate voices when available
  function populateVoices() {
    voices = synth.getVoices()

    // Group voices by language
    const voicesByLanguage = {}

    voices.forEach((voice) => {
      // Extract language code (e.g., 'en-US' -> 'en')
      const langCode = voice.lang.split("-")[0]

      if (!voicesByLanguage[langCode]) {
        voicesByLanguage[langCode] = {
          male: [],
          female: [],
          unknown: [],
        }
      }

      // Classify voice by gender
      let gender = "unknown"

      // Check if voice name contains female indicators
      if (
        femalePatterns.some((pattern) => pattern.test(voice.name)) ||
        knownFemaleVoices.some((pattern) => pattern.test(voice.name))
      ) {
        gender = "female"
      }
      // Check if voice name contains male indicators
      else if (
        malePatterns.some((pattern) => pattern.test(voice.name)) ||
        knownMaleVoices.some((pattern) => pattern.test(voice.name))
      ) {
        gender = "male"
      }
      // Default classification based on voice name
      else if (voice.name.includes("Google") && voice.name.includes("Female")) {
        gender = "female"
      } else if (voice.name.includes("Google") && voice.name.includes("Male")) {
        gender = "male"
      } else if (voice.name.includes("Microsoft")) {
        // For Microsoft voices without clear gender indicators in the name
        if (voice.name.includes("Female") || voice.name.includes("F ")) {
          gender = "female"
        } else if (voice.name.includes("Male") || voice.name.includes("M ")) {
          gender = "male"
        }
      }

      // Add voice to appropriate gender category
      voicesByLanguage[langCode][gender].push(voice)
    })

    // Update language options in the select elements
    updateLanguageOptions(voicesByLanguage)
  }

  // Update language options in the select elements
  function updateLanguageOptions(voicesByLanguage) {
    // Clear existing options except the first one
    while (inputLanguage.options.length > 1) {
      inputLanguage.remove(1)
    }

    while (outputLanguage.options.length > 0) {
      outputLanguage.remove(0)
    }

    // Add language options based on available voices
    const languageCodes = Object.keys(voicesByLanguage)

    // Add options to input language select
    inputLanguage.add(new Option("Auto Detect", "auto"))

    // Sort languages alphabetically by their display name
    const sortedLanguages = languageCodes
      .map((code) => ({
        code,
        name: languageNames[code] || code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    // Add options to both selects
    sortedLanguages.forEach((lang) => {
      const { code, name } = lang

      // Get all voices for this language
      const allVoices = [
        ...voicesByLanguage[code].male,
        ...voicesByLanguage[code].female,
        ...voicesByLanguage[code].unknown,
      ]

      if (allVoices.length > 0) {
        const fullCode = allVoices[0].lang // Use the first voice's full language code

        if (code !== "auto") {
          inputLanguage.add(new Option(name, fullCode))
        }

        outputLanguage.add(new Option(name, fullCode))
      }
    })

    // Set default output language to English if available
    const englishVoices = voicesByLanguage["en"]
    if (
      englishVoices &&
      (englishVoices.male.length > 0 || englishVoices.female.length > 0 || englishVoices.unknown.length > 0)
    ) {
      const allEnglishVoices = [...englishVoices.male, ...englishVoices.female, ...englishVoices.unknown]
      if (allEnglishVoices.length > 0) {
        outputLanguage.value = allEnglishVoices[0].lang
      }
    }
  }

  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoices
  }

  // Initial population of voices
  populateVoices()

  // Fallback for browsers that don't trigger onvoiceschanged
  setTimeout(() => {
    if (voices.length === 0) {
      voices = synth.getVoices()
      if (voices.length > 0) {
        populateVoices()
      }
    }
  }, 1000)

  // Initialize speech recognition if available
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true

    // Enable language detection
    if (recognition.lang) {
      recognition.lang = "auto" // Try to auto-detect language if supported
    }
  } else {
    // Speech recognition not supported
    startRecordingBtn.disabled = true
    showNotification("Speech recognition is not supported in your browser.", "error")
  }

  // Start/stop recording
  startRecordingBtn.addEventListener("click", () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  })

  // Play transcribed text
  playBtn.addEventListener("click", () => {
    if (currentTranscript) {
      speakText(currentTranscript)
    }
  })

  // Download transcription
  downloadBtn.addEventListener("click", () => {
    if (currentTranscript) {
      downloadTranscription()
    }
  })

  // Copy transcription to clipboard
  copyBtn.addEventListener("click", () => {
    if (currentTranscript) {
      copyToClipboard()
    }
  })

  // Start recording function with enhanced capabilities
  function startRecording() {
    if (!recognition) return

    // Clear previous results
    currentTranscript = ""
    sttResult.innerHTML = '<div class="stt-placeholder">Listening...</div>'
    audioChunks = []

    // Set recognition language if not auto
    if (inputLanguage.value !== "auto") {
      recognition.lang = inputLanguage.value
    }

    // Set up recognition event handlers
    recognition.onstart = () => {
      isRecording = true
      startRecordingBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
        Stop Recording
      `
      startRecordingBtn.classList.remove("primary")
      startRecordingBtn.style.background = "var(--error-color)"

      // Start visualizer animation
      startVisualizer()

      // Record start time
      recordingStartTime = Date.now()

      // Update timer
      recordingInterval = setInterval(updateRecordingTime, 1000)

      // Start audio recording for playback
      startAudioRecording()
    }

    recognition.onresult = (event) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        // Store detected language if available
        if (event.results[i].length > 0 && event.results[i][0].lang) {
          originalLanguage = event.results[i][0].lang
        }

        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Update current transcript
      if (finalTranscript) {
        currentTranscript = finalTranscript
      }

      // Display transcript with language detection info
      let langInfo = ""
      if (originalLanguage) {
        const langCode = originalLanguage.split("-")[0]
        const langName = languageNames[langCode] || langCode
        langInfo = `<div class="detected-language">Detected language: ${langName}</div>`
      }

      sttResult.innerHTML = `
        ${langInfo}
        <div>${finalTranscript}</div>
        <div style="opacity: 0.7; font-style: italic;">${interimTranscript}</div>
      `

      // Enable buttons if we have content
      if (currentTranscript || interimTranscript) {
        playBtn.disabled = false
        downloadBtn.disabled = false
        copyBtn.disabled = false
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      stopRecording()
      showNotification(`Error: ${event.error}`, "error")
    }

    recognition.onend = () => {
      // If we're still in recording state, restart recognition
      // (this can happen if recognition stops unexpectedly)
      if (isRecording) {
        recognition.start()
      }
    }

    // Start recognition
    try {
      recognition.start()
    } catch (error) {
      console.error("Recognition start error:", error)
      showNotification("Failed to start speech recognition.", "error")
    }
  }

  // Start audio recording for playback
  function startAudioRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Media devices API not supported")
      return
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Create media recorder
        mediaRecorder = new MediaRecorder(stream)

        // Set up audio context for visualization
        if (audioContext) {
          const source = audioContext.createMediaStreamSource(stream)
          analyser = audioContext.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)

          const bufferLength = analyser.frequencyBinCount
          dataArray = new Uint8Array(bufferLength)
        }

        // Collect audio chunks
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data)
          }
        }

        // When recording stops
        mediaRecorder.onstop = () => {
          // Create audio blob
          audioBlob = new Blob(audioChunks, { type: "audio/wav" })
          audioUrl = URL.createObjectURL(audioBlob)

          // Enable playback button
          playBtn.disabled = false
        }

        // Start recording
        mediaRecorder.start()
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error)
        showNotification("Error accessing microphone. Please check permissions.", "error")
      })
  }

  // Stop recording function
  function stopRecording() {
    if (!recognition) return

    isRecording = false

    // Stop recognition
    recognition.stop()

    // Stop media recorder if active
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
    }

    // Update UI
    startRecordingBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
      Start Recording
    `
    startRecordingBtn.classList.add("primary")
    startRecordingBtn.style.background = ""

    // Stop visualizer animation
    stopVisualizer()

    // Clear recording interval
    clearInterval(recordingInterval)

    // If we have a transcript, add to history and translate if needed
    if (currentTranscript) {
      // If input and output languages are different, translate
      if (outputLanguage.value !== inputLanguage.value && outputLanguage.value !== "auto") {
        translateTranscript()
      } else {
        // Add to history without translation
        addToHistory(currentTranscript)
        showNotification("Transcription complete!", "success")
      }
    } else {
      sttResult.innerHTML = '<div class="stt-placeholder">Your transcription will appear here...</div>'
    }
  }

  // Translate transcript to selected output language
  function translateTranscript() {
    // Show translation in progress
    sttResult.innerHTML = '<div class="stt-placeholder">Translating...</div>'

    // In a real app, you would call a translation API here
    // For demo purposes, we'll simulate a delay and translation
    setTimeout(() => {
      const originalText = currentTranscript
      const targetLang = outputLanguage.value

      // Improved translation simulation for demo purposes
      const translatedText = simulateTranslation(originalText, originalLanguage || "auto", targetLang)

      // Update the result with both original and translated text
      const sourceLangCode = originalLanguage ? originalLanguage.split("-")[0] : "auto"
      const targetLangCode = targetLang.split("-")[0]

      const sourceLangName = languageNames[sourceLangCode] || sourceLangCode
      const targetLangName = languageNames[targetLangCode] || targetLangCode

      sttResult.innerHTML = `
        <div class="translation-result">
          <div class="original-text">
            <h4>Original (${sourceLangName})</h4>
            <p>${originalText}</p>
          </div>
          <div class="translated-text">
            <h4>Translated (${targetLangName})</h4>
            <p>${translatedText}</p>
          </div>
        </div>
      `

      // Update current transcript to translated version
      currentTranscript = translatedText

      // Add to history
      addToHistory(translatedText)

      // Show success notification
      showNotification(`Translation complete to ${targetLangName}!`, "success")
    }, 1500)
  }

  // Improved translation simulation for demo purposes
  function simulateTranslation(text, sourceLang, targetLang) {
    // In a real app, you would call a translation API here
    // This is just a simple simulation for demo purposes

    // Get language codes without region
    const sourceCode = sourceLang.split("-")[0]
    const targetCode = targetLang.split("-")[0]

    // If translating to the same language, return the original text
    if (sourceCode === targetCode) {
      return text
    }

    // Create a more realistic "translation" based on the target language
    let translatedText = ""

    // Common phrases in different languages for more realistic simulation
    const greetings = {
      es: "¡Hola!",
      fr: "Bonjour!",
      de: "Hallo!",
      it: "Ciao!",
      ja: "こんにちは！",
      zh: "你好！",
      ru: "Привет!",
      ar: "مرحبا!",
      hi: "नमस्ते!",
      pt: "Olá!",
      nl: "Hallo!",
      pl: "Cześć!",
      tr: "Merhaba!",
      sv: "Hej!",
      fi: "Hei!",
      da: "Hej!",
      no: "Hei!",
      cs: "Ahoj!",
      hu: "Szia!",
      el: "Γεια σας!",
      he: "שלום!",
      th: "สวัสดี!",
      vi: "Xin chào!",
      id: "Halo!",
      ms: "Hai!",
      ro: "Salut!",
      sk: "Ahoj!",
      uk: "Привіт!",
      ca: "Hola!",
      bg: "Здравейте!",
      hr: "Bok!",
      sr: "Здраво!",
      sl: "Zdravo!",
      et: "Tere!",
      lv: "Sveiki!",
      lt: "Labas!",
    }

    // Translation phrases in different languages
    const translationPhrases = {
      es: "Esta es una traducción simulada al español:",
      fr: "Ceci est une traduction simulée en français:",
      de: "Dies ist eine simulierte Übersetzung auf Deutsch:",
      it: "Questa è una traduzione simulata in italiano:",
      ja: "これは日本語への模擬翻訳です:",
      zh: "这是中文模拟翻译:",
      ru: "Это симуляция перевода на русский язык:",
      ar: "هذه ترجمة محاكاة إلى اللغة العربية:",
      hi: "यह हिंदी में एक सिमुलेटेड अनुवाद है:",
      pt: "Esta é uma tradução simulada para português:",
      nl: "Dit is een gesimuleerde vertaling in het Nederlands:",
      pl: "To jest symulowane tłumaczenie na język polski:",
      tr: "Bu Türkçe simüle edilmiş bir çeviridir:",
      sv: "Detta är en simulerad översättning till svenska:",
      fi: "Tämä on simuloitu käännös suomeksi:",
      da: "Dette er en simuleret oversættelse til dansk:",
      no: "Dette er en simulert oversettelse til norsk:",
      cs: "Toto je simulovaný překlad do češtiny:",
      hu: "Ez egy szimulált fordítás magyarra:",
      el: "Αυτή είναι μια προσομοιωμένη μετάφραση στα ελληνικά:",
      he: "זהו תרגום מדומה לעברית:",
      th: "นี่คือการแปลจำลองเป็นภาษาไทย:",
      vi: "Đây là bản dịch mô phỏng sang tiếng Việt:",
      id: "Ini adalah terjemahan simulasi ke Bahasa Indonesia:",
      ms: "Ini adalah terjemahan simulasi ke Bahasa Melayu:",
      ro: "Aceasta este o traducere simulată în limba română:",
      sk: "Toto je simulovaný preklad do slovenčiny:",
      uk: "Це симуляція перекладу українською мовою:",
      ca: "Aquesta és una traducció simulada al català:",
      bg: "Това е симулиран превод на български:",
      hr: "Ovo je simulirani prijevod na hrvatski:",
      sr: "Ово је симулирани превод на српски:",
      sl: "To je simuliran prevod v slovenščino:",
      et: "See on simuleeritud tõlge eesti keelde:",
      lv: "Šis ir simulēts tulkojums latviešu valodā:",
      lt: "Tai yra imituotas vertimas į lietuvių kalbą:",
    }

    // Get greeting and translation phrase for the target language
    const greeting = greetings[targetCode] || `[${targetCode.toUpperCase()}]`
    const translationPhrase = translationPhrases[targetCode] || `This is a simulated translation to ${targetCode}:`

    // Create the "translated" text
    translatedText = `${greeting} ${translationPhrase} "${text}"`

    return translatedText
  }

  // Speak the transcribed text
  function speakText(text) {
    if (!text) return

    // Stop any ongoing speech
    synth.cancel()

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text)

    // Set language
    utterance.lang = outputLanguage.value

    // Find appropriate voice based on gender selection
    const gender = maleVoice.checked ? "male" : "female"
    const langCode = outputLanguage.value.split("-")[0]

    // Get all voices for the selected language
    const languageVoices = voices.filter((voice) => voice.lang.startsWith(langCode))
    console.log(
      `Available voices for ${langCode}:`,
      languageVoices.map((v) => v.name),
    )

    // Try to find a voice that matches the language and gender
    let selectedVoice = null
    let foundGender = null

    // First try: Look for exact gender match
    if (gender === "male") {
      // Look for male voices using our improved classification
      for (const voice of languageVoices) {
        // Check if voice name contains male indicators
        if (malePatterns.some((pattern) => pattern.test(voice.name))) {
          selectedVoice = voice
          foundGender = "male"
          break
        }

        // Check for specific voice naming patterns
        if (voice.name.includes("Google") && voice.name.includes("Male")) {
          selectedVoice = voice
          foundGender = "male"
          break
        }

        if (
          voice.name.includes("Microsoft") &&
          /\bDavid\b|\bMark\b|\bGeorge\b|\bRavi\b|\bPablo\b|\bStefan\b|\bRichard\b/i.test(voice.name)
        ) {
          selectedVoice = voice
          foundGender = "male"
          break
        }
      }
    } else {
      // Look for female voices using our improved classification
      for (const voice of languageVoices) {
        // Check if voice name contains female indicators
        if (femalePatterns.some((pattern) => pattern.test(voice.name))) {
          selectedVoice = voice
          foundGender = "female"
          break
        }

        // Check for specific voice naming patterns
        if (voice.name.includes("Google") && voice.name.includes("Female")) {
          selectedVoice = voice
          foundGender = "female"
          break
        }

        if (
          voice.name.includes("Microsoft") &&
          /\bZira\b|\bElsa\b|\bHazel\b|\bHeera\b|\bPaulina\b|\bSabina\b|\bTracy\b|\bYasmeen\b/i.test(voice.name)
        ) {
          selectedVoice = voice
          foundGender = "female"
          break
        }
      }
    }

    // If no matching voice is found, use any voice for that language
    if (!selectedVoice && languageVoices.length > 0) {
      selectedVoice = languageVoices[0]
      foundGender = "default"
    }

    // If still no voice is found, use the first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0]
      foundGender = "fallback"
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`)

      // Show notification with voice info and gender status
      let notificationMessage = `Using voice: ${selectedVoice.name}`

      if (foundGender === "default") {
        notificationMessage += ` (No specific ${gender} voice found for this language)`
      } else if (foundGender === "fallback") {
        notificationMessage += ` (No voice found for ${langCode}, using fallback)`
      }

      showNotification(notificationMessage, "info")
    } else {
      console.warn("No suitable voice found")
      showNotification("No suitable voice found for this language", "error")
    }

    // Set other properties
    utterance.rate = 1

    // Adjust pitch based on gender - make the difference more pronounced
    // Even if we couldn't find the exact gender voice, we'll still adjust pitch to simulate it
    if (gender === "male") {
      utterance.pitch = 0.7 // Lower pitch for male
    } else {
      utterance.pitch = 1.3 // Higher pitch for female
    }

    // Speak
    synth.speak(utterance)

    // Show notification
    showNotification("Playing audio...", "info")
  }

  // Download transcription as text file
  function downloadTranscription() {
    if (!currentTranscript) return

    const filename = `transcription_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`
    const blob = new Blob([currentTranscript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showNotification("Transcription downloaded!", "success")
  }

  // Copy transcription to clipboard
  function copyToClipboard() {
    if (!currentTranscript) return

    navigator.clipboard
      .writeText(currentTranscript)
      .then(() => {
        showNotification("Copied to clipboard!", "success")
      })
      .catch((error) => {
        console.error("Copy failed:", error)
        showNotification("Failed to copy to clipboard.", "error")
      })
  }

  // Enhanced visualizer animation with more realistic audio visualization
  function startVisualizer() {
    // Add recording-active class to visualizer
    document.querySelector(".stt-visualizer").classList.add("recording-active")

    // Set up animation interval
    const visualizerInterval = setInterval(() => {
      if (analyser && dataArray) {
        // Get frequency data
        analyser.getByteFrequencyData(dataArray)

        // Update bars based on frequency data
        visualizerBars.forEach((bar, index) => {
          // Map the frequency data to the number of bars
          const dataIndex = Math.floor((index * dataArray.length) / visualizerBars.length)
          const value = dataArray[dataIndex]

          // Calculate height based on frequency value (0-255)
          const height = (value / 255) * 95 + 5
          bar.style.setProperty("--random-height", `${height}px`)

          // Add color variation based on frequency
          const hue = 220 + (value / 255) * 40 // Blue to purple range
          bar.style.background = `hsl(${hue}, 100%, 50%)`
          bar.style.boxShadow = `0 0 10px hsl(${hue}, 100%, 70%)`
        })
      } else {
        // Fallback to random animation if analyser is not available
        visualizerBars.forEach((bar) => {
          const height = Math.floor(Math.random() * 95) + 5
          bar.style.setProperty("--random-height", `${height}px`)

          // Add futuristic glow effect
          const hue = 220 + Math.random() * 40 // Blue to purple range
          bar.style.background = `hsl(${hue}, 100%, 50%)`
          bar.style.boxShadow = `0 0 10px hsl(${hue}, 100%, 70%)`
        })
      }
    }, 100)

    // Store interval ID for cleanup
    animationInterval = visualizerInterval
  }

  function stopVisualizer() {
    // Remove recording-active class
    document.querySelector(".stt-visualizer").classList.remove("recording-active")

    // Clear animation interval
    clearInterval(animationInterval)

    // Reset bars
    visualizerBars.forEach((bar) => {
      bar.style.height = "5px"
      bar.style.removeProperty("--random-height")
      bar.style.background = "var(--primary-color)"
      bar.style.boxShadow = "none"
    })
  }

  // Update recording time
  function updateRecordingTime() {
    if (!recordingStartTime) return

    const elapsedTime = Math.floor((Date.now() - recordingStartTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60

    visualizerTime.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} / Recording...`
  }

  // Add to history
  function addToHistory(text) {
    // Create a new history item
    const historyItem = document.createElement("div")
    historyItem.className = "history-item"

    // Truncate text if too long
    const displayText = text.length > 50 ? text.substring(0, 50) + "..." : text

    historyItem.innerHTML = `
      <div class="history-text">${displayText}</div>
      <div class="history-actions">
        <button class="history-play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
        <button class="history-delete">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `

    // Add event listeners
    const playBtn = historyItem.querySelector(".history-play")
    const deleteBtn = historyItem.querySelector(".history-delete")

    playBtn.addEventListener("click", () => {
      speakText(text)
    })

    deleteBtn.addEventListener("click", () => {
      historyItem.remove()
    })

    // Add to history list
    historyList.prepend(historyItem)

    // Save to local storage
    saveHistoryToLocalStorage()
  }

  // Save history to local storage
  function saveHistoryToLocalStorage() {
    // In a real app, you would save the history items to local storage
    // For demo purposes, we'll just log a message
    console.log("History saved to local storage")
  }

  // Enhanced notification system with different types
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = "notification"

    // Set icon based on type
    let icon = ""
    switch (type) {
      case "success":
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>`
        notification.style.background = "var(--success-color)"
        break
      case "error":
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>`
        notification.style.background = "var(--error-color)"
        break
      default:
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>`
        notification.style.background = "var(--primary-color)"
    }

    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-message">${message}</div>
    `

    // Add styles
    notification.style.position = "fixed"
    notification.style.bottom = "20px"
    notification.style.right = "20px"
    notification.style.color = "var(--background-dark)"
    notification.style.padding = "15px 20px"
    notification.style.borderRadius = "5px"
    notification.style.boxShadow = "0 0 15px var(--glow-color)"
    notification.style.zIndex = "1000"
    notification.style.opacity = "0"
    notification.style.transform = "translateY(20px)"
    notification.style.transition = "opacity 0.3s ease, transform 0.3s ease"
    notification.style.display = "flex"
    notification.style.alignItems = "center"
    notification.style.gap = "10px"

    // Add to body
    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => {
      notification.style.opacity = "1"
      notification.style.transform = "translateY(0)"
    }, 10)

    // Hide and remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0"
      notification.style.transform = "translateY(20px)"

      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Space to start/stop recording
    if (e.key === " " && document.activeElement !== ttsText) {
      e.preventDefault()
      startRecordingBtn.click()
    }

    // Ctrl/Cmd + C to copy
    if ((e.ctrlKey || e.metaKey) && e.key === "c" && document.activeElement !== ttsText) {
      e.preventDefault()
      copyBtn.click()
    }

    // Ctrl/Cmd + S to download
    if ((e.ctrlKey || e.metaKey) && e.key === "s" && document.activeElement !== ttsText) {
      e.preventDefault()
      downloadBtn.click()
    }

    // Ctrl/Cmd + P to play
    if ((e.ctrlKey || e.metaKey) && e.key === "p" && document.activeElement !== ttsText) {
      e.preventDefault()
      playBtn.click()
    }
  })

  // Add futuristic pulse effect to visualizer container
  const visualizerContainer = document.querySelector(".stt-visualizer")
  if (visualizerContainer) {
    // Add pulse animation
    visualizerContainer.style.animation = "pulse 2s infinite alternate"
    visualizerContainer.style.boxShadow = "0 0 20px var(--glow-color)"
  }

  // Add styles for translation result
  const style = document.createElement("style")
  style.textContent = `
    .translation-result {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
    }
    
    @media (min-width: 768px) {
      .translation-result {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .original-text, .translated-text {
      background: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 5px;
    }
    
    .original-text h4, .translated-text h4 {
      color: var(--primary-color);
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 0.9rem;
    }
    
    .detected-language {
      background: rgba(0, 102, 255, 0.2);
      padding: 5px 10px;
      border-radius: 5px;
      margin-bottom: 10px;
      font-size: 0.9rem;
      display: inline-block;
    }
  `
  document.head.appendChild(style)
})

