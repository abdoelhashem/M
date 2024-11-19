import React, { useRef, useState, useEffect } from "react";

const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // رسم الموجة الصوتية
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ccc";

    const width = canvas.width;
    const height = canvas.height;
    const waveHeight = height / 2;

    for (let i = 0; i < width; i += 4) {
      const barHeight = Math.random() * waveHeight;
      ctx.fillRect(i, waveHeight - barHeight / 2, 2, barHeight);
    }

    // شريط التقدم
    ctx.fillStyle = "#000"; // لون الخط العمودي
    const progressX = (currentTime / duration) * width || 0;
    ctx.fillRect(progressX, 0, 2, height); // خط عمودي رفيع
  };

  useEffect(() => {
    drawWaveform();
  }, [currentTime, duration]);

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

  const handleSeek = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / canvas.width) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="flex items-center space-x-4 bg-white rounded-full shadow-lg p-3 w-full max-w-md">
      {/* زر التشغيل */}
      <button onClick={togglePlay} className="text-gray-600">
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5v15m12-15v15" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 5.25l13.5 6.75-13.5 6.75V5.25z"
            />
          </svg>
        )}
      </button>

      {/* الموجة الصوتية */}
      <div className="flex-1 relative h-6">
        <canvas
          ref={canvasRef}
          width="300"
          height="24"
          className="w-full h-full cursor-pointer"
          onClick={handleSeek}
        ></canvas>
      </div>

      {/* الوقت */}
      <div className="text-sm text-gray-600">
        {new Date(currentTime * 1000).toISOString().substr(14, 5)} /{" "}
        {new Date(duration * 1000).toISOString().substr(14, 5)}
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
