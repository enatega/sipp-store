import React from "react";
import { View, Pressable } from "react-native";
import Text from "../../Text";
import { styles } from "./styles";
import { ActivityIndicator } from "react-native";
import { useTranslations } from "../../../localization/LocalizationProvider";

type Props = {
    canAccept: boolean;
    canReject: boolean;
    orderId: string;
    onAccept: (orderId: string) => void;
    onReject: (orderId: string) => void;
    isAccepting?: boolean;
    isRejecting?: boolean;
    theme: any;
};

export default function AcceptRejectButtons({
    canAccept,
    canReject,
    orderId,
    onAccept,
    onReject,
    isAccepting,
    isRejecting,
    theme,
}: Props) {
    const { t } = useTranslations('app');
    if (!canAccept && !canReject) return null;

    return (
        <View style={styles.actions}>
            {canReject && (
                <Pressable
                    style={[styles.btn, styles.btnReject, isRejecting && { opacity: 0.6 }]}
                    onPress={() => onReject(orderId)}
                    disabled={isRejecting}
                >
                    {isRejecting ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <Text style={styles.btnRejectText} color="#EF4444" weight="medium">
                            {t("order_card_reject")}
                        </Text>
                    )}
                </Pressable>
            )}
            {canAccept && (
                <Pressable
                    style={[styles.btn, styles.btnAccept, { backgroundColor: theme.colors.primary }, isAccepting && { opacity: 0.6 }]}
                    onPress={() => onAccept(orderId)}
                    disabled={isAccepting}
                >
                    {isAccepting ? (
                        <ActivityIndicator size="small" color={theme.colors.buttonText} />
                    ) : (
                        <Text style={styles.btnAcceptText} color={theme.colors.buttonText} weight="medium">
                            {t("order_card_accept")}
                        </Text>
                    )}
                </Pressable>
            )}
        </View>
    );
}
