import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVolumeUp, faPlay, faPause, faStop, faRedo } from '@fortawesome/free-solid-svg-icons';
import SplashScreen from './SplashScreen'; 
import bujjiGif from './assets/bujji12.gif';
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

  const API_KEY = "AIzaSyBhuYRkdE9ULfxl3w0iDkrOLGkbt7_zUHc";

  useEffect(() => {
    if (!showSplash) {
      const greetUser = () => {
        const greetingMessage = "Hi, welcome to my World";
        addMessage("Bujji AI", greetingMessage);
        speakText(greetingMessage);
      };
      greetUser();
    }
  }, [showSplash]);

  const addMessage = (sender, text) => {
    setMessages((prevMessages) => [...prevMessages, { sender, text }]);
  };

  async function generateAnswer(e) {
    e.preventDefault(); 
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    addMessage("User", question);
    setAnswer("Loading Bhirava...  \n I Will get You 300 Units of information in 10 seconds");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: question }] }],
        }
      );

      const generatedAnswer = response.data.candidates[0].content.parts[0].text;
      addMessage("Bujji AI", generatedAnswer);
      setAnswer(generatedAnswer);
    } catch (error) {
      console.error(error);
      const errorMessage = "Sorry - Something went wrong. Please try again!";
      addMessage("Bujji AI", errorMessage);
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
    recognition.lang = 'en-US';
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
    utterance.lang = 'en-US';
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

  return (
    <div className="h-screen w-screen">
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
          <div className="flex flex-col w-full max-w-2xl p-4 bg-white rounded-lg shadow-lg bg-opacity-80 backdrop-blur-md animate-shadowColorChangeInner">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-bold text-black-500">Bujji AI</h1>
              <button
                type="button"
                onClick={handleRestart}
                className="bg-gray-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-600 transition-all duration-300"
                aria-label="Restart Application"
              >
                <FontAwesomeIcon icon={faRedo} size="lg" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="overflow-y-auto max-h-96">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex mb-2 animate-shadowColorChangeInner ${msg.sender === "User" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg p-3 shadow-md animate-shadowColorChangeInner ${
                        msg.sender === "User" ? "bg-orange-500 text-white" : "bg-gray-200"
                      }`}
                      style={{ maxWidth: '80%' }}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={generateAnswer} className="flex items-center mb-4">
              <textarea
                required
                className="border border-gray-300 rounded-l w-full p-3 transition-all duration-300 focus:border-red-400 focus:shadow-lg"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    generateAnswer(e);
                  }
                }}
                placeholder="Ask anything"
                style={{ resize: 'none', minHeight: '50px' }}
              ></textarea>
              <button
                type="button"
                onClick={startVoiceRecognition}
                className="text-gray-600 hover:text-gray-900 p-3 bg-white border-t border-b border-gray-300"
                aria-label="Start Voice Recognition"
              >
                <FontAwesomeIcon icon={faMicrophone} size="lg" />
              </button>
              <button
                type="submit"
                className={`bg-blue-500 text-white py-3 px-4 rounded-r-md shadow-md hover:bg-red-600 transition-all duration-300 ${
                  generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={generatingAnswer}
              >
                {generatingAnswer ? <ClipLoader size={20} color={"#fff"} /> : "Send"}
              </button>
            </form>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                type="button"
                onClick={handlePlayResponse}
                className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition-all duration-300"
                aria-label="Play Response"
              >
                <FontAwesomeIcon icon={faPlay} size="lg" />
              </button>
              <button
                type="button"
                onClick={handlePauseResponse}
                className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition-all duration-300"
                aria-label="Pause Response"
              >
                <FontAwesomeIcon icon={faPause} size="lg" />
              </button>
              <button
                type="button"
                onClick={handleStopResponse}
                className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition-all duration-300"
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
