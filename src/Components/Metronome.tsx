import { useEffect, useRef, useState } from "react";
import metronomeSound from "../assets/metronomeSound.mp3";

export default function Metronome() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const bpmRef = useRef<number>(60); // <-- stores latest BPM
  const [bpm, setBpm] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  
  const [currentBeat, setCurrentBeat] = useState(0);
  const beatsPerMeasure = 4;

  // loading audio
  useEffect(() => {
    audioRef.current = new Audio(metronomeSound);
    audioRef.current.load();
  }, []);

  // Always sync bpmRef with current bpm state
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // Avoid using setInterval for a clean transition to the new BPM state.
  // With setInterval, we would need to stop the interval first and then start a new one with the new BPM,
  // which isn't very clean.
  // Instead, we use setTimeout recursively for a smoother and more controlled transition.
  // gives flexibility for dynamically changing BPM.
  // using setTimeout recursively (calling tick() again at the end of each tick), each time it runs, it recalculates the interval based on the latest BPM value.
  const tick = () => {
    if (!audioRef.current) return;

    setCurrentBeat((prev) => (prev + 1) % beatsPerMeasure); // move to next beat

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.error("Audio playback failed:", err);
    });

    const interval = (60 / bpmRef.current) * 1000;

    // Schedule the next tick recursively using setTimeout, allowing for smooth and accurate BPM transitions.
    timeoutRef.current = window.setTimeout(tick, interval);
  };

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      tick(); // start ticking
    }
  };

  const stop = () => {
    setIsRunning(false);
    setCurrentBeat(0); // reset the visual dots
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <>
      <div className="flex gap-2 mt-4 justify-center">
        {[...Array(beatsPerMeasure)].map((_, index) => (
          <div
            key={index}
            className={`w-6 h-6 rounded-full transition-all duration-150 ${
              currentBeat === index
                ? "bg-green-600 scale-125"
                : "bg-gray-400 scale-100"
            }`}
          ></div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          disabled={isRunning}
          className="border-2 border-green-700 p-3"
          onClick={start}
        >
          Start
        </button>
        <button
          disabled={!isRunning}
          className="border-2 border-red-700 p-3"
          onClick={stop}
        >
          Stop
        </button>
      </div>

      <div className="mt-4">
        <label htmlFor="bpm" className="block mb-2">
          BPM: {bpm}
        </label>
        <input
          id="bpm"
          type="range"
          min={30}
          max={240}
          value={bpm}
          onChange={(e) => setBpm(+e.target.value)}
          className="w-full"
        />
      </div>
    </>
  );
}
