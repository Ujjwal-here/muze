import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

const PORTRAIT_WIDTH = Math.min(width, height);
const PORTRAIT_HEIGHT = Math.max(width, height);

export const wp = (percent: number): number => {
  const value = (PORTRAIT_WIDTH * percent) / 100;
  return PixelRatio.roundToNearestPixel(value);
};

export const hp = (percent: number): number => {
  const value = (PORTRAIT_HEIGHT * percent) / 100;
  return PixelRatio.roundToNearestPixel(value);
};

const FIGMA_WIDTH = 360;
const FIGMA_HEIGHT = 800;

export const fz = (figmaPx: number): number => {
  const percent = (figmaPx / FIGMA_HEIGHT) * 100;
  return hp(percent);
};

export const iw = (figmaPx: number): number => {
  const percent = (figmaPx / FIGMA_WIDTH) * 100;
  return wp(percent);
};

export const ih = (figmaPx: number): number => {
  const percent = (figmaPx / FIGMA_HEIGHT) * 100;
  return hp(percent);
};
