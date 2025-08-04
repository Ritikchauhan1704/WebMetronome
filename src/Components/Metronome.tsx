import { useEffect, useRef, useState } from "react";
import { FiPlay, FiStopCircle, FiPlus, FiMinus } from "react-icons/fi";
import metronomeSound from "../assets/metronomeSound.mp3";

export default function Metronome() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bpmRef = useRef<number>(60);
  const intervalRef = useRef<number | null>(null);

  const [bpm, setBpm] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const beatsPerMeasure = 4;

  useEffect(() => {
    audioRef.current = new Audio(metronomeSound);
    audioRef.current.load();
  }, []);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const tick = () => {
    if (!audioRef.current) return;
    setCurrentBeat((prev) => (prev + 1) % beatsPerMeasure);
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .catch((err) => console.error("Audio playback failed:", err));
    const interval = (60 / bpmRef.current) * 1000;
    timeoutRef.current = window.setTimeout(tick, interval);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      tick();
      setElapsedTime(0);
      intervalRef.current = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stop = () => {
    setIsRunning(false);
    setCurrentBeat(0);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

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

  useEffect(() => {
    return () => stop();
  }, []);

  const incrementBpm = () => setBpm((prev) => Math.min(prev + 1, 240));
  const decrementBpm = () => setBpm((prev) => Math.max(prev - 1, 30));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-700 text-gray-900 p-6">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl p-10 lg:p-16 shadow-2xl max-w-3xl w-full text-center border border-gray-200">
        <h1 className="text-5xl font-bold mb-10 text-purple-700">
          🎵 Metronome
        </h1>

        <div className="flex justify-center gap-6 mb-10">
          {[...Array(beatsPerMeasure)].map((_, index) => (
            <div
              key={index}
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full transition-all duration-200 transform ${
                currentBeat === index
                  ? "bg-purple-500 scale-150 shadow-xl"
                  : "bg-purple-300 scale-100 opacity-50"
              }`}
            ></div>
          ))}
        </div>

        <div className="flex gap-6 justify-center mb-8">
          <button
            disabled={isRunning}
            onClick={start}
            className={`px-8 py-3 rounded-full text-xl font-semibold flex items-center justify-center gap-3 transition duration-200 border-2 ${
              isRunning
                ? "cursor-not-allowed opacity-50"
                : "border-blue-400 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <FiPlay size={24} />
            Start
          </button>
          <button
            disabled={!isRunning}
            onClick={stop}
            className={`px-8 py-3 rounded-full text-xl font-semibold flex items-center justify-center gap-3 transition duration-200 border-2 ${
              !isRunning
                ? "cursor-not-allowed opacity-50"
                : "border-red-400 text-red-700 hover:bg-red-200"
            }`}
          >
            <FiStopCircle size={24} />
            Stop
          </button>
        </div>

        <div className="text-lg font-medium text-gray-700 mt-4 mb-6">
          Timer:{" "}
          <span className="font-mono text-xl text-purple-600">
            {formatTime(elapsedTime)}
          </span>
        </div>

        <div className="mb-4 text-xl font-semibold text-gray-800 flex items-center justify-center gap-6">
          <button
            onClick={decrementBpm}
            className="text-2xl p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition font-bold"
          >
            <FiMinus />
          </button>
          <span className="text-3xl font-extrabold w-36 text-purple-700">
            {bpm} BPM
          </span>
          <button
            onClick={incrementBpm}
            className="text-2xl p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition font-bold"
          >
            <FiPlus />
          </button>
        </div>

        <input
          type="range"
          min={30}
          max={240}
          value={bpm}
          onChange={(e) => setBpm(+e.target.value)}
          className="w-full h-3 mt-6 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-sm mt-1 text-gray-600">
          <span>30</span>
          <span>240</span>
        </div>
      </div>
    </div>
  );
}
