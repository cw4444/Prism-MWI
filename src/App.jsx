import { useState, useEffect } from 'react'
import { generateTimelines } from './api'
import './App.css'

// Auto-detect API keys from environment variables (set at build time by Vite)
const ENV_ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
const ENV_OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

const LOADING_MESSAGES = [
  'Scanning parallel branches...',
  'Isolating divergence points...',
  'Reconstructing alternate histories...',
  'Calibrating timeline coherence...',
  'Resolving quantum superpositions...',
]

const STORAGE_KEY = 'prism-history'
const SETTINGS_KEY = 'prism-settings'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch { return {} }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function App() {
  const [entry, setEntry] = useState('')
  const [provider, setProvider] = useState(() => loadSettings().provider || (ENV_OPENAI_KEY && !ENV_ANTHROPIC_KEY ? 'openai' : 'anthropic'))
  const [apiKey, setApiKey] = useState(() => loadSettings().apiKey || ENV_ANTHROPIC_KEY || ENV_OPENAI_KEY || '')
  const [model, setModel] = useState(() => loadSettings().model || '')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [error, setError] = useState(null)
  const [timelines, setTimelines] = useState(null)
  const [currentEntry, setCurrentEntry] = useState(null)
  const [history, setHistory] = useState(loadHistory)
  const [showHistory, setShowHistory] = useState(false)

  // Persist settings
  useEffect(() => {
    saveSettings({ provider, apiKey, model })
  }, [provider, apiKey, model])

  // Cycle loading messages
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingMsg(i => (i + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [loading])

  const modelOptions = provider === 'anthropic'
    ? [
        { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
        { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
        { value: 'claude-haiku-4-20250514', label: 'Claude Haiku 4' },
      ]
    : [
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      ]

  const defaultModel = modelOptions[0].value

  async function handleActivate() {
    if (!entry.trim() || !apiKey.trim()) return

    setLoading(true)
    setError(null)
    setTimelines(null)
    setLoadingMsg(0)
    setCurrentEntry(entry.trim())

    try {
      const result = await generateTimelines(entry.trim(), {
        provider,
        apiKey,
        model: model || defaultModel,
      })
      setTimelines(result)

      // Save to history
      const record = {
        id: Date.now(),
        date: new Date().toISOString(),
        entry: entry.trim(),
        timelines: result,
      }
      const updated = [record, ...history].slice(0, 50)
      setHistory(updated)
      saveHistory(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function loadFromHistory(record) {
    setCurrentEntry(record.entry)
    setTimelines(record.timelines)
    setEntry(record.entry)
    setShowHistory(false)
    setError(null)
  }

  function handleReset() {
    setTimelines(null)
    setCurrentEntry(null)
    setError(null)
    setEntry('')
  }

  return (
    <>
      <header className="prism-header">
        <h1>Prism</h1>
        <p>alternate timeline explorer</p>
      </header>

      {/* Settings */}
      <div className="settings-bar">
        <div className="setting-group">
          <label>Provider</label>
          <select value={provider} onChange={e => { setProvider(e.target.value); setModel(''); }}>
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
        <div className="setting-group">
          <label>Model</label>
          <select value={model || defaultModel} onChange={e => setModel(e.target.value)}>
            {modelOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="setting-group key-group">
          <label>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
          />
        </div>
      </div>

      {/* Diary Input */}
      {!timelines && !loading && (
        <div className="diary-section">
          <div className="diary-input-wrapper">
            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="Write about something that happened today. A decision you made, a conversation, a moment that felt important. The Prism will show you how it could have gone differently..."
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleActivate()
              }}
            />
            <div className="diary-footer">
              <span className="char-count">{entry.length} chars</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {history.length > 0 && (
                  <button
                    className="activate-btn"
                    style={{ opacity: 0.5, fontSize: '11px', padding: '8px 16px' }}
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    History ({history.length})
                  </button>
                )}
                <button
                  className="activate-btn"
                  onClick={handleActivate}
                  disabled={!entry.trim() || !apiKey.trim()}
                >
                  Activate Prism
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="prism-spinner" />
          <p>Peering into parallel timelines...</p>
          <div className="loading-messages">
            <p key={loadingMsg}>{LOADING_MESSAGES[loadingMsg]}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-msg">
          {error}
        </div>
      )}

      {/* Timeline Results */}
      {timelines && (
        <div className="timelines-container">
          <div className="timelines-header">
            <h2>Observed Timelines</h2>
            <button className="activate-btn" onClick={handleReset} style={{ fontSize: '11px', padding: '8px 16px' }}>
              New Entry
            </button>
          </div>

          <div className="original-entry">
            <div className="entry-label">Your Timeline &mdash; Prime</div>
            <div className="entry-text">{currentEntry}</div>
          </div>

          {timelines.map((t, i) => (
            <div className="timeline-card" key={t.timeline_id || i}>
              <div className="timeline-card-header">
                <span className="timeline-id">{t.timeline_id}</span>
                <div className="timeline-meta">
                  <span className="timeline-mood">{t.mood}</span>
                  <div className="divergence-meter">
                    <div className="divergence-bar">
                      <div
                        className="divergence-fill"
                        style={{ width: `${(t.divergence || 0) * 100}%` }}
                      />
                    </div>
                    <span className="divergence-label">{((t.divergence || 0) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div className="branch-point">{t.branch_point}</div>
              <div className="timeline-entry">{t.entry}</div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {showHistory && history.length > 0 && (
        <div className="past-entries">
          <h2>Past Prism Sessions</h2>
          {history.map(record => (
            <div
              key={record.id}
              className="past-entry-item"
              onClick={() => loadFromHistory(record)}
            >
              <div className="past-entry-preview">{record.entry}</div>
              <div className="past-entry-date">
                {new Date(record.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="prism-footer">
        <p>Inspired by Ted Chiang's "Anxiety Is the Dizziness of Freedom"</p>
      </footer>
    </>
  )
}

export default App
