import { Icon } from "@iconify/react/dist/iconify.js";
import gsap from "gsap";
import { Observer } from "gsap/all";
import { useEffect, useRef } from "react";

gsap.registerPlugin(Observer);

interface MarqueeProps {
  items: string[];
  className?: string;
  icon?: string;
  iconClassName?: string;
  reverse?: boolean;
}

interface HorizontalLoopConfig {
  repeat?: number;
  paused?: boolean;
  speed?: number;
  snap?: number | ((value: number) => number);
  paddingRight?: number | string;
  reversed?: boolean;
}

interface ExtendedTimeline extends gsap.core.Timeline {
  next?: (vars?: gsap.TweenVars) => gsap.core.Tween;
  previous?: (vars?: gsap.TweenVars) => gsap.core.Tween;
  current?: () => number;
  toIndex?: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween;
  times?: number[];
}

const Marquee: React.FC<MarqueeProps> = ({
  items,
  className = "text-white bg-black",
  icon = "mdi:star-four-points",
  iconClassName = "",
  reverse = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineRef = useRef<ExtendedTimeline | null>(null);
  const observerRef = useRef<Observer | null>(null);

  function horizontalLoop(
    items: gsap.TweenTarget,
    config?: HorizontalLoopConfig
  ): ExtendedTimeline {
    const itemsArray = gsap.utils.toArray(items) as HTMLElement[];
    const cfg = config || {};

    let curIndex = 0;

    const tl: ExtendedTimeline = gsap.timeline({
      repeat: cfg.repeat,
      paused: cfg.paused,
      defaults: { ease: "none" },
      onReverseComplete: () => {
        tl.totalTime(tl.rawTime() + tl.duration() * 100);
      },
    });

    const length = itemsArray.length;
    const startX = itemsArray[0].offsetLeft;
    const times: number[] = [];
    const widths: number[] = [];
    const xPercents: number[] = [];
    const pixelsPerSecond = (cfg.speed || 1) * 100;

    const snap =
      typeof cfg.snap === "function"
        ? cfg.snap
        : gsap.utils.snap(cfg.snap || 1);

    gsap.set(itemsArray, {
      xPercent: (i: number, el: gsap.TweenTarget) => {
        const element = el as HTMLElement;
        const w = (widths[i] = parseFloat(
          gsap.getProperty(element, "width", "px") as string
        ));
        xPercents[i] = snap(
          (parseFloat(gsap.getProperty(element, "x", "px") as string) / w) *
            100 +
            (gsap.getProperty(element, "xPercent") as number)
        );
        return xPercents[i];
      },
    });

    gsap.set(itemsArray, { x: 0 });

    const totalWidth =
      itemsArray[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      itemsArray[length - 1].offsetWidth *
        (gsap.getProperty(itemsArray[length - 1], "scaleX") as number) +
      (parseFloat(cfg.paddingRight as string) || 0);

    for (let i = 0; i < length; i++) {
      const item = itemsArray[i];
      const curX = (xPercents[i] / 100) * widths[i];
      const distanceToStart = item.offsetLeft + curX - startX;
      const distanceToLoop =
        distanceToStart +
        widths[i] * (gsap.getProperty(item, "scaleX") as number);

      tl.to(
        item,
        {
          xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
          duration: distanceToLoop / pixelsPerSecond,
        },
        0
      )
        .fromTo(
          item,
          {
            xPercent: snap(
              ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
            ),
          },
          {
            xPercent: xPercents[i],
            duration:
              (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
            immediateRender: false,
          },
          distanceToLoop / pixelsPerSecond
        )
        .add("label" + i, distanceToStart / pixelsPerSecond);
      times[i] = distanceToStart / pixelsPerSecond;
    }

    function toIndex(index: number, vars?: gsap.TweenVars) {
      const v = vars || {};
      if (Math.abs(index - curIndex) > length / 2) {
        index += index > curIndex ? -length : length;
      }
      const newIndex = gsap.utils.wrap(0, length, index);
      let time = times[newIndex];
      if (time > tl.time() !== index > curIndex) {
        v.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      curIndex = newIndex;
      v.overwrite = true;
      return tl.tweenTo(time, v);
    }

    tl.next = (vars?: gsap.TweenVars) => toIndex(curIndex + 1, vars);
    tl.previous = (vars?: gsap.TweenVars) => toIndex(curIndex - 1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index: number, vars?: gsap.TweenVars) => toIndex(index, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true);

    if (cfg.reversed) {
      tl.vars.onReverseComplete?.();
      tl.reverse();
    }

    return tl;
  }

  useEffect(() => {
    const filteredItems = itemsRef.current.filter(
      (el): el is HTMLSpanElement => el !== null
    );

    timelineRef.current = horizontalLoop(filteredItems, {
      repeat: -1,
      paddingRight: 30,
      reversed: reverse,
    });

    observerRef.current = Observer.create({
      onChangeY(self) {
        let factor = 2.5;
        if ((!reverse && self.deltaY < 0) || (reverse && self.deltaY > 0)) {
          factor *= -1;
        }
        if (timelineRef.current) {
          gsap
            .timeline({
              defaults: {
                ease: "none",
              },
            })
            .to(timelineRef.current, {
              timeScale: factor * 2.5,
              duration: 0.2,
              overwrite: true,
            })
            .to(
              timelineRef.current,
              { timeScale: factor / 2.5, duration: 1 },
              "+=0.3"
            );
        }
      },
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.kill();
        observerRef.current = null;
      }
    };
  }, [items, reverse]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden w-full h-20 md:h-25 flex items-center marquee-text-responsive font-light uppercase whitespace-nowrap ${className}`}
    >
      <div className="flex">
        {items.map((text, index) => (
          <span
            key={index}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            className="flex items-center px-16 gap-x-32"
          >
            {text} <Icon icon={icon} className={iconClassName} />
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
