
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, TreePalm, Image, Gamepad, Waves, ChevronLeft, ChevronRight, Flag } from "lucide-react";
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
    name: "Village Quiz",
    x: 500,
    y: 350,
    description: "Test your knowledge about the village and its surroundings.",
  },
  {
    id: 2,
    name: "Memory Match",
    x: 780,
    y: 320,
    description: "Match pairs of village items in this memory game.",
  },
  {
    id: 3,
    name: "Fishing Game",
    x: 550,
    y: 650,
    description: "Try to catch fish from the village pond.",
  },
  {
    id: 4,
    name: "Farm Harvest",
    x: 600,
    y: 250,
    description: "Help gather crops from the local farm.",
  },
  {
    id: 5,
    name: "Boat Race",
    x: 650,
    y: 620,
    description: "Race traditional boats through the Kerala backwaters.",
  }
];

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

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
  const [dialogStep, setDialogStep] = useState(0);
  const [boatRaceState, setBoatRaceState] = useState({
    started: false,
    playerPosition: 0,
    cpuPositions: [0, 0, 0], // 3 CPU boats
    countdown: 3,
    finished: false,
    winner: '',
    obstacles: [] as {position: number, lane: number}[],
    crashedObstacle: false,
    playerSpeed: 0,
    playerLane: 1, // 0, 1, or 2 (top, middle, bottom)
    maxSpeed: 5,
    currentPathIndex: 0
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // NPC dialog content about the cultural significance of boat races
  const npcDialogs = [
    "Namaskaram! Welcome to the famous Kerala boat race, known locally as Vallam Kali.",
    "These snake boat races are part of our ancient tradition dating back over 400 years. They started as water festivals celebrating the harvest season.",
    "The iconic boats you see, called 'Chundan Vallams' or snake boats, can be up to 100 feet long and carry over 100 rowers!",
    "During Onam festival, our biggest celebration, these races attract thousands of spectators from across the world.",
    "The rhythm and coordination of the rowers is crucial. They move to the beats of traditional vanchipattu (boat songs).",
    "Would you like to experience the thrill of competing in this cultural treasure of Kerala?",
  ];

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
      if (playingGame) {
        if (boatRaceState.started && !boatRaceState.finished && boatRaceState.countdown === 0) {
          if (e.key === "ArrowUp") {
            setBoatRaceState(prev => ({
              ...prev, 
              playerLane: Math.max(0, prev.playerLane - 1)
            }));
          } else if (e.key === "ArrowDown") {
            setBoatRaceState(prev => ({
              ...prev, 
              playerLane: Math.min(2, prev.playerLane + 1)
            }));
          } else if (e.key === " " || e.key === "ArrowRight") {
            increaseBoatSpeed();
          }
        }
        return;
      }
      
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
  }, [playerPosition, playerDirection, playingGame, boatRaceState]);
  
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

  const startGame = () => {
    if (activeGame) {
      // For boat race, show NPC dialog first
      if (activeGame.id === 5) {
        setShowNpcDialog(true);
        setDialogStep(0);
      } else {
        setPlayingGame(true);
        toast.success(`Starting ${activeGame.name}!`);
      }
    }
  };

  const endGame = () => {
    setPlayingGame(false);
    setShowNpcDialog(false);
    setDialogStep(0);
    toast.success("Game completed! Continue exploring");
  };

  const nextDialogStep = () => {
    if (dialogStep < npcDialogs.length - 1) {
      setDialogStep(prev => prev + 1);
    } else {
      setShowNpcDialog(false);
      setPlayingGame(true);
      toast.success("Starting Kerala Boat Race!");
    }
  };

  const generateObstacles = () => {
    // Generate random obstacles throughout the race path
    const obstacles = [];
    // Create 8 obstacles at different positions
    for (let i = 0; i < 8; i++) {
      obstacles.push({
        position: 15 + (i * 10) + (Math.random() * 5), // Distribute obstacles between 15% and 95% of race track
        lane: Math.floor(Math.random() * 3) // Random lane (0, 1, or 2)
      });
    }
    return obstacles;
  };

  const startBoatRace = () => {
    const obstacles = generateObstacles();
    
    setBoatRaceState({
      ...boatRaceState,
      started: true,
      playerPosition: 0,
      cpuPositions: [0, 0, 0],
      countdown: 3,
      finished: false,
      winner: '',
      obstacles,
      crashedObstacle: false,
      playerSpeed: 0,
      playerLane: 1,
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
              // Don't update if race is finished or player crashed
              if (prev.finished || prev.crashedObstacle) {
                clearInterval(raceInterval);
                return prev;
              }
              
              // Update CPU boats (three of them, with varying speeds)
              const cpuSpeeds = [
                1.5 + Math.random() * 1.5, // Slowest boat
                1.8 + Math.random() * 1.7, // Medium boat
                2.0 + Math.random() * 2.0  // Fastest boat
              ];
              
              const newCpuPositions = prev.cpuPositions.map((pos, idx) => pos + cpuSpeeds[idx]);
              
              // Update player position based on speed
              const newPlayerPosition = prev.playerPosition + prev.playerSpeed;
              
              // Check for collisions with obstacles
              let crashed = false;
              prev.obstacles.forEach(obstacle => {
                // Check if player is within 5% of obstacle position and in same lane
                if (Math.abs(newPlayerPosition - obstacle.position) < 3 && 
                    prev.playerLane === obstacle.lane) {
                  crashed = true;
                }
              });
              
              // Check for finish or crash
              if (crashed) {
                toast.error("Your boat crashed into an obstacle!");
                return {
                  ...prev,
                  crashedObstacle: true,
                  finished: true,
                  winner: 'obstacle'
                };
              } else if (newPlayerPosition >= 100 || 
                         newCpuPositions[0] >= 100 || 
                         newCpuPositions[1] >= 100 || 
                         newCpuPositions[2] >= 100) {
                clearInterval(raceInterval);
                
                let winner = 'player';
                if (newCpuPositions[0] >= 100 && newCpuPositions[0] > newPlayerPosition) winner = 'cpu1';
                if (newCpuPositions[1] >= 100 && newCpuPositions[1] > newPlayerPosition) winner = 'cpu2';
                if (newCpuPositions[2] >= 100 && newCpuPositions[2] > newPlayerPosition) winner = 'cpu3';
                
                if (winner === 'player') {
                  toast.success("You won the boat race!");
                } else {
                  toast.error("One of the opponents won this time. Try again!");
                }
                
                return {
                  ...prev,
                  playerPosition: Math.min(newPlayerPosition, 100),
                  cpuPositions: [
                    Math.min(newCpuPositions[0], 100),
                    Math.min(newCpuPositions[1], 100),
                    Math.min(newCpuPositions[2], 100)
                  ],
                  finished: true,
                  winner
                };
              }
              
              // Normal update - speed gradually decreases if not paddling
              return {
                ...prev,
                playerPosition: newPlayerPosition,
                cpuPositions: newCpuPositions,
                playerSpeed: Math.max(0, prev.playerSpeed - 0.05) // Slow down slightly each tick
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
      playerSpeed: Math.min(prev.maxSpeed, prev.playerSpeed + 0.3)
    }));
  };
  
  const changeBoatLane = (lane: number) => {
    setBoatRaceState(prev => ({
      ...prev,
      playerLane: lane
    }));
  };
  
  const resetBoatRace = () => {
    setPlayingGame(false);
    setBoatRaceState(prev => ({
      ...prev,
      started: false,
      finished: false,
      crashedObstacle: false
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
          <h3 className="text-xl font-bold text-white mb-4">Village Quiz</h3>
          <p className="text-gray-300 mb-4">What is this village known for?</p>
          <div className="grid grid-cols-1 gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={endGame} className="w-full justify-start">A) Fishing</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={endGame} className="w-full justify-start">B) Farming</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={endGame} className="w-full justify-start">C) Trading</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={endGame} className="w-full justify-start">D) Mining</Button>
            </motion.div>
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

  const renderNpcDialog = () => {
    if (!showNpcDialog) return null;
    
    return (
      <motion.div 
        className="p-6 bg-slate-800/95 rounded-lg border-2 border-teal-800/70"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-teal-700 p-2 flex-shrink-0">
            <Waves className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <motion.h3 
              className="text-lg font-bold text-teal-300 mb-2"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Kerala Boat Race Guide
            </motion.h3>
            
            <motion.p 
              className="text-white mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {npcDialogs[dialogStep]}
            </motion.p>
            
            <div className="flex justify-end">
              <Button 
                onClick={nextDialogStep}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {dialogStep < npcDialogs.length - 1 ? "Continue" : "Let's Race!"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBoatRace = () => {
    if (!activeGame || activeGame.id !== 5) return null;
    
    // Render boat race dialog if showing
    if (showNpcDialog) {
      return renderNpcDialog();
    }
    
    return (
      <motion.div 
        className="p-4 bg-slate-800 rounded-lg border-2 border-blue-900/50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Kerala Chundan Vallam Race</h3>
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
            <p className="text-gray-300 mb-6">
              Race your traditional snake boat through the Kerala backwaters! Use LEFT/RIGHT arrows or buttons to switch lanes and
              avoid obstacles. Tap SPACE or PADDLE button repeatedly to increase your speed!
            </p>
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
            <div className="relative h-40 bg-blue-900/50 rounded-lg mb-6 overflow-hidden">
              {/* Water background animation */}
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

              {/* Lane dividers */}
              <div className="absolute top-[33%] left-0 right-0 h-0.5 bg-blue-500/20" />
              <div className="absolute top-[66%] left-0 right-0 h-0.5 bg-blue-500/20" />
              
              {/* Player Boat */}
              <motion.div 
                className="absolute h-10 w-20"
                style={{ 
                  left: `${boatRaceState.playerPosition}%`,
                  top: `${boatRaceState.playerLane * 33 + 11.5}%`,
                  transform: `translateX(-50%)` 
                }}
                animate={{ 
                  y: [0, -2, 0],
                  rotate: [0, 1, 0, -1, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5
                }}
              >
                <div className="relative">
                  {/* Boat hull */}
                  <div className="absolute h-5 w-20 bg-gradient-to-r from-yellow-800 via-yellow-600 to-yellow-800 rounded-lg transform -skew-x-12" />
                  
                  {/* Boat interior */}
                  <div className="absolute h-3 w-16 bg-gradient-to-b from-yellow-600 to-yellow-900 rounded-lg top-1 left-2 transform -skew-x-12" />
                  
                  {/* Rowers */}
                  <div className="absolute top-0 left-4 w-10 flex justify-around">
                    <motion.div 
                      className="h-3 w-1 bg-red-600"
                      animate={{ rotate: [0, 20, 0, -20, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    />
                    <motion.div 
                      className="h-3 w-1 bg-red-600"
                      animate={{ rotate: [0, -20, 0, 20, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                    />
                    <motion.div 
                      className="h-3 w-1 bg-red-600"
                      animate={{ rotate: [0, 20, 0, -20, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* CPU Boats */}
              {boatRaceState.cpuPositions.map((position, idx) => (
                <motion.div 
                  key={`cpu-${idx}`}
                  className="absolute h-9 w-16"
                  style={{ 
                    left: `${position}%`, 
                    top: `${idx * 33 + 12}%`,
                    transform: `translateX(-50%)`
                  }}
                  animate={{ 
                    y: [0, -1, 0],
                    rotate: [0, 1, 0, -1, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.4 + (idx * 0.1)
                  }}
                >
                  <div className="relative">
                    {/* CPU Boat hull */}
                    <div className={`absolute h-4 w-16 bg-gradient-to-r ${
                      idx === 0 
                      ? "from-blue-800 via-blue-600 to-blue-800" 
                      : idx === 1 
                        ? "from-green-800 via-green-600 to-green-800" 
                        : "from-purple-800 via-purple-600 to-purple-800"
                    } rounded-lg transform -skew-x-12`} />
                    
                    {/* CPU Boat interior */}
                    <div className={`absolute h-2 w-12 bg-gradient-to-b ${
                      idx === 0 
                      ? "from-blue-600 to-blue-900" 
                      : idx === 1 
                        ? "from-green-600 to-green-900" 
                        : "from-purple-600 to-purple-900"
                    } rounded-lg top-1 left-2 transform -skew-x-12`} />
                    
                    {/* CPU Rowers */}
                    <div className="absolute top-0 left-3 w-8 flex justify-around">
                      <motion.div 
                        className="h-2 w-1 bg-red-600"
                        animate={{ rotate: [0, 30, 0, -30, 0] }}
                        transition={{ repeat: Infinity, duration: 0.3 + (idx * 0.05) }}
                      />
                      <motion.div 
                        className="h-2 w-1 bg-red-600"
                        animate={{ rotate: [0, -30, 0, 30, 0] }}
                        transition={{ repeat: Infinity, duration: 0.3 + (idx * 0.05), delay: 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Obstacles */}
              {boatRaceState.obstacles.map((obstacle, idx) => (
                <div 
                  key={`obstacle-${idx}`}
                  className="absolute h-4 w-4 bg-red-500/70 rounded-full"
                  style={{ 
                    left: `${obstacle.position}%`, 
                    top: `${obstacle.lane * 33 + 14}%` 
                  }}
                >
                  <div className="absolute -inset-1 bg-red-500/30 rounded-full animate-pulse" />
                </div>
              ))}
              
              {/* Finish line */}
              <div className="absolute h-full w-1 bg-white right-0 top-0 flex flex-col">
                {Array(10).fill(0).map((_, i) => (
                  <div 
                    key={`finish-${i}`} 
                    className={`h-[10%] w-full ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`} 
                  />
                ))}
              </div>
            </div>

            {/* Paddle button and lane controls */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => changeBoatLane(0)}
                  variant={boatRaceState.playerLane === 0 ? "default" : "outline"}
                  className={`px-3 py-1 ${boatRaceState.playerLane === 0 ? "bg-teal-600" : ""}`}
                  disabled={boatRaceState.finished}
                >
                  Top Lane
                </Button>
                <Button 
                  onClick={() => changeBoatLane(1)}
                  variant={boatRaceState.playerLane === 1 ? "default" : "outline"}
                  className={`px-3 py-1 ${boatRaceState.playerLane === 1 ? "bg-teal-600" : ""}`}
                  disabled={boatRaceState.finished}
                >
                  Middle Lane
                </Button>
                <Button 
                  onClick={() => changeBoatLane(2)}
                  variant={boatRaceState.playerLane === 2 ? "default" : "outline"} 
                  className={`px-3 py-1 ${boatRaceState.playerLane === 2 ? "bg-teal-600" : ""}`}
                  disabled={boatRaceState.finished}
                >
                  Bottom Lane
                </Button>
              </div>
              
              <div className="flex-1 flex flex-col items-center gap-3">
                {boatRaceState.finished ? (
                  <div className="text-center">
                    <h4 className="text-xl font-bold mb-2">
                      {boatRaceState.crashedObstacle 
                        ? "Your boat crashed!" 
                        : boatRaceState.winner === 'player' 
                          ? "Victory!" 
                          : "Better luck next time!"}
                    </h4>
                    <Button onClick={resetBoatRace} className="bg-teal-600 hover:bg-teal-700">
                      Race Again
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-700 rounded-full h-3 w-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500 transition-all duration-100" 
                        style={{ width: `${boatRaceState.playerSpeed / boatRaceState.maxSpeed * 100}%` }} 
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={increaseBoatSpeed}
                      disabled={boatRaceState.finished}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg text-lg w-full disabled:opacity-50"
                    >
                      PADDLE!
                    </motion.button>
                    <p className="text-gray-300 text-sm">
                      Tap repeatedly to increase speed!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-[70vh] relative">
      {showInstructions && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 p-6 rounded-lg text-white max-w-md border-2 border-teal-500/30">
            <h3 className="font-bold text-xl mb-4">Welcome to Kerala Explorer!</h3>
            <p className="mb-3">Use arrow keys or directional buttons to navigate through Kerala village.</p>
            <p className="mb-3">Approach landmarks to learn about them or mini-games to play.</p>
            <p className="mb-5">Don't miss the fun boat race by the pond!</p>
            <Button 
              onClick={() => setShowInstructions(false)}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Start Exploring!
            </Button>
          </div>
        </div>
      )}
      
      <div 
        className="h-full relative overflow-hidden"
        ref={mapContainerRef}
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
          className="absolute"
          style={{
            transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${mapScale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {/* Map background with Kerala style */}
          <div className="relative rounded-xl overflow-hidden w-[1000px] h-[1000px]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-700 to-green-800" />
            
            {/* Water bodies */}
            <div className="absolute bottom-0 right-0 h-[400px] w-[500px] bg-blue-900/70 rounded-tl-[200px]">
              <div className="absolute inset-0 flex flex-wrap overflow-hidden">
                {Array(30).fill(0).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="h-3 bg-blue-500/10 rounded-full m-[2px]"
                    style={{ width: '7%' }}
                    animate={{ y: [0, 3, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2, 
                      delay: i * 0.04 % 0.5 
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Palm trees */}
            <div className="absolute top-20 left-40">
              <TreePalm className="h-16 w-16 text-green-500" />
            </div>
            <div className="absolute top-60 left-20">
              <TreePalm className="h-14 w-14 text-green-600" />
            </div>
            <div className="absolute top-30 right-40">
              <TreePalm className="h-16 w-16 text-green-500" />
            </div>
            <div className="absolute top-[500px] left-[120px]">
              <TreePalm className="h-16 w-16 text-green-500" />
            </div>
            <div className="absolute bottom-[200px] right-[300px]">
              <TreePalm className="h-16 w-16 text-green-600" />
            </div>
            
            {/* Paths */}
            <div className="absolute h-[700px] w-8 bg-amber-200/40 left-[400px] top-[150px] rounded-full" />
            <div className="absolute h-8 w-[500px] bg-amber-200/40 left-[250px] top-[500px] rounded-full" />
            <div className="absolute h-8 w-[200px] bg-amber-200/40 left-[400px] top-[150px] rounded-full" />
            <div className="absolute h-[250px] w-8 bg-amber-200/40 left-[600px] top-[150px] rounded-full" />
            <div className="absolute h-8 w-[300px] bg-amber-200/40 left-[600px] top-[400px] rounded-full" />
            
            {/* Landmark markers */}
            {landmarks.map(landmark => (
              <div 
                key={landmark.id}
                className="absolute flex flex-col items-center"
                style={{ top: landmark.y - 25, left: landmark.x - 10 }}
              >
                <motion.div 
                  initial={{ y: 0 }}
                  animate={{ y: [-2, 2, -2] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
                </motion.div>
                <div className="text-[10px] font-bold text-white bg-slate-800/70 px-2 py-0.5 rounded mt-1 whitespace-nowrap">
                  {landmark.name}
                </div>
              </div>
            ))}
            
            {/* Mini game markers */}
            {miniGames.map(game => (
              <div 
                key={game.id}
                className="absolute flex flex-col items-center"
                style={{ top: game.y - 20, left: game.x - 10 }}
              >
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 5, 0, -5, 0] }} 
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  {game.id === 5 ? (
                    <Waves className="h-8 w-8 text-blue-400 drop-shadow-lg" />
                  ) : game.id === 3 ? (
                    <Waves className="h-8 w-8 text-blue-400 drop-shadow-lg" />
                  ) : (
                    <Gamepad className="h-8 w-8 text-purple-400 drop-shadow-lg" />
                  )}
                </motion.div>
                <div className="text-[10px] font-bold text-white bg-slate-800/70 px-2 py-0.5 rounded mt-1 whitespace-nowrap">
                  {game.name}
                </div>
              </div>
            ))}
            
            {/* Player character */}
            <div 
              className="absolute transition-all duration-100 h-12 w-12 flex items-center justify-center"
              style={{ 
                top: playerPosition.y - (CHARACTER_SIZE / 2),
                left: playerPosition.x - (CHARACTER_SIZE / 2)
              }}
            >
              <motion.div 
                className="h-full w-full"
                animate={{
                  y: [0, -2, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1
                }}
              >
                <div className={`h-full w-full ${
                  playerDirection === Direction.UP 
                    ? "rotate-0" 
                    : playerDirection === Direction.RIGHT 
                      ? "rotate-90" 
                      : playerDirection === Direction.DOWN 
                        ? "rotate-180" 
                        : "-rotate-90"
                } transition-transform duration-150`}>
                  <div className="h-full w-full bg-blue-500 rounded-full relative flex items-center justify-center">
                    <div className="absolute top-1 -right-1 w-4 h-4 bg-blue-700 rounded-full" />
                    <div className="h-1/2 w-1/2 bg-white rounded-full" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Landmark or Game Info Card */}
      <AnimatePresence>
        {activeLandmark && (
          <motion.div 
            className="absolute bottom-4 left-4 w-64 bg-slate-800/90 rounded-lg overflow-hidden border border-teal-500/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <img 
              src={activeLandmark.image} 
              alt={activeLandmark.name} 
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <h3 className="font-bold text-white">{activeLandmark.name}</h3>
              <p className="text-sm text-gray-300 mt-1">{activeLandmark.description}</p>
              <div className="flex justify-end mt-2">
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => setActiveLandmark(null)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeGame && !playingGame && (
          <motion.div 
            className="absolute bottom-4 left-4 w-64 bg-slate-800/90 rounded-lg overflow-hidden border border-teal-500/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="h-32 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
              {activeGame.id === 5 ? (
                <Waves className="h-16 w-16 text-blue-300 opacity-80" />
              ) : (
                <Gamepad className="h-16 w-16 text-purple-300 opacity-80" />
              )}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-white">{activeGame.name}</h3>
              <p className="text-sm text-gray-300 mt-1">{activeGame.description}</p>
              <div className="flex justify-between mt-2">
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => setActiveGame(null)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Close
                </Button>
                <Button 
                  size="sm" 
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  Play Game
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mini Game Modal */}
      <AnimatePresence>
        {activeGame && playingGame && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-full max-w-lg mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {renderMiniGame()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile controls */}
      {!playingGame && renderControls()}
      
      {/* Map navigation buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button 
          onClick={centerMapOnPlayer}
          className="bg-slate-700/70 hover:bg-slate-600/70"
          disabled={playingGame}
        >
          Center Map
        </Button>
      </div>
      
      {/* Landmarks navigation list */}
      <div className="absolute top-4 right-4">
        <div className="w-48 bg-slate-800/80 rounded-lg p-3 border border-teal-500/30">
          <h3 className="font-bold text-white text-sm mb-2">Kerala Landmarks</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {landmarks.map(landmark => (
              <Button 
                key={landmark.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-300 hover:text-white text-xs py-1 h-auto"
                onClick={() => navigateToLandmark(landmark)}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {landmark.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeralaItinerary;
