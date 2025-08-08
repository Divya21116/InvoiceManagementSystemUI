import React, { useState, useRef } from 'react';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const recognition = useRef(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.lang = 'te-IN'; // Telugu language
      
      recognition.current.onresult = async (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setText(prevText => prevText + transcript + ' ');
        
        // Translate the text
        await translateText(transcript);
      };

      recognition.current.onerror = (event) => {
        setError('Error occurred in recognition: ' + event.error);
      };
    } catch (err) {
      setError('Speech recognition is not supported in this browser.');
    }
  };

  // Function to translate using MyMemory API (free, CORS-friendly)
  const translateWithMyMemory = async (text) => {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=te|en`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.responseData.translatedText;
    } catch (err) {
      throw new Error('MyMemory API error: ' + err.message);
    }
  };

  // Backup translation using Microsoft Azure (requires API key)
  const translateWithMicrosoft = async (text) => {
    // Note: Add your Azure key in production
    const key = 'YOUR_AZURE_KEY';
    const endpoint = 'https://api.cognitive.microsofttranslator.com';
    const location = 'global';

    try {
      const response = await fetch(`${endpoint}/translate?api-version=3.0&from=te&to=en`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': location,
          'Content-type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
      });

      const data = await response.json();
      return data[0].translations[0].text;
    } catch (err) {
      throw new Error('Microsoft Translator error: ' + err.message);
    }
  };

  // Main translation function with fallback
  const translateText = async (textToTranslate) => {
    if (!textToTranslate.trim()) return;

    setIsTranslating(true);
    try {
      // Try MyMemory API first
      const translatedResult = await translateWithMyMemory(textToTranslate);
      setTranslatedText(prevText => prevText + translatedResult + ' ');
    } catch (firstErr) {
      console.error('First translation attempt failed:', firstErr);
      
      try {
        // Fallback to bare fetch with CORS proxy
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(
          `https://translate.argosopentech.com/translate`
        )}`, {
          method: 'POST',
          body: JSON.stringify({
            q: textToTranslate,
            source: 'te',
            target: 'en',
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Translation failed with status: ${response.status}`);
        }

        const data = await response.json();
        setTranslatedText(prevText => prevText + data.translatedText + ' ');
      } catch (secondErr) {
        setError('Translation failed. Please try again later.');
        console.error('All translation attempts failed:', secondErr);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleRecording = () => {
    if (!recognition.current) {
      initializeSpeechRecognition();
    }

    if (!isRecording) {
      recognition.current.start();
      setError(''); // Clear any previous errors
    } else {
      recognition.current.stop();
    }
    setIsRecording(!isRecording);
  };

  const copyToClipboard = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy text');
    }
  };

  const clearText = () => {
    setText('');
    setTranslatedText('');
    setError('');
  };

  // Rest of the component remains the same...
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Previous JSX remains the same */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '20px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Voice Recorder & Translator
        </h1>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginBottom: '20px' 
        }}>
          <button
            onClick={toggleRecording}
            style={{
              padding: '15px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isRecording ? '#ef4444' : '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
          
          <button
            onClick={clearText}
            style={{
              padding: '15px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#6b7280',
              color: 'white',
              cursor: 'pointer',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🗑️
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {isTranslating && (
          <div style={{
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Translating...
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h3 style={{ margin: 0 }}>Original Text (Telugu)</h3>
              <button
                onClick={() => copyToClipboard(text)}
                style={{
                  padding: '5px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
            <p style={{ 
              minHeight: '50px',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {text || 'Start speaking in Telugu...'}
            </p>
          </div>

          <div style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '15px'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h3 style={{ margin: 0 }}>Translated Text (English)</h3>
              <button
                onClick={() => copyToClipboard(translatedText)}
                style={{
                  padding: '5px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
            <p style={{ 
              minHeight: '50px',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {translatedText || 'Translation will appear here...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;