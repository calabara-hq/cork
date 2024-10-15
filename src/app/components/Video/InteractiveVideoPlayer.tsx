"use client";
import { VolumeX, Volume2 } from 'lucide-react'
import useVideoControls from "@/app/hooks/useVideoControls";
import { useEffect, useRef } from "react";
import { TvMinimalPlay } from 'lucide-react';
import {
    MediaController,
    MediaTimeDisplay,
    MediaPlayButton,
    MediaMuteButton,
    MediaLoadingIndicator,
} from "media-chrome/dist/react";
import { transformVideoAsset } from './index';

const InteractiveVideoPlayer = ({ videoUrl, posterUrl, isActive }: { videoUrl: string, posterUrl?: string, isActive: boolean }) => {
    const vidRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!vidRef.current) return
        vidRef.current.addEventListener("error", () => {
            console.log('error loading video, switching to unoptimized url')
            if (!vidRef.current) return
            vidRef.current.src = videoUrl
        })
    }, [])

    useEffect(() => {
        if (isActive && vidRef.current) vidRef.current.play();
        else if (!isActive && vidRef.current) vidRef.current.pause();
    }, [isActive]);

    const { muteButtonRef, timeRef } = useVideoControls({
        onMute: (event: Event) => {
            event.stopPropagation();
            event.preventDefault();
        },
        onTimeToggle: (event: Event) => {
            event.stopPropagation();
            event.preventDefault();
        },
    });

    return (
        <MediaController className="w-full h-fit bg-transparent animate-fadeIn">
            <video
                ref={vidRef}
                autoPlay={isActive}
                playsInline
                slot="media"
                loop={true}
                src={videoUrl}
                poster={posterUrl ? transformVideoAsset(posterUrl, 'image', 300) : undefined}
                preload="auto"
                muted
                crossOrigin=""
                className="w-full aspect-square object-cover rounded-2xl"
            />
            <MediaLoadingIndicator slot="centered-chrome" />
            <div slot="top-chrome" className="flex flex-row w-full mt-2">
                {isActive ? (
                    <MediaMuteButton
                        ref={muteButtonRef}
                        className="bg-[#1c1c1ca6] hover:bg-[#1c1c1ce6] ml-auto mr-2 rounded-xl p-2"
                    >
                        <span slot="high">
                            <Volume2 className="h-6 w-6 text-t1" />
                        </span>
                        <span slot="off">
                            <VolumeX className="h-6 w-6 text-t1" />
                        </span>
                    </MediaMuteButton>
                ) : (
                    <MediaPlayButton className="bg-[#1c1c1ce6] ml-auto mr-2 rounded-xl p-2">
                        <span slot="play">
                            <TvMinimalPlay className="h-6 w-6 text-warning" />
                        </span>
                    </MediaPlayButton>
                )}
            </div>

            <div className="flex flex-row w-full items-end bg-gradient-to-t from-[black] rounded-b-xl h-20">
                <MediaTimeDisplay
                    ref={timeRef}
                    className="ml-auto mr-2 rounded-xl p-1 bg-transparent text-t1"
                    showDuration={isActive}
                    remaining={!isActive}
                ></MediaTimeDisplay>
            </div>
        </MediaController>
    );
};

export default InteractiveVideoPlayer;
