import React from "react";
import { View } from "react-native";
import { useTranslations } from "../../../localization/LocalizationProvider";
import type { Theme } from "../../../theme/theme";
import Text from "../../Text";
import { styles } from "./styles";

type Props = {
    comment: string | null;
    theme: Theme;
};

export default function CommentSection({ comment, theme }: Props) {
    const { t } = useTranslations("app");

    if (!comment) return null;

    return (
        <View style={[styles.commentBox, { backgroundColor: theme.colors.gray50 }]}>
            <Text style={[styles.commentLabel, { color: theme.colors.gray600 }]} weight="medium">
                {t("order_card_comment")}
            </Text>
            <Text style={[styles.commentText, { color: theme.colors.gray900 }]} weight="medium">{comment}</Text>
        </View>
    );
}
