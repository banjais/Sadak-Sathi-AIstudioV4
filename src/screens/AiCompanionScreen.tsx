import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { useTranslation } from '../hooks/useTranslation';
import { playSoundEffect } from '../utils/audioFeedback';
import { WeatherData } from '../api/weatherApi';

const SendIcon = () => <svg height="24" viewBox="0 0 24 24" width="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/></svg>;

interface Message {
    role: 'user' | 'model';
    text: string;
    isSpecial?: boolean;
}

interface AiCompanionScreenProps {
    initialQuery: string | null;
    userLocation: [number, number] | null;
    weatherData: WeatherData | null;
}

type Sentiment = 'angry' | 'happy' | 'neutral';

const AiCompanionScreen: React.FC<AiCompanionScreenProps> = ({ initialQuery, userLocation, weatherData }) => {
    const { t, language } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialQueryProcessed = useRef(false);
    const aiRef = useRef<GoogleGenAI | null>(null);
    const messagesRef = useRef(messages);
    const isSending = useRef(false);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Lazily initialize the AI instance
    const getAiInstance = useCallback((): GoogleGenAI | null => {
        if (aiRef.current) {
            return aiRef.current;
        }
        if (typeof process === 'undefined' || !process.env?.API_KEY) {
            console.warn("API_KEY environment variable not found. AI Companion is disabled.");
            setError(t('error_ai_response'));
            setIsReady(false);
            return null;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            aiRef.current = ai;
            setIsReady(true);
            return ai;
        } catch (e) {
            console.error("Failed to initialize Gemini AI:", e);
            setError(t('error_ai_response'));
            setIsReady(false);
            return null;
        }
    }, [t]);
    
    useEffect(() => {
        getAiInstance();
        if (!initialQuery) {
            setMessages([{ role: 'model', text: t('aiWelcomeMessage') }]);
        }
    }, [t, initialQuery, getAiInstance]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const analyzeSentiment = useCallback(async (text: string): Promise<Sentiment> => {
        const ai = getAiInstance();
        if (!ai) return 'neutral';

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze the sentiment of this text: "${text}". Is it angry, happy, or neutral? Respond with a single JSON object: {"sentiment": "value"} where value is "angry", "happy", or "neutral".`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            sentiment: { type: Type.STRING }
                        }
                    }
                }
            });
            const jsonResponse = JSON.parse(response.text);
            const sentiment = jsonResponse.sentiment?.toLowerCase();
            if (['angry', 'happy'].includes(sentiment)) {
                return sentiment;
            }
            return 'neutral';
        } catch (e) {
            console.warn("Sentiment analysis failed, defaulting to neutral:", e);
            return 'neutral';
        }
    }, [getAiInstance]);

    const getSystemInstruction = useCallback((sentiment: Sentiment): string => {
        let baseInstruction = t('aiSystemInstruction');

        if (sentiment === 'angry') {
            baseInstruction = t('aiSystemInstruction_angry');
        } else if (sentiment === 'happy') {
            baseInstruction = t('aiSystemInstruction_happy');
        }

        const time = new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
        const locationInfo = userLocation ? `The user is at latitude ${userLocation[0].toFixed(4)}, longitude ${userLocation[1].toFixed(4)}.` : '';
        const weatherInfo = weatherData ? `The weather is ${t(weatherData.conditionKey)} at ${Math.round(weatherData.temperature)}°C.` : '';
        
        const context = [
            `Current time is ${time}.`,
            locationInfo,
            weatherInfo
        ].filter(Boolean).join(' ');

        return `${baseInstruction} ${t('aiSystemInstruction_withContext')} ${context}`;
    }, [t, language, userLocation, weatherData]);


    const sendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || isSending.current) return;
        
        isSending.current = true;
        setIsLoading(true);
        setError(null);

        const lowerCaseMessage = messageText.toLowerCase();

        if (lowerCaseMessage.includes('gadha')) {
            const userMessage: Message = { role: 'user', text: messageText };
            setMessages(prev => [...prev, userMessage, { role: 'model', text: t('aiResponse_donkey'), isSpecial: true }]);
            playSoundEffect('donkey');
            setInput('');
            setIsLoading(false);
            isSending.current = false;
            return;
        }

        const isMusicRequest = lowerCaseMessage.includes(t('voice_cmd_play_music')) || lowerCaseMessage.includes(t('voice_cmd_radio'));
        
        const ai = getAiInstance();
        if (!ai) {
            setIsLoading(false);
            isSending.current = false;
            return;
        }

        const userMessage: Message = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);

        try {
            const sentiment = await analyzeSentiment(messageText);
            
            let systemInstruction: string;
            if (isMusicRequest) {
                 const weatherContext = weatherData ? `The weather is currently ${t(weatherData.conditionKey)}.` : '';
                 systemInstruction = `${t('aiDjInstruction')} The user's mood is ${sentiment}. ${weatherContext}`;
            } else {
                systemInstruction = getSystemInstruction(sentiment);
            }
            
            const chatHistory = (messagesRef.current || []).filter(m => m.text).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
                history: chatHistory
            });

            const result = await chat.sendMessageStream({ message: userMessage.text });

            let accumulatedText = '';
            for await (const chunk of result) {
                accumulatedText += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: accumulatedText };
                    return newMessages;
                });
            }

        } catch (e) {
            console.error("Gemini API error:", e);
            setError(t('error_ai_response'));
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
            isSending.current = false;
        }
    }, [t, analyzeSentiment, getAiInstance, weatherData, getSystemInstruction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
        setInput('');
    };

    useEffect(() => {
        if (initialQuery && !initialQueryProcessed.current) {
            initialQueryProcessed.current = true;
            setMessages([]); 
            sendMessage(initialQuery);
        }
    }, [initialQuery, sendMessage]);

    const isInputDisabled = isLoading || !isReady;

    return (
        <div className="ai-screen">
            <div className="ai-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`ai-message ${msg.role} ${msg.isSpecial ? 'special' : ''}`}>
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            {error && <p className="ai-error">{error}</p>}
            <form className="ai-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('aiCompanionPlaceholder')}
                    disabled={isInputDisabled}
                />
                <button type="submit" disabled={!input.trim() || isInputDisabled}>
                   <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default AiCompanionScreen;
