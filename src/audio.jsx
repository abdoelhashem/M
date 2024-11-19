import React, { useState, useRef } from 'react';
import RecordRTC from 'recordrtc';
import axios from 'axios';
import AudioPlayer from './componants/AudioPlayer';

const VoiceRecorder = ({ publicUrl, setPublicUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isd, setIsd] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const recorderRef = useRef(null);
  const streamRef = useRef(null); // تخزين تدفق الصوت هنا
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyserRef = useRef(audioContext.createAnalyser());
  const compressorRef = useRef(audioContext.createDynamicsCompressor());
  const gainNode = useRef(audioContext.createGain());
  const noiseReductionNode = useRef(audioContext.createGain());
  const equalizerNode = useRef(audioContext.createBiquadFilter());
  const reverbNode = useRef(audioContext.createConvolver());

  const setupFilters = () => {
    equalizerNode.current.type = 'peaking';
    equalizerNode.current.frequency.setValueAtTime(1000, audioContext.currentTime);
    equalizerNode.current.gain.setValueAtTime(5, audioContext.currentTime);
    reverbNode.current.buffer = null;
    reverbNode.current.normalize = true;
  };

  const checkAudioSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("عذرًا، المتصفح لا يدعم تسجيل الصوت.");
      return false;
    }
    return true;
  };

  const requestAudioPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (err) {
      setErrorMessage("لم يتم منح إذن التسجيل الصوتي.");
      return null;
    }
  };

  const startRecording = async () => {
    if (!checkAudioSupport()) return;

    // إذا كان هناك تدفق صوت سابق، قم بإيقافه
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const stream = await requestAudioPermission();
    if (!stream) return;

    streamRef.current = stream; // تخزين التدفق الجديد

    try {
      const audioSource = audioContext.createMediaStreamSource(stream);
      setupFilters();

      compressorRef.current.threshold.setValueAtTime(-50, audioContext.currentTime);
      compressorRef.current.knee.setValueAtTime(40, audioContext.currentTime);
      compressorRef.current.ratio.setValueAtTime(12, audioContext.currentTime);
      compressorRef.current.attack.setValueAtTime(0, audioContext.currentTime);
      compressorRef.current.release.setValueAtTime(0.25, audioContext.currentTime);

      noiseReductionNode.current.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.current.gain.setValueAtTime(1, audioContext.currentTime);

      audioSource.connect(noiseReductionNode.current);
      noiseReductionNode.current.connect(equalizerNode.current);
      equalizerNode.current.connect(reverbNode.current);
      reverbNode.current.connect(compressorRef.current);
      compressorRef.current.connect(gainNode.current);
      gainNode.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);

      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
      setErrorMessage("");
      setShowUploadOptions(false);
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء بدء التسجيل.");
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
    setIsRecording(false); // إعادة تعيين حالة التسجيل
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
