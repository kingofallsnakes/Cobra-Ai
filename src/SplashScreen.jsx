import React, { useEffect, useState } from 'react';

const SplashScreenWithLoading = ({ onStart }) => {
  const [animationClass, setAnimationClass] = useState('animate-bounce');

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

    const interval = setInterval(changeAnimation, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-black">
      <div className="text-center">
        <h1 className={`text-6xl font-bold text-blue-500 ${animationClass} shadow-title`}>
          Bujji AI
        </h1>
        <button
          onClick={onStart}
          className="mt-10 py-1 px-3 bg-black text-white rounded-md shadow-md hover:bg-gray-800 transition-all duration-400 animate-button"
        >
          Cobra
        </button>
      </div>

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
        * {
          border: 0;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --hue: 223;
          --fg: hsl(var(--hue),10%,90%);
          --trans-dur: 0.3s;
          font-size: calc(28px + (60 - 28) * (100vw - 280px) / (3840 - 280));
        }

        body {
          background-color: var(--bg);
          color: var(--fg);
          display: grid;
          place-items: center;
          font: 1em/1.5 sans-serif;
          height: 100vh;
          transition: background-color var(--trans-dur), color var(--trans-dur);
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

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: hsl(var(--hue),10%,10%);
            --fg: hsl(var(--hue),10%,90%);
          }

          .device__a, .device__d, .device__e {
            background-color: hsl(var(--hue), 10%, 30%);
          }
        }

        /* Animations */
        @keyframes device-a {
          from, to {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 0;
            width: 4em;
            height: 2.5em;
            transform: translateY(0);
          }
          12.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 0;
            width: 4em;
            height: 2.5em;
            transform: translateY(1.5em);
          }
          25% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 0;
            width: 4em;
            height: 2.5em;
            transform: translateY(0.375em);
          }
          37.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 0;
            width: 4em;
            height: 2.5em;
            transform: translateY(1.5em);
          }
          50% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 1em;
            width: 2em;
            height: 3em;
            transform: translateY(0.125em);
          }
          62.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 1em;
            width: 2em;
            height: 3em;
            transform: translateY(1em);
          }
          75% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 1em;
            width: 2em;
            height: 2em;
            transform: translateY(0.625em);
          }
          87.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 1em;
            width: 2em;
            height: 2em;
            transform: translateY(1.375em);
          }
        }
        @keyframes device-a-1 {
          from, to {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            top: 2.25em;
            left: 1.5em;
            width: 1em;
            height: 0.25em;
            transform: translateY(0);
          }
          12.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            top: 2.25em;
            left: 1.5em;
            width: 1em;
            height: 0.25em;
            transform: translateY(0.5em);
          }
          25% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            top: 2.25em;
            left: 1.5em;
            width: 1em;
            height: 0.25em;
            transform: translateY(0);
          }
          37.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            top: 2.25em;
            left: 1.5em;
            width: 1em;
            height: 0.25em;
            transform: translateY(0.5em);
          }
          50% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            top: 2.25em;
            left: 1.5em;
            width: 1em;
            height: 0.25em;
            transform: translateY(0.25em);
          }
          62.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            top: 2.25em;
            left: 1.5em;
            width: 1em;
            height: 0.25em;
            transform: translateY(0.5em);
          }
        }
        @keyframes device-a-2 {
          from {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            top: 0.625em;
            right: 0;
            width: 0.25em;
            height: 0.75em;
            transform: translateY(0);
          }
          12.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            top: 0.625em;
            right: 0;
            width: 0.25em;
            height: 0.75em;
            transform: translateY(0.5em);
          }
          25% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            top: 0.625em;
            right: 0;
            width: 0.25em;
            height: 0.75em;
            transform: translateY(0);
          }
          37.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            top: 0.625em;
            right: 0;
            width: 0.25em;
            height: 0.75em;
            transform: translateY(0.5em);
          }
          50% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            top: 0.625em;
            right: 0;
            width: 0.25em;
            height: 0.75em;
            transform: translateY(0);
          }
          62.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            top: 0.625em;
            right: 0;
            width: 0.25em;
            height: 0.75em;
            transform: translateY(0.5em);
          }
        }
        @keyframes device-b {
          from {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 1.875em;
            width: 0.25em;
            height: 1em;
            transform: translateY(0);
          }
          12.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 1.875em;
            width: 0.25em;
            height: 1em;
            transform: translateY(0.75em);
          }
          25% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 1.875em;
            width: 0.25em;
            height: 1em;
            transform: translateY(0.5em);
          }
          37.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 1.875em;
            width: 0.25em;
            height: 1em;
            transform: translateY(0.75em);
          }
          50% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 1.875em;
            width: 0.25em;
            height: 1em;
            transform: translateY(0.75em);
          }
          62.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 1.875em;
            width: 0.25em;
            height: 1em;
            transform: translateY(1.25em);
          }
          75% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            left: 1.875em;
            width: 0.25em;
            height: 1em;
            transform: translateY(1.25em);
          }
          87.5% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            left: 1.875em;
            width: 0.25em;
            height: 1em;
            transform: translateY(1.75em);
          }
        }
        @keyframes device-c {
          from {
            animation-timing-function: steps(1, end);
            top: 3em;
            left: 1em;
            width: 2em;
            height: 0.25em;
            transform: translateY(0);
          }
          to {
            animation-timing-function: steps(1, end);
            top: 3em;
            left: 1em;
            width: 2em;
            height: 0.25em;
            transform: translateY(0.5em);
          }
        }
        @keyframes device-d {
          from {
            animation-timing-function: steps(1, end);
            top: 0.75em;
            left: 1.25em;
            width: 1.5em;
            height: 0.875em;
            transform: translateY(0);
          }
          to {
            animation-timing-function: steps(1, end);
            top: 0.75em;
            left: 1.25em;
            width: 1.5em;
            height: 0.875em;
            transform: translateY(0.5em);
          }
        }
        @keyframes device-e {
          from {
            animation-timing-function: steps(1, end);
            top: 1.625em;
            left: 1.25em;
            width: 1.5em;
            height: 0.875em;
            transform: translateY(0);
          }
          to {
            animation-timing-function: steps(1, end);
            top: 1.625em;
            left: 1.25em;
            width: 1.5em;
            height: 0.875em;
            transform: translateY(0.5em);
          }
        }
        @keyframes device-f {
          from {
            animation-timing-function: steps(1, end);
            top: 1.625em;
            left: 1.25em;
            width: 1.5em;
            height: 0.875em;
            transform: translateY(0);
          }
          to {
            animation-timing-function: steps(1, end);
            top: 1.625em;
            left: 1.25em;
            width: 1.5em;
            height: 0.875em;
            transform: translateY(0.5em);
          }
        }
        @keyframes device-g {
          from {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            top: 1.25em;
            left: 0;
            width: 4em;
            height: 0.25em;
            transform: translateY(0);
          }
          50% {
            animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
            top: 1.25em;
            left: 0;
            width: 4em;
            height: 0.25em;
            transform: translateY(0.5em);
          }
          100% {
            animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
            top: 1.25em;
            left: 0;
            width: 4em;
            height: 0.25em;
            transform: translateY(0);
          }
        }

        /* Title animations */
        @keyframes animate-bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes animate-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes animate-pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes animate-fade {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes animate-shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          50% {
            transform: translateX(0);
          }
          75% {
            transform: translateX(5px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-bounce {
          animation: animate-bounce 1s infinite;
        }
        .animate-spin {
          animation: animate-spin 1s linear infinite;
        }
        .animate-pulse {
          animation: animate-pulse 1s infinite;
        }
        .animate-fade {
          animation: animate-fade 1s infinite;
        }
        .animate-shake {
          animation: animate-shake 1s infinite;
        }

        .shadow-title {
          text-shadow: 0 0 0.5em rgba(0, 0, 0, 0.6);
        }
        .animate-button {
          animation: button-animation 2s infinite;
        }
        @keyframes button-animation {
          0%, 100% {
            background-color: #000;
            color: #fff;
          }
          50% {
            background-color: #fff;
            color: #000;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreenWithLoading;
