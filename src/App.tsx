import { useState } from 'react'

import './App.scss'

import Chart from './components/Chart'
import ChartControls from './components/ChartControls'
import ClassButtons from './components/ClassButtons'
import GradientLink from './components/GradientLink'
import HeaderInfo from './components/HeaderInfo'
import BlightbaneModal from './components/Modal/BlightbaneModal'
import OpenSourceInfo from './components/OpenSourceInfo'
import ViewModeInfo from './components/ViewModeInfo'
import { useChartControlState } from './hooks/useChartControlState'
import { useUrlParams } from './hooks/useUrlParams'
import { SpeedRunClass } from './types/speedRun'

function App(): JSX.Element {
  const [selectedClass, setSelectedClass] = useState<SpeedRunClass>(SpeedRunClass.Arcanist)
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | undefined>()

  const controls = useChartControlState(selectedClass)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handlePlayerClick = (player: string, timestamp: number) => {
    setSelectedPlayer(player)
    setSelectedTimestamp(timestamp)
    setIsModalOpen(true)
  }

  const openInBlightbane = () => {
    window.open(`https://blightbane.io/deck/${selectedTimestamp}`, '_blank')
    setIsModalOpen(false)
  }

  useUrlParams(selectedClass, setSelectedClass, controls)

  return (
    <div className="App">
      <BlightbaneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={openInBlightbane}
        player={selectedPlayer}
        playerClass={selectedClass}
      />

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
        <HeaderInfo />
      </div>

      <div className="content">
        <ClassButtons onClassSelect={setSelectedClass} selectedClass={selectedClass} />
        <ChartControls controls={controls} selectedClass={selectedClass} />
        <ViewModeInfo viewMode={controls.viewMode} />
        <Chart
          controls={controls}
          selectedClass={selectedClass}
          onPlayerClick={handlePlayerClick}
        />
      </div>

      <footer className="footer">
        <div className="footer-credits">
          Artwork and game data ©{' '}
          <GradientLink text="Dawncaster" url="https://dawncaster.wanderlost.games/" /> the game,{' '}
          <GradientLink text="Wanderlost" url="https://wanderlost.games/" />, and{' '}
          <GradientLink text="Blightbane" url="https://blightbane.io/" />
        </div>
        <OpenSourceInfo />
      </footer>
    </div>
  )
}

export default App
