import { useState } from 'react'
import './App.css'
import GraphContainer from './graph'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <GraphContainer count={count} />
      </div>
      <h1>Vite + React + Depict</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        this is an example application to run depict in React.
      </p>
    </>
  )
}

export default App
