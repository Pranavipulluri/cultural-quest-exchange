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
                      animate={{ rotate: [0, 20, 0, -20, 0
