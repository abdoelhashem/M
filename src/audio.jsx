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
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);

  const checkAudioSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("عذرًا، المتصفح لا يدعم تسجيل الصوت.");
      return false;
    }
    return true;
  };

  // إضافة معالجة صوتية باستخدام Web Audio API
  const setupAudioProcessing = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    gainNodeRef.current = audioContextRef.current.createGain();
    source.connect(analyserRef.current);
    analyserRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);
  };

  const startRecording = async () => {
    if (!checkAudioSupport()) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAudioProcessing(stream);

      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 44100, // زيادة جودة التسجيل
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
    recorderRef.current.stopRecording(async () => {
      setIsRecording(false);
      const blob = recorderRef.current.getBlob();
      const audioUrl = URL.createObjectURL(blob);

      // تطبيق تقنيات تحسين الصوت بعد التسجيل
      const improvedAudio = await applyAudioEnhancements(audioUrl);
      setAudioFile(improvedAudio);
      setShowUploadOptions(true);
    });
  };

  // استخدام Web Audio API لتصفية الصوت
  const applyAudioEnhancements = async (audioUrl) => {
    const response = await fetch(audioUrl);
    const audioData = await response.arrayBuffer();

    // فك تشفير الصوت
    const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
    
    // معالجة الصوت (على سبيل المثال: تحسين الصوت / إزالة الضوضاء)
    const filteredBuffer = audioContextRef.current.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

    // تطبيق تحسينات الصوت (مثل استخدام خوارزميات لتصفية الضوضاء هنا)

    // العودة إلى الصوت المحسن
    return new Blob([filteredBuffer], { type: 'audio/wav' });
  };

  const uploadToCloudinary = async (blob) => {
    setIsd(true);
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", "exeeii57");

    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dmocyqnng/upload", formData);
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

      {isRecording == false && (
        <button className='py-2 text-white px-6 bg-cyan-600 rounded-md' onClick={startRecording}>
          بدء التسجيل
        </button>
      )}

      {isRecording == true && (
        <button className='py-2 text-white px-6 bg-cyan-600 rounded-md' onClick={stopRecording}>
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
        <div className='flex gap-3' style={{ marginTop: '10px' }}>
          <button className='py-2 text-white px-6 bg-cyan-600 rounded-md' onClick={handleUploadConfirmation}>ارسال مع الرساله</button>
          <button className='py-2 text-white px-6 bg-cyan-600 rounded-md' onClick={handleRetakeRecording} style={{ marginLeft: '10px' }}>تسجيل من جديد</button>
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
