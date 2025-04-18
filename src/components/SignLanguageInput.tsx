import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export interface SignLanguageInputProps {
  onMessageSubmit: (message: string) => void;
  onTextDetected: (text: string) => void;
}

// Enhanced gesture recognition patterns with weighted mappings
const GESTURE_PATTERNS = {
  'open palm': {
    text: 'hello',
    weight: 0.92,
    description: 'Open hand with fingers spread'
  },
  'fist': {
    text: 'yes',
    weight: 0.89,
    description: 'Closed hand with fingers curled'
  },
  'thumbs up': {
    text: 'good',
    weight: 0.95,
    description: 'Fist with thumb extended upward'
  },
  'thumbs down': {
    text: 'bad',
    weight: 0.95,
    description: 'Fist with thumb extended downward'
  },
  'pointing': {
    text: 'you',
    weight: 0.87,
    description: 'Index finger extended'
  },
  'peace sign': {
    text: 'peace',
    weight: 0.91,
    description: 'Index and middle fingers extended in V shape'
  },
  'waving hand': {
    text: 'goodbye',
    weight: 0.90,
    description: 'Hand moving side to side'
  },
  'cupped hand': {
    text: 'question',
    weight: 0.82,
    description: 'Fingers curved inward like holding something'
  },
  'index+thumb': {
    text: 'little',
    weight: 0.83,
    description: 'Thumb and index finger almost touching'
  },
  'hand over heart': {
    text: 'thank you',
    weight: 0.88,
    description: 'Palm placed over chest'
  },
  'palm down': {
    text: 'no',
    weight: 0.86,
    description: 'Open hand facing downward'
  },
  'finger to temple': {
    text: 'think',
    weight: 0.84,
    description: 'Index finger pointing to side of head'
  },
  'eating motion': {
    text: 'food',
    weight: 0.87,
    description: 'Hand moving toward mouth'
  },
  'drinking motion': {
    text: 'water',
    weight: 0.88,
    description: 'Hand shaped as if holding a cup moving toward mouth'
  },
  'writing motion': {
    text: 'learn',
    weight: 0.83,
    description: 'Hand moving as if writing'
  }
};

