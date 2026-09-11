import React, { useEffect, useRef, useState } from 'react';
import Text from './Text';
import { StyleProp, TextStyle } from 'react-native';

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
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const shouldUseRemainingOverride =
            typeof remainingSecondsOverride === "number" &&
            (remainingSecondsOverride > 0 || totalMinutes <= 0);

        const initialRemaining =
            shouldUseRemainingOverride
                ? Math.max(0, remainingSecondsOverride)
                : Math.max(0, totalMinutes * 60);
        setRemainingSeconds(initialRemaining);

        intervalRef.current = setInterval(() => {
            setRemainingSeconds((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startTimeMs, totalMinutes, remainingSecondsOverride]);

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
