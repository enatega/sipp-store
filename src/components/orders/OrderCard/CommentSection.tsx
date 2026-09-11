import React from "react";
import { View } from "react-native";
import { useTranslations } from "../../../localization/LocalizationProvider";
import Text from "../../Text";
import { styles } from "./styles";

type Props = {
    comment: string | null;
    theme: any;
};

export default function CommentSection({ comment, theme }: Props) {
    const { t } = useTranslations("app");

    if (!comment) return null;

    return (
        <View style={[styles.commentBox, { backgroundColor: "#F3F4F6" }]}>
            <Text style={styles.commentLabel} weight="medium">
                {t("order_card_comment")}
            </Text>
            <Text style={styles.commentText} weight="medium">{comment}</Text>
        </View>
    );
}
