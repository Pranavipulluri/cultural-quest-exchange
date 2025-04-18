
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { SignLanguageInput } from './SignLanguageInput';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Predefined cultural responses for demonstration
const CULTURAL_RESPONSES = {
  "hello": "Welcome to Cultural Quest! How can I assist you today?",
  "help": "I can help you learn about different cultures, recommend places to visit, and answer questions about traditions around the world.",
  "culture": "Culture encompasses the customs, arts, social institutions, and achievements of a particular nation, people, or social group.",
  "tradition": "Traditions are customs or beliefs passed from generation to generation, often forming an important part of cultural identity.",
  "food": "Food is a central aspect of cultural identity! Would you like to learn about dishes from a specific region?",
  "language": "Language is a fundamental part of cultural heritage. The world has approximately 7,000 languages!",
  "festival": "Festivals are joyous celebrations that often mark important cultural or religious events.",
  "clothing": "Traditional clothing or dress varies widely across cultures and often reflects climate, resources, and social customs.",
  "music": "Music is a universal language that varies beautifully across cultures, using different instruments, scales, and traditions.",
  "dance": "Dance is a powerful form of cultural expression found in every society, from traditional to contemporary forms.",
  "religion": "Religious beliefs and practices are central to many cultures and shape traditions, values, and social structures.",
  "art": "Art reflects cultural values, history, and worldview through various mediums like painting, sculpture, and crafts.",
  "history": "Understanding cultural history helps us appreciate the development of traditions, values, and social practices.",
  "default": "That's an interesting question about culture! I'd be happy to explore this further with you."
};

function getResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords in the message
  for (const [keyword, response] of Object.entries(CULTURAL_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  // Default response if no keywords match
  return CULTURAL_RESPONSES.default;
}

export default function HomeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to Cultural Quest! I can help you learn about cultures around the world. What would you like to know?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (text: string = inputValue) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate bot thinking
    setTimeout(() => {
      // Add bot response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getResponse(text),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleSignLanguageDetection = (text: string) => {
    setInputValue(text);
  };
  
  return (
    <>
      {/* Floating chat button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Chat panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 md:w-96 shadow-xl z-50 border border-orange-500/30 bg-background/95 backdrop-blur-sm">
          <CardHeader className="p-4 pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-playfair">Cultural Assistant</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
                      {message.sender === 'bot' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/lovable-uploads/91bf8199-59a4-4e3e-96c1-10cd41b289f1.png" />
                          <AvatarFallback>CQ</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <SignLanguageInput 
                onMessageSubmit={(text) => {
                  handleSendMessage(text);
                }}
                onTextDetected={handleSignLanguageDetection}
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
