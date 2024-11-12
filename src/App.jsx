import './App.css'
import VoiceRecorder from './audio'
import Messages from './componants/messages'
import Sendbox from './componants/sendbox'
import Container from './container'
function App() {

  return (
    <div>
      <Container>
        <Sendbox />
      </Container>
      
      <Container>
        <VoiceRecorder />
      </Container>
        
      <Container >
        <Messages />
      </Container>

    </div>
  )
}

export default App
