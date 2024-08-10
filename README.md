# Cobra AI

Welcome to **Cobra AI**, a powerful React application that leverages Google's Gemini API to generate and interact with AI-driven responses. This application features text-to-speech, voice recognition, and a user-friendly interface designed to enhance your interaction with AI technology.

## Features

- **Voice Recognition:** Convert spoken input into text using the Web Speech API.
- **Text-to-Speech:** Hear the AI-generated responses with a customizable voice synthesis feature.
- **API Integration:** Utilizes Google's Gemini API to generate responses based on user queries.
- **Loading State:** Display a user-friendly loading indicator while processing queries.
- **Interactive UI:** Includes intuitive controls for voice commands and response playback.

## Prerequisites

Before running this application, ensure you have the following:

- [Node.js](https://nodejs.org/) (>=14.x)
- [npm](https://www.npmjs.com/) 
- A Google Cloud API key for the Gemini API

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/kingofallsnakes/Cobra-Ai.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd Cobra-Ai-main
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```
   **Next**
  ```bash
   npm install vite --save-dev
  ```

4. **Add Your Google API Key**

   Open the `src/App.js` file and replace the placeholder API key with your own Google Cloud API key:

   ```javascript
   const API_KEY = "YOUR_GOOGLE_API_KEY";
   ```

5. **Run the Application**
   ##open terminal open the project path then type:
   ```bash
   npm run dev
   ```
   **NEXT**
    ```bash
   h + Enter
   ```
   **NEXT**
    ```bash
   o + Enter
   ```
   The application will be available at `http://localhost:5173`.

## Usage

1. **Ask Questions:** Type or speak your question to get a response from the AI.
2. **Voice Commands:** Use the microphone button to start voice recognition and dictate your question.
3. **Playback Controls:** Play or pause the spoken response using the controls provided.
4. **Restart:** Clear the current session and reset the application using the restart button.

## API Integration

This project uses the Google Gemini API for content generation. The Gemini API allows for advanced text generation based on provided prompts, leveraging the power of Google's language models to produce high-quality and contextually relevant content.

- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Method:** `POST`
- **Parameters:** Includes user queries as input to generate responses.

