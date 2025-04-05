import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, NPCPopoverContent } from "@/components/ui/popover";
import { 
  ArrowLeft, MapPin, TreePalm, Image, Gamepad, Waves, 
  ChevronLeft, ChevronRight, Flag, Music, Utensils, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const MAP_WIDTH = 1000;  
const MAP_HEIGHT = 1000; 
const CHARACTER_SIZE = 24;

const landmarks = [
  { 
    id: 1, 
    name: "Village Center", 
    x: 520, 
    y: 420, 
    description: "The central hub of the village with various services and shops.",
    image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 2, 
    name: "Forest Path", 
    x: 300, 
    y: 150, 
    description: "A winding path through the dense green forest.",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 3, 
    name: "Farm House", 
    x: 700, 
    y: 200, 
    description: "A local farm with crops and animals.",
    image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 4, 
    name: "Town Square", 
    x: 400, 
    y: 600, 
    description: "The main gathering place for villagers and visitors.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 5, 
    name: "Pond", 
    x: 600, 
    y: 700, 
    description: "A serene water body surrounded by greenery.",
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 6, 
    name: "Garden Path", 
    x: 200, 
    y: 400, 
    description: "A beautiful pathway lined with colorful flowers.",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  { 
    id: 7, 
    name: "Market", 
    x: 800, 
    y: 500, 
    description: "A bustling marketplace with local vendors.",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  }
];

const miniGames = [
  {
    id: 1,
    name: "Kerala Culture Quiz",
    x: 500,
    y: 350,
    description: "Test your knowledge about Kerala culture and traditions.",
    icon: <Brain className="w-4 h-4 text-white" />,
    color: "bg-blue-600",
    npcAvatar: "/lovable-uploads/49a90938-ee32-4179-97cf-28ed0bbecc51.png", 
    npcName: "Professor Rajan",
    npcMessage: "Namaskaram! I'm Professor Rajan. Kerala has a rich cultural heritage spanning thousands of years. This quiz will test your knowledge about our traditions, art forms, and customs. Did you know that Kerala has over 600 Ayurvedic medicinal plants? Let's see how much you know about our beautiful state!"
  },
  {
    id: 2,
    name: "Kathakali Memory Match",
    x: 380,
    y: 520,
    description: "Match pairs of Kathakali dance expressions in this memory game.",
    icon: <Music className="w-4 h-4 text-white" />,
    color: "bg-purple-600",
    npcAvatar: "/lovable-uploads/49a90938-ee32-4179-97cf-28ed0bbecc51.png",
    npcName: "Guru Menon",
    npcMessage: "Namaskaram! I am Guru Menon, a Kathakali artist. Kathakali is a classical dance form that originated in Kerala over 400 years ago. It combines dance, music, colorful makeup, and elaborate costumes to tell stories from Hindu epics. There are nine basic facial expressions we use called 'Navarasas' - can you match them all in this memory game?"
  },
  {
    id: 3,
    name: "Fishing Game",
    x: 550,
    y: 650,
    description: "Try to catch fish from the village pond using traditional techniques.",
    icon: <MapPin className="w-4 h-4 text-white" />,
    color: "bg-blue-500",
    npcAvatar: "/lovable-uploads/49a90938-ee32-4179-97cf-28ed0bbecc51.png",
    npcName: "Fisherman Antony",
    npcMessage: "Hello there! I'm Antony from the fishing community of Kerala. Fishing is an ancient tradition here, and it's still an important part of our livelihood. We use unique fishing techniques like 'Cheena vala' (Chinese nets) that were introduced by Chinese explorers centuries ago. Try your hand at catching some fish using our traditional methods!"
  },
  {
    id: 4,
    name: "Farm Harvest",
    x: 600,
    y: 250,
    description: "Help gather crops from the local farm with this Mahjong game.",
    icon: <Utensils className="w-4 h-4 text-white" />,
    color: "bg-green-600",
    npcAvatar: "/lovable-uploads/49a90938-ee32-4179-97cf-28ed0bbecc51.png",
    npcName: "Farmer Lakshmi",
    npcMessage: "Namaskaram! I'm Lakshmi, and my family has been farming in Kerala for generations. Rice is our main crop, especially the famous 'Kaima' and 'Jeerakasala' varieties. Our farming is closely tied to our festivals - Vishu celebrates the agricultural new year, and we have songs called 'Vanchipattu' that we sing while working in the fields. Help me match and harvest the crops in this game!"
  },
  {
    id: 5,
    name: "Onam Boat Race",
    x: 650,
    y: 620,
    description: "Race traditional boats through the Kerala backwaters during Onam festival.",
    icon: <Waves className="w-4 h-4 text-white" />,
    color: "bg-yellow-500",
    featured: true,
    npcAvatar: "/lovable-uploads/49a90938-ee32-4179-97cf-28ed0bbecc51.png",
    npcName: "Captain Unnikrishnan",
    npcMessage: "Namaskaram! I'm Unnikrishnan, captain of our village's boat race team. The Vallam Kali (boat race) is a spectacular part of the Onam festival celebrating the return of King Mahabali. Our snake boats, called 'Chundan Vallam', are over 100 feet long and carry up to 100 rowers! The rhythmic 'Vanchipattu' songs power our oars. Are you ready to experience the thrill of Kerala's most exciting water sport?"
  },
  {
    id: 6,
    name: "Spice Sorting",
    x: 750,
    y: 430,
    description: "Sort and identify famous Kerala spices in this fast-paced puzzle game.",
    icon: <Utensils className="w-4 h-4 text-white" />,
    color: "bg-red-600",
    npcAvatar: "/lovable-uploads/49a90938-ee32-4179-97cf-28ed0bbecc51.png",
    npcName: "Spice Merchant Fathima",
    npcMessage: "Namaskaram! I'm Fathima, a spice merchant from the hills of Kerala. Did you know that Kerala has been the center of spice trade for over 3000 years? Our black pepper was once so valuable it was called 'black gold'! We also grow cardamom, cinnamon, cloves, and many other spices that give Kerala cuisine its distinctive flavor. Try sorting these precious spices in my shop!"
  },
  {
    id: 7,
    name: "Theyyam Rhythm",
    x: 280,
    y: 280,
    description: "Match the beats of this ancient ritual performance in this rhythm game.",
    icon: <Music className="w-4 h-4 text-white" />,
    color: "bg-orange-600",
    npcAvatar: "/lovable-uploads/49a90938-ee32-4179-97cf-28ed0bbecc51.png",
    npcName: "Theyyam Performer Krishnan",
    npcMessage: "Namaskaram! I am Krishnan, a Theyyam artist. Theyyam is an ancient ritual art form of North Kerala where performers become divine incarnations through elaborate costumes and makeup. There are over 400 forms of Theyyam, each with unique rhythms, movements, and stories. Our performances often last through the night and are believed to bring blessings to the village. Try to match the sacred rhythms in this game!"
  }
];

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const NPCCharacter = ({ 
  avatar, 
  name, 
  message, 
  position = "left",
  isOpen,
  onOpenChange
}: { 
  avatar: string; 
  name: string; 
  message: string; 
  position?: "left" | "right";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <motion.div 
          className={`absolute bottom-0 ${position === "left" ? "left-2" : "right-2"} cursor-pointer z-30`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="relative">
            <img 
              src={avatar} 
              alt={name} 
              className="h-24 object-contain"
            />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-slate-900/80 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
              {name}
            </div>
          </div>
        </motion.div>
      </PopoverTrigger>
      <NPCPopoverContent characterSide={position}>
        <h4 className="text-lg font-bold text-yellow-400 mb-2">{name}</h4>
        <p className="text-white">{message}</p>
        <div className="mt-3 text-right">
          <Button 
            size="sm" 
            className="bg-yellow-600 hover:bg-yellow-700"
            onClick={() => onOpenChange(false)}
          >
            Continue
          </Button>
        </div>
      </NPCPopoverContent>
    </Popover>
  );
};

const KeralaItinerary = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 500, y: 400 });
  const [playerDirection, setPlayerDirection] = useState(Direction.DOWN);
  const [activeLandmark, setActiveLandmark] = useState<typeof landmarks[0] | null>(null);
  const [activeGame, setActiveGame] = useState<typeof miniGames[0] | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [playingGame, setPlayingGame] = useState(false);
  const [mapScale, setMapScale] = useState(1.0);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showNpcDialog, setShowNpcDialog] = useState(false);
  const [boatRaceState, setBoatRaceState] = useState({
    started: false,
    playerPosition: 0,
    aiPosition: 0,
    countdown: 3,
    finished: false,
    winner: '',
    racePath: Array(10).fill(0).map(() => Math.random() > 0.7 ? 1 : 0),
    playerSpeed: 0,
    maxSpeed: 5,
    currentPathIndex: 0
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    centerMapOnPlayer();
  }, []);

  const centerMapOnPlayer = useCallback(() => {
    if (!mapContainerRef.current) return;
    
    const containerWidth = mapContainerRef.current.clientWidth;
    const containerHeight = mapContainerRef.current.clientHeight;
    
    const centerX = (containerWidth / 2 - playerPosition.x * mapScale);
    const centerY = (containerHeight / 2 - playerPosition.y * mapScale);
    
    setMapPosition({ x: centerX, y: centerY });
  }, [playerPosition, mapScale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (playingGame) return;
      
      const moveStep = 16;
      let newDirection = playerDirection;
      let newX = playerPosition.x;
      let newY = playerPosition.y;
      
      switch (e.key) {
        case "ArrowUp":
          newY -= moveStep;
          newDirection = Direction.UP;
          break;
        case "ArrowDown":
          newY += moveStep;
          newDirection = Direction.DOWN;
          break;
        case "ArrowLeft":
          newX -= moveStep;
          newDirection = Direction.LEFT;
          break;
        case "ArrowRight":
          newX += moveStep;
          newDirection = Direction.RIGHT;
          break;
      }
      
      if (newX < 0) newX = 0;
      if (newX > MAP_WIDTH) newX = MAP_WIDTH;
      if (newY < 0) newY = 0;
      if (newY > MAP_HEIGHT) newY = MAP_HEIGHT;
      
      setPlayerDirection(newDirection);
      setPlayerPosition({ x: newX, y: newY });
      
      checkLandmarksAndGames(newX, newY);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPosition, playerDirection, playingGame]);
  
  const checkLandmarksAndGames = (x: number, y: number) => {
    const foundLandmark = landmarks.find(landmark => 
      Math.abs(landmark.x - x) < 30 && Math.abs(landmark.y - y) < 30
    );
    
    if (foundLandmark) {
      setActiveLandmark(foundLandmark);
      setActiveGame(null);
      return;
    }
    
    const foundGame = miniGames.find(game => 
      Math.abs(game.x - x) < 30 && Math.abs(game.y - y) < 30
    );
    
    if (foundGame) {
      setActiveGame(foundGame);
      setActiveLandmark(null);
      setShowNpcDialog(true);
      return;
    }
    
    setActiveLandmark(null);
    setActiveGame(null);
  };

  const movePlayer = (dx: number, dy: number) => {
    const moveStep = 16;
    let newDirection = playerDirection;
    
    if (dx > 0) newDirection = Direction.RIGHT;
    else if (dx < 0) newDirection = Direction.LEFT;
    else if (dy > 0) newDirection = Direction.DOWN;
    else if (dy < 0) newDirection = Direction.UP;
    
    const newX = Math.max(0, Math.min(MAP_WIDTH, playerPosition.x + dx * moveStep));
    const newY = Math.max(0, Math.min(MAP_HEIGHT, playerPosition.y + dy * moveStep));
    
    setPlayerDirection(newDirection);
    setPlayerPosition({ x: newX, y: newY });
    
    checkLandmarksAndGames(newX, newY);
  };
  
  const handleZoom = (event: React.WheelEvent) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setMapScale(prevScale => {
      const newScale = prevScale * zoomFactor;
      return Math.max(0.5, Math.min(2.0, newScale));
    });
  };
  
  const handleMapDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    if (playingGame) return;
    
    setIsDragging(true);
    let clientX, clientY;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    setDragStart({ 
      x: clientX - mapPosition.x, 
      y: clientY - mapPosition.y 
    });
  };
  
  const handleMapDragMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    let clientX, clientY;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    setMapPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };
  
  const handleMapDragEnd = () => {
    setIsDragging(false);
  };
  
  const navigateToLandmark = (landmark: typeof landmarks[0]) => {
    setPlayerPosition({
      x: landmark.x,
      y: landmark.y - 32
    });
    
    if (mapContainerRef.current) {
      const containerWidth = mapContainerRef.current.clientWidth;
      const containerHeight = mapContainerRef.current.clientHeight;
      
      setMapPosition({
        x: containerWidth / 2 - landmark.x * mapScale,
        y: containerHeight / 2 - landmark.y * mapScale
      });
    }
    
    setActiveLandmark(landmark);
    setActiveGame(null);
  };

  const navigateToGame = (game: typeof miniGames[0]) => {
    setPlayerPosition({
      x: game.x,
      y: game.y
    });
    
    if (mapContainerRef.current) {
      const containerWidth = mapContainerRef.current.clientWidth;
      const containerHeight = mapContainerRef.current.clientHeight;
      
      setMapPosition({
        x: containerWidth / 2 - game.x * mapScale,
        y: containerHeight / 2 - game.y * mapScale
      });
    }
    
    setActiveGame(game);
    setActiveLandmark(null);
    setShowNpcDialog(true);
  };

  const startGame = () => {
    if (activeGame) {
      setPlayingGame(true);
      setShowNpcDialog(false);
      toast.success(`Starting ${activeGame.name}!`);
    }
  };

  const endGame = () => {
    setPlayingGame(false);
    toast.success("Game completed! Continue exploring");
  };

  const startBoatRace = () => {
    setBoatRaceState({
      ...boatRaceState,
      started: true,
      playerPosition: 0,
      aiPosition: 0,
      countdown: 3,
      finished: false,
      winner: '',
      racePath: Array(10).fill(0).map(() => Math.random() > 0.7 ? 1 : 0),
      playerSpeed: 0,
      maxSpeed: 5,
      currentPathIndex: 0
    });
    
    const countdownInterval = setInterval(() => {
      setBoatRaceState(prev => {
        if (prev.countdown > 1) {
          return { ...prev, countdown: prev.countdown - 1 };
        } else {
          clearInterval(countdownInterval);
          const raceInterval = setInterval(() => {
            setBoatRaceState(prev => {
              const aiSpeed = Math.random() * 2 + 2;
              const newAiPosition = prev.aiPosition + aiSpeed;
              
              const newPlayerPosition = prev.playerPosition + prev.playerSpeed;
              
              if (newPlayerPosition >= 100 || newAiPosition >= 100) {
                clearInterval(raceInterval);
                const winner = newPlayerPosition >= 100 ? 'player' : 'ai';
                
                if (winner === 'player') {
                  toast.success("You won the boat race!");
                } else {
                  toast.error("The opponent won this time. Try again!");
                }
                
                return {
                  ...prev,
                  playerPosition: Math.min(newPlayerPosition, 100),
                  aiPosition: Math.min(newAiPosition, 100),
                  finished: true,
                  winner
                };
              }
              
              const pathIndex = Math.floor(newPlayerPosition / 10);
              const hitObstacle = pathIndex !== prev.currentPathIndex && 
                                 pathIndex < prev.racePath.length && 
                                 prev.racePath[pathIndex] === 1;
              
              const updatedSpeed = hitObstacle ? 
                Math.max(0, prev.playerSpeed - 2) : 
                prev.playerSpeed;
              
              return {
                ...prev,
                playerPosition: newPlayerPosition,
                aiPosition: newAiPosition,
                currentPathIndex: pathIndex,
                playerSpeed: updatedSpeed
              };
            });
          }, 100);
          
          return { ...prev, countdown: 0 };
        }
      });
    }, 1000);
  };

  const increaseBoatSpeed = () => {
    setBoatRaceState(prev => ({
      ...prev,
      playerSpeed: Math.min(prev.maxSpeed, prev.playerSpeed + 0.5)
    }));
  };
  
  const resetBoatRace = () => {
    setPlayingGame(false);
    setBoatRaceState(prev => ({
      ...prev,
      started: false,
      finished: false
    }));
  };

  const renderControls = () => (
    <div className="absolute bottom-4 right-4 grid grid-cols-3 gap-2 w-36 h-36">
      <div className="col-start-2">
        <Button 
          onClick={() => movePlayer(0, -1)}
          className="w-12 h-12 bg-slate-700/70 hover:bg-slate-600/70 rounded-full p-0"
          disabled={playingGame}
        >
          ↑
        </Button>
      </div>
      <div className="col-start-1 row-start-2">
        <Button 
          onClick={() => movePlayer(-1, 0)}
          className="w-12 h-12 bg-slate-700/70 hover:bg-slate-600/70 rounded-full p-0"
          disabled={playingGame}
        >
          ←
        </Button>
      </div>
      <div className="col-start-3 row-start-2">
        <Button 
          onClick={() => movePlayer(1, 0)}
          className="w-12 h-12 bg-slate-700/70 hover:bg-slate-600/70 rounded-full p-0"
          disabled={playingGame}
        >
          →
        </Button>
      </div>
      <div className="col-start-2 row-start-3">
        <Button 
          onClick={() => movePlayer(0, 1)}
          className="w-12 h-12 bg-slate-700/70 hover:bg-slate-600/70 rounded-full p-0"
          disabled={playingGame}
        >
          ↓
        </Button>
      </div>
    </div>
  );

  const renderMiniGame = () => {
    if (!activeGame) return null;
    
    if (activeGame.id === 5) {
      return renderBoatRace();
    } else if (activeGame.id === 1) {
      return (
        <motion.div 
          className="p-4 bg-slate-800 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <h3 className="text-xl font-bold text-white mb-4">Kerala Culture Quiz</h3>
          <p className="text-gray-300 mb-4">What is the state flower of Kerala?</p>
          <div className="grid grid-cols-1 gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={endGame} className="w-full justify-start">A) Jasmine</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={endGame} className="w-full justify-start bg-green-600 hover:bg-green-700">B) Golden Shower (Kanikkonna)</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={endGame} className="w-full justify-start">C) Lotus</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={endGame} className="w-full justify-start">D) Sunflower</Button>
            </motion.div>
          </div>
        </motion.div>
      );
    } else if (activeGame.id === 4) {
      // Farm Harvest Mahjong Game
      return (
        <motion.div 
          className="p-4 bg-slate-800 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Farm Harvest Mahjong</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={endGame}
              className="text-gray-400 hover:text-white"
            >
              Exit Game
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-2 overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: '<div><script src="https://cdn.htmlgames.com/embed.js?game=FarmMahjong&bgcolor=white"></script></div>' }} />
          </div>
        </motion.div>
      );
    } else if (activeGame.id === 2) {
      // Kathakali Memory Match
      return (
        <motion.div 
          className="p-4 bg-slate-800 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Kathakali Memory Match</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={endGame}
              className="text-gray-400 hover:text-white"
            >
              Exit Game
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Array(16).fill(0).map((_, i) => (
              <motion.div 
                key={i}
                className="aspect-square bg-purple-800 rounded-md flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endGame}
              >
                <span className="text-2xl">?</span>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-gray-300 mb-2">Match the Kathakali facial expressions</p>
            <Button onClick={endGame} className="bg-purple-600 hover:bg-purple-700">
              Complete Game
            </Button>
          </div>
        </motion.div>
      );
    } else if (activeGame.id === 3) {
      // Fishing Game
      return (
        <motion.div 
          className="p-4 bg-slate-800 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Kerala Fishing Game</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={endGame}
              className="text-gray-400 hover:text-white"
            >
              Exit Game
            </Button>
          </div>
          
          <div className="relative h-48 bg-blue-900/50 rounded-lg overflow-hidden mb-4">
            <div className="absolute inset-0 flex">
              {Array(20).fill(0).map((_, i) => (
                <motion.div 
                  key={i}
                  className="h-1 bg-blue-400/20 rounded-full"
                  style={{ width: `${100/20}%` }}
                  animate={{ y: [0, 5, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    delay: i * 0.1 % 0.5 
                  }}
                />
              ))}
            </div>
            
            {Array(5).fill(0).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-4 bg-cyan-500 rounded-sm"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                }}
                animate={{
                  x: [0, 20, 0, -20, 0],
                  y: [0, 5, 0, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4 + Math.random() * 2,
                  delay: i * 0.5,
                }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-300 rounded-full" />
              </motion.div>
            ))}
            
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gray-400"
              animate={{ height: [16, 40, 16] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-300" />
            </motion.div>
          </div>
          
          <div className="text-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={endGame} 
                className="bg-blue-600 hover:bg-blue-700 w-full py-3"
              >
                Catch Fish
              </Button>
            </motion.div>
          </div>
        </motion.div>
      );
    } else if (activeGame.id === 6) {
      // Spice Sorting Game
      return (
        <motion.div 
          className="p-4 bg-slate-800 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Spice Sorting Challenge</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={endGame}
              className="text-gray-400 hover:text-white"
            >
              Exit Game
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {["Cardamom", "Pepper", "Cinnamon", "Cloves", "Turmeric", "Ginger"].map((spice, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-r from-amber-700 to-red-700 p-1 rounded-lg cursor-move"
                drag
                dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="px-3 py-1 bg-slate-800 rounded-md">
                  {spice}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border-2 border-dashed border-amber-500/50 rounded-lg p-3 h-24 flex items-center justify-center">
              <p className="text-amber-300 text-center">Drop aromatic spices here</p>
            </div>
            <div className="border-2 border-dashed border-red-500/50 rounded-lg p-3 h-24 flex items-center justify-center">
              <p className="text-red-300 text-center">Drop spicy spices here</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button onClick={endGame} className="bg-amber-600 hover:bg-amber-700">
              Complete Sorting
            </Button>
          </div>
        </motion.div>
      );
    } else if (activeGame.id === 7) {
      // Theyyam Rhythm Game
      return (
        <motion.div 
          className="p-4 bg-slate-800 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Theyyam Rhythm Challenge</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={endGame}
              className="text-gray-400 hover:text-white"
            >
              Exit Game
            </Button>
          </div>
          
          <div className="relative h-24 bg-orange-900/30 rounded-lg mb-4 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500" />
            
            {["A", "S", "D", "F"].map((key, i) => (
              <div key={i} className="absolute bottom-1 h-12 w-12 flex items-center justify-center bg-slate-800 border-2 border-orange-500 rounded-lg" style={{ left: `${10 + i * 25}%` }}>
                <span className="text-xl font-bold text-white">{key}</span>
              </div>
            ))}
            
            <motion.div 
              className="absolute h-8 w-8 bg-orange-600 rounded-md flex items-center justify-center text-white font-bold"
              initial={{ top: "-20%", left: "10%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
              onAnimationComplete={endGame}
            >
              A
            </motion.div>
          </div>
          
          <div className="text-center bg-slate-700/50 p-3 rounded-lg mb-4">
            <p className="text-gray-300 mb-2">Press the keys when the notes align with the buttons!</p>
            <p className="text-orange-300 text-xl">Score: 0</p>
          </div>
          
          <div className="text-center">
            <Button onClick={endGame} className="bg-orange-600 hover:bg-orange-700">
              Complete Game
            </Button>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        className="p-4 bg-slate-800 rounded-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">{activeGame.name}</h3>
        <p className="text-gray-300 mb-4">{activeGame.description}</p>
        <Button onClick={endGame} className="w-full">Complete Game</Button>
      </motion.div>
    );
  };

  const renderBoatRace = () => {
    if (!activeGame || activeGame.id !== 5) return null;
    
    return (
      <motion.div 
        className="p-4 bg-slate-800 rounded-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Onam Boat Race</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetBoatRace}
            className="text-gray-400 hover:text-white"
          >
            Exit Race
          </Button>
        </div>
        
        {!boatRaceState.started ? (
          <div className="text-center">
            <img 
              src="/lovable-uploads/ca2d6830-e22c-4607-b372-bf96d604334a.png" 
              alt="Boat Race" 
              className="w-full h-32 object-cover rounded-lg mb-4 opacity-70"
            />
            <p className="text-gray-300 mb-6">Race your traditional boat through the Kerala backwaters during the Onam festival. Tap rapidly to increase speed and avoid obstacles!</p>
            <Button onClick={startBoatRace} className="bg-teal-600 hover:bg-teal-700">
              Start Race
            </Button>
          </div>
        ) : boatRaceState.countdown > 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-5xl font-bold text-white mb-4">{boatRaceState.countdown}</div>
            <p className="text-gray-300">Get ready to race!</p>
          </div>
        ) : (
          <div>
            <div className="relative h-20 bg-blue-900/50 rounded-lg mb-6 overflow-hidden">
              <div className="absolute inset-0 flex">
                {Array(20).fill(0).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="h-1 bg-blue-400/20 rounded-full"
                    style={{ width: `${100/20}%` }}
                    animate={{ y: [0, 5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5, 
                      delay: i * 0.1 % 0.5 
                    }}
                  />
                ))}
              </div>
              
              <motion.div 
                className="absolute top-2 h-8 w-12 bg-yellow-500 rounded-sm"
                style={{ 
                  left: `${boatRaceState.playerPosition}%`,
                  transform: `translateX(-50%)` 
                }}
                animate={{ 
                  y: [0, -2, 0],
                  rotate: [0, 2, 0, -2, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">YOU</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute bottom-2 h-8 w-12 bg-red-500 rounded-sm"
                style={{ 
                  left: `${boatRaceState.aiPosition}%`,
                  transform: `translateX(-50%)` 
                }}
                animate={{ 
                  y: [0, -2, 0],
                  rotate: [0, -2, 0, 2, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5 
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">CPU</span>
                </div>
              </motion.div>
              
              <div 
                className="absolute top-0 bottom-0 right-0 w-1 bg-white"
                style={{ boxShadow: '0 0 10px rgba(255,255,255,0.8)' }}
              >
                <Flag className="absolute -right-3 -top-2 h-5 w-5 text-white" />
              </div>
              
              {boatRaceState.racePath.map((isObstacle, index) => {
                if (isObstacle) {
                  return (
                    <motion.div 
                      key={index}
                      className="absolute top-1/2 transform -translate-y-1/2 h-4 w-4 bg-slate-700 rounded-full"
                      style={{ left: `${(index + 1) * 10}%` }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  );
                }
                return null;
              })}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Speed</span>
                <span>{Math.round(boatRaceState.playerSpeed * 20)} km/h</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                  style={{ width: `${(boatRaceState.playerSpeed / boatRaceState.maxSpeed) * 100}%` }}
                />
              </div>
            </div>
            
            {boatRaceState.finished ? (
              <div className="text-center">
                <h4 className="text-xl font-bold mb-4">
                  {boatRaceState.winner === 'player' ? (
                    <span className="text-green-400">You Won!</span>
                  ) : (
                    <span className="text-red-400">You Lost!</span>
                  )}
                </h4>
                <Button onClick={startBoatRace} className="bg-teal-600 hover:bg-teal-700 mr-2">
                  Race Again
                </Button>
                <Button onClick={resetBoatRace} variant="outline">
                  Exit
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 text-sm mb-3 text-center">Tap repeatedly to paddle faster!</p>
                <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                  <Button 
                    onClick={increaseBoatSpeed}
                    className="bg-teal-600 hover:bg-teal-700 w-full h-16 text-lg font-bold"
                  >
                    PADDLE!
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg w-full h-full overflow-hidden">
      <div className="flex items-center mb-4">
        <Button variant="ghost" className="mr-2" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
        <h2 className="text-2xl font-bold text-white">Kerala Explorer</h2>
        
        <div className="ml-auto flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setMapScale(prev => Math.max(0.5, prev - 0.1))}
            className="w-8 h-8 p-0 rounded-full"
          >
            -
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setMapScale(prev => Math.min(2.0, prev + 0.1))}
            className="w-8 h-8 p-0 rounded-full"
          >
            +
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={centerMapOnPlayer}
            className="text-xs"
          >
            Center
          </Button>
        </div>
      </div>
      
      {showInstructions && (
        <motion.div 
          className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg mb-4 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Kerala Explorer!</h3>
              <p className="text-sm text-gray-300 mb-2">Use arrow keys or on-screen controls to move your character.</p>
              <p className="text-sm text-gray-300">Visit landmarks and mini-games to discover Kerala's rich cultural heritage.</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowInstructions(false)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          {playingGame ? (
            <motion.div 
              key="game-mode"
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderMiniGame()}
            </motion.div>
          ) : (
            <motion.div
              key="map-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div 
                ref={mapContainerRef}
                className="relative bg-green-800 rounded-lg overflow-hidden shadow-xl border border-teal-900/50 h-[50vh]" 
                onWheel={handleZoom}
                onMouseDown={handleMapDragStart}
                onMouseMove={handleMapDragMove}
                onMouseUp={handleMapDragEnd}
                onMouseLeave={handleMapDragEnd}
                onTouchStart={handleMapDragStart}
                onTouchMove={handleMapDragMove}
                onTouchEnd={handleMapDragEnd}
              >
                <div 
                  ref={mapRef}
                  className="absolute origin-top-left transition-transform duration-200"
                  style={{ 
                    transform: `scale(${mapScale})`,
                    left: `${mapPosition.x}px`,
                    top: `${mapPosition.y}px`,
                  }}
                >
                  <div className="relative">
                    <img 
                      src="/lovable-uploads/f55a5bc8-b4e5-446a-9803-84768ce13250.png" 
                      alt="Village Map" 
                      className="w-[1000px] h-[1000px] object-cover pixel-art sepia brightness-75"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    
                    {landmarks.map(landmark => (
                      <motion.div
                        key={`landmark-${landmark.id}`}
                        className="absolute cursor-pointer"
                        style={{ 
                          left: landmark.x - 12, 
                          top: landmark.y - 12,
                          zIndex: 10
                        }}
                        whileHover={{ scale: 1.2 }}
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        onClick={() => navigateToLandmark(landmark)}
                      >
                        <div className="w-[24px] h-[24px] bg-red-500 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-800/90 text-white text-xs py-1 px-2 rounded mb-1">
                          {landmark.name}
                        </div>
                      </motion.div>
                    ))}
                    
                    {miniGames.map(game => (
                      <motion.div
                        key={`game-${game.id}`}
                        className="absolute cursor-pointer"
                        style={{ 
                          left: game.x - 12, 
                          top: game.y - 12,
                          zIndex: 10
                        }}
                        whileHover={{ scale: 1.2 }}
                        animate={game.id === 5 ? {
                          scale: [1, 1.2, 1],
                          boxShadow: ['0 0 0 0 rgba(255,215,0,0)', '0 0 0 8px rgba(255,215,0,0.3)', '0 0 0 0 rgba(255,215,0,0)']
                        } : { 
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{ repeat: Infinity, duration: game.id === 5 ? 1.5 : 3 }}
                        onClick={() => {
                          setPlayerPosition({ x: game.x, y: game.y });
                          setActiveGame(game);
                          setActiveLandmark(null);
                          setShowNpcDialog(true);
                        }}
                      >
                        <div className={`w-[24px] h-[24px] ${game.color} rounded-lg flex items-center justify-center`}>
                          {game.icon}
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-800/90 text-white text-xs py-1 px-2 rounded mb-1">
                          {game.name}
                          {game.featured && (
                            <span className="ml-1 text-yellow-300 text-xs">✨</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                    <motion.div 
                      className="absolute z-20"
                      style={{ 
                        left: playerPosition.x - CHARACTER_SIZE/2, 
                        top: playerPosition.y - CHARACTER_SIZE/2,
                        width: CHARACTER_SIZE,
                        height: CHARACTER_SIZE
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <motion.div 
                        className="w-full h-full bg-yellow-500 rounded-sm relative overflow-hidden flex items.center justify-center pixelated"
                        style={{ 
                          imageRendering: 'pixelated',
                          boxShadow: '0 3px 0 rgba(0,0,0,0.3)'
                        }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full relative">
                            <div className="absolute top-1/4 left-1/3 w-[4px] h-[4px] bg-black rounded-none" />
                            <div className="absolute top-1/4 right-1/3 w-[4px] h-[4px] bg-black rounded-none" />
                            <div 
                              className="absolute top-1/2 left-1/4 w-[12px] h-[4px] bg-black rounded-none"
                              style={{
                                transform: 
                                  playerDirection === Direction.UP ? 'translateY(-4px)' : 
                                  playerDirection === Direction.DOWN ? 'translateY(4px)' : 
                                  playerDirection === Direction.LEFT ? 'translateX(-4px) rotate(90deg)' : 
                                  'translateX(4px) rotate(90deg)'
                              }} 
                            />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
                
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-slate-900/30" />
                
                {activeGame && showNpcDialog && (
                  <NPCCharacter 
                    avatar={activeGame.npcAvatar}
                    name={activeGame.npcName}
                    message={activeGame.npcMessage}
                    position="left"
                    isOpen={showNpcDialog}
                    onOpenChange={setShowNpcDialog}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Information Panel - Below the map */}
        <div className="mt-4">
          <AnimatePresence>
            {activeLandmark && !playingGame && (
              <motion.div 
                key={`landmark-${activeLandmark.id}`}
                className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {activeLandmark.image && (
                    <motion.img 
                      src={activeLandmark.image} 
                      alt={activeLandmark.name} 
                      className="w-full sm:w-40 h-32 object-cover rounded-lg"
                      initial={{ scale: 0.95, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <div>
                    <motion.h3 
                      className="text-xl font-bold mb-1 flex items-center gap-2"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <MapPin className="h-5 w-5 text-red-500" />
                      {activeLandmark.name}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-300"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {activeLandmark.description}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {activeGame && !playingGame && !showNpcDialog && (
              <motion.div 
                key={`game-${activeGame.id}`}
                className="mt-4 bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-start gap-3">
                  <motion.div 
                    className={`${activeGame.color} rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0`}
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {activeGame.icon}
                  </motion.div>
                  <div>
                    <motion.h3 
                      className="text-xl font-bold mb-1"
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {activeGame.name}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-300 mb-3"
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {activeGame.description}
                    </motion.p>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={startGame} 
                        className={`${activeGame.color} hover:opacity-90`}
                      >
                        Play Game
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {!playingGame && (
          <motion.div 
            className="mt-4 bg-slate-800/80 p-3 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-white text-sm font-semibold mb-2 flex items-center">
              Quick Travel
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h4 className="text-gray-300 text-xs mb-2">Landmarks</h4>
                <div className="flex flex-wrap gap-2">
                  {landmarks.slice(0, 4).map(landmark => (
                    <Button 
                      key={landmark.id} 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => navigateToLandmark(landmark)}
                    >
                      <MapPin className="h-3 w-3 mr-1" /> {landmark.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-gray-300 text-xs mb-2">Games</h4>
                <div className="flex flex-wrap gap-2">
                  {miniGames.slice(0, 3).map(game => (
                    <Button 
                      key={game.id} 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => navigateToGame(game)}
                    >
                      <Gamepad className="h-3 w-3 mr-1" /> {game.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {!playingGame && renderControls()}
        
        <style>{`
          .pixel-art {
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
          }
          .sepia {
            filter: sepia(0.5);
          }
        `}</style>
      </div>
    </div>
  );
};

export default KeralaItinerary;
