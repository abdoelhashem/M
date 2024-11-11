import "./messages.css";
import { useEffect, useState } from "react";
function Messages() {
    const [data,setData] = useState([]);
    const [loader,setLoader] = useState(true);
    useEffect(() => {
        fetch("http://hdbdbsjzj.fwh.is/messages.json").then(response => response.json()).then(arr => {
            const arr1 = arr.filter(w => w.show == "true");
            setData(arr1);
            setLoader(false)
        })
    },[])

    function timeAgo(date) {
        // الحصول على التوقيت الحالي في توقيت القاهرة
        const currentTime = new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" });
        const cairoTime = new Date(currentTime);
        
        // إنشاء تاريخ الرسالة في توقيت القاهرة
        const messageTime = new Date(`${date.month} ${date.day_of_month}, ${date.year} ${date.time_24hr}`);
        messageTime.setHours(messageTime.getHours() + 1); // تقليل ساعة واحدة
        
        const elapsed = cairoTime - messageTime;
    
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30); 
        const years = Math.floor(days / 365); 
    
        if (seconds < 60) {
            return `منذ ${seconds} ثانية`;
        } else if (minutes < 60) {
            return `منذ ${minutes} دقيقة`;
        } else if (hours < 24) {
            return `منذ ${hours} ساعة`;
        } else if (days < 7) {
            return `منذ ${days} يوم`;
        } else if (weeks < 4) {
            return `منذ ${weeks} أسبوع`;
        } else if (months < 12) {
            return `منذ ${months} شهر`;
        } else {
            return `منذ ${years} سنة`;
        }
    }
    
    


    return (
        <div>
        <h1>الرسائل</h1>
        <div className={`${loader ? "flex" : "hidden"} items-center flex-col`}>
           <div className="loader"></div>
           <h3 className="message-content">جار تحميل الرسائل...</h3>
        </div>
        {data.map((x,i) => (
            <div className="message-box" key={i}>
                <div className="message-footer">
                <span>{timeAgo(x.date)}</span>
            </div>
            <div className="message-box" >
            <p className="">{x.message}</p>
            </div>
            {x.reply == "" ? "" : <><div className="message-footer">
                    الرد :
                </div><div className="message-box">
                        <p className="">{x.reply}</p>
                    </div></>}
            </div>
            
        ))}
        
        
    </div>
    )
  }
  
  export default Messages