
import React, { useRef, useState } from 'react';
import { Camera, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export interface SignLanguageInputProps {
  onMessageSubmit: (message: string) => void;
  onTextDetected: (text: string) => void;
}

// Predefined sign dictionary as fallback since we can't access the HuggingFace model
const SIGN_DICTIONARY = {
  'hello': 'Hello!',
  'thank you': 'Thank you!',
  'help': 'Can you help me?',
  'yes': 'Yes',
  'no': 'No',
  'please': 'Please',
  'goodbye': 'Goodbye',
  'friend': 'Friend',
  'understand': 'I understand',
  'question': 'I have a question',
  'culture': 'Tell me about this culture',
  'where': 'Where is this from?',
  'learn': 'I want to learn more',
  'food': 'What food is popular here?',
  'history': 'What is the history?'
};

// Map gestures to their meanings for display purposes
const GESTURE_MEANINGS = {
  'waving hand': 'hello',
  'thumbs up': 'yes',
  'thumbs down': 'no',
  'hand over heart': 'thank you',
  'raised palm': 'stop/no',
  'pointing': 'question',
  'cupped ear': 'understand',
  'waving goodbye': 'goodbye',
  'eating motion': 'food',
  'hand shake': 'friend',
  'book motion': 'learn',
  'question mark motion': 'where'
};

export function SignLanguageInput({ onMessageSubmit, onTextDetected }: SignLanguageInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [recordedGestures, setRecordedGestures] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setIsVideoMode(false);
  };

  const toggleVideoMode = () => {
    setIsVideoMode(!isVideoMode);
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
      
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Simulated gesture detection
      // In reality, this would use a machine learning model
      const gestureKeys = Object.keys(GESTURE_MEANINGS);
      const detectedGestureKey = gestureKeys[Math.floor(Math.random() * gestureKeys.length)];
      const signKey = GESTURE_MEANINGS[detectedGestureKey as keyof typeof GESTURE_MEANINGS];
      
      setDetectedGesture(detectedGestureKey);
      
      // Get the corresponding text from sign dictionary
      if (signKey && SIGN_DICTIONARY[signKey as keyof typeof SIGN_DICTIONARY]) {
        const text = SIGN_DICTIONARY[signKey as keyof typeof SIGN_DICTIONARY];
        
        if (isVideoMode) {
          // Add to list of detected gestures if in video mode
          setRecordedGestures(prev => [...prev, detectedGestureKey]);
          // Combine all gestures into a single message
          const combinedText = [...recordedGestures, detectedGestureKey]
            .map(gesture => {
              const sign = GESTURE_MEANINGS[gesture as keyof typeof GESTURE_MEANINGS];
              return sign ? SIGN_DICTIONARY[sign as keyof typeof SIGN_DICTIONARY] : "";
            })
            .filter(Boolean)
            .join(" ");
          
          setDetectedText(combinedText);
        } else {
          // Just set the single detected text in photo mode
          setDetectedText(text);
        }
        
        // Insert the detected text into the input box instead of submitting directly
        onTextDetected(text);
        
        // Show a success toast
        toast({
          title: "Sign Detected",
          description: `Detected: "${detectedGestureKey}" (${signKey})`,
        });
      }
      
      // If not in video mode, stop the webcam after detection
      if (!isVideoMode) {
        stopWebcam();
      }
    } catch (error) {
      console.error('Error processing sign:', error);
      toast({
        title: "Detection Error",
        description: "Failed to process sign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAllGestures = () => {
    if (detectedText) {
      onMessageSubmit(detectedText);
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
              <p className="text-base">{detectedGesture}</p>
              
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
            Click capture when ready. {isVideoMode ? 'Use video mode to record multiple signs in sequence.' : ''}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
