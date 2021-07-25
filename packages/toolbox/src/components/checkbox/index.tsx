import classNames from "classnames";
import {CSSProperties, MouseEvent, MouseEventHandler, ReactNode, useCallback, useRef} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {Check} from "./check";

import checkboxCss, {CheckboxCss} from "../__style__/checkbox.css";
export {checkboxCss, CheckboxCss};

/** Props du Checkbox. */
export interface CheckboxProps {
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** If true, the checkbox shown as disabled and cannot be modified. */
    disabled?: boolean;
    /** Text label to attach next to the checkbox element. */
    label?: ReactNode;
    /** The id of the field to set in the input checkbox. */
    id?: string;
    /** The name of the field to set in the input checkbox. */
    name?: string;
    /** Est appelé quand on coche la case. */
    onChange?: (value: boolean, event: MouseEvent<HTMLInputElement>) => void;
    onMouseEnter?: MouseEventHandler<HTMLLabelElement>;
    onMouseLeave?: MouseEventHandler<HTMLLabelElement>;
    style?: CSSProperties;
    theme?: CSSProp<CheckboxCss>;
    /** Valeur. */
    value?: boolean;
}

export function Checkbox({
    children,
    className = "",
    disabled = false,
    label,
    id,
    onChange,
    onMouseEnter,
    onMouseLeave,
    name,
    theme: pTheme,
    style,
    value = false
}: CheckboxProps) {
    const theme = useTheme("RTCheckbox", checkboxCss, pTheme);
    const inputNode = useRef<HTMLInputElement | null>(null);

    const handleToggle = useCallback(
        (event: MouseEvent<HTMLInputElement>) => {
            if (event.pageX !== 0 && event.pageY !== 0) {
                inputNode.current?.blur();
            }
            if (!disabled && onChange) {
                onChange(!value, event);
            }
        },
        [disabled, onChange, value]
    );

    return (
        <label
            className={classNames(theme.field({disabled}), className)}
            data-react-toolbox="checkbox"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <input
                ref={inputNode}
                checked={value}
                className={theme.input()}
                disabled={disabled}
                id={id}
                name={name}
                onClick={handleToggle}
                readOnly
                type="checkbox"
            />
            <Check
                disabled={disabled}
                rippleTheme={{ripple: theme.ripple()}}
                style={style}
                theme={theme}
                value={value}
            />
            {label ? (
                <span className={theme.text()} data-react-toolbox="label">
                    {label}
                </span>
            ) : null}
            {children}
        </label>
    );
}
