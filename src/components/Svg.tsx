import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SvgProps } from "react-native-svg";

/**
 * 1️⃣ Import your SVG files here.
 * Make sure the file exists inside assets/svgs
 */
import EmptyCard from "../assets/svgs/empty-cart.svg";
import Timer from "../assets/svgs/timer.svg";

/**
 * 2️⃣ Add the SVG file name here.
 * The name must match the key used in `svgIcons` below.
 */
export type SvgName = "emptyCart" | "timer";

interface AppSvgProps extends SvgProps {
  name: SvgName;
  width?: number;
  height?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * 3️⃣ Register all imported SVGs here.
 * Key must match the SvgName type.
 */
const svgIcons: Record<SvgName, React.FC<SvgProps>> = {
  emptyCart: EmptyCard,
  timer: Timer,
};

const Svg: React.FC<AppSvgProps> = ({
  name,
  width = 200,
  height = 200,
  color = "#000",
  style,
  ...rest
}) => {
  const SvgComponent = svgIcons[name];

  if (!SvgComponent) return null;

  return (
    <SvgComponent
      width={width}
      height={height}
      fill={color}
      style={style}
      {...rest}
    />
  );
};

export default Svg;
