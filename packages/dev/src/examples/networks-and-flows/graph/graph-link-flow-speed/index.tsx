import React, { useCallback, useEffect, useState } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphLayoutType } from '@unovis/ts'

export const title = 'Graph: Link Flow Speed'
export const subTitle = 'Testing smooth speed transitions'

type NodeDatum = { id: string; label: string }
type LinkDatum = { id: string; source: string; target: string; speed: number }

export const component = (): React.ReactNode => {
  const [showFlow, setShowFlow] = useState(true)
  const [autoChange, setAutoChange] = useState(false)

  // Simple node data
  const nodes: NodeDatum[] = [
    { id: '0', label: 'A' },
    { id: '1', label: 'B' },
    { id: '2', label: 'C' },
    { id: '3', label: 'D' },
    { id: '4', label: 'E' },
  ]

  // Link data with initial speeds
  const [links, setLinks] = useState<LinkDatum[]>([
    { id: '0-1', source: '0', target: '1', speed: 20 },
    { id: '0-2', source: '0', target: '2', speed: 30 },
    { id: '1-3', source: '1', target: '3', speed: 15 },
    { id: '2-4', source: '2', target: '4', speed: 25 },
    { id: '3-4', source: '3', target: '4', speed: 10 },
  ])

  // Auto-change speeds every 2 seconds
  useEffect(() => {
    if (!autoChange) return

    const interval = setInterval(() => {
      setLinks(currentLinks =>
        currentLinks.map(link => ({
          ...link,
          speed: 10 + Math.random() * 40, // Random speed between 10-50
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [autoChange])

  // Manual speed change handlers
  const randomizeSpeeds = useCallback(() => {
    setLinks(currentLinks =>
      currentLinks.map(link => ({
        ...link,
        speed: 10 + Math.random() * 40,
      }))
    )
  }, [])

  const setAllSpeedsSlow = useCallback(() => {
    setLinks(currentLinks =>
      currentLinks.map(link => ({ ...link, speed: 5 }))
    )
  }, [])

  const setAllSpeedsFast = useCallback(() => {
    setLinks(currentLinks =>
      currentLinks.map(link => ({ ...link, speed: 50 }))
    )
  }, [])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <VisSingleContainer
        data={{ nodes, links }}
        style={{ flex: 1 }}
      >
        <VisGraph<NodeDatum, LinkDatum>
          layoutType={GraphLayoutType.Elk}
          nodeLabel={d => d.label}
          nodeSize={40}
          linkFlow={showFlow}
          linkFlowParticleSpeed={d => showFlow ? d.speed : undefined}
          linkFlowParticleSize={3}
          linkWidth={2}
        />
      </VisSingleContainer>

      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #ddd',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={showFlow}
            onChange={(e) => setShowFlow(e.target.checked)}
          />
          Show Flow
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={autoChange}
            onChange={(e) => setAutoChange(e.target.checked)}
          />
          Auto-change speeds (every 2s)
        </label>

        <button onClick={randomizeSpeeds}>
          Randomize Speeds
        </button>

        <button onClick={setAllSpeedsSlow}>
          All Slow (5px/s)
        </button>

        <button onClick={setAllSpeedsFast}>
          All Fast (50px/s)
        </button>

        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
          {showFlow && (
            <span>
              Current speeds: {links.map(l => `${Math.round(l.speed)}`).join(', ')} px/s
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
