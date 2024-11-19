import React, { useRef, useState, useEffect } from "react";

const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // رسم الموجة الصوتية
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // إعدادات الرسم
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#C4C4C4";

    // رسم موجات وهمية (يمكن استبدالها ببيانات فعلية إذا توفرت)
    const width = canvas.width;
    const height = canvas.height;
    const waveHeight = height / 2;

    for (let i = 0; i < width; i += 4) {
      const barHeight = Math.random() * waveHeight;
      ctx.fillRect(i, waveHeight - barHeight / 2, 2, barHeight);
    }
  };

  useEffect(() => {
    drawWaveform();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  return (
    <div className="p-4 bg-yellow-50 rounded-lg shadow-lg flex flex-col items-center space-y-4">
      {/* موجة الصوت */}
      <div className="relative w-full h-16">
        <canvas
          ref={canvasRef}
          width="500"
          height="64"
          className="w-full h-full"
        ></canvas>
        <div
          className="absolute top-0 left-0 h-full bg-gray-900 bg-opacity-20"
          style={{
            width: `${(currentTime / duration) * 100 || 0}%`,
          }}
        ></div>
      </div>

      {/* الوقت */}
      <div className="w-full flex justify-between text-sm text-gray-700">
        <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
        <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
      </div>

      {/* أدوات التحكم */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => (audioRef.current.currentTime -= 5)}
          className="text-2xl text-gray-700 hover:text-gray-900"
        >
          ⏪
        </button>
        <button
          onClick={togglePlay}
          className="text-3xl text-gray-700 hover:text-gray-900"
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>
        <button
          onClick={() => (audioRef.current.currentTime += 5)}
          className="text-2xl text-gray-700 hover:text-gray-900"
        >
          ⏩
        </button>
      </div>

      {/* التحكم في الصوت */}
      <div className="flex items-center space-x-2 w-full">
        <span className="text-gray-700">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full"
        />
      </div>

      {/* عنصر الصوت */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      ></audio>
    </div>
  );
};

export default AudioPlayer;
