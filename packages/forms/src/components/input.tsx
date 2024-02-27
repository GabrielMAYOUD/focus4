import {range, takeWhile} from "lodash";
import numeral from "numeral";
import {FormEvent, ForwardedRef, forwardRef, ReactElement, useCallback, useEffect, useMemo, useState} from "react";

import {DomainFieldType, DomainTypeSingle} from "@focus4/stores";
import {TextField, TextFieldProps} from "@focus4/toolbox";

import {MaskDefinition, useMask} from "./utils/mask";
import {getInputSelection, setInputSelection} from "./utils/selection";

export interface InputProps<T extends DomainFieldType> extends Omit<TextFieldProps, "error" | "onChange" | "value"> {
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Pour un input de type "number", affiche les séparateurs de milliers. */
    hasThousandsSeparator?: boolean;
    /** Pour un input de type "string", paramètre un masque de saisie. */
    mask?: MaskDefinition;
    /** Pour un input de type "number", le nombre maximal de décimales qu'il est possible de saisir. Par défaut : 10. */
    maxDecimals?: number;
    /** Pour un input de type "number", interdit la saisie de nombres négatifs. */
    noNegativeNumbers?: boolean;
    /** Handler appelé à chaque saisie. Retourne la valeur dans le type de l'input. */
    onChange: (value: DomainTypeSingle<T> | undefined) => void;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Valeur. */
    value?: DomainTypeSingle<T>;
}

/**
 * Surcharge du [`TextField`](/docs/composants-focus4∕toolbox-textfield--docs) de `@focus4/toolbox` pour ajouter :
 *
 * -   La gestion de masques de saisie
 * -   Une gestion propre de saisie de nombre (avec formattage, restrictions de décimales, et un `onChange` qui renvoie bien un nombre)
 *
 * Il s'agit du composant par défaut de tous les domaines pour [`fieldFor`](/docs/modèle-métier-afficher-des-champs--docs#fieldforfield-options) (`InputComponent`).
 */
export const Input = forwardRef(function Input<T extends DomainFieldType>(
    {
        error,
        mask,
        noNegativeNumbers = false,
        hasThousandsSeparator = false,
        maxDecimals = 10,
        onChange,
        onKeyDown,
        onPaste,
        showSupportingText = "always",
        supportingText,
        type,
        value,
        ...props
    }: InputProps<T>,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    const numberFormat = useMemo(
        () =>
            `${hasThousandsSeparator ? "0," : ""}0${
                maxDecimals > 0
                    ? `[.][${range(0, maxDecimals)
                          .map(_ => "0")
                          .join("")}]`
                    : ""
            }`,
        [hasThousandsSeparator, maxDecimals]
    );

    const [numberStringValue, setNumberStringValue] = useState(
        type === "number" ? (value !== undefined ? numeral(value).format(numberFormat) : "") : undefined
    );
    useEffect(() => {
        if (
            type === "number" &&
            (!numberStringValue || (value ?? undefined) !== (numeral(numberStringValue).value() ?? undefined))
        ) {
            setNumberStringValue(value !== undefined ? numeral(value).format(numberFormat) : "");
        }
    }, [numberFormat, value]);

    const {handleKeyDown, handlePaste, stringValue} = useMask({
        onChange: onChange as (value: string) => void,
        value: value?.toString(),
        onKeyDown,
        onPaste,
        ...mask
    });

    const handleChange = useCallback(
        (v: string, e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (type !== "number") {
                onChange(v === "" ? undefined : (v as DomainTypeSingle<T>));
            } else if (v === "") {
                setNumberStringValue("");
                onChange(undefined);
            } else {
                let newNumberStringValue = numberStringValue;

                if (numeral.locale() === "fr") {
                    v = v.replace(".", ",");
                }

                let isNegative = false;
                if (v.startsWith("-") && !noNegativeNumbers) {
                    v = v.substring(1);
                    isNegative = true;
                }

                const {decimal, thousands} = numeral.localeData().delimiters;
                const invalidCharRegex = new RegExp(`[^\\d\\${thousands}\\${decimal}]`, "g");
                const digitDecimalRegex = new RegExp(`[\\d\\${decimal}-]`);
                const [left, right, nope] = v.split(decimal);

                if (
                    ((maxDecimals && (right || "").length <= maxDecimals) || right === undefined) &&
                    nope === undefined &&
                    !invalidCharRegex.exec(v)
                ) {
                    const newValue =
                        (isNegative ? "-" : "") + // Ajoute le "-" s'il faut.
                        (!left && !right
                            ? ""
                            : // On formatte le nombre avec numeral en gardant tous les "0" de tête.
                              numeral(v).format(
                                  range(0, left.replace(new RegExp(thousands, "g"), "").length - 1)
                                      .map(_ => "0")
                                      .join("") + numberFormat
                              )) +
                        (right !== undefined && !+right ? decimal : "") + // Ajoute la virgule si elle était là et a été retirée par le format().
                        (right ? takeWhile(right.split("").reverse(), c => c === "0").join("") : ""); // Ajoute les "0" de fin.
                    const newNumberValue = numeral(newValue).value() ?? undefined;

                    if (!newValue.includes("NaN")) {
                        newNumberStringValue = newValue;
                        setNumberStringValue(newValue);
                        onChange(!!newNumberValue || newNumberValue === 0 ? (newNumberValue as any) : undefined);
                    }
                }

                const end = getInputSelection(e.currentTarget).end - (isNegative ? 1 : 0);
                const ajustedEnd =
                    Math.max(
                        0,
                        v.slice(0, end).replace(invalidCharRegex, "").replace(new RegExp(thousands, "g"), "").length +
                            newNumberStringValue!.split("").filter(c => c === "0").length -
                            v.split("").filter(c => c === "0").length
                    ) + (isNegative ? 1 : 0);

                let charCount = 0;
                const newEnd = newNumberStringValue!.split("").reduce((count, char) => {
                    if (charCount === ajustedEnd) {
                        return count;
                    }
                    if (digitDecimalRegex.exec(char)) {
                        charCount++;
                    }
                    return count + 1;
                }, 0);

                setInputSelection(e.currentTarget, {
                    start: newEnd,
                    end: newEnd
                });
            }
        },
        [maxDecimals, noNegativeNumbers, numberFormat, numberStringValue, onChange, type]
    );

    const finalValue = useMemo(() => {
        if (type === "string") {
            return stringValue;
        } else if (type === "number") {
            return numberStringValue!;
        } else {
            return value?.toString() ?? "";
        }
    }, [numberStringValue, stringValue, value]);

    return (
        <TextField
            {...props}
            ref={ref}
            error={!!error}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            showSupportingText={showSupportingText}
            supportingText={error ?? supportingText}
            type="text"
            value={finalValue}
        />
    );
}) as <T extends DomainFieldType>(
    props: InputProps<T> & {ref?: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
) => ReactElement;
