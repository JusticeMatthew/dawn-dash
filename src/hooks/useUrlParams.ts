import { useEffect, useRef, useCallback } from 'react'

import { useSearchParams } from 'react-router-dom'

import {
  DIFFICULTY_VALUES,
  PLAYER_LIMIT_VALUES,
  MAX_DURATION_SUNFORGE_VALUES,
  MAX_DURATION_OTHER_VALUES,
  VIEW_MODE_VALUES,
  ZOOM_LEVEL_VALUES,
  GAME_VERSION_VALUES,
} from '../constants/chartControlValues'
import { ChartControlState, ViewMode } from '../types/chart'
import { Difficulty, SpeedRunClass } from '../types/speedRun'
import { parseVersion, versionToString } from '../utils/version'

function setSearchParamsFromControlState(
  setSearchParams: (params: URLSearchParams, options?: { replace?: boolean }) => void,
  selectedClass: SpeedRunClass,
  controls: ChartControlState,
  debounceTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>
) {
  const isSunforge = selectedClass === SpeedRunClass.Sunforge

  if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)

  debounceTimeoutRef.current = setTimeout(() => {
    const params = new URLSearchParams()
    params.set('class', selectedClass)
    if (!isSunforge) params.set('difficulty', controls.difficulty)
    params.set('players', controls.playerLimit.toString())
    params.set('duration', controls.maxDuration.toString())
    params.set('view', controls.viewMode)
    params.set('zoom', controls.zoomLevel.toString())
    params.set('version', versionToString(controls.gameVersion))

    setSearchParams(params, { replace: true })
  }, 100)
}

export function useUrlParams(
  selectedClass: SpeedRunClass,
  setSelectedClass: (classType: SpeedRunClass) => void,
  controls: ChartControlState
): void {
  const [searchParams, setSearchParams] = useSearchParams()
  const isSunforge = selectedClass === SpeedRunClass.Sunforge

  const prevClassRef = useRef(selectedClass)
  const prevControlStateRef = useRef(controls)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  const isValidClass = (value: string): value is SpeedRunClass =>
    Object.values(SpeedRunClass).includes(value as SpeedRunClass)

  const isValidDifficulty = (value: string): value is Difficulty =>
    DIFFICULTY_VALUES.includes(value as Difficulty)

  const isValidPlayerLimit = (value: number): boolean => PLAYER_LIMIT_VALUES.includes(value)

  const isValidDuration = useCallback(
    (value: number): boolean =>
      isSunforge
        ? MAX_DURATION_SUNFORGE_VALUES.includes(value)
        : MAX_DURATION_OTHER_VALUES.includes(value),
    [isSunforge]
  )

  const isValidViewMode = (value: string): value is ViewMode =>
    VIEW_MODE_VALUES.includes(value as ViewMode)

  const isValidGameVersion = (value: string): boolean => GAME_VERSION_VALUES.includes(value)

  const isValidZoomLevel = (value: number): boolean => ZOOM_LEVEL_VALUES.includes(value)

  useEffect(() => {
    const currentTimeout = debounceTimeoutRef.current
    const isUpdateFromControlChange = Object.entries(
      controls as unknown as Record<string, unknown>
    ).some(([key, value]) => prevControlStateRef.current[key as keyof ChartControlState] !== value)
    const isUpdateFromClassChange = selectedClass !== prevClassRef.current

    prevControlStateRef.current = controls
    prevClassRef.current = selectedClass

    if (isUpdateFromControlChange || isUpdateFromClassChange) {
      // Update URL params if controls or class have changed
      setSearchParamsFromControlState(setSearchParams, selectedClass, controls, debounceTimeoutRef)
    } else {
      // Otherwise, update controls and class from URL params
      const classParam = searchParams.get('class')
      const difficulty = searchParams.get('difficulty')
      const players = searchParams.get('players')
      const duration = searchParams.get('duration')
      const view = searchParams.get('view')
      const zoom = searchParams.get('zoom')
      const version = searchParams.get('version')
      let areAllParamsValid = true

      if (classParam && isValidClass(classParam)) {
        setSelectedClass(classParam)
      } else if (classParam) {
        areAllParamsValid = false
      }

      if (difficulty && !isSunforge && isValidDifficulty(difficulty)) {
        controls.setDifficulty(difficulty)
      } else if (difficulty) {
        areAllParamsValid = false
      }

      if (players) {
        const playerValue = parseInt(players)

        if (isValidPlayerLimit(playerValue)) controls.setPlayerLimit(playerValue)
        else areAllParamsValid = false
      }

      if (duration) {
        const durationValue = parseInt(duration)

        if (isValidDuration(durationValue)) controls.setMaxDuration(durationValue)
        else areAllParamsValid = false
      }

      if (view) {
        if (isValidViewMode(view)) controls.setViewMode(view)
        else areAllParamsValid = false
      }

      if (version) {
        if (isValidGameVersion(version)) controls.setGameVersion(parseVersion(version))
        else areAllParamsValid = false
      }

      if (zoom) {
        const zoomValue = parseInt(zoom)
        if (isValidZoomLevel(zoomValue)) {
          controls.setZoomLevel(zoomValue)
        } else {
          areAllParamsValid = false
        }
      }

      // If any parameter is invalid, reset URL to previous valid state
      if (!areAllParamsValid) {
        setSearchParamsFromControlState(
          setSearchParams,
          selectedClass,
          controls,
          debounceTimeoutRef
        )
      }
    }

    return () => {
      if (currentTimeout) clearTimeout(currentTimeout)
    }
  }, [
    searchParams,
    controls,
    selectedClass,
    setSearchParams,
    isSunforge,
    isValidDuration,
    setSelectedClass,
  ])
}
