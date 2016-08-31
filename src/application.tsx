import {observable, action} from "mobx";
import * as React from "react";

export type Mode = "consult" | "edit";

export interface ApplicationAction {
    summary?: React.ReactElement<any>;
    barLeft?: React.ReactElement<any>;
    barRight?: React.ReactElement<any>;
    cartridge?: React.ReactElement<any>;
    actions?: {
        primary?: {icon: string, action: () => void}[];
        secondary?: {label: string, action: () => void}[];
    };
    canDeploy?: boolean;
}

export class ApplicationStore implements ApplicationAction {
    @observable actions: {
        primary?: {icon: string, action: () => void}[],
        secondary?: {label: string, action: () => void}[],
    } = {};
    @observable canDeploy = true;
    @observable mode: {[mode: string]: number} = {};
    @observable route: string;

    @observable barLeft = <div />;
    @observable barRight = <div />;
    @observable cartridge = <div />;
    @observable summary = <div />;

    @action
    changeMode(newMode: Mode, previousMode: Mode) {
        this.mode[newMode] = this.mode[newMode] ? (this.mode[newMode] + 1) : 1;
        this.mode[previousMode] = this.mode[previousMode] ? (this.mode[previousMode] - 1) : 0;
    }

    @action
    clearHeader() {
        this.cartridge = <div />;
        this.barLeft = <div />;
        this.summary = <div />;
        this.actions = {primary: [], secondary: []};
    }

    @action
    setHeader({cartridge, summary, actions, barLeft, canDeploy, barRight}: ApplicationAction, isPartial?: boolean) {
        if (!isPartial) {
            this.cartridge = cartridge || <div />;
            this.summary = summary || <div />;
            this.actions = actions || {primary: [], secondary: []};
            this.barLeft = barLeft || <div />;
            this.canDeploy = canDeploy === undefined ? true : canDeploy;
        } else {
            if (cartridge) {
                this.cartridge = cartridge;
            }
            if (summary) {
                this.summary = summary;
            }
            if (actions) {
                this.actions = actions;
            }
            if (barLeft) {
                this.barLeft = barLeft;
            }
            if (canDeploy) {
                this.canDeploy = canDeploy;
            }
        }

        if (barRight) {
            this.barRight = barRight;
        }
    }
}
