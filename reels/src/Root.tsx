import React from "react";
import { Composition } from "remotion";
import { StyleCheck, STYLE_CHECK_FRAMES } from "./StyleCheck";

/**
 * Every video is registered here: 1080×1920, 30fps.
 * New reels are added as new <Composition> entries (never edit another video's files).
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="StyleCheck" component={StyleCheck} durationInFrames={STYLE_CHECK_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
