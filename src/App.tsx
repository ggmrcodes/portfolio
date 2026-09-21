import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Experience } from './components/Experience'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Projects } from './components/Projects'
import { Terminal } from './components/Terminal'
import { useBoring } from './hooks/useBoring'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, toggle } = useTheme()
  const { boring, toggle: toggleBoring } = useBoring()
  const [terminalOpen, setTerminalOpen] = useState(false)

  // Backtick opens the terminal from anywhere except inside a text field
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'
      if (e.key === '`' && !typing && !boring) {
        e.preventDefault()
        setTerminalOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [boring])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav
        theme={theme}
        boring={boring}
        onToggleTheme={toggle}
        onToggleBoring={toggleBoring}
        onOpenTerminal={() => setTerminalOpen(true)}
      />
      <main id="main">
        <Hero boring={boring} onOpenTerminal={() => setTerminalOpen(true)} />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <Terminal
        open={terminalOpen && !boring}
        onClose={() => setTerminalOpen(false)}
        onToggleTheme={toggle}
        onToggleBoring={toggleBoring}
      />
    </>
  )
}
