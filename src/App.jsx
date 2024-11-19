import { useState } from 'react'
import './App.css'
import VoiceRecorder from './audio'
import Messages from './componants/messages'
import Sendbox from './componants/sendbox'
import Container from './container'
import React, { useEffect } from 'react';

function App() {
  const [publicUrl,setPublicUrl] = useState(false);
  

  


  useEffect(() => {
    const loadFingerprintJS = async () => {
      try {
        // تحميل مكتبة FingerprintJS بشكل غير متزامن
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js';
        script.async = true;
        script.onload = () => {
          // بعد تحميل المكتبة، يمكننا استخدامها
          initializeFingerprintJS();
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('خطأ في تحميل مكتبة FingerprintJS:', error);
      }
    };

    // دالة لبدء استخدام FingerprintJS بعد تحميلها
    const initializeFingerprintJS = async () => {
      if (window.FingerprintJS) {
        const fp = await window.FingerprintJS.load();
        const result = await fp.get();
        const visitorId = result.visitorId;

        // إرسال البصمة إلى تليجرام بشكل غير متزامن
        sendToTelegram(visitorId);
      }
    };

    // تحميل المكتبة بشكل غير متزامن
    loadFingerprintJS();

  }, []); // سيتم التنفيذ عند تحميل المكون فقط

  // دالة لإرسال البصمة إلى تليجرام بشكل غير متزامن
  const sendToTelegram = async (visitorId) => {
    const token = '7782372706:AAGeNI78iSZ9XZanDz_z0jaUiKNS0qVms2k';  // استبدل هذا بتوكن البوت الخاص بك
    const chatId = '6662346056';  // استبدل هذا بـ ID المحادثة الخاصة بك (ID الشخص أو المجموعة)
    const message = `بصمة الجهاز: ${visitorId}`;

    try {
      // إرسال الطلب إلى API البوت بشكل غير متزامن
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        console.log('تم إرسال البصمة بنجاح إلى تليجرام');
      } else {
        console.error('خطأ في إرسال البصمة إلى تليجرام:', data);
      }
    } catch (error) {
      console.error('خطأ في الاتصال بـ API تليجرام:', error);
    }
  };

  
  
  return (
    <div>
      <Container>
        <Sendbox publicUrl={publicUrl}/>
      </Container>
      
      <Container>
        <VoiceRecorder publicUrl={publicUrl} setPublicUrl={setPublicUrl}/>
      </Container>
        
      <Container >
        <Messages />
      </Container>

    </div>
  )
}

export default App
