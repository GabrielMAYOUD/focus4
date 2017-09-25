import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {Button} from "react-toolbox/lib/button";
import Tooltip from "react-toolbox/lib/tooltip";

import {ButtonMenu, getIcon, MenuItem} from "../../../components";

import {PrimaryAction, SecondaryAction} from "../../store";

import {HeaderStyle, styles} from "./types";

const TooltipButton = Tooltip(Button);

/** Props des actions du header. */
export interface HeaderActionsProps {
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Actions principales. */
    primary?: PrimaryAction[];
    /** Actions secondaires. */
    secondary?: SecondaryAction[];
    /** CSS. */
    theme?: HeaderStyle;
}

/** Barre d'actions du header. */
export const HeaderActions = observer<HeaderActionsProps>(({i18nPrefix = "focus", primary = [], secondary = [], theme}) => (
    <div className={theme!.actions}>
        {primary.map((action, i) => {
            const FinalButton = action.tooltip ? TooltipButton : Button;
            return (
                <FinalButton
                    key={`${i}`}
                    floating={true}
                    {...action}
                    icon={getIcon(action.icon, action.iconCustom || false)}
                />
            );
        })}
        {secondary.length > 0 ?
            <ButtonMenu
                button={{
                    floating: true,
                    icon: getIcon(`${i18nPrefix}.icons.headerActions.secondary`)
                }}
                position="topRight"
            >
                {secondary.map((action, i) => <MenuItem key={`${i}`} {...action} icon={getIcon(action.icon, action.iconCustom || false)}  />)}
            </ButtonMenu>
        : null}
    </div>
));

export default themr("header", styles)(HeaderActions);
