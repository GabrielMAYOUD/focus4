import {autobind} from "core-decorators";
import i18n from "i18next";
import {observable, reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle} from "../theming";

import {Message, messageStore} from "./store";

import * as styles from "./style/message-center.css";
export type MessageCenterStyle = Partial<typeof styles>;

export interface MessageCenterProps {
    classNames?: MessageCenterStyle;
    error?: number;
    info?: number;
    success?: number;
    warning?: number;
}

const ANIMATION_LENGTH = 250;

interface Notification {
    type?: string;
    content: string;
    timeout: number;
}

@injectStyle("messageCenter")
@autobind
@observer
export class MessageCenter extends React.Component<MessageCenterProps, void> {

    @observable active = false;

    private cleanupTimeout: any = null;
    private currentNotification?: Notification;
    private queuedNotifications: Notification[] = [];
    private reaction = reaction(() => messageStore.latestMessage, this.handlePushMessage);

    componentWillUnmount() {
        this.reaction();
    }

    checkQueue() {
        if (this.queuedNotifications.length > 0) {
            this.showSnackbar(this.queuedNotifications.shift()!);
        }
    }

    forceCleanup() {
        clearTimeout(this.cleanupTimeout);
        this.cleanup();
    }

    cleanup() {
        this.cleanupTimeout = null;
        this.active = false;
        setTimeout(this.checkQueue, ANIMATION_LENGTH);
    }

    handlePushMessage(message: Message) {
        const {content, type} = message;
        const {error = 8000, info = 3000, success = 3000, warning = 3000} = this.props;
        const timeout = type === "error" ? error : type === "info" ? info : type === "success" ? success : warning;
        this.showSnackbar({type, content, timeout});
    }

    private showSnackbar(data: Notification) {
        if (this.active) {
            this.queuedNotifications.push(data);
        } else {
            this.currentNotification = data;
            this.active = true;
            this.cleanupTimeout = setTimeout(this.cleanup, data.timeout);
        }
    }

    render() {
        const {classNames} = this.props;
        const {content = "", type = ""} = this.currentNotification || {};
        const otherProps = { "aria-hidden": this.active, "aria-live": "assertive", "aria-atomic": "true", "aria-relevant": "text" };
        return (
            <div className={`${styles.center} ${classNames!.center || ""} mdl-snackbar ${this.active ? "mdl-snackbar--active" :  ""} ${type === "error" ? `${styles.error} ${classNames!.error || ""}` : type === "success" ? `${styles.success} ${classNames!.success || ""}` : type === "warning" ? `${styles.warning} ${classNames!.warning || ""}` : ""}`} {...otherProps}>
                <div className="mdl-snackbar__text">{content.includes(" ") ? content : i18n.t(content)}</div>
                <button className="mdl-snackbar__close" type="button" onClick={this.forceCleanup}><i className="material-icons">clear</i></button>
            </div>
        );
    }
}
