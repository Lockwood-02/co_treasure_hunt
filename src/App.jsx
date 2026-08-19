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

const CHECKPOINTS = [
  {
    letter: 'A', location: 'REC',
    riddle: 'Where weights are lifted, hoops are shot, and swimmers race through lanes. Go where Norse come to move and play.',
    type: 'physical', code: '1847',
    prompt: 'Find the weathered blue envelope at the puzzle station. Solve the four-number cipher printed inside.',
  },
  {
    letter: 'B', location: 'Student Union',
    riddle: 'When you want a meal made to order, this is where campus restaurants serve the crowd. Find the building where you can choose your lunch from a counter.',
    type: 'physical', code: 'STACKS',
    prompt: 'Locate the marked clue card at the puzzle station. The letters on it hold your next code.',
  },
  {
    letter: 'C', location: 'Fine Arts Center',
    riddle: 'Music fills the halls, art covers the walls, and performers take the stage. Find the home of NKU’s creative minds.',
    type: 'physical', code: 'SPARK',
    prompt: 'Find the illustrated puzzle sheet. Use the highlighted letters to uncover the code word.',
  },
  {
    letter: 'D', location: 'Baseball Complex',
    riddle: 'A diamond is here, but no jewels are found. Bats crack and runners race the bases. Go where the Norse play baseball.',
    type: 'order', answer: '3142',
    prompt: 'A brass plate reads: “Oldest to newest.” Tap the discoveries in chronological order.',
  },
  {
    letter: 'E', location: 'Griffin Hall',
    riddle: 'Computers, cameras, and big ideas help students create what comes next. Find the home of technology and media.',
    type: 'physical', code: 'ROOTS',
    prompt: 'Find the rubbing sheet in the supply box and reveal the hidden five-letter word.',
  },
  {
    letter: 'F', location: 'Founders Hall',
    riddle: 'Its name honors the people who helped start this university. Find the hall named for those who came first.',
    type: 'scramble', answer: 'CREATE',
    prompt: 'The clue contains six scattered letters. Unscramble them to name what artists do.',
  },
  {
    letter: 'G', location: 'Library',
    riddle: 'Thousands of stories sit silently on shelves, waiting for someone to open them. Find the place where students read, research, and study.',
    type: 'physical', code: 'VICTORY',
    prompt: 'Count the pennants pictured on the puzzle sheet, then use its key to decode the winning word.',
  },
  {
    letter: 'H', location: 'Tennis Complex',
    riddle: 'No courtrooms are here—only courts with nets. Rackets swing and yellow balls fly. Find the place where the Norse play tennis.',
    type: 'choice', answer: 'echo', options: ['A shadow', 'An echo', 'A bell'],
    prompt: 'I speak without a mouth and answer without being asked. What am I?',
  },
  {
    letter: 'I', location: 'University Center',
    riddle: 'At the edge of the plaza, this building helps students find their way. Look for the place with the bookstore, support offices, and a bright atrium.',
    type: 'physical', code: 'FEAST',
    prompt: 'Match the menu symbols on the table card. Read the circled letters from left to right.',
  },
  {
    letter: 'J', location: 'Softball Complex',
    riddle: 'This diamond has bats, gloves, and bases too, but a larger ball takes the field. Find where the Norse play softball.',
    type: 'sequence', answer: '34',
    prompt: 'Complete the sequence: 1, 2, 3, 5, 8, 13, 21, __',
  },
  {
    letter: 'K', location: 'Regents Hall',
    riddle: 'Volleyballs fly over the net and basketball teams practice their plays. Find the hall where athletes and events gather.',
    type: 'physical', code: 'LEGACY',
    prompt: 'Arrange the photo cards from oldest to newest. Flip them over to reveal the code.',
  },
  {
    letter: 'L', location: 'New Residence Hall',
    riddle: 'Five floors of suites give students a place to study, relax, and call home. Find the newest home in Booth Residential Village.',
    type: 'compass', answer: 'east', options: ['North', 'East', 'South', 'West'],
    prompt: 'The final marker is opposite the setting sun. Which direction is it?',
  },
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
    return { ...INITIAL_PROGRESS, ...JSON.parse(localStorage.getItem('trailbound-progress-v3') || '{}') }
  } catch {
    return INITIAL_PROGRESS
  }
}

