import { useState, useEffect, useRef, memo } from 'react'
import Button from './ui/Button'
import Card from './ui/Card'
import Modal from './ui/Modal'
import Input from './ui/Input'
import { Play, Pause, RotateCcw, Coffee, Zap, Settings } from 'lucide-react'

const Pomodoro = () => {
    // Load settings from localStorage or use defaults
    const [workTime, setWorkTime] = useState(() => {
        const saved = localStorage.getItem('pomodoro_work_time')
        return saved ? parseInt(saved) : 25
    })
    const [breakTime, setBreakTime] = useState(() => {
        const saved = localStorage.getItem('pomodoro_break_time')
        return saved ? parseInt(saved) : 5
    })

    const [minutes, setMinutes] = useState(workTime)
    const [seconds, setSeconds] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [isBreak, setIsBreak] = useState(false)
    const [sessions, setSessions] = useState(0)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [tempWorkTime, setTempWorkTime] = useState(workTime)
    const [tempBreakTime, setTempBreakTime] = useState(breakTime)
    const intervalRef = useRef(null)

    const WORK_TIME = workTime * 60 // minutes to seconds
    const BREAK_TIME = breakTime * 60 // minutes to seconds

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        // Timer finished
                        handleTimerComplete()
                    } else {
                        setMinutes(minutes - 1)
                        setSeconds(59)
                    }
                } else {
                    setSeconds(seconds - 1)
                }
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isActive, minutes, seconds])

    const handleTimerComplete = () => {
        setIsActive(false)

        if (!isBreak) {
            // Work session completed
            setSessions(sessions + 1)
            setIsBreak(true)
            setMinutes(breakTime)
            setSeconds(0)
            // Optional: Play notification sound
            playNotification()
        } else {
            // Break completed
            setIsBreak(false)
            setMinutes(workTime)
            setSeconds(0)
            playNotification()
        }
    }

    const handleSaveSettings = () => {
        setWorkTime(tempWorkTime)
        setBreakTime(tempBreakTime)
        localStorage.setItem('pomodoro_work_time', tempWorkTime.toString())
        localStorage.setItem('pomodoro_break_time', tempBreakTime.toString())

        // Reset timer with new settings if not active
        if (!isActive) {
            setIsBreak(false)
            setMinutes(tempWorkTime)
            setSeconds(0)
        }

        setIsSettingsOpen(false)
    }

    const playNotification = () => {
        // Simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = 800
            oscillator.type = 'sine'

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.5)
        } catch (error) {
            console.log('Audio notification not supported')
        }
    }

    const toggleTimer = () => {
        setIsActive(!isActive)
    }

    const resetTimer = () => {
        setIsActive(false)
        setIsBreak(false)
        setMinutes(workTime)
        setSeconds(0)
    }

    // Calculate progress for circular indicator
    const totalSeconds = isBreak ? BREAK_TIME : WORK_TIME
    const currentSeconds = minutes * 60 + seconds
    const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100

    // Calculate stroke dashoffset for circular progress
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <Card className="relative overflow-hidden">
            {/* Background gradient based on mode - monochrome */}
            <div className={`absolute inset-0 opacity-5 ${isBreak ? 'bg-gradient-to-br from-white to-gray-500' : 'bg-gradient-to-br from-white to-gray-600'}`} />

            <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isBreak ? (
                            <Coffee className="text-white" size={20} />
                        ) : (
                            <Zap className="text-white" size={20} />
                        )}
                        <h3 className="text-lg font-semibold text-text-primary font-mono">
                            {isBreak ? 'Intervalo' : 'Foco'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-text-muted font-mono">
                            {sessions} sessões
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setTempWorkTime(workTime)
                                setTempBreakTime(breakTime)
                                setIsSettingsOpen(true)
                            }}
                            className="!p-2"
                        >
                            <Settings size={16} />
                        </Button>
                    </div>
                </div>

                {/* Circular Timer */}
                <div className="flex justify-center py-4">
                    <div className="relative">
                        <svg width="120" height="120" className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                stroke="#2a2a2a"
                                strokeWidth="8"
                                fill="none"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="60"
                                cy="60"
                                r={radius}
                                stroke={isBreak ? '#FFFFFF' : '#FFFFFF'}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>

                        {/* Time display */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-text-primary font-mono">
                                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant={isActive ? 'secondary' : 'primary'}
                        onClick={toggleTimer}
                        className="!px-6"
                    >
                        {isActive ? (
                            <>
                                <Pause size={16} />
                                Pausar
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                Iniciar
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={resetTimer}
                        className="!p-2"
                    >
                        <RotateCcw size={16} />
                    </Button>
                </div>

                {/* Status text */}
                <div className="text-center text-sm text-text-muted">
                    {isActive ? (
                        isBreak ? 'Relaxe e descanse' : 'Mantenha o foco!'
                    ) : (
                        'Pronto para começar?'
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <Modal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Configurações do Pomodoro"
                size="sm"
                footer={
                    <div className="flex gap-2 ml-auto">
                        <Button
                            variant="ghost"
                            onClick={() => setIsSettingsOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveSettings}>
                            Salvar
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Tempo de Foco (minutos)"
                        type="number"
                        min="1"
                        max="60"
                        value={tempWorkTime}
                        onChange={(e) => setTempWorkTime(parseInt(e.target.value) || 1)}
                    />
                    <Input
                        label="Tempo de Intervalo (minutos)"
                        type="number"
                        min="1"
                        max="30"
                        value={tempBreakTime}
                        onChange={(e) => setTempBreakTime(parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-text-muted">
                        As configurações serão salvas localmente e aplicadas ao próximo timer.
                    </p>
                </div>
            </Modal>
        </Card>
    )
}

export default memo(Pomodoro)
