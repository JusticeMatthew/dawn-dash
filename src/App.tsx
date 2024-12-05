import { useState } from 'react'

import './App.scss'

import ButtonRow from './components/ButtonRow'
import Chart from './components/Chart'
import ChartControls from './components/ChartControls'
import GradientLink from './components/GradientLink'
import OpenSourceInfo from './components/OpenSourceInfo'
import { useChartControlState } from './hooks/useChartControlState'
import { useUrlParams } from './hooks/useUrlParams'
import { SpeedRunClass } from './types/speedRun'

function App(): JSX.Element {
  const [selectedClass, setSelectedClass] = useState<SpeedRunClass>(SpeedRunClass.Arcanist)
  const controls = useChartControlState(selectedClass)

  useUrlParams(selectedClass, setSelectedClass, controls)

  return (
    <div className="App">
      <div className="header">
        <img
          src="https://blightbane.io/images/icons/cardart_4_53.webp"
          alt="Dawncaster Logo"
          className="app-logo"
        />
        <div className="title-container">
          <h1 className="app-title">Dawn-Dash</h1>
          <h2 className="app-subtitle">Dawncaster speedrun charts</h2>
        </div>
      </div>

      <div className="content">
        <ButtonRow onClassSelect={setSelectedClass} selectedClass={selectedClass} />
        <ChartControls controls={controls} selectedClass={selectedClass} />
        <Chart controls={controls} selectedClass={selectedClass} />
      </div>

      <footer className="footer">
        <div className="footer-credits">
          Artwork and game data ©{' '}
          <GradientLink text="Dawncaster" url="https://dawncaster.wanderlost.games/" /> the game,{' '}
          <GradientLink text="Wanderlost" url="https://wanderlost.games/" />, and{' '}
          <GradientLink text="Blightbane" url="https://blightbane.io/" />
        </div>
        <OpenSourceInfo />
        <br />
        <br />
        {`Referrer: ${document.referrer}`}
        <br />
        {`Width: ${window.innerWidth}`}
        <br />
        {`Height: ${window.innerHeight}`}
      </footer>
    </div>
  )
}

export default App
