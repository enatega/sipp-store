import React from "react";
import { View, Pressable, Linking } from "react-native";
import Text from "../../Text";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./styles";

type Props = {
    riderName: string | null;
    createdAt: string;
    riderPhone?: string | null;
    riderVehicle?: string | null;
    unreadMessagesCount?: number;
    onOpenChat?: () => void;
    theme: any;
};

export default function CompletedSection({
    riderName,
    createdAt: _createdAt,
    riderPhone,
    riderVehicle,
    unreadMessagesCount = 0,
    onOpenChat,
    theme,
}: Props) {
    const handleCallRider = () => {
        if (!riderPhone) return;
        Linking.openURL(`tel:${riderPhone}`);
    };

    return (
        <>
            <View style={[styles.divider, { backgroundColor: theme.colors.gray200, marginVertical: 8 }]} />
            {!!riderName && (
                <View style={styles.riderDetailsBox}>
                    <View style={styles.riderAssignedCompact}>
                        <Text style={styles.riderNameText} weight="semiBold">
                            {riderName}
                        </Text>
                        <View style={styles.actionButtonsRow}>
                            <Pressable
                                style={[styles.iconBtn, !riderPhone && styles.iconBtnDisabled]}
                                onPress={handleCallRider}
                                disabled={!riderPhone}
                            >
                                <Feather name="phone" size={20} color="#374151" />
                            </Pressable>
                            <Pressable style={styles.iconBtn} onPress={onOpenChat}>
                                <Feather name="message-circle" size={20} color="#374151" />
                                {unreadMessagesCount > 0 ? (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadMessagesCount}</Text>
                                    </View>
                                ) : null}
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.riderVehicleRow}>
                        <MaterialCommunityIcons name="bike" size={16} color="#4B5563" />
                        <Text style={styles.riderVehicleText}>
                            {riderVehicle || "-"}
                        </Text>
                    </View>
                </View>
            )}
        </>
    );
}
