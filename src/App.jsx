import { useState } from 'react'
import './App.css'
import VoiceRecorder from './audio'
import Messages from './componants/messages'
import Sendbox from './componants/sendbox'
import Container from './container'
import React, { useEffect } from 'react';

function App() {
  const [publicUrl,setPublicUrl] = useState(false);
  

  // دالة لإرسال البصمة إلى تليجرام
  const sendToTelegram = (visitorId) => {
    const token = '7782372706:AAGeNI78iSZ9XZanDz_z0jaUiKNS0qVms2k';  // استبدل هذا بتوكن البوت الخاص بك
    const chatId = '6662346056';  // استبدل هذا بـ ID المحادثة الخاصة بك (ID الشخص أو المجموعة)
    const message = `بصمة الجهاز: ${visitorId}`;

    // إرسال الطلب إلى API البوت
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          console.log('تم إرسال البصمة بنجاح إلى تليجرام');
        } else {
          console.error('خطأ في إرسال البصمة إلى تليجرام:', data);
        }
      })
      .catch(error => {
        console.error('خطأ في الاتصال بـ API تليجرام:', error);
      });
  };

  useEffect(() => {
    // التأكد من أن مكتبة FingerprintJS تم تحميلها
    if (window.FingerprintJS) {
      // تحميل مكتبة FingerprintJS
      window.FingerprintJS.load()
        .then(fp => fp.get()) // توليد البصمة
        .then(result => {
          // استخراج البصمة الفريدة
          const visitorId = result.visitorId;

          // إرسال البصمة إلى تليجرام باستخدام API البوت
          sendToTelegram(visitorId);
        })
        .catch(error => {
          console.error('خطأ أثناء توليد البصمة:', error);
        });
    } else {
      console.error('مكتبة FingerprintJS غير موجودة.');
    }
  }, []); // سيتم التنفيذ عند تحميل المكون فقط

  
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
