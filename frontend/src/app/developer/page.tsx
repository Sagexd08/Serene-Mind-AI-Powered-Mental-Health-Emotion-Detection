"use client";

import { useState, useEffect } from 'react';
import { config } from '@/config';
import { Plus, Trash, Copy, Key as KeyIcon, Terminal, Eye, EyeOff, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiKey {
    api_key: string;
    label: string;
    created_at: number;
    is_active: boolean;
    usage_count?: number;
}

export default function DeveloperConsole() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedTabDoc, setSelectedTabDoc] = useState<'curl' | 'python' | 'javascript'>('curl');

    const fetchKeys = async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/api-keys`, {
                // Auth headers removed for anonymous/dev mode
            });
            if (res.ok) {
                const data = await res.json();
                setKeys(data.sort((a: ApiKey, b: ApiKey) => b.created_at - a.created_at));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const createKey = async () => {
        if (!newLabel.trim()) {
            alert("Please enter a key label");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch(`${config.apiBaseUrl}/api-keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ label: newLabel })
            });
            if (res.ok) {
                await fetchKeys();
                setNewLabel("");
                setSuccessMessage("API Key generated successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                alert("Failed to create key");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating key");
        } finally {
            setIsCreating(false);
        }
    };

    const deleteKey = async (apiKey: string, label: string) => {
        if (!confirm(`Revoke API key "${label}"? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`${config.apiBaseUrl}/api-keys/${apiKey}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setKeys(keys.filter(k => k.api_key !== apiKey));
                setSuccessMessage("API Key revoked successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (e) {
            console.error(e);
            alert("Error revoking key");
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const toggleKeyVisibility = (key: string) => {
        setVisibleKeys(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    };

    const maskedKey = (key: string) => {
        return key.substring(0, 7) + "..." + key.substring(key.length - 4);
    };

    const activeKeyCount = keys.filter(k => k.is_active).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                                <KeyIcon size={28} className="text-white" />
                            </div>
                            Developer Console
                        </h1>
                        <p className="text-gray-600">Manage API keys and integrate with SereneMind</p>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600">Active Keys</p>
                        <p className="text-3xl font-bold text-green-600">{activeKeyCount}</p>
                    </div>
                </motion.div>

                {/* Success Message */}
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-2 text-green-700"
                    >
                        <CheckCircle size={20} />
                        {successMessage}
                    </motion.div>
                )}

                {/* Create Key Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
                >
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                        <Plus size={22} className="text-blue-600" /> Generate New API Key
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">Create a new API key for third-party integrations. Keys are unique and can be revoked anytime.</p>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && createKey()}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Key label (e.g., Mobile App, Dashboard, Webhook)"
                        />
                        <button
                            onClick={createKey}
                            disabled={isCreating || !newLabel.trim()}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} /> Generate
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Keys List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your API Keys</h2>
                    {isLoading ? (
                        <div className="text-center p-8 bg-white rounded-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                            <p className="text-gray-500">Loading keys...</p>
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                            <KeyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No API keys yet</p>
                            <p className="text-gray-400 text-sm">Create your first API key above to get started</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {keys.map((key) => (
                                <motion.div
                                    key={key.api_key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-6"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="font-semibold text-gray-800 text-lg">{key.label}</span>
                                                {key.is_active ? (
                                                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                                        <Zap size={12} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">Revoked</span>
                                                )}
                                            </div>

                                            {/* Key Display */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-3 font-mono text-sm flex items-center justify-between">
                                                <span className="text-gray-700 break-all">
                                                    {visibleKeys.has(key.api_key) ? key.api_key : maskedKey(key.api_key)}
                                                </span>
                                                <div className="flex items-center gap-2 ml-2">
                                                    <button
                                                        onClick={() => toggleKeyVisibility(key.api_key)}
                                                        className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                                                        title={visibleKeys.has(key.api_key) ? "Hide" : "Show"}
                                                    >
                                                        {visibleKeys.has(key.api_key) ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(key.api_key, key.api_key)}
                                                        className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                                                        title="Copy"
                                                    >
                                                        {copiedKey === key.api_key ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Key Stats */}
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                                <div>
                                                    <p className="text-gray-500 text-xs">Created</p>
                                                    <p className="font-medium">{new Date(key.created_at * 1000).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs">Usage</p>
                                                    <p className="font-medium">{key.usage_count || 0} requests</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => deleteKey(key.api_key, key.label)}
                                            className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Revoke Key"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Documentation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="border-b border-gray-700">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Terminal size={24} className="text-green-400" /> Integration Guide
                            </h2>

                            {/* Tab Buttons */}
                            <div className="flex gap-2 border-b border-gray-700 pb-4">
                                {['curl', 'python', 'javascript'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedTabDoc(tab as any)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTabDoc === tab
                                                ? 'bg-green-600 text-white'
                                                : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                    >
                                        {tab.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* cURL Example */}
                        {selectedTabDoc === 'curl' && (
                            <div>
                                <h3 className="text-green-400 font-mono mb-3 text-lg">Text Emotion Analysis</h3>
                                <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-300 border border-gray-700">
                                    {`curl -X POST ${config.apiBaseUrl}/emotion/text \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your_api_key_here" \\
  -d '{
    "text": "I feel amazing today!"
  }'`}
                                </pre>
                                <h3 className="text-green-400 font-mono mt-6 mb-3 text-lg">Expected Response</h3>
                                <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-green-300 border border-gray-700">
                                    {`{
  "emotion": "joy",
  "confidence": 0.94,
  "details": {
    "anger": 0.02,
    "disgust": 0.01,
    "fear": 0.01,
    "joy": 0.94,
    "sadness": 0.01,
    "neutral": 0.01
  },
  "timestamp": 1703179200000
}`}
                                </pre>
                            </div>
                        )}

                        {/* Python Example */}
                        {selectedTabDoc === 'python' && (
                            <div>
                                <h3 className="text-green-400 font-mono mb-3 text-lg">Python Integration</h3>
                                <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-300 border border-gray-700">
                                    {`import requests

api_key = "your_api_key_here"
headers = {
    "Content-Type": "application/json",
    "x-api-key": api_key
}

# Text Emotion Analysis
response = requests.post(
    "${config.apiBaseUrl}/emotion/text",
    json={"text": "I feel amazing!"},
    headers=headers
)
result = response.json()
print(f"Emotion: {result['emotion']}")
print(f"Confidence: {result['confidence']}")

# Audio Analysis
with open("audio.wav", "rb") as f:
    audio_b64 = f.read()

response = requests.post(
    "${config.apiBaseUrl}/emotion/audio",
    json={"audio": audio_b64.decode()},
    headers=headers
)
result = response.json()`}
                                </pre>
                            </div>
                        )}

                        {/* JavaScript Example */}
                        {selectedTabDoc === 'javascript' && (
                            <div>
                                <h3 className="text-green-400 font-mono mb-3 text-lg">JavaScript Integration</h3>
                                <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-300 border border-gray-700">
                                    {`const API_KEY = "your_api_key_here";
const API_URL = "${config.apiBaseUrl}";

// Text Emotion Analysis
async function analyzeText(text) {
  const response = await fetch(\`\${API_URL}/emotion/text\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    body: JSON.stringify({ text })
  });
  return await response.json();
}

// Usage
const result = await analyzeText("I feel amazing!");
console.log(\`Emotion: \${result.emotion}\`);
console.log(\`Confidence: \${result.confidence}\`);`}
                                </pre>
                            </div>
                        )}

                        {/* Available Endpoints */}
                        <div className="mt-8 pt-6 border-t border-gray-700">
                            <h3 className="text-blue-400 font-mono mb-4 text-lg">Available Endpoints</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex gap-3">
                                    <code className="bg-black/50 text-cyan-300 px-3 py-1 rounded flex-shrink-0">POST</code>
                                    <div>
                                        <p className="text-blue-300 font-mono">/emotion/text</p>
                                        <p className="text-gray-400">Analyze text for emotional content</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <code className="bg-black/50 text-cyan-300 px-3 py-1 rounded flex-shrink-0">POST</code>
                                    <div>
                                        <p className="text-blue-300 font-mono">/emotion/audio</p>
                                        <p className="text-gray-400">Analyze voice recordings (base64 WAV/MP3)</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <code className="bg-black/50 text-cyan-300 px-3 py-1 rounded flex-shrink-0">POST</code>
                                    <div>
                                        <p className="text-blue-300 font-mono">/emotion/face</p>
                                        <p className="text-gray-400">Detect facial emotions in images (base64)</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <code className="bg-black/50 text-cyan-300 px-3 py-1 rounded flex-shrink-0">POST</code>
                                    <div>
                                        <p className="text-blue-300 font-mono">/risk/score</p>
                                        <p className="text-gray-400">Calculate mental health risk assessment</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Headers Info */}
                        <div className="mt-8 pt-6 border-t border-gray-700">
                            <h3 className="text-amber-400 font-mono mb-4 text-lg">Required Headers</h3>
                            <div className="space-y-2 text-sm font-mono text-gray-300">
                                <div><span className="text-purple-300">x-api-key:</span> <span className="text-gray-400">Your API key (sk_...)</span></div>
                                <div><span className="text-purple-300">Content-Type:</span> <span className="text-gray-400">application/json</span></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
