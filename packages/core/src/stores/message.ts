import {isString} from "lodash";
import {action, makeObservable, observable} from "mobx";
import {v4} from "uuid";

/** Description d'un message. */
export interface Message {
    id?: string;
    content: string;
    type?: "error" | "info" | "success" | "warning";
}

/** Store de messages */
export class MessageStore {
    /** Objet contenant tous les messages reçus. */
    @observable data: {[id: string]: Message} = {};
    /** Dernier message reçu. */
    @observable latestMessage?: Message;

    constructor() {
        makeObservable(this);
    }

    /**
     * Ajoute un message sans type.
     * @param message Le message.
     */
    @action.bound
    addMessage(message: Message | string) {
        const id = v4();
        this.data[id] = parseString(message);
        this.latestMessage = this.data[id];
    }

    /**
     * Ajoute un message d'avertissement.
     * @param message Le message.
     */
    @action.bound
    addWarningMessage(message: Message | string) {
        message = parseString(message);
        message.type = "warning";
        this.addMessage(message);
    }

    /**
     * Ajoute un message d'information.
     * @param message Le message.
     */
    @action.bound
    addInformationMessage(message: Message | string) {
        message = parseString(message);
        message.type = "info";
        this.addMessage(message);
    }

    /**
     * Ajoute un message d'erreur.
     * @param message Le message.
     */
    @action.bound
    addErrorMessage(message: Message | string) {
        message = parseString(message);
        message.type = "error";
        this.addMessage(message);
    }

    /**
     * Ajoute un message de succès.
     * @param message Le message.
     */
    @action.bound
    addSuccessMessage(message: Message | string) {
        message = parseString(message);
        message.type = "success";
        this.addMessage(message);
    }
}

/**
 * Formatte un message entrant.
 * @param message Le message.
 */
function parseString(message: Message | string) {
    if (isString(message)) {
        message = {content: message};
    }
    return message;
}

/** Instance principale du MessageStore. */
export const messageStore = new MessageStore();
