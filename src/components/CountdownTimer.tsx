import React, { useEffect, useState } from 'react';
import Text from './Text';
import { AppState, StyleProp, TextStyle } from 'react-native';

type Props = {
    startTimeMs?: number | null;
    totalMinutes: number;
    remainingSecondsOverride?: number | null;
    style?: StyleProp<TextStyle>;
};

export default function CountdownTimer({
    startTimeMs,
    totalMinutes,
    remainingSecondsOverride,
    style,
}: Props) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        setNow(Date.now());
        const interval = setInterval(() => setNow(Date.now()), 1000);
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') setNow(Date.now());
        });
        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [startTimeMs, totalMinutes, remainingSecondsOverride]);

    const durationSeconds = Math.max(0, totalMinutes * 60);
    const remainingSeconds = startTimeMs != null && Number.isFinite(startTimeMs)
        ? Math.max(0, Math.ceil((startTimeMs + durationSeconds * 1000 - now) / 1000))
        : Math.max(0, remainingSecondsOverride ?? durationSeconds);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        if (hours > 0) return `${pad(hours)} : ${pad(minutes)} : ${pad(secs)}`;
        return `${pad(minutes)} : ${pad(secs)}`;
    };

    return (
        <Text style={[style, { fontVariant: ['tabular-nums'] }]}>
            {formatTime(remainingSeconds)}
        </Text>
    );
}
