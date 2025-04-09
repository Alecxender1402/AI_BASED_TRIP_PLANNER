import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, ChevronDown, ChevronUp, User, Bot } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatInterfaceProps {
  itineraryId?: string;
  itineraryContext?: any;
  onSendMessage?: (message: string) => Promise<string>;
  isCollapsible?: boolean;
}

// Helper function to format bot responses
const formatBotResponse = (text: string): string => {
  // Remove ** markdown formatting
  let formattedText = text.replace(/\*\*/g, "");

  // Convert numbered points with periods (e.g., "1. Text") to proper bullet points
  formattedText = formattedText.replace(/^(\d+)\. (.+)$/gm, "• $2");

  // Convert lines that start with city names in parentheses to bullet points
  formattedText = formattedText.replace(
    /^\s*\(([^)]+)\)\s*(.+)$/gm,
    "• $1: $2",
  );

  return formattedText;
};

const ChatInterface = ({
  itineraryId = "default-itinerary",
  itineraryContext,
  onSendMessage = async (message) => {
    try {
      if (!itineraryContext) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return "I don't have access to your itinerary details yet. Please create an itinerary first.";
      }

      // Import dynamically to avoid circular dependencies
      const { answerItineraryQuestion } = await import("@/lib/deepseek");
      return await answerItineraryQuestion(message, itineraryContext);
    } catch (error) {
      console.error("Error getting response:", error);
      return "Sorry, I encountered an error processing your request. Please try again.";
    }
  },
  isCollapsible = true,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I can help answer questions about your trip itinerary. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      let response = await onSendMessage(inputValue);

      // Format the response to remove ** and convert to point-wise format
      response = formatBotResponse(response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card className="w-full max-w-md bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="p-4 border-b bg-primary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Trip Assistant</CardTitle>
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <ScrollArea className="h-[350px] p-4">
            <CardContent className="p-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`p-1 rounded-full ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        {message.sender === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                      >
                        <div className="text-sm whitespace-pre-line">
                          {message.content}
                        </div>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </ScrollArea>

          <CardFooter className="p-4 border-t bg-background">
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="Ask about your trip..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ChatInterface;
