import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);

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
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setErrorMessage("");
      setShowUploadOptions(false);
    } catch (error) {
      setErrorMessage("لم يتم منح إذن التسجيل الصوتي.");
    }
  };

  const stopRecording = (recordedBlob) => {
    setIsRecording(false);
    setAudioFile(recordedBlob.blob);
    setShowUploadOptions(true);
  };

  const uploadToCloudinary = async (blob) => {
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
        <button className='py-2 text-white px-6 bg-cyan-600 rounded-md' onClick={startRecording}>
          بدء التسجيل
        </button>
      )}

<ReactMic className='w-full'
        record={isRecording}
        onStop={stopRecording}
        mimeType="audio/wav"
        echoCancellation={true}
        autoGainControl={true}
        onError={() => setErrorMessage("حدث خطأ أثناء التسجيل. تأكد من إعدادات المتصفح.")}
      />

      {isRecording && (
        <button className='py-2 text-white px-6 bg-cyan-600 rounded-md' onClick={() => setIsRecording(false)}>
          إيقاف التسجيل
        </button>
      )}

      {audioFile && (
        <div>
          <h4>الرسالة الصوتية:</h4>
          <audio src={URL.createObjectURL(audioFile)} controls />
        </div>
      )}

      {showUploadOptions && (
        <div style={{ marginTop: '10px' }}>
          <button className='py-2 text-white px-6 bg-cyan-600 rounded-md' onClick={handleUploadConfirmation}>رفع الملف</button>
          <button className='py-2 text-white px-6 bg-cyan-600 rounded-md' onClick={handleRetakeRecording} style={{ marginLeft: '10px' }}>تسجيل من جديد</button>
        </div>
      )}

      {publicUrl && (
        <div>
          <h4>رابط عام للملف:</h4>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            {publicUrl}
          </a>
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