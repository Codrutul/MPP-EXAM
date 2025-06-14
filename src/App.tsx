import { CharacterList } from './components/CharacterList'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>MMO RPG Character Roster</h1>
      </header>
      <main>
        <CharacterList />
      </main>
    </div>
  )
}

export default App
