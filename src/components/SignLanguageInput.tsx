
import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { pipeline } from "@huggingface/transformers";

export interface SignLanguageInputProps {
  onMessageSubmit: (message: string) => void;
}

export function SignLanguageInput({ onMessageSubmit }: SignLanguageInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
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
    } catch (err) {
      console.error('Error accessing webcam:', err);
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
      
      // Convert to image for processing
      const imageBlob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg')
      );

      // Initialize the image classification pipeline
      const classifier = await pipeline(
        "image-classification",
        "sign-language-model/asl-signs"
      );

      // Process the image
      const results = await classifier(imageBlob);
      
      if (results && Array.isArray(results) && results[0] && results[0].score !== undefined) {
        // Access the first result which should have the highest score
        const detectedSign = results[0].label || "Unknown sign";
        onMessageSubmit(detectedSign);
      } else {
        console.error('Unexpected result format:', results);
      }

      stopWebcam();
    } catch (error) {
      console.error('Error processing sign:', error);
    } finally {
      setIsProcessing(false);
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
          <div className="text-sm font-medium">Sign Language Input</div>
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
                {isProcessing ? 'Processing...' : 'Capture Sign'}
              </Button>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Position your hands clearly in the frame and make your sign. 
            Click capture when ready.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
