'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Phone,
  Video,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';

// Types
interface Student {
  id: string;
  name: string;
  avatar?: string;
  mood?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  priority: 'normal' | 'urgent';
  status: 'active' | 'waiting' | 'ended';
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'student' | 'counselor';
  timestamp: Date;
  read: boolean;
}

// Mock data
const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'John Smith',
    mood: 'anxious',
    lastMessage: 'I am feeling really stressed about exams...',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 2,
    priority: 'urgent',
    status: 'active',
  },
  {
    id: 's2',
    name: 'Emily Johnson',
    mood: 'sad',
    lastMessage: 'Thank you for listening to me today.',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
    unreadCount: 0,
    priority: 'normal',
    status: 'active',
  },
  {
    id: 's3',
    name: 'Michael Brown',
    mood: 'neutral',
    lastMessage: 'Can we schedule a follow-up session?',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 1,
    priority: 'normal',
    status: 'waiting',
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  s1: [
    {
      id: 'm1',
      content: 'Hello, I need to talk to someone about my stress.',
      sender: 'student',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: true,
    },
    {
      id: 'm2',
      content: 'Hi John, I\'m here to help. Can you tell me more about what\'s causing your stress?',
      sender: 'counselor',
      timestamp: new Date(Date.now() - 9 * 60 * 1000),
      read: true,
    },
    {
      id: 'm3',
      content: 'I have final exams coming up and I feel like I\'m not prepared at all.',
      sender: 'student',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      read: true,
    },
    {
      id: 'm4',
      content: 'I am feeling really stressed about exams...',
      sender: 'student',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
  ],
  s2: [
    {
      id: 'm5',
      content: 'Thank you for listening to me today.',
      sender: 'student',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
    },
  ],
  s3: [
    {
      id: 'm6',
      content: 'Can we schedule a follow-up session?',
      sender: 'student',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
  ],
};

export default function ChatPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedStudent) {
      setMessages(mockMessages[selectedStudent.id] || []);
      // Mark messages as read
      setStudents(prev => 
        prev.map(s => 
          s.id === selectedStudent.id ? { ...s, unreadCount: 0 } : s
        )
      );
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedStudent) return;

    const message: ChatMessage = {
      id: `m${Date.now()}`,
      content: newMessage,
      sender: 'counselor',
      timestamp: new Date(),
      read: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update last message in student list
    setStudents(prev =>
      prev.map(s =>
        s.id === selectedStudent.id
          ? { ...s, lastMessage: newMessage, lastMessageTime: new Date() }
          : s
      )
    );
  };

  const getMoodEmoji = (mood?: string) => {
    const moods: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      angry: '😠',
      neutral: '😐',
      stressed: '😫',
    };
    return moods[mood || 'neutral'] || '😐';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Student List Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Active Chats
            </CardTitle>
            <Badge variant="secondary">{students.filter(s => s.status === 'active').length}</Badge>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-2">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedStudent?.id === student.id
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 text-sm">{getMoodEmoji(student.mood)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{student.name}</span>
                        {student.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {student.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{student.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {student.lastMessageTime && formatTime(student.lastMessageTime)}
                        </span>
                        {student.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs py-0">Urgent</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedStudent ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {selectedStudent.name}
                      <span className="text-lg">{getMoodEmoji(selectedStudent.mood)}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </span>
                      {selectedStudent.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4" ref={scrollRef as any}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'counselor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'counselor'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          message.sender === 'counselor' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          <span className="text-xs">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.sender === 'counselor' && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                🔒 All conversations are encrypted and confidential
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-sm">Choose a student from the list to start chatting</p>
            </div>
          </div>
        )}
      </Card>

      {/* Info Panel */}
      {selectedStudent && (
        <Card className="w-72 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Student Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarFallback className="text-2xl">
                  {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium">{selectedStudent.name}</h3>
              <p className="text-sm text-muted-foreground">Student ID: {selectedStudent.id}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Mood</span>
                <span className="flex items-center gap-1">
                  {getMoodEmoji(selectedStudent.mood)} {selectedStudent.mood || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Priority</span>
                <Badge variant={selectedStudent.priority === 'urgent' ? 'destructive' : 'secondary'}>
                  {selectedStudent.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="capitalize">{selectedStudent.status}</Badge>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                <User className="h-4 w-4 mr-2" />
                View Full Profile
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Session History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
