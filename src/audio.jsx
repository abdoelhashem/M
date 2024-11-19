import React, { useState, useRef } from 'react';
import RecordRTC from 'recordrtc';
import axios from 'axios';
import AudioPlayer from './componants/AudioPlayer';

const VoiceRecorder = ({ publicUrl, setPublicUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isd, setIsd] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const recorderRef = useRef(null);
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyserRef = useRef(audioContext.createAnalyser());
  const compressorRef = useRef(audioContext.createDynamicsCompressor());

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
      
      // إنشاء مصدر الصوت
      const audioSource = audioContext.createMediaStreamSource(stream);

      // فلتر لخفض الترددات العالية أو الضوضاء
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'lowpass'; // تصفية الترددات العالية أو الضوضاء
      noiseFilter.frequency.setValueAtTime(2000, audioContext.currentTime);

      // استخدام Equalizer لتعديل الترددات
      const equalizer = audioContext.createBiquadFilter();
      equalizer.type = 'peaking';  // تعديل الترددات بشكل متوازن
      equalizer.frequency.setValueAtTime(1000, audioContext.currentTime);
      equalizer.gain.setValueAtTime(10, audioContext.currentTime);  // رفع تردد 1kHz

      // إضافة ضاغط الصوت (Compressor) للتحكم في الديناميكية
      compressorRef.current.threshold.setValueAtTime(-50, audioContext.currentTime);
      compressorRef.current.knee.setValueAtTime(40, audioContext.currentTime);
      compressorRef.current.ratio.setValueAtTime(12, audioContext.currentTime);
      compressorRef.current.attack.setValueAtTime(0, audioContext.currentTime);
      compressorRef.current.release.setValueAtTime(0.25, audioContext.currentTime);

      // ربط الفلاتر بالصوت
      audioSource.connect(noiseFilter);
      noiseFilter.connect(equalizer);
      equalizer.connect(compressorRef.current);
      compressorRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);

      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
      setErrorMessage("");
      setShowUploadOptions(false);
    } catch (error) {
      setErrorMessage("لم يتم منح إذن التسجيل الصوتي.");
    }
  };

  const stopRecording = () => {
    recorderRef.current.stopRecording(() => {
      setIsRecording(false);
      const blob = recorderRef.current.getBlob();
      setAudioFile(blob);
      setShowUploadOptions(true);
    });
  };

  const uploadToCloudinary = async (blob) => {
    setIsd(true);
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", "exeeii57");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dmocyqnng/upload",
        formData
      );
      setPublicUrl(response.data.secure_url);
      setIsd(false);
      setIsRecording("hid");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى.");
      setIsd(false);
      setIsRecording(false);
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

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>تسجيل رسالة صوتية</h3>

      {isRecording === false && (
        <button className="py-2 text-white px-6 bg-cyan-600 rounded-md" onClick={startRecording}>
          بدء التسجيل
        </button>
      )}

      {isRecording === true && (
        <button className="py-2 text-white px-6 bg-cyan-600 rounded-md" onClick={stopRecording}>
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
          <button className="py-2 text-white px-6 bg-cyan-600 rounded-md" onClick={handleUploadConfirmation}>ارسال مع الرساله</button>
          <button className="py-2 text-white px-6 bg-cyan-600 rounded-md" onClick={handleRetakeRecording} style={{ marginLeft: '10px' }}>تسجيل من جديد</button>
        </div>
      )}

      <div className={`${isd ? "flex" : "hidden"} items-center flex-col`}>
        <div className="loader"></div>
        <div>جار الرفع الرجاء الانتظار...</div>
      </div>

      {publicUrl && (
        <div>
          تم الرفع ارسل رسالتك وسوف يرسل معها
        </div>
      )}

      {errorMessage && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
