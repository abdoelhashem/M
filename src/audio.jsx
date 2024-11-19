import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AudioPlayer from './components/AudioPlayer';

const VoiceRecorder = ({ publicUrl, setPublicUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);

  const checkAudioSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("عذرًا، المتصفح لا يدعم تسجيل الصوت.");
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    if (!checkAudioSupport()) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // إنشاء AudioContext لتحسين الصوت
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

      // تطبيق مرشحات لتحسين الصوت
      const highPassFilter = audioContextRef.current.createBiquadFilter();
      highPassFilter.type = "highpass";
      highPassFilter.frequency.value = 100; // إزالة الضوضاء منخفضة التردد

      const lowPassFilter = audioContextRef.current.createBiquadFilter();
      lowPassFilter.type = "lowpass";
      lowPassFilter.frequency.value = 8000; // إزالة الضوضاء عالية التردد

      const compressor = audioContextRef.current.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-30, audioContextRef.current.currentTime);
      compressor.knee.setValueAtTime(40, audioContextRef.current.currentTime);
      compressor.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
      compressor.attack.setValueAtTime(0.003, audioContextRef.current.currentTime);
      compressor.release.setValueAtTime(0.25, audioContextRef.current.currentTime);

      // توصيل المرشحات
      mediaStreamSourceRef.current
        .connect(highPassFilter)
        .connect(lowPassFilter)
        .connect(compressor)
        .connect(audioContextRef.current.destination);

      // إعداد التسجيل
      const options = {
        mimeType: 'audio/webm', // صيغة مضغوطة بجودة عالية
        audioBitsPerSecond: 128000, // معدل البت الصوتي
      };
      recorderRef.current = new MediaRecorder(stream, options);

      const chunks = [];
      recorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioFile(blob);
        setShowUploadOptions(true);
      };

      recorderRef.current.start();
      setIsRecording(true);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("لم يتم منح إذن التسجيل الصوتي.");
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    setIsRecording(false);

    // تنظيف الموارد
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
  };

  const uploadToCloudinary = async (blob) => {
    if (!blob) {
      setErrorMessage("لا يوجد ملف صوتي للرفع.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", "exeeii57");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dmocyqnng/upload",
        formData
      );
      setPublicUrl(response.data.secure_url);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadConfirmation = () => {
    uploadToCloudinary(audioFile);
    setShowUploadOptions(false);
  };

  const handleRetakeRecording = () => {
    setAudioFile(null);
    setShowUploadOptions(false);
    setPublicUrl("");
    setErrorMessage("");
  };

  // تنظيف الموارد عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recorderRef.current) {
        recorderRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>تسجيل رسالة صوتية</h3>

      {!isRecording && (
        <button
          className="py-2 text-white px-6 bg-cyan-600 rounded-md"
          onClick={startRecording}
          disabled={isUploading}
        >
          بدء التسجيل
        </button>
      )}

      {isRecording && (
        <button
          className="py-2 text-white px-6 bg-cyan-600 rounded-md"
          onClick={stopRecording}
        >
          إيقاف التسجيل
        </button>
      )}

      {audioFile && (
        <div>
          <h4>الرسالة الصوتية:</h4>
          <AudioPlayer src={URL.createObjectURL(audioFile)} />
        </div>
      )}

      {showUploadOptions && (
        <div className="flex gap-3" style={{ marginTop: '10px' }}>
          <button
            className="py-2 text-white px-6 bg-cyan-600 rounded-md"
            onClick={handleUploadConfirmation}
            disabled={isUploading}
          >
            ارسال مع الرسالة
          </button>
          <button
            className="py-2 text-white px-6 bg-cyan-600 rounded-md"
            onClick={handleRetakeRecording}
            style={{ marginLeft: '10px' }}
          >
            تسجيل من جديد
          </button>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center flex-col">
          <div className="loader"></div>
          <div>جار الرفع الرجاء الانتظار...</div>
        </div>
      )}

      {publicUrl && <div>تم الرفع ارسل رسالتك وسوف يرسل معها</div>}

      {errorMessage && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