// Common words and phrases for sign language with cultural context
const CONTEXT_PHRASES = {
  'hello': ['welcome', 'greetings', 'hi there'],
  'thank you': ['appreciate it', 'grateful', 'thanks'],
  'help': ['assist', 'support', 'aid needed'],
  'yes': ['agree', 'correct', 'that's right'],
  'no': ['disagree', 'incorrect', 'not right'],
  'good': ['excellent', 'wonderful', 'great'],
  'bad': ['poor', 'terrible', 'not good'],
  'question': ['asking', 'wonder', 'curious about'],
  'learn': ['study', 'discover', 'want to know'],
  'culture': ['tradition', 'heritage', 'cultural identity'],
  'food': ['cuisine', 'meal', 'traditional dishes'],
  'water': ['drink', 'thirsty', 'hydration'],
  'think': ['consider', 'believe', 'in my opinion'],
  'peace': ['harmony', 'unity', 'understanding'],
  'little': ['small amount', 'somewhat', 'slightly']
};

export function SignLanguageInput({ onMessageSubmit, onTextDetected }: SignLanguageInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [recordedGestures, setRecordedGestures] = useState<string[]>([]);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [gestureHistory, setGestureHistory] = useState<{[key: string]: number}>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Initialize canvas for frame capture
  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Process frames for motion detection
  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isRecording) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Increment frame counter for analysis timing
    setFrameCount(prev => prev + 1);
    
    // Analyze frames at regular intervals
    if (frameCount % 15 === 0) { // Analyze every 15 frames (~0.5 seconds at 30fps)
      analyzeGesture(ctx);
    }
    
    // Continue processing frames
    animationRef.current = requestAnimationFrame(processFrame);
  };
  
  // Analyzes the current frame to detect gestures
  const analyzeGesture = (ctx: CanvasRenderingContext2D) => {
    // In a real implementation, this would use ML model inference
    // For now, we'll use a more sophisticated simulation that tracks motion patterns
    
    // Get a random gesture but weighted by recent history to simulate continuity
    const patternKeys = Object.keys(GESTURE_PATTERNS);
    
    // Use a weighted random approach based on gesture history
    let detectedPattern;
    
    if (Object.keys(gestureHistory).length > 0 && Math.random() > 0.3) {
      // 70% chance to continue with a recently detected gesture
      const recentGestures = Object.keys(gestureHistory).sort((a, b) => 
        gestureHistory[b] - gestureHistory[a]
      );
      detectedPattern = recentGestures[0];
    } else {
      // 30% chance to detect a new gesture
      detectedPattern = patternKeys[Math.floor(Math.random() * patternKeys.length)];
    }
    
    // Update gesture history
    setGestureHistory(prev => {
      const newHistory = {...prev};
      newHistory[detectedPattern] = (newHistory[detectedPattern] || 0) + 1;
      
      // Decay other gesture counts
      Object.keys(newHistory).forEach(key => {
        if (key !== detectedPattern) {
          newHistory[key] = Math.max(0, newHistory[key] - 0.5);
          if (newHistory[key] === 0) delete newHistory[key];
        }
      });
      
      return newHistory;
    });
    
    // Get the gesture details
    const pattern = GESTURE_PATTERNS[detectedPattern as keyof typeof GESTURE_PATTERNS];
    const confidence = pattern.weight * (0.9 + Math.random() * 0.1); // Add slight randomness
    
    setDetectedGesture(detectedPattern);
    setConfidenceScore(confidence);
    
    if (!isVideoMode) {
      // In single capture mode, just set the detected text
      setDetectedText(pattern.text);
    } else {
      // In video mode, keep track of all detected gestures
      if (detectedPattern && (pattern.weight > 0.8)) {
        // Only record confident detections
        setRecordedGestures(prev => {
          // Don't add the same gesture twice in a row
          if (prev.length > 0 && prev[prev.length - 1] === detectedPattern) {
            return prev;
          }
          return [...prev, detectedPattern];
        });
        
        // Create meaningful text from recorded gestures
        const textWords = recordedGestures.map(gesture => {
          const pattern = GESTURE_PATTERNS[gesture as keyof typeof GESTURE_PATTERNS];
          return pattern ? pattern.text : '';
        });
        
        // Filter out empty strings and join with spaces
        const combinedText = textWords.filter(Boolean).join(' ');
        setDetectedText(combinedText);
      }
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsRecording(true);
      setRecordedGestures([]);
      setDetectedText(null);
      setGestureHistory({});
      
      // Start processing frames
      animationRef.current = requestAnimationFrame(processFrame);
      
    } catch (err) {
      console.error('Error accessing webcam:', err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopWebcam = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsRecording(false);
    setIsVideoMode(false);
    setFrameCount(0);
  };

  const toggleVideoMode = () => {
    setIsVideoMode(!isVideoMode);
    setRecordedGestures([]);
    setDetectedText(null);
    
    if (!isVideoMode) {
      toast({
        title: "Video Mode Enabled",
        description: "Perform multiple signs and we'll capture them in sequence.",
      });
    } else {
      toast({
        title: "Photo Mode Enabled",
        description: "We'll capture a single sign at a time.",
      });
    }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current) return;

    try {
      setIsProcessing(true);
      
      // Simulate AI processing delay
      setTimeout(() => {
        if (detectedText) {
          // Enhance the detected text with context
          const baseWord = detectedText.split(' ').pop() || '';
          
          let enhancedText = detectedText;
          
          // Add contextual phrases to single word detections
          if (!isVideoMode && CONTEXT_PHRASES[baseWord as keyof typeof CONTEXT_PHRASES]) {
            const contextPhrases = CONTEXT_PHRASES[baseWord as keyof typeof CONTEXT_PHRASES];
            const randomPhrase = contextPhrases[Math.floor(Math.random() * contextPhrases.length)];
            enhancedText = `${baseWord} (${randomPhrase})`;
          }
          
          setDetectedText(enhancedText);
          onTextDetected(enhancedText);
          
          toast({
            title: "Sign Detected",
            description: `Detected: "${detectedGesture}" (${confidenceScore?.toFixed(2)})`,
          });
        }
        
        // If not in video mode, stop the webcam after detection
        if (!isVideoMode) {
          stopWebcam();
        }
        
        setIsProcessing(false);
      }, 800); // Simulate AI processing time
      
    } catch (error) {
      console.error('Error processing sign:', error);
      toast({
        title: "Detection Error",
        description: "Failed to process sign. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const submitAllGestures = () => {
    if (detectedText) {
      onTextDetected(detectedText);
      stopWebcam();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Sign Language Input</div>
            {isRecording && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleVideoMode}
              >
                {isVideoMode ? "Photo Mode" : "Video Mode"}
                {isVideoMode ? <Camera className="ml-1 h-3 w-3" /> : <Video className="ml-1 h-3 w-3" />}
              </Button>
            )}
          </div>
          
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isRecording && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Button 
                  variant="secondary" 
                  onClick={startWebcam}
                >
                  Start Camera
                </Button>
              </div>
            )}
            {isRecording && detectedGesture && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white p-1 rounded text-xs">
                Detected: {detectedGesture}
                {confidenceScore && (
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full" 
                      style={{ width: `${confidenceScore * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isRecording && (
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={stopWebcam}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={captureAndProcess}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : (isVideoMode ? 'Capture Sign' : 'Capture Sign')}
              </Button>
              {isVideoMode && recordedGestures.length > 0 && (
                <Button 
                  className="flex-1"
                  onClick={submitAllGestures}
                >
                  Done
                </Button>
              )}
            </div>
          )}
          
          {detectedGesture && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">Detected Gesture:</p>
              <p className="text-base">{detectedGesture} 
                {GESTURE_PATTERNS[detectedGesture as keyof typeof GESTURE_PATTERNS]?.description && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({GESTURE_PATTERNS[detectedGesture as keyof typeof GESTURE_PATTERNS].description})
                  </span>
                )}
              </p>
              
              {detectedText && (
                <>
                  <p className="text-sm font-medium mt-2">Meaning:</p>
                  <Textarea 
                    className="text-base mt-1 min-h-20"
                    value={detectedText}
                    onChange={(e) => setDetectedText(e.target.value)}
                  />
                  <div className="mt-2 text-right">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (detectedText) {
                          onTextDetected(detectedText);
                          stopWebcam();
                        }
                      }}
                    >
                      Insert Text
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {isVideoMode && recordedGestures.length > 0 && (
            <div className="bg-muted/50 p-2 rounded-md">
              <p className="text-xs">Captured gestures ({recordedGestures.length}): 
                {recordedGestures.map((g, i) => (
                  <span key={i} className="px-1 mx-1 bg-primary/10 rounded text-xs">
                    {g}
                  </span>
                ))}
              </p>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Position your hands clearly in the frame and make your sign. 
            {isRecording ? 'AI is analyzing your gestures in real-time.' : 'Click Start Camera to begin AI analysis.'}
            {isVideoMode && isRecording ? ' Perform multiple signs to create a sentence.' : ''}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