function normalize(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, '')
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
  const checkpointIndex = team ? (TEAMS.findIndex((item) => item.letter === team.letter) + solved) % CHECKPOINTS.length : 0
  const checkpoint = CHECKPOINTS[checkpointIndex]
  const path = useMemo(() => {
    if (!team) return []
    const start = TEAMS.findIndex((item) => item.letter === team.letter)
    return Array.from({ length: CHECKPOINTS.length }, (_, index) => CHECKPOINTS[(start + index) % CHECKPOINTS.length].letter)
  }, [team])

  useEffect(() => {
    localStorage.setItem('trailbound-progress-v3', JSON.stringify(progress))
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
    const expected = checkpoint.code ?? checkpoint.answer
    const correct = checkpoint.type === 'order'
      ? order.join('') === checkpoint.answer
      : normalize(value) === normalize(expected)

    if (!correct) {
      setMessage({ type: 'error', text: 'Not quite—check the puzzle and try again.' })
      return
    }

    setMessage({
      type: 'success',
      text: solved === 11 ? 'Final puzzle solved! The treasure clue is ready.' : 'Puzzle solved! Your next location clue is ready.',
    })
  }

  function continueHunt() {
    setProgress((current) => ({ ...current, [team.letter]: Math.min(CHECKPOINTS.length, solved + 1) }))
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
          <p>Twelve teams. Twelve hidden destinations. Follow each riddle, solve every puzzle, and uncover the treasure.</p>
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
            <p>Your team determines which location riddle appears first. Every team completes all 12 checkpoints.</p>
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
                    {teamProgress === 12 ? 'Hunt complete' : teamProgress > 0 ? `${teamProgress} of 12 solved` : 'Trail not started'}
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

  const isComplete = solved >= CHECKPOINTS.length
  const percent = Math.round((solved / CHECKPOINTS.length) * 100)

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
            <div className="route-track" aria-label={`Your route has ${solved} of 12 puzzles complete`}>
              {path.map((stop, index) => (
                <div className={`route-stop ${index < solved ? 'done' : ''} ${index === solved ? 'current' : ''}`} key={stop}>
                  <span>{index < solved ? '✓' : index + 1}</span>
                  {index < path.length - 1 && <i></i>}
                </div>
              ))}
            </div>
          </section>

          <section className="puzzle-stage">
            <div className="travel-clue-card">
              <div className="travel-clue-heading">
                <div className="location-pin" aria-hidden="true">⌖</div>
                <div>
                  <span className="location-label">Your location clue</span>
                  <h2>Find the next puzzle station</h2>
                </div>
                <span className="puzzle-type digital">No answer needed</span>
              </div>
              <blockquote className="riddle-copy">“{checkpoint.riddle}”</blockquote>
              <p className="travel-instruction"><span aria-hidden="true">→</span> Figure out the location, travel there together, and use what you find to solve the puzzle below.</p>
            </div>

            <div className="puzzle-card">
              <span className="puzzle-number">Puzzle {String(solved + 1).padStart(2, '0')}</span>
              <h2>{checkpoint.type === 'physical' ? 'Find it. Solve it. Enter it.' : 'Crack the puzzle.'}</h2>
              <p className="puzzle-prompt">{checkpoint.prompt}</p>

              {checkpoint.type === 'physical' && (
                <div className="answer-form">
                  <label htmlFor="code-answer">Enter your code</label>
                  <div className="input-row">
                    <input id="code-answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setMessage(null) }} onKeyDown={(event) => event.key === 'Enter' && submitAnswer()} placeholder="TYPE CODE" autoComplete="off" />
                    <button onClick={() => submitAnswer()} disabled={!answer.trim()}>Check code <ArrowIcon /></button>
                  </div>
                </div>
              )}

              {checkpoint.type === 'scramble' && (
                <div className="digital-area">
                  <div className="letter-tiles" aria-label="Scrambled letters">{['T', 'R', 'C', 'E', 'A', 'E'].map((letter, index) => <span key={`${letter}${index}`}>{letter}</span>)}</div>
                  <div className="answer-form">
                    <label htmlFor="word-answer">Your answer</label>
                    <div className="input-row">
                      <input id="word-answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setMessage(null) }} onKeyDown={(event) => event.key === 'Enter' && submitAnswer()} placeholder="UNSCRAMBLE THE WORD" autoComplete="off" />
                      <button onClick={() => submitAnswer()} disabled={!answer.trim()}>Submit <ArrowIcon /></button>
                    </div>
                  </div>
                </div>
              )}

              {checkpoint.type === 'order' && (
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

              {(checkpoint.type === 'choice' || checkpoint.type === 'compass') && (
                <div className="option-list">
                  {checkpoint.options.map((option) => {
                    const value = option.toLowerCase().replace('an ', '').replace('a ', '')
                    return <button className={answer === value ? 'selected' : ''} key={option} onClick={() => { setAnswer(value); setMessage(null) }}><span></span>{option}</button>
                  })}
                  <button className="submit-digital" onClick={() => submitAnswer()} disabled={!answer}>Lock in answer <ArrowIcon /></button>
                </div>
              )}

              {checkpoint.type === 'sequence' && (
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
                  {message.type === 'success' && <button onClick={continueHunt}>{solved === 11 ? 'Reveal final clue' : 'Reveal next location clue'} <ArrowIcon /></button>}
                </div>
              )}

              <div className="hint-wrap">
                <button className="hint-button" onClick={() => setHintOpen((open) => !open)} aria-expanded={hintOpen}><span>?</span>{hintOpen ? 'Hide puzzle hint' : 'Need a puzzle hint?'}</button>
                {hintOpen && (
                  <p className="hint-text">
                    {checkpoint.type === 'physical' && <>Temporary test code: <strong>{checkpoint.code}</strong>. Replace this when the physical puzzle is finalized.</>}
                    {checkpoint.type === 'order' && 'Think telescope, electricity, computer, DNA.'}
                    {checkpoint.type === 'scramble' && 'The answer is a six-letter word for making something new.'}
                    {checkpoint.type === 'choice' && 'Think about a sound that repeats what it hears.'}
                    {checkpoint.type === 'sequence' && 'Each number is the sum of the two numbers before it.'}
                    {checkpoint.type === 'compass' && 'The sun sets in the west. What direction is opposite west?'}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="safety-note">
            <span aria-hidden="true">☀</span>
            <div><strong>Stay together</strong><p>Every teammate should arrive before beginning the puzzle. Watch for roads and restricted areas.</p></div>
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
