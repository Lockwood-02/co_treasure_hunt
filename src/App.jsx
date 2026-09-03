import { useEffect, useMemo, useState } from 'react'
import './App.css'

const TEAMS = [
  { letter: 'A', name: 'Sharks', animal: '🦈', color: '#3689A6' },
  { letter: 'B', name: 'Eagles', animal: '🦅', color: '#9B7151' },
  { letter: 'C', name: 'Wolves', animal: '🐺', color: '#6D7A80' },
  { letter: 'D', name: 'Bears', animal: '🐻', color: '#B76B3E' },
  { letter: 'E', name: 'Foxes', animal: '🦊', color: '#D7653D' },
  { letter: 'F', name: 'Gators', animal: '🐊', color: '#6F963C' },
  { letter: 'G', name: 'Lions', animal: '🦁', color: '#C97834' },
  { letter: 'H', name: 'Tigers', animal: '🐯', color: '#D09234' },
]

const CHECKPOINTS = [
  {
    letter: 'A',
    riddle: `Where weights are lifted, hoops are shot,
and swimmers race through lanes.
Go where Norse come to move and play.`,
    answer: 'exercise',
  },
  {
    letter: 'B',
    riddle: `A diamond is here, but no jewels are found.
Bats crack and runners race the bases.
Go where the Norse play baseball.`,
    answer: 'doubleplay',
  },
  {
    letter: 'C',
    riddle: `When you want a meal made to order,
this is where campus restaurants serve the crowd.
Find the building where you can choose your lunch from a counter.`,
    answer: '28',
  },
  {
    letter: 'D',
    riddle: `Music fills the halls, art covers the walls,
and performers take the stage.
Find the home of NKU’s creative minds.`,
    answer: 'creative',
  },
  {
    letter: 'E',
    riddle: `Computers, cameras, and big ideas
help students create what comes next.
Find the home of technology and media.`,
    answer: 'keyboard',
  },
  {
    letter: 'F',
    riddle: `No courtrooms are here—only courts with nets.
Rackets swing and yellow balls fly.
Find the place where the Norse play tennis.`,
    answer: '859',
  },
  {
    letter: 'G',
    riddle: `At the edge of the plaza,
this building helps students find their way.
Look for the place with the bookstore, support offices, and a campus store.`,
    answer: '1968',
  },
  {
    letter: 'H',
    riddle: `I’m not a building, but I’m right on campus.
I’m surrounded by paths, trees, and open space.
Water sits at my center, where you can stop and take in the view.
Find this campus landmark where the Norse meet the lake.`,
    answer: 'norse',
  },
]

const INITIAL_PROGRESS = Object.fromEntries(TEAMS.map((team) => [team.letter, 0]))
const PROGRESS_KEY = 'trailbound-progress-v4'

function loadProgress() {
  try {
    return { ...INITIAL_PROGRESS, ...JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') }
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
  const [message, setMessage] = useState(null)

  const team = TEAMS.find((item) => item.letter === selectedLetter)
  const solved = team ? progress[team.letter] || 0 : 0
  const teamStartIndex = team ? TEAMS.findIndex((item) => item.letter === team.letter) : 0
  const checkpointIndex = (teamStartIndex + solved) % CHECKPOINTS.length
  const checkpoint = CHECKPOINTS[checkpointIndex]
  const path = useMemo(() => {
    if (!team) return []
    const start = TEAMS.findIndex((item) => item.letter === team.letter)
    return Array.from({ length: CHECKPOINTS.length }, (_, index) => CHECKPOINTS[(start + index) % CHECKPOINTS.length].letter)
  }, [team])

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  }, [progress])

  function chooseTeam(letter) {
    setSelectedLetter(letter)
    setScreen('hunt')
    resetPuzzleState()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetPuzzleState() {
    setAnswer('')
    setMessage(null)
  }

  function submitAnswer() {
    if (normalize(answer) !== normalize(checkpoint.answer)) {
      setMessage({ type: 'error', text: 'Not quite—check the physical puzzle and try again.' })
      return
    }

    setMessage({
      type: 'success',
      text: solved === CHECKPOINTS.length - 1
        ? 'Final puzzle solved! The treasure clue is ready.'
        : 'Puzzle solved! Your next location clue is ready.',
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
          <p>Eight teams. Eight hidden destinations. Follow each clue, solve every physical puzzle, and uncover the treasure.</p>
          <div className="hero-stats" aria-label="Event overview">
            <div><strong>8</strong><span>Teams</span></div>
            <div><strong>8</strong><span>Stops</span></div>
            <div><strong>1</strong><span>Treasure</span></div>
          </div>
        </section>

        <section className="team-section" aria-labelledby="team-heading">
          <div className="section-heading">
            <div>
              <span className="step-label">Step 01</span>
              <h2 id="team-heading">Choose your team</h2>
            </div>
            <p>Your team determines which location clue appears first. Every team completes all eight checkpoints.</p>
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
                    {teamProgress === CHECKPOINTS.length
                      ? 'Hunt complete'
                      : teamProgress > 0
                        ? `${teamProgress} of ${CHECKPOINTS.length} solved`
                        : 'Trail not started'}
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
          <span className="completion-kicker">All 8 puzzles solved</span>
          <div className="trophy" aria-hidden="true">🏆</div>
          <h1>You found the<br/><em>final clue!</em></h1>
          <p className="completion-copy">Eight locations conquered. One final task remains.</p>
          <div className="final-clue-card">
            <span className="clue-number">Final clue</span>
            <p>Go back to the beginning, but don’t look for a sign.<br/>Look for the person who gave you the rules and sent you on your way.<br/>Find the person wearing a hard hat and tell them:</p>
            <strong className="final-phrase">“The Norse have returned.”</strong>
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
                <h1>Puzzle {solved + 1} <span>of {CHECKPOINTS.length}</span></h1>
              </div>
              <strong>{percent}%</strong>
            </div>
            <div className="progress-track"><span style={{ width: `${percent}%` }}></span></div>
            <div className="route-track" aria-label={`Your route has ${solved} of ${CHECKPOINTS.length} puzzles complete`}>
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
              <blockquote className="riddle-copy">{checkpoint.riddle}</blockquote>
              <p className="travel-instruction"><span aria-hidden="true">→</span> Figure out the location, travel there together, and use what you find to solve the physical puzzle.</p>
            </div>

            <div className="puzzle-card">
              <span className="puzzle-number">Puzzle {String(solved + 1).padStart(2, '0')}</span>
              <h2>Find it. Solve it. Submit it.</h2>
              <div className="answer-form">
                <label htmlFor="puzzle-answer">Locate the physical puzzle, and submit your answer here.</label>
                <div className="input-row">
                  <input
                    id="puzzle-answer"
                    value={answer}
                    onChange={(event) => { setAnswer(event.target.value); setMessage(null) }}
                    onKeyDown={(event) => event.key === 'Enter' && answer.trim() && submitAnswer()}
                    placeholder="ENTER YOUR ANSWER"
                    autoComplete="off"
                  />
                  <button onClick={submitAnswer} disabled={!answer.trim()}>Submit answer <ArrowIcon /></button>
                </div>
              </div>

              {message && (
                <div className={`feedback ${message.type}`} role="status">
                  <span>{message.type === 'success' ? '✓' : '!'}</span>
                  <p>{message.text}</p>
                  {message.type === 'success' && (
                    <button onClick={continueHunt}>
                      {solved === CHECKPOINTS.length - 1 ? 'Reveal final clue' : 'Reveal next location clue'} <ArrowIcon />
                    </button>
                  )}
                </div>
              )}
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
