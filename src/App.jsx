import { useEffect, useMemo, useState } from 'react'
import './App.css'

const TEAMS = [
  { letter: 'A', name: 'Alligators', animal: '🐊', color: '#7EA947' },
  { letter: 'B', name: 'Bears', animal: '🐻', color: '#B76B3E' },
  { letter: 'C', name: 'Cougars', animal: '🐆', color: '#D09234' },
  { letter: 'D', name: 'Dolphins', animal: '🐬', color: '#3B91A6' },
  { letter: 'E', name: 'Eagles', animal: '🦅', color: '#9B7151' },
  { letter: 'F', name: 'Foxes', animal: '🦊', color: '#D7653D' },
  { letter: 'G', name: 'Gorillas', animal: '🦍', color: '#736D68' },
  { letter: 'H', name: 'Hawks', animal: '🦅', color: '#B85438' },
  { letter: 'I', name: 'Ibex', animal: '🐐', color: '#758255' },
  { letter: 'J', name: 'Jaguars', animal: '🐆', color: '#C7942F' },
  { letter: 'K', name: 'Koalas', animal: '🐨', color: '#758B91' },
  { letter: 'L', name: 'Lions', animal: '🦁', color: '#C97834' },
]

const PUZZLES = [
  { letter: 'A', place: 'Founders Hall', spot: 'Beneath the bell tower', type: 'physical', code: '1847', prompt: 'Find the weathered blue envelope. Solve the four-number cipher printed inside.' },
  { letter: 'B', place: 'Campus Library', spot: 'North reading room', type: 'physical', code: 'STACKS', prompt: 'Locate the marked book on the history shelf. The bookmark holds your next code.' },
  { letter: 'C', place: 'Student Union', spot: 'Beside the fireplace', type: 'physical', code: 'SPARK', prompt: 'Find the kickoff weekend poster. Use the highlighted letters to uncover the code word.' },
  { letter: 'D', place: 'Science Quad', spot: 'Center sculpture', type: 'order', answer: '3142', prompt: 'A brass plate reads: “Oldest to newest.” Tap the discoveries in chronological order.' },
  { letter: 'E', place: 'Memorial Garden', spot: 'Stone archway', type: 'physical', code: 'ROOTS', prompt: 'Find the rubbing sheet in the supply box and reveal the hidden five-letter word.' },
  { letter: 'F', place: 'Arts Center', spot: 'Main lobby mural', type: 'scramble', answer: 'CREATE', prompt: 'The mural has scattered letters. Unscramble them to name what artists do.' },
  { letter: 'G', place: 'Recreation Center', spot: 'Courtyard entrance', type: 'physical', code: 'VICTORY', prompt: 'Count the pennants, then use the key on the clipboard to decode the winning word.' },
  { letter: 'H', place: 'Chapel Steps', spot: 'Top landing', type: 'choice', answer: 'echo', prompt: 'I speak without a mouth and answer without being asked. What am I?', options: ['A shadow', 'An echo', 'A bell'] },
  { letter: 'I', place: 'Dining Commons', spot: 'East patio', type: 'physical', code: 'FEAST', prompt: 'Match the menu symbols on the table card. Read the circled letters from left to right.' },
  { letter: 'J', place: 'Clock Plaza', spot: 'Under the west clock', type: 'sequence', answer: '34', prompt: 'Complete the sequence: 1, 2, 3, 5, 8, 13, 21, __' },
  { letter: 'K', place: 'Alumni House', spot: 'Front porch', type: 'physical', code: 'LEGACY', prompt: 'Arrange the photo cards from oldest to newest. Flip them over to reveal the code.' },
  { letter: 'L', place: 'Observatory Lawn', spot: 'Star marker', type: 'compass', answer: 'north', prompt: 'Face the observatory. The final marker is opposite the setting sun. Which direction is it?', options: ['North', 'East', 'South', 'West'] },
]

const DISCOVERIES = [
  { id: '1', icon: '⚡', label: 'Electricity' },
  { id: '2', icon: '🧬', label: 'DNA' },
  { id: '3', icon: '🔭', label: 'Telescope' },
  { id: '4', icon: '💻', label: 'Computer' },
]

