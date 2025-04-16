
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CallTimerProps {
  isActive: boolean;
  pricePerMinute: number;
}

const CallTimer = ({ isActive, pricePerMinute }: CallTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    let interval: number | null = null;
    
    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          const minutesElapsed = newSeconds / 60;
          setTotalCost(Number((minutesElapsed * pricePerMinute).toFixed(2)));
          return newSeconds;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, pricePerMinute]);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2 bg-primary-foreground p-2 rounded-lg">
      <Clock className="h-4 w-4 text-primary" />
      <div className="text-sm font-medium">{formatTime(seconds)}</div>
      {pricePerMinute > 0 && (
        <div className="text-sm flex items-center ml-2">
          <span className="font-medium text-hotseat-500">${totalCost}</span>
          <span className="text-muted-foreground ml-1">
            (${pricePerMinute}/min)
          </span>
        </div>
      )}
    </div>
  );
};

export default CallTimer;
