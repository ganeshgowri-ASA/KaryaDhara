'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Target, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_CONFIG = {
  focus: { duration: 25 * 60, label: 'Focus Time', color: 'bg-red-500', icon: Brain },
  shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500', icon: Coffee },
  longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500', icon: Coffee },
};

export default function PomodoroPage() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [currentTask, setCurrentTask] = useState('Deep work session');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const config = TIMER_CONFIG[mode];
  const progress = ((config.duration - timeLeft) / config.duration) * 100;

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIG[newMode].duration);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      setTotalFocusMinutes(prev => prev + 25);
      if (newSessions % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('focus');
    }
  }, [mode, sessionsCompleted, switchMode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, handleTimerComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const reset = () => {
    setTimeLeft(config.duration);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const todaysSessions = [
    { task: 'Design system review', duration: 25, completed: true },
    { task: 'API integration work', duration: 25, completed: true },
    { task: 'Bug fixes & testing', duration: 25, completed: true },
  ];

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
          <p className="text-muted-foreground mt-1">Stay focused, take breaks, be productive</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 justify-center">
          {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'outline'}
              onClick={() => switchMode(m)}
              className="capitalize"
            >
              {TIMER_CONFIG[m].label}
            </Button>
          ))}
        </div>

        {/* Timer Card */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-6">
            <div className="flex justify-center mb-4">
              <config.icon className="h-8 w-8 text-primary" />
            </div>
            <div className="text-7xl font-mono font-bold mb-4 tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <Progress value={progress} className="h-2 mb-6" />
            <div className="text-sm text-muted-foreground mb-6">
              Current task: <span className="font-medium text-foreground">{currentTask}</span>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="icon" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className="px-8"
              >
                {isRunning ? <><Pause className="h-5 w-5 mr-2" />Pause</> : <><Play className="h-5 w-5 mr-2" />Start</>}
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleTimerComplete()}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                <Target className="h-3.5 w-3.5" /> Sessions Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionsCompleted + 3}</div>
              <p className="text-xs text-muted-foreground">{4 - (sessionsCompleted % 4)} until long break</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" /> Focus Minutes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFocusMinutes + 75}</div>
              <p className="text-xs text-muted-foreground">minutes today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                <Coffee className="h-3.5 w-3.5" /> Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaysSessions.map((session, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">{session.task}</span>
                </div>
                <Badge variant="secondary">{session.duration} min</Badge>
              </div>
            ))}
            {sessionsCompleted > 0 && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">{currentTask}</span>
                </div>
                <Badge variant="secondary">{sessionsCompleted * 25} min</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
