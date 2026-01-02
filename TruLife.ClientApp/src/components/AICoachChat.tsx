import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { getApiUrl } from '../services/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface AICoachChatProps {
    coachType: 'PersonalTrainer' | 'MindsetCoach';
    title: string;
    icon: string;
}

export default function AICoachChat({ coachType, title, icon }: AICoachChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadHistory();
    }, [coachType]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        try {
            const response = await fetch(getApiUrl(`/api/coaching/history/${coachType}`), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const history = await response.json();
                setMessages(history);
            }
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setLoading(true);

        // Add user message immediately
        const newUserMessage: Message = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };
        setMessages([...messages, newUserMessage]);

        try {
            const response = await fetch(getApiUrl('/api/coaching/message'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    coachType,
                    message: userMessage
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage: Message = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: data.timestamp
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        if (!confirm('Clear all conversation history?')) return;

        try {
            const response = await fetch(getApiUrl(`/api/coaching/history/${coachType}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setMessages([]);
            }
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    const getSuggestedPrompts = () => {
        if (coachType === 'PersonalTrainer') {
            return [
                "How can I improve my squat form?",
                "What's the best way to build muscle?",
                "How often should I train each muscle group?",
                "I'm plateauing on bench press, what should I do?"
            ];
        } else {
            return [
                "I'm struggling to stay consistent",
                "How do I stay motivated?",
                "I feel overwhelmed by my fitness goals",
                "How can I build better habits?"
            ];
        }
    };

    if (loadingHistory) {
        return <div className="text-center py-8"><div className="spinner"></div></div>;
    }

    return (
        <div className="ai-coach-chat flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span>{icon}</span>
                    {title}
                </h3>
                {messages.length > 0 && (
                    <button
                        className="btn btn-sm btn-ghost text-red-600"
                        onClick={clearHistory}
                    >
                        <Trash2 size={16} />
                        Clear
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                            Start a conversation with your {title}
                        </p>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Suggested prompts:</p>
                            {getSuggestedPrompts().map((prompt, idx) => (
                                <button
                                    key={idx}
                                    className="block w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
                                    onClick={() => setInput(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-900'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="input flex-1"
                        placeholder="Ask your coach..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={loading}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
