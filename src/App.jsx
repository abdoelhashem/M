import { useState } from 'react'
import './App.css'
import VoiceRecorder from './audio'
import Messages from './componants/messages'
import Sendbox from './componants/sendbox'
import Container from './container'
function App() {
  const [publicUrl,setPublicUrl] = useState(false);
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
