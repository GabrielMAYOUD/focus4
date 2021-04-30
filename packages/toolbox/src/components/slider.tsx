import classnames from "classnames";
import range from "ramda/src/range";
import {
    MouseEvent as RMouseEvent,
    TouchEvent as RTouchEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {findDOMNode} from "react-dom";
import {SLIDER} from "react-toolbox/lib/identifiers";
import {SliderTheme} from "react-toolbox/lib/slider/Slider";
import events from "react-toolbox/lib/utils/events";
import {round} from "react-toolbox/lib/utils/utils";

import {CSSProp, useTheme} from "@focus4/styling";
import rtSliderTheme from "react-toolbox/components/slider/theme.css";
const sliderTheme: SliderTheme = rtSliderTheme;
export {sliderTheme, SliderTheme};

import {Input} from "./input";
import {ProgressBar} from "./progress-bar";

export interface SliderProps {
    /** Used to style the ProgressBar element */
    buffer?: number;
    /** CSS class for the root component. */
    className?: string;
    /** If true, an input is shown and the user can set the slider from keyboard value. */
    editable?: boolean;
    /** If true, component will be disabled. */
    disabled?: boolean;
    /** Maximum value permitted. */
    max?: number;
    /** Minimum value permitted. */
    min?: number;
    /** Callback function that will be invoked when the slider value changes. */
    onChange?: (value: number) => void;
    /** If true, a pin with numeric value label is shown when the slider thumb is pressed. Use for settings for which users need to know the exact value of the setting. */
    pinned?: boolean;
    /** If true, the slider thumb snaps to tick marks evenly spaced based on the step property value. */
    snaps?: boolean;
    /** Amount to vary the value when the knob is moved or increase/decrease is called. */
    step?: number;
    /** Classnames object defining the component style. */
    theme?: CSSProp<SliderTheme>;
    /** Current value of the slider. */
    value?: number;
}

export function Slider({
    buffer = 0,
    className: pClassName = "",
    disabled,
    editable = false,
    max = 100,
    min = 0,
    onChange,
    pinned = false,
    snaps = false,
    step = 0.01,
    theme: pTheme,
    value = 0
}: SliderProps) {
    const theme = useTheme(SLIDER, sliderTheme, pTheme);
    const [inputFocused, setInputFocused] = useState(false);
    const [sliderFocused, setSliderFocused] = useState(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [sliderLength, setSliderLength] = useState(0);
    const [sliderStart, setSliderStart] = useState(0);
    const [pressed, setPressed] = useState(false);

    const progressbarNode = useRef<any>(null);
    const inputNode = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const handleResize = useCallback(() => {
        const {left, right} = (findDOMNode(progressbarNode.current) as Element).getBoundingClientRect();
        setSliderStart(left);
        setSliderLength(right - left);
    }, []);

    const stepDecimals = useMemo(() => {
        return (step.toString().split(".")[1] || []).length;
    }, [step]);

    const valueForInput = useCallback(
        (value: number) => {
            const decimals = stepDecimals;
            return decimals > 0 ? value.toFixed(decimals) : value.toString();
        },
        [stepDecimals]
    );

    const trimValue = useCallback(
        (value: number) => {
            if (value < min) {
                return min;
            }
            if (value > max) {
                return max;
            }
            return round(value, stepDecimals) as number;
        },
        [max, min, stepDecimals]
    );

    const addToValue = useCallback(
        (increment: number) => {
            let newValue = inputFocused ? parseFloat(inputValue) : value;
            newValue = trimValue(value + increment);
            if (newValue !== value) {
                onChange?.(newValue);
            }
        },
        [inputFocused, inputValue, onChange, trimValue, value]
    );

    const positionToValue = useCallback(
        (position: {x: number}) => {
            const pos = ((position.x - sliderStart) / sliderLength) * (max - min);
            return trimValue(Math.round(pos / step) * step + min);
        },
        [max, min, step, sliderStart, sliderLength, trimValue]
    );

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (inputFocused) {
            setInputValue(valueForInput(value));
        }
    }, [inputFocused, value, valueForInput]);

    const start = useCallback(
        (position: {x: number}) => {
            handleResize();
            setPressed(true);
            onChange?.(positionToValue(position));
        },
        [handleResize, onChange, positionToValue]
    );

    const handleMouseDown = useCallback(
        (event: RMouseEvent<HTMLDivElement>) => {
            if (inputFocused) {
                inputNode.current?.blur();
            }
            start(events.getMousePosition(event));
            events.pauseEvent(event);
        },
        [inputFocused, start]
    );

    const handleTouchStart = useCallback(
        (event: RTouchEvent<HTMLDivElement>) => {
            if (inputFocused) {
                inputNode.current?.blur();
            }
            start(events.getTouchPosition(event));
            events.pauseEvent(event);
        },
        [inputFocused, start]
    );

    useEffect(() => {
        if (pressed) {
            const move = (position: {x: number}) => {
                onChange?.(positionToValue(position));
            };

            const handleMouseMove = (event: MouseEvent) => {
                events.pauseEvent(event);
                move(events.getMousePosition(event));
            };

            const handleTouchMove = (event: TouchEvent) => {
                move(events.getTouchPosition(event));
            };

            const end = () => {
                setPressed(false);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("touchmove", handleTouchMove);
            document.addEventListener("mouseup", end);
            document.addEventListener("touchend", end);

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("mouseup", end);
                document.removeEventListener("touchend", end);
            };
        }
    }, [positionToValue, pressed]);

    const handleInputFocus = useCallback(() => {
        setInputFocused(true);
        setInputValue(valueForInput(value));
    }, [value, valueForInput]);

    const handleInputChange = useCallback((newValue: string) => {
        setInputValue(newValue);
    }, []);

    const handleInputBlur = useCallback(() => {
        const newValue = +inputValue || 0;
        setInputFocused(false);
        setInputValue("");
        onChange?.(trimValue(newValue));
    }, [inputValue, onChange, trimValue]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (disabled) {
                return;
            }
            if (["Enter", "Escape"].includes(event.code)) {
                inputNode.current?.blur();
            }
            if (event.code === "ArrowUp") {
                addToValue(step);
            }
            if (event.code === "ArrowDown") {
                addToValue(-step);
            }
        },
        [addToValue, disabled, step]
    );

    useEffect(() => {
        if (sliderFocused) {
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [handleKeyDown, sliderFocused]);

    const knobOffset = useMemo(() => {
        return 100 * ((value - min) / (max - min));
    }, [max, min, value]);

    const knobStyles = {left: `${knobOffset}%`};
    const className = classnames(
        theme.slider(),
        {
            [theme.editable()]: editable,
            [theme.pinned()]: pinned,
            [theme.pressed()]: pressed,
            [theme.ring()]: value === min
        },
        pClassName
    );

    return (
        <div
            className={className}
            data-react-toolbox="slider"
            onBlur={() => setSliderFocused(false)}
            onFocus={() => setSliderFocused(true)}
            tabIndex={0}
        >
            <div className={theme.container()} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
                <div
                    className={theme.knob()}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    style={knobStyles}
                >
                    <div className={theme.innerknob()} data-value={value} />
                </div>

                <div className={theme.progress()}>
                    <ProgressBar
                        disabled={disabled}
                        ref={progressbarNode}
                        className={theme.innerprogress()}
                        max={max}
                        min={min}
                        mode="determinate"
                        value={value}
                        buffer={buffer}
                    />
                    {snaps ? (
                        <div className={theme.snaps()}>
                            {range(0, (max - min) / step).map(i => (
                                <div key={`span-${i}`} className={theme.snap()} />
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
            {editable ? (
                <Input
                    ref={inputNode}
                    className={theme.input()}
                    disabled={disabled}
                    onFocus={handleInputFocus}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    value={inputFocused ? inputValue : valueForInput(value)}
                />
            ) : null}
        </div>
    );
}
