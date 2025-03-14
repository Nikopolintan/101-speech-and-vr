document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const clearBtn = document.getElementById('clear-btn');
    const transcript = document.getElementById('transcript');
    const status = document.getElementById('status');
    const listeningIndicator = document.getElementById('listening-indicator');
    const languageSelect = document.getElementById('language-select');
    const confidenceMeter = document.getElementById('confidence-meter');
    const confidenceValue = document.getElementById('confidence-value');
    const translateBtn = document.getElementById('translate-btn');
    const translationOutput = document.getElementById('translation-output');
    const translationLanguage = document.getElementById('translation-language');
    
    // Speech Recognition setup
    let recognition = null;
    let isListening = false;
    
    // Check if browser supports Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // Create Speech Recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = languageSelect.value;
        
        // Event listeners for recognition
        recognition.onstart = function() {
            isListening = true;
            status.textContent = 'Listening...';
            startBtn.disabled = true;
            stopBtn.disabled = false;
            listeningIndicator.classList.add('active');
            
            // Animate listening indicator
            animateListeningIndicator();
        };
        
        recognition.onend = function() {
            isListening = false;
            status.textContent = 'Not listening. Click "Start Speaking" to begin again.';
            startBtn.disabled = false;
            stopBtn.disabled = true;
            listeningIndicator.classList.remove('active');
        };
        
        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';
            let maxConfidence = 0;
            
            // Process results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                    // Update confidence
                    if (result[0].confidence > maxConfidence) {
                        maxConfidence = result[0].confidence;
                    }
                } else {
                    interimTranscript += result[0].transcript;
                }
            }
            
            // Update transcript
            if (finalTranscript !== '') {
                transcript.innerHTML += finalTranscript + ' ';
            }
            
            // Show interim results in grey
            if (interimTranscript !== '') {
                const existingText = transcript.innerHTML;
                transcript.innerHTML = existingText + '<span style="color: #999;">' + interimTranscript + '</span>';
            }
            
            // Update confidence meter
            if (maxConfidence > 0) {
                const confidencePercentage = Math.round(maxConfidence * 100);
                confidenceMeter.value = confidencePercentage;
                confidenceValue.textContent = confidencePercentage + '%';
            }
            
            // Scroll to bottom of transcript
            transcript.scrollTop = transcript.scrollHeight;
        };
        
        recognition.onerror = function(event) {
            if (event.error === 'no-speech') {
                status.textContent = 'No speech detected. Please try again.';
            } else if (event.error === 'audio-capture') {
                status.textContent = 'No microphone detected. Please check your settings.';
            } else if (event.error === 'not-allowed') {
                status.textContent = 'Microphone access denied. Please allow access to use this feature.';
            } else {
                status.textContent = 'Error occurred: ' + event.error;
            }
            
            listeningIndicator.classList.remove('active');
            startBtn.disabled = false;
            stopBtn.disabled = true;
        };
    } else {
        // Browser doesn't support Speech Recognition
        status.textContent = 'Your browser does not support Speech Recognition. Please try Chrome, Edge, or Safari.';
        startBtn.disabled = true;
        stopBtn.disabled = true;
    }
    
    // Event listeners for buttons
    startBtn.addEventListener('click', function() {
        if (recognition) {
            recognition.lang = languageSelect.value;
            recognition.start();
        }
    });
    
    stopBtn.addEventListener('click', function() {
        if (recognition) {
            recognition.stop();
        }
    });
    
    clearBtn.addEventListener('click', function() {
        transcript.innerHTML = '';
        translationOutput.innerHTML = '';
        confidenceMeter.value = 0;
        confidenceValue.textContent = '0%';
    });
    
    // Language selector
    languageSelect.addEventListener('change', function() {
        if (recognition) {
            const currentLanguage = languageSelect.value;
            recognition.lang = currentLanguage;
            
            // Restart recognition with new language if currently listening
            if (isListening) {
                recognition.stop();
                setTimeout(() => {
                    recognition.start();
                }, 200);
            }
        }
    });
    
    // Translation button
    translateBtn.addEventListener('click', function() {
        const textToTranslate = transcript.textContent.trim();
        const targetLang = translationLanguage.value;
        
        if (textToTranslate === '') {
            status.textContent = 'Please speak or enter some text to translate.';
            return;
        }
        
        // Update status
        status.textContent = 'Translating...';
        translateBtn.disabled = true;
        
        // Perform translation
        translateText(textToTranslate, targetLang)
            .then(result => {
                translationOutput.textContent = result;
                status.textContent = 'Translation complete!';
            })
            .catch(error => {
                translationOutput.textContent = 'Translation failed. Please try again.';
                status.textContent = 'Translation error: ' + error.message;
                console.error('Translation error:', error);
            })
            .finally(() => {
                translateBtn.disabled = false;
            });
    });
    
    // Translation function using the free LibreTranslate API
    async function translateText(text, targetLang) {
        try {
            // Show loading state
            translationOutput.innerHTML = '<div style="text-align: center; padding: 20px;"><i>Translating...</i></div>';
            
            // Detect source language from the speech recognition language
            const sourceLang = languageSelect.value.split('-')[0]; // Extract language code (e.g., 'en' from 'en-US')
            
            // Use fetch with the LibreTranslate API
            const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + 
                sourceLang + '&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(text));
            
            // Parse the response (which is in the format of [[["translated text","original text",null,null,1]]])
            const data = await response.json();
            
            if (data && data[0] && data[0][0] && data[0][0][0]) {
                // Extract the translated text from the response
                let translatedText = '';
                for (let i = 0; i < data[0].length; i++) {
                    translatedText += data[0][i][0];
                }
                return translatedText;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Translation error:', error);
            // Try alternative method using LibreTranslate
            try {
                const response = await fetch('https://libretranslate.com/translate', {
                    method: 'POST',
                    body: JSON.stringify({
                        q: text,
                        source: languageSelect.value.split('-')[0],
                        target: targetLang,
                        format: 'text'
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                if (data && data.translatedText) {
                    return data.translatedText;
                } else {
                    throw new Error('Failed to translate with alternative API');
                }
            } catch (backupError) {
                console.error('Backup translation error:', backupError);
                throw new Error('Translation failed. Please try again later.');
            }
        }
    }
    
    // Function to animate listening indicator
    function animateListeningIndicator() {
        if (!isListening) return;
        
        const bars = listeningIndicator.querySelectorAll('.bar');
        bars.forEach(bar => {
            const randomHeight = Math.floor(Math.random() * 20) + 5;
            bar.style.height = `${randomHeight}px`;
        });
        
        requestAnimationFrame(() => {
            setTimeout(animateListeningIndicator, 100);
        });
    }
});