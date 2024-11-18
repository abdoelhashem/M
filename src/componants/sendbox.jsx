import React, { useEffect, useState } from "react";
import "./sendbox.css"
const Sendbox = ({publicUrl}) => {
    const [invalue,setInvalue] = useState("");
    const [ine,setIne] = useState(true);
    const [ip,setIp] = useState("");
    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => setIp(data.ip))
        .catch(error => console.error("حدث خطأ:", error));
    }, [])
    const v = (x) => {
        setInvalue(x.target.value);
        
    }
    const send = () => {
        if (invalue != "") {
            setInvalue("")
            setIne(false);
            fetch(`https://abdoelhashem.pythonanywhere.com/add?voice=${publicUrl}&message=${invalue}&ip=${ip || "0.0.0.0"}`).then(b => {
                window.location.reload()
            })
        }
    }
    return (
        <div>
            <h1>إرسال رسالة مجهولة</h1>
    
            <textarea onInput={v} value={invalue} className="input-box" placeholder="اكتب رسالتك هنا..." rows="4"></textarea>
            <button className="send-btn" onClick={send}>{ine ? 'send' : <div className="flex justify-center"><div class="loader vv"></div></div>}</button>
        </div>

    )

} 

export default Sendbox;
