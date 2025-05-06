import { useEffect, useRef, useState } from "react";
import metronomeSound from "../assets/metronomeSound.mp3";

export default function Metronome() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bpmRef = useRef<number>(60);
  const [bpm, setBpm] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const beatsPerMeasure = 4;

  // Load sound
  useEffect(() => {
    audioRef.current = new Audio(metronomeSound);
    audioRef.current.load();
  }, []);

  // Sync bpmRef
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // Metronome tick
  const tick = () => {
    if (!audioRef.current) return;
    setCurrentBeat((prev) => (prev + 1) % beatsPerMeasure);
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    const interval = (60 / bpmRef.current) * 1000;
    timeoutRef.current = window.setTimeout(tick, interval);
  };

  // Start and Stop
  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      tick();
    }
  };

  const stop = () => {
    setIsRunning(false);
    setCurrentBeat(0);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Keyboard controls: Space to toggle, ArrowUp/Right/Down/Left to adjust BPM
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
        case "Enter":
          e.preventDefault();
          isRunning ? stop() : start();
          break;
        case "ArrowUp":
        case "ArrowRight":
          e.preventDefault();
          setBpm((prev) => Math.min(prev + 1, 240));
          break;
        case "ArrowDown":
        case "ArrowLeft":
          e.preventDefault();
          setBpm((prev) => Math.max(prev - 1, 30));
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning]);

  // Clean up on unmount
  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-700 text-gray-900 p-6">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-md w-full text-center border border-gray-300">
        <h1 className="text-3xl font-bold mb-6">🎵 Metronome</h1>

        <div className="flex justify-center gap-4 mb-6">
          {[...Array(beatsPerMeasure)].map((_, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full transition-all duration-200 transform ${
                currentBeat === index
                  ? "bg-purple-400 scale-150 shadow-lg"
                  : "bg-purple-200 scale-100 opacity-50"
              }`}
            ></div>
          ))}
        </div>

        <div className="flex gap-4 justify-center mb-6">
          <button
            disabled={isRunning}
            onClick={start}
            className={`px-6 py-2 rounded-full font-semibold transition duration-200 border-2 ${
              isRunning
                ? "cursor-not-allowed opacity-50"
                : "border-blue-300 hover:bg-blue-300 hover:text-blue-900"
            }`}
          >
            Start
          </button>
          <button
            disabled={!isRunning}
            onClick={stop}
            className={`px-6 py-2 rounded-full font-semibold transition duration-200 border-2 ${
              !isRunning
                ? "cursor-not-allowed opacity-50"
                : "border-red-300 hover:bg-red-300 hover:text-red-900"
            }`}
          >
            Stop
          </button>
        </div>

        <div className="mb-2 text-sm font-medium text-gray-800">BPM: {bpm}</div>
        <input
          type="range"
          min={30}
          max={240}
          value={bpm}
          onChange={(e) => setBpm(+e.target.value)}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs mt-1 text-gray-600">
          <span>30</span>
          <span>240</span>
        </div>
      </div>
    </div>
  );
}
