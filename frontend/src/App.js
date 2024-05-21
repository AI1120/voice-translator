import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaSpinner } from 'react-icons/fa';

const AppContainer = styled.div`
  background-color: #f0f2f6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 100px 0 0;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 13px 24px;
  margin: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 70%;
`;

const TextContainer = styled.div`
  margin: 20px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  width: 80%;
  max-width: 600px;
  text-align: left;
`;

const Spinner = styled(FaSpinner)`
  margin-left: 10px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AudioPlayer = styled.audio`
  margin-top: 20px;
  width: 80%;
  max-width: 600px;
`;

function App() {
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const handleSpeechRecognition = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/recognize-speech');
      setTranscription(response.data.transcription);

      const translationResponse = await axios.post('http://localhost:5000/translate-text', {
        text: response.data.transcription,
        src: 'ar',
        dest: 'en'
      });
      setTranslation(translationResponse.data.translation);

      const ttsResponse = await axios.post('http://localhost:5000/text-to-speech', {
        text: translationResponse.data.translation,
        lang: 'en'
      }, { responseType: 'blob' });

      const url = URL.createObjectURL(new Blob([ttsResponse.data], { type: 'audio/mp3' }));
      setAudioSrc(url);
    } catch (error) {
      console.error('Error processing speech:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (audioSrc) {
      audioRef.current.play();
    }
  }, [audioSrc]);

  return (
    <AppContainer>
      <Header>
        <Title>🌐 Arabic to English Voice Translator</Title>
        <Button onClick={handleSpeechRecognition} disabled={loading}>
          🎤 Press button and Speak {loading && <Spinner />}
        </Button>
      </Header>
      <MainContent>
        {transcription && (
          <TextContainer>
            <p><strong>Transcription:</strong> {transcription}</p>
            <p><strong>Translation:</strong> {translation}</p>
          </TextContainer>
        )}
        {audioSrc && <AudioPlayer ref={audioRef} src={audioSrc} controls />}
      </MainContent>
    </AppContainer>
  );
}

export default App;
