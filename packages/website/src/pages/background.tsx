import React, { useCallback, useEffect, useState } from 'react'

export default function Background (): JSX.Element {
  const [shift, setShift] = useState([0, 0])
  const [timeShift, setTimeShift] = useState([0, 0])
  const [scrollTop, setScrollTop] = useState(0)

  const window = globalThis?.window
  const document = globalThis?.document

  const onMouseMove = useCallback((e: MouseEvent): void => {
    setShift([e.pageX - window?.innerWidth / 2, e.screenY - window?.innerHeight / 2])
  }, [])

  const onScroll = useCallback((): void => {
    setScrollTop(document?.documentElement.scrollTop)
  }, [])

  useEffect(() => {
    window?.addEventListener('mousemove', onMouseMove)
    document?.addEventListener('scroll', onScroll)

    const intervalId = setInterval(() => {
      const time = Date.now()
      setTimeShift([
        0.5 * Math.sin(time / 10000) * Math.cos(time / 5500) * window?.innerWidth,
        0.5 * Math.cos(time / 10000) * Math.sin(time / 6000) * window?.innerHeight,
      ])
    }, 15)
    return () => {
      window?.removeEventListener('mousemove', onMouseMove)
      document?.removeEventListener('scroll', onScroll)

      clearInterval(intervalId)
    }
  }, [])

  const dx = timeShift[0] / 2 + shift[0] / 2
  const dy = timeShift[1] / 2 + (shift[1]) / 2 - scrollTop

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 2436 1125"
      preserveAspectRatio="xMidYMid slice"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlSpace="preserve"
      style={{
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        strokeLinejoin: 'round',
        strokeMiterlimit: 2,
      }}
    >
      <rect x="0" y="0" width="2436" height="1125" style={{ fill: 'rgb(218,197,187)' }}/>
      <g transform={`rotate(${(dx + dy) / 300} ${window?.innerWidth / 2 || 0} ${window?.innerHeight / 2 || 0})`}>
        <g transform="matrix(0.251313,-0.0632911,0.108076,0.429143,625.985,411.389)">
          <rect x={430 + dx / 5} y={866 + dy / 5} width="788" height="77" style={{ fill: 'rgb(255,214,81)' }}/>
        </g>
        <g transform="matrix(0.222534,-0.0560433,0.0992659,0.39416,607.713,481.662)">
          <rect x={430 - dx / 5} y={866 + dy / 5} width="788" height="77" style={{ fill: 'rgb(142,141,149)' }}/>
        </g>
        <g transform="matrix(0.116912,-0.277302,0.204417,0.0861831,545.703,1055.12)">
          <rect x={430 - dx / 5} y={866 + dy / 5} width="788" height="77" style={{ fill: 'rgb(226,32,58)' }}/>
        </g>
        <g transform="matrix(1.03374,0,0,1.03374,578.127,12.5196)">
          <circle cx={400.25 + dx / 5} cy={702.75 - dy / 5} r={140.25 + dy / 10} style={{ fill: 'rgb(23,19,41)' }}/>
        </g>
        <g transform="matrix(0.322661,-0.0812596,0.210244,0.834827,736.738,-458.268)">
          <rect x={430 + dx / 5} y={866 - dy / 5} width="788" height="77" style={{ fill: 'rgb(23,19,41)' }}/>
        </g>
        <g transform="matrix(0.322661,-0.0812596,0.210244,0.834827,424.271,-147.048)">
          <rect x={430 + dx / 5} y={866 + dy / 5} width="788" height="77" style={{ fill: 'rgb(23,19,41)' }}/>
        </g>
        <g transform="matrix(0.470215,-0.11842,0.0366999,0.145726,1043.67,502.815)">
          <rect x={430 - dx / 5} y={866 + dy / 5} width="788" height="77" style={{ fill: 'rgb(226,32,58)' }}/>
        </g>
        <g transform="matrix(0.513012,-0.0833088,0.0256167,0.157746,1294.55,306.253)">
          <rect x={430 + dx / 5} y={866 - dy / 5} width="788" height="77" style={{ fill: 'rgb(226,32,58)' }}/>
        </g>
        <g transform="matrix(1.07501,-0.270732,0.0417494,0.165776,757.59,520.183)">
          <rect x={430 - dx / 5} y={866 - dy / 5} width="788" height="77" style={{ fill: 'rgb(23,19,41)' }}/>
        </g>
        <g transform="matrix(0.264764,0.964313,-0.964313,0.264764,953.308,-1294.58)">
          <path
            transform={`rotate(${(dx + dy) / 300})`}
            // transform={`translate(${-dx / 35}, ${-dy / 30})`}
            d="M1771.16,15.199C1730.01,-53.294 1677.18,-114.058 1615.08,-164.345L1567.78,-105.926C1623.06,-61.158 1670.09,-7.062 1706.73,53.915L1771.16,15.199Z"
            style={{ fill: 'rgb(69,128,192)' }}
          />
        </g>
        <g transform="matrix(0.264764,0.964313,-0.964313,0.264764,929.239,-1307.99)">
          <path
            // transform={`rotate(-${(dx + dy) / 300})`}
            transform={`translate(${-dx / 35}, ${+dy / 30})`}
            d="M1738.18,-34.633C1686.48,-105.781 1621.58,-166.31 1547,-212.913L1507.16,-149.165C1573.56,-107.676 1631.34,-53.789 1677.36,9.551L1738.18,-34.633Z"
            style={{ fill: 'rgb(190,178,139)' }}
          />
        </g>
        <g transform="matrix(0.264764,0.964313,-0.964313,0.264764,887.925,-1329.66)">
          <path
            // transform={`rotate(${(dx + dy) / 200})`}
            transform={`translate(${dx / 35}, ${-dy / 30})`}
            d="M1869,368C1869,178.026 1790.11,-3.416 1651.17,-132.977L1599.9,-78.001C1723.59,37.343 1793.83,198.874 1793.83,368L1869,368Z"
            style={{ fill: 'rgb(226,32,58)' }}
          />
        </g>
        <g transform="matrix(0.592886,-0.148567,0.206842,0.128437,575.54,735.738)">
          <rect x={810 - dx / 5} y={354 - dy / 5} width={477 + dy / 5} height={477 + dy / 5} style={{ fill: 'rgb(190,178,139)' }}/>
        </g>
        <g transform="matrix(0.901886,-0.225997,0.225997,0.901886,45.3694,186.384)">
          <rect x={810 - dx / 5} y={354 - dy / 5} width={477 - dy / 4} height={477 - dy / 4} style={{ fill: 'rgb(69,128,192)' }}/>
        </g>
        <g transform="matrix(0.918438,-0.231301,0.339428,1.34778,-304.873,-400.661)">
          <rect x={430 - dx / 2} y={866 - dy / 2} width="788" height="77" style={{ fill: 'rgb(226,32,58)' }}/>
        </g>
        <g transform="matrix(-0.411462,-0.382888,0.70964,-0.25844,1485.61,929.546)">
          <rect x={430 - dx / 5} y={866 - dy / 5} width="788" height="77" style={{ fill: 'rgb(255,214,81)' }}/>
        </g>
        <path style={{
          transformBox: 'fill-box',
          transformOrigin: 'center',
          fill: 'rgb(226,32,58)',
        }}
        transform={`rotate(${(dx + dy) / 100}) translate(${dx / 15}, ${-dy / 10})`}
        d="M1503,730L1599,895L1977.88,661L1503,730Z"
        />
      </g>
    </svg>
  )
}