const INITIAL_PROGRESS = Object.fromEntries(TEAMS.map((team) => [team.letter, 0]))

function loadProgress() {
  try {
    return { ...INITIAL_PROGRESS, ...JSON.parse(localStorage.getItem('trailbound-progress') || '{}') }
  } catch {
    return INITIAL_PROGRESS
  }
}

function ArrowIcon() {
  return <span aria-hidden="true">→</span>
}

function App() {
  const [screen, setScreen] = useState('teams')
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [progress, setProgress] = useState(loadProgress)
  const [answer, setAnswer] = useState('')
  const [order, setOrder] = useState([])
  const [message, setMessage] = useState(null)
  const [hintOpen, setHintOpen] = useState(false)

  const team = TEAMS.find((item) => item.letter === selectedLetter)
  const solved = team ? progress[team.letter] || 0 : 0
  const puzzleIndex = team ? (TEAMS.findIndex((item) => item.letter === team.letter) + solved) % 12 : 0
  const puzzle = PUZZLES[puzzleIndex]
  const path = useMemo(() => {
    if (!team) return []
    const start = TEAMS.findIndex((item) => item.letter === team.letter)
    return Array.from({ length: 12 }, (_, index) => PUZZLES[(start + index) % 12].letter)
  }, [team])

  useEffect(() => {
    localStorage.setItem('trailbound-progress', JSON.stringify(progress))
  }, [progress])

  function chooseTeam(letter) {
    setSelectedLetter(letter)
    setScreen('hunt')
    resetPuzzleState()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetPuzzleState() {
    setAnswer('')
    setOrder([])
    setMessage(null)
    setHintOpen(false)
  }

  function submitAnswer(value = answer) {
    let correct = false
    const normalized = String(value).trim().toLowerCase()

    if (puzzle.type === 'physical') correct = normalized === puzzle.code.toLowerCase()
    if (puzzle.type === 'scramble' || puzzle.type === 'sequence') correct = normalized === puzzle.answer
    if (puzzle.type === 'choice' || puzzle.type === 'compass') correct = normalized === puzzle.answer
    if (puzzle.type === 'order') correct = order.join('') === puzzle.answer

    if (!correct) {
      setMessage({ type: 'error', text: 'Not quite—check the clue and try again.' })
      return
    }

    setMessage({ type: 'success', text: 'Puzzle cracked! Your next stop is ready.' })
  }

  function continueHunt() {
    setProgress((current) => ({ ...current, [team.letter]: Math.min(12, solved + 1) }))
    resetPuzzleState()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetTeam() {
    if (!team || !window.confirm(`Reset all progress for the ${team.name}?`)) return
    setProgress((current) => ({ ...current, [team.letter]: 0 }))
    resetPuzzleState()
  }

  if (screen === 'teams' || !team) {
    return (
      <main className="landing-shell">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Trailbound home">
            <span className="brand-mark">✦</span>
            <span>TRAILBOUND</span>
          </a>
          <span className="event-label">Kickoff Weekend ’26</span>
        </header>

        <section className="hero" id="top">
          <div className="eyebrow"><span></span> The campus treasure hunt</div>
          <h1>Your trail starts <em>here.</em></h1>
          <p>Twelve teams. Twelve puzzles. One legendary prize. Choose your team to begin the hunt.</p>
          <div className="hero-stats" aria-label="Event overview">
            <div><strong>12</strong><span>Teams</span></div>
            <div><strong>12</strong><span>Stops</span></div>
            <div><strong>1</strong><span>Treasure</span></div>
          </div>
        </section>

        <section className="team-section" aria-labelledby="team-heading">
          <div className="section-heading">
            <div>
              <span className="step-label">Step 01</span>
              <h2 id="team-heading">Choose your team</h2>
            </div>
            <p>Your team determines where your route begins. Everyone visits all 12 locations.</p>
          </div>

          <div className="team-grid">
            {TEAMS.map((item) => {
              const teamProgress = progress[item.letter] || 0
              return (
                <button className="team-card" key={item.letter} onClick={() => chooseTeam(item.letter)} style={{ '--team-color': item.color }}>
                  <span className="team-letter">{item.letter}</span>
                  <span className="animal-badge" aria-hidden="true">{item.animal}</span>
                  <span className="team-name">{item.name}</span>
                  <span className="team-status">
                    {teamProgress === 12 ? 'Hunt complete' : teamProgress > 0 ? `${teamProgress} of 12 solved` : `Starts at ${item.letter}`}
                  </span>
                  <span className="card-arrow"><ArrowIcon /></span>
                </button>
              )
            })}
          </div>
        </section>

        <footer>
          <span>✦ Trailbound 2026</span>
          <span>Adventure responsibly. Stay with your team.</span>
        </footer>
      </main>
    )
  }

  const isComplete = solved >= 12
  const percent = Math.round((solved / 12) * 100)

  return (
    <main className="hunt-shell">
      <header className="hunt-header">
        <button className="brand brand-button" onClick={() => setScreen('teams')} aria-label="Return to team selection">
          <span className="brand-mark">✦</span>
          <span>TRAILBOUND</span>
        </button>
        <button className="team-switcher" onClick={() => setScreen('teams')}>
          <span>{team.animal}</span>
          <span><small>Team {team.letter}</small>{team.name}</span>
          <span aria-hidden="true">⌄</span>
        </button>
      </header>

      {isComplete ? (
        <section className="completion-page">
          <div className="confetti" aria-hidden="true">✦</div>
          <span className="completion-kicker">All 12 puzzles solved</span>
          <div className="trophy" aria-hidden="true">🏆</div>
          <h1>You found the<br/><em>final clue!</em></h1>
          <p className="completion-copy">Incredible work, Team {team.name}. One last secret stands between you and the treasure.</p>
          <div className="final-clue-card">
            <span className="clue-number">Final clue</span>
            <p>“Where every new journey begins, look beneath the oldest campus welcome sign.”</p>
            <span className="clue-footnote">Move quickly—and keep this clue within your team.</span>
          </div>
          <button className="secondary-button" onClick={() => setScreen('teams')}>Back to team list</button>
          <button className="text-button" onClick={resetTeam}>Restart this team’s hunt</button>
        </section>
      ) : (
        <>
          <section className="progress-panel">
            <div className="progress-copy">
              <div>
                <span className="step-label">Team {team.letter} · {team.name}</span>
                <h1>Puzzle {solved + 1} <span>of 12</span></h1>
              </div>
              <strong>{percent}%</strong>
            </div>
            <div className="progress-track"><span style={{ width: `${percent}%` }}></span></div>
            <div className="route-track" aria-label={`Your route: ${path.join(', ')}`}>
              {path.map((stop, index) => (
                <div className={`route-stop ${index < solved ? 'done' : ''} ${index === solved ? 'current' : ''}`} key={stop}>
                  <span>{index < solved ? '✓' : stop}</span>
                  {index < path.length - 1 && <i></i>}
                </div>
              ))}
            </div>
          </section>

          <section className="puzzle-stage">
            <div className="location-card">
              <div className="location-pin" aria-hidden="true">⌖</div>
              <div>
                <span className="location-label">Your next location</span>
                <h2>{puzzle.letter} · {puzzle.place}</h2>
                <p>{puzzle.spot}</p>
              </div>
              <span className={`puzzle-type ${puzzle.type === 'physical' ? 'physical' : 'digital'}`}>
                {puzzle.type === 'physical' ? 'Physical clue' : 'Digital puzzle'}
              </span>
            </div>

            <div className="puzzle-card">
              <span className="puzzle-number">Puzzle {String(solved + 1).padStart(2, '0')}</span>
              <h2>{puzzle.type === 'physical' ? 'Find it. Solve it. Enter it.' : 'Crack the digital clue.'}</h2>
              <p className="puzzle-prompt">{puzzle.prompt}</p>

              {puzzle.type === 'physical' && (
                <div className="answer-form">
                  <label htmlFor="code-answer">Enter your code</label>
                  <div className="input-row">
                    <input id="code-answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setMessage(null) }} onKeyDown={(event) => event.key === 'Enter' && submitAnswer()} placeholder="TYPE CODE" autoComplete="off" />
                    <button onClick={() => submitAnswer()} disabled={!answer.trim()}>Check code <ArrowIcon /></button>
                  </div>
                </div>
              )}

              {puzzle.type === 'scramble' && (
                <div className="digital-area">
                  <div className="letter-tiles" aria-label="Scrambled letters">{['T','R','C','E','A','E'].map((letter, index) => <span key={`${letter}${index}`}>{letter}</span>)}</div>
                  <div className="answer-form">
                    <label htmlFor="word-answer">Your answer</label>
                    <div className="input-row">
                      <input id="word-answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setMessage(null) }} placeholder="UNSCRAMBLE THE WORD" autoComplete="off" />
                      <button onClick={() => submitAnswer()} disabled={!answer.trim()}>Submit <ArrowIcon /></button>
                    </div>
                  </div>
                </div>
              )}

              {puzzle.type === 'order' && (
                <div className="digital-area">
                  <div className="order-display">
                    {Array.from({ length: 4 }, (_, index) => <span key={index}>{order[index] ? DISCOVERIES.find((item) => item.id === order[index]).icon : index + 1}</span>)}
                  </div>
                  <div className="choice-grid">
                    {DISCOVERIES.map((item) => <button className={order.includes(item.id) ? 'selected' : ''} key={item.id} onClick={() => { if (!order.includes(item.id)) setOrder((current) => [...current, item.id]); setMessage(null) }} disabled={order.includes(item.id)}><span>{item.icon}</span>{item.label}</button>)}
                  </div>
                  <div className="digital-actions"><button className="reset-order" onClick={() => { setOrder([]); setMessage(null) }}>Reset</button><button className="submit-digital" onClick={() => submitAnswer()} disabled={order.length < 4}>Check order <ArrowIcon /></button></div>
                </div>
              )}

              {(puzzle.type === 'choice' || puzzle.type === 'compass') && (
                <div className="option-list">
                  {puzzle.options.map((option) => {
                    const value = option.toLowerCase().replace('an ', '').replace('a ', '')
                    return <button className={answer === value ? 'selected' : ''} key={option} onClick={() => { setAnswer(value); setMessage(null) }}><span></span>{option}</button>
                  })}
                  <button className="submit-digital" onClick={() => submitAnswer()} disabled={!answer}>Lock in answer <ArrowIcon /></button>
                </div>
              )}

              {puzzle.type === 'sequence' && (
                <div className="digital-area">
                  <div className="number-sequence"><span>1</span><span>2</span><span>3</span><span>5</span><span>8</span><span>13</span><span>21</span><strong>?</strong></div>
                  <div className="sequence-options">{['29', '32', '34', '42'].map((option) => <button className={answer === option ? 'selected' : ''} key={option} onClick={() => { setAnswer(option); setMessage(null) }}>{option}</button>)}</div>
                  <button className="submit-digital" onClick={() => submitAnswer()} disabled={!answer}>Check answer <ArrowIcon /></button>
                </div>
              )}

              {message && (
                <div className={`feedback ${message.type}`} role="status">
                  <span>{message.type === 'success' ? '✓' : '!'}</span>
                  <p>{message.text}</p>
                  {message.type === 'success' && <button onClick={continueHunt}>{solved === 11 ? 'Reveal final clue' : 'Continue to next stop'} <ArrowIcon /></button>}
                </div>
              )}

              <div className="hint-wrap">
                <button className="hint-button" onClick={() => setHintOpen((open) => !open)} aria-expanded={hintOpen}><span>?</span>{hintOpen ? 'Hide hint' : 'Need a hint?'}</button>
                {hintOpen && <p className="hint-text">{puzzle.type === 'physical' ? `Demo mode: use “${puzzle.code}”. Replace this with your event’s real code later.` : puzzle.type === 'order' ? 'Think telescope, electricity, DNA, computer.' : 'Read every word carefully—the answer is right in front of you.'}</p>}
              </div>
            </div>
          </section>

          <section className="safety-note">
            <span aria-hidden="true">☀</span>
            <div><strong>Stay together</strong><p>Every teammate should arrive before you begin a puzzle. Watch for roads and restricted areas.</p></div>
          </section>

          <div className="hunt-footer">
            <button className="text-button" onClick={resetTeam}>Reset team progress</button>
            <button className="text-button" onClick={() => setScreen('teams')}>Switch teams</button>
          </div>
        </>
      )}
    </main>
  )
}

export default App
