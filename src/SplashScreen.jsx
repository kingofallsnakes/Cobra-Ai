import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

const SplashScreenWithLoading = ({ onStart }) => {
  const [animationClass, setAnimationClass] = useState('animate-bounce');
  const [showConfetti, setShowConfetti] = useState(false);
  const [bgColor, setBgColor] = useState('bg-black');

  useEffect(() => {
    const animations = [
      'animate-bounce',
      'animate-spin',
      'animate-pulse',
      'animate-fade',
      'animate-shake'
    ];

    const changeAnimation = () => {
      const randomIndex = Math.floor(Math.random() * animations.length);
      setAnimationClass(animations[randomIndex]);
    };

    const changeBgColor = () => {
      const colors = [
  'bg-black', 
  'bg-red-500', 
  'bg-green-500', 
  'bg-blue-500', 
  'bg-yellow-500',
  'bg-purple-500', 
  'bg-pink-500', 
  'bg-teal-500', 
  'bg-indigo-500', 
  'bg-gray-500'
];

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setBgColor(randomColor);
    };

    const interval = setInterval(() => {
      changeAnimation();
      changeBgColor();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onStart();
    }, 3000); // Show confetti for 3 seconds
  };

  return (
    <div className={`h-screen w-screen flex flex-col justify-center items-center ${bgColor}`}>
      <div className="text-center">
        <h2 className={`text-4xl font-bold text-white ${animationClass} shadow-title`}>
          Cobra AI
        </h2>
        <button
          onClick={handleStart}
          className="mt-6 py-1 px-1 bg-black text-white rounded-md shadow-md hover:bg-gray-800 transition-all duration-400 animate-button relative"
        >
          Let's Go
          <span className="tooltip absolute top-0 left-full ml-2 bg-gray-800 text-white rounded-md py-1 px-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
            Click to start
          </span>
        </button>
      </div>

      {showConfetti && <Confetti />}

      <div className="device">
        <div className="device__a">
          <div className="device__a-1"></div>
          <div className="device__a-2"></div>
        </div>
        <div className="device__b"></div>
        <div className="device__c"></div>
        <div className="device__d"></div>
        <div className="device__e"></div>
        <div className="device__f"></div>
        <div className="device__g"></div>
      </div>

      <style jsx>{`
        @keyframes animate-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes animate-shake {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
        .tooltip {
          position: absolute;
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.7);
          color: #fff;
          padding: 5px;
          border-radius: 3px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        button:hover .tooltip {
          opacity: 1;
        }
        .device {
          position: relative;
          width: 4em;
          height: 4em;
        }
        .device__a, .device__a-1, .device__a-2, .device__b, .device__c,
         .device__d, .device__e, .device__f, .device__g {
          animation: device-a 3s cubic-bezier(0.65, 0, 0.35, 1) infinite;
          position: absolute;
          transition: background-color var(--trans-dur), box-shadow var(--trans-dur);
        }
        .device__a, .device__d, .device__e {
          background-color: hsl(var(--hue), 10%, 70%);
          box-shadow: 0 0 0 0.25em inset;
        }
        .device__a {
          border-radius: 0.375em;
          top: 0;
          width: 4em;
          height: 2.5em;
          z-index: 1;
        }
        .device__a-1, .device__a-2 {
          visibility: hidden;
        }
        .device__a-1 {
          animation-name: device-a-1;
          top: 2.25em;
          left: 1.5em;
          width: 1em;
          height: 0.25em;
        }
        .device__a-2 {
          animation-name: device-a-2;
          top: 0.625em;
          right: 0;
          width: 0.25em;
          height: 0.75em;
        }
        .device__a-1, .device__a-2, .device__b, .device__c, .device__f, .device__g {
          background-color: var(--fg);
          border-radius: 0.125em;
        }
        .device__b {
          animation-name: device-b;
          top: 2.25em;
          left: 1.875em;
          width: 0.25em;
          height: 1em;
        }
        .device__c {
          animation-name: device-c;
          top: 3em;
          left: 1em;
          width: 2em;
          height: 0.25em;
        }
        .device__d, .device__e {
          left: 1.25em;
          width: 1.5em;
          height: 0.875em;
          visibility: hidden;
        }
        .device__d {
          animation-name: device-d;
          border-radius: 0.375em 0.375em 0 0;
          top: 0.75em;
        }
        .device__e {
          animation-name: device-e;
          border-radius: 0 0 0.375em 0.375em;
          top: 1.625em;
        }
        .device__f, .device__g {
          filter: blur(0.375em);
          bottom: 0;
          height: 0.25em;
        }
        .device__f {
          animation-name: device-f;
          opacity: 0.5;
          left: 1em;
          width: 2em;
        }
        .device__g {
          animation-name: device-g;
          opacity: 0;
          left: 0;
          width: 4em;
        }
        @keyframes device-a {
          from, to {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 0;
            width: 4em;
            height: 5.5em;
            transform: translateY(0);
          }
          12.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 0;
            width: 4em;
            height: 5.5em;
            transform: translateY(1.5em);
          }
          25% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 0;
            width: 4em;
            height: 5.5em;
            transform: translateY(0.375em);
          }
          37.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 0;
            width: 4em;
            height: 5.5em;
            transform: translateY(1.5em);
          }
          50% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 1em;
            width: 2em;
            height: 4em;
            transform: translateY(0.125em);
          }
          62.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 1em;
            width: 4em;
            height: 4em;
            transform: translateY(1.5em);
          }
          75% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 0.5em;
            width: 4em;
            height: 4em;
            transform: translateY(0.5em);
          }
          87.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 0.5em;
            width: 4em;
            height: 4em;
            transform: translateY(1.5em);
          }
        }
        @keyframes device-a-1 {
          12.5% {
            visibility: visible;
          }
          50% {
            top: 2em;
          }
        }	
        @keyframes device-a-2 {
          12.5% {
            visibility: visible;
          }
        }
        @keyframes device-b {
          25% {
            height: 3.875em;
          }
        }
        @keyframes device-c {
          25% {
            transform: translateX(1em);
            width: 0.25em;
          }
        }
        @keyframes device-d {
          37.5% {
            visibility: visible;
          }
          50% {
            top: 0.875em;
          }
        }
        @keyframes device-e {
          37.5% {
            visibility: visible;
          }
        }
        @keyframes device-f {
          50% {
            opacity: 0;
          }
        }
        @keyframes device-g {
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreenWithLoading;
