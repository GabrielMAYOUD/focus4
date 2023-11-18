import classNames from "classnames";
import {AriaAttributes, createElement, CSSProperties, FocusEventHandler, MouseEventHandler, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import buttonCss, {ButtonCss} from "./__style__/button.css";
export {buttonCss, ButtonCss};

export interface ButtonProps extends PointerEvents<HTMLButtonElement | HTMLLinkElement>, AriaAttributes {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Couleur du bouton. */
    color?: "accent" | "light" | "primary";
    /** Désactive le bouton. */
    disabled?: boolean;
    /** Si renseigné, pose une balise <a> à la place du <button>. */
    href?: string;
    /** Icône a afficher dans le bouton. */
    icon?: ReactNode;
    /** Position de l'icône dans le bouton. Par défaut : "left". */
    iconPosition?: "left" | "right";
    /**  Libellé du bouton. */
    label?: string;
    /** Au blur du bouton. */
    onBlur?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au clic sur le bouton. */
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au focus du bouton. */
    onFocus?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** CSS inline pour l'élément racine. */
    style?: CSSProperties;
    /** "target" pour le <a>, si `href` est rensigné. */
    target?: string;
    /** "tabindex" pour l'élément HTML. */
    tabIndex?: number;
    /** CSS. */
    theme?: CSSProp<ButtonCss>;
    /** Type de bouton HTML (ignoré si `href` est renseigné). */
    type?: string;
    /** Variante du bouton .*/
    variant?: "elevated-filled" | "elevated" | "filled" | "outlined";
}

/**
 * Bouton standard.
 */
export function Button({
    className,
    color,
    disabled,
    href,
    icon,
    iconPosition = "left",
    label,
    onBlur,
    onClick,
    onFocus,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    style,
    tabIndex,
    target,
    theme: pTheme,
    type = "button",
    variant,
    ...other
}: ButtonProps) {
    const theme = useTheme("button", buttonCss, pTheme);
    const {ref, handlePointerLeave, handlePointerUp} = useInputRef({
        onPointerLeave,
        onPointerUp
    });

    const element = href ? "a" : "button";

    const props = {
        ...other,
        ref,
        className: classNames(
            theme.button({
                disabled,
                outlined: variant === "outlined",
                filled: variant?.includes("filled") && !!color,
                elevated: variant?.includes("elevated"),
                accent: color === "accent",
                primary: color === "primary",
                light: color === "light",
                label: !!label,
                left: !!icon && iconPosition === "left",
                right: !!icon && iconPosition === "right"
            }),
            className
        ),
        disabled: !href ? disabled : undefined,
        href,
        onBlur,
        onClick,
        onFocus,
        style,
        tabIndex,
        target: href ? target : undefined,
        type: !href ? type : undefined
    };

    return (
        <Ripple
            disabled={disabled}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
        >
            {createElement(
                element,
                props,
                icon ? <FontIcon className={theme.icon()}>{icon}</FontIcon> : null,
                <span className={theme.label()}>{label ?? "\xa0"}</span>
            )}
        </Ripple>
    );
}
