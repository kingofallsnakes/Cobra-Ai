import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVolumeUp, faPlay, faPause, faStop, faRedo, faMoon, faSun, faDownload } from '@fortawesome/free-solid-svg-icons';
import SplashScreen from './SplashScreen'; 
import bujjiGif from './assets/bujji3.gif';
import './App.css';

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSynthesisUtterance, setSpeechSynthesisUtterance] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const API_KEY = "AIzaSyBhuYRkdE9ULfxl3w0iDkrOLGkbt7_zUHc";

  useEffect(() => {
    if (!showSplash) {
      const greetUser = () => {
        const greetingMessage = "Hi, welcome to my World";
        addMessage("Cobra AI", greetingMessage);
        speakText(greetingMessage);
      };
      greetUser();
    }
  }, [showSplash]);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('messages'));
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages((prevMessages) => [...prevMessages, { sender, text }]);
  };

  async function generateAnswer(e) {
    e.preventDefault(); 
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    addMessage("Me", question);
    setAnswer("Loading Bhirava...  \n I Will get You 300 Units of information in 10 seconds");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: question }] }],
        }
      );

      const generatedAnswer = response.data.candidates[0].content.parts[0].text;
      addMessage("Cobra AI", generatedAnswer);
      setAnswer(generatedAnswer);
    } catch (error) {
      console.error(error);
      const errorMessage = "Sorry - Something went wrong. Please try again!";
      addMessage("Cobra AI", errorMessage);
      setAnswer(errorMessage);
    }

    setGeneratingAnswer(false);
    setQuestion("");
  }

  const startVoiceRecognition = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-Uk';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setQuestion(speechToText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended.');
    };
  };

  const speakText = (text, lineByLine = false) => {
    if (isPlaying) return;
    
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = 'en-Uk';
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes('Female')) || null;
    const lines = text.split('\n');

    setSpeechSynthesisUtterance(utterance);
    setIsPlaying(true);
    setIsPaused(false);

    if (lineByLine) {
      let currentLine = 0;
      const speakNextLine = () => {
        if (currentLine < lines.length) {
          utterance.text = lines[currentLine];
          utterance.onend = speakNextLine;
          speechSynthesis.speak(utterance);
          currentLine++;
        } else {
          setIsPlaying(false);
        }
      };
      speakNextLine();
    } else {
      utterance.text = text;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handlePlayResponse = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speakText(answer, true);
    }
  };

  const handlePauseResponse = () => {
    if (speechSynthesisUtterance) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStopResponse = () => {
    if (speechSynthesisUtterance) {
      speechSynthesisUtterance.onend = null;
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleRestart = () => {
    setQuestion("");
    setAnswer("");
    setGeneratingAnswer(false);
    setMessages([]);
    setIsPlaying(false);
    setIsPaused(false);
    setSpeechSynthesisUtterance(null);
  };

  const handleStart = () => {
    setShowSplash(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const exportConversation = () => {
    const element = document.createElement("a");
    const file = new Blob([messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Your data.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className={`h-screen w-screen ${darkMode ? 'dark' : ''}`}>
      {showSplash ? (
        <SplashScreen onStart={handleStart} />
      ) : (
        <div
          className="main-container flex-1 p-3 flex flex-col justify-between items-center overflow-hidden animate-shadowColorChange"
          style={{
            backgroundImage: `url(${bujjiGif})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className={`flex flex-col w-full max-w-2xl p-4 rounded-lg shadow-lg bg-opacity-80 backdrop-blur-md animate-shadowColorChangeInner ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-bold">{darkMode ? 'Cobra AI' : 'Cobra AI'}</h1>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-600 transition-all duration-300"
                  aria-label="Restart Application"
                >
                  <FontAwesomeIcon icon={faRedo} size="lg" />
                </button>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-600 transition-all duration-300"
                  aria-label="Toggle Dark Mode"
                >
                  <FontAwesomeIcon icon={darkMode ? faSun : faMoon} size="lg" />
                </button>
                <button
                  type="button"
                  onClick={exportConversation}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-600 transition-all duration-300"
                  aria-label="Export Conversation"
                >
                  <FontAwesomeIcon icon={faDownload} size="lg" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="overflow-y-auto max-h-96">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex mb-2 animate-shadowColorChangeInner ${msg.sender === "Me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg p-3 shadow-md animate-shadowColorChangeInner ${
                        msg.sender === "Me" ? "bg-orange-500 text-white" : "bg-gray-200 text-black"
                      }`}
                    >
                      <p className="font-semibold">{msg.sender}:</p>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
              {generatingAnswer && (
                <div className="flex justify-center mb-2">
                  <ClipLoader color={"#ffffff"} size={50} />
                </div>
              )}
            </div>
            <div className="mb-4">
              <form onSubmit={generateAnswer} className="flex space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask your question..."
                  className="flex-1 py-2 px-4 rounded-md shadow-md border border-gray-300 focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition-all duration-300"
                  aria-label="Start Voice Recognition"
                >
                  <FontAwesomeIcon icon={faMicrophone} size="lg" />
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition-all duration-300"
                  aria-label="Generate Answer"
                >
                  <FontAwesomeIcon icon={faPlay} size="lg" />
                </button>
              </form>
            </div>
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={handlePlayResponse}
                className="bg-green-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-600 transition-all duration-300"
                aria-label="Play Response"
              >
                <FontAwesomeIcon icon={faVolumeUp} size="lg" />
              </button>
              <button
                type="button"
                onClick={handlePauseResponse}
                className="bg-yellow-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-yellow-600 transition-all duration-300"
                aria-label="Pause Response"
              >
                <FontAwesomeIcon icon={faPause} size="lg" />
              </button>
              <button
                type="button"
                onClick={handleStopResponse}
                className="bg-red-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-600 transition-all duration-300"
                aria-label="Stop Response"
              >
                <FontAwesomeIcon icon={faStop} size="lg" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
