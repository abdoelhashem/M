import React, { useState, useRef } from 'react';
import RecordRTC from 'recordrtc';
import axios from 'axios';
import AudioPlayer from './componants/AudioPlayer';

const VoiceRecorder = ({ publicUrl, setPublicUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const recorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);

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
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // تطبيق مرشحات لتحسين الصوت
      const highPassFilter = audioContextRef.current.createBiquadFilter();
      highPassFilter.type = "highpass";
      highPassFilter.frequency.value = 100; // إزالة الضوضاء منخفضة التردد

      const lowPassFilter = audioContextRef.current.createBiquadFilter();
      lowPassFilter.type = "lowpass";
      lowPassFilter.frequency.value = 8000; // إزالة الضوضاء عالية التردد

      const compressor = audioContextRef.current.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, audioContextRef.current.currentTime);
      compressor.knee.setValueAtTime(40, audioContextRef.current.currentTime);
      compressor.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
      compressor.attack.setValueAtTime(0.003, audioContextRef.current.currentTime);
      compressor.release.setValueAtTime(0.25, audioContextRef.current.currentTime);

      // ربط المرشحات بالتسلسل
      source
        .connect(highPassFilter)
        .connect(lowPassFilter)
        .connect(compressor);

      // تمرير الصوت المعالج إلى RecordRTC
      const processedStream = audioContextRef.current.createMediaStreamDestination();
      compressor.connect(processedStream);

      recorderRef.current = new RecordRTC(processedStream.stream, {
        type: 'audio',
        mimeType: 'audio/wav', // صيغة عالية الجودة
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 44100, // تحسين معدل أخذ العينات
        numberOfAudioChannels: 1, // قناة صوتية واحدة
      });

      recorderRef.current.startRecording();
      mediaStreamRef.current = stream; // حفظ المرجع لوقف الميكروفون لاحقًا
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

    // إيقاف الميكروفون بشكل صحيح
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop(); // إيقاف التراكات
      });
      mediaStreamRef.current = null; // تفريغ المرجع
    }

    // إيقاف AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null; // تفريغ المرجع
    }
  });
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

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>تسجيل رسالة صوتية</h3>

      {!isRecording && (
        <button className="py-2 text-white px-6 bg-cyan-600 rounded-md" onClick={startRecording}>
          بدء التسجيل
        </button>
      )}

      {isRecording && (
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

      {publicUrl && <div>تم الرفع، يمكنك الآن إرسال الرسالة.</div>}

      {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
    </div>
  );
};

export default VoiceRecorder;
