/// <reference types="react" />

declare type ReactComponent<P> = React.ComponentClass<P> | ((props: P) => React.ReactElement<any>);

declare module "focus-components/autocomplete-select" {
    export interface AutoCompleteItem {
        key: string;
        label: string;
    }

    export interface AutoCompleteResult {
        data: AutoCompleteItem[];
        totalCount: number;
    }

    export default class AutocompleteSelectField extends React.Component<{
        error?: string;
        inputTimeout?: number;
        isEdit?: boolean;
        keyName?: string;
        keyResolver: (code: string | number) => Promise<string>;
        label?: string;
        labelName?: string;
        name?: string;
        onChange?: (code: string) => void;
        placeholder?: string;
        querySearcher: (text: string) => Promise<AutoCompleteResult>;
        type?: string;
        value?: string;
    }, {}> {}
}

declare module "focus-components/autocomplete-text/field" {
    export interface AutoCompleteItem {
        key: string;
        label: string;
    }

    export interface AutoCompleteResult {
        data: AutoCompleteItem[];
        totalCount: number;
    }

    export default class AutocompleteTextField extends React.Component<{
        emptyShowAll?: boolean;
        error?: string;
        isEdit?: boolean;
        label?: string;
        name?: string;
        onChange?: (code: string) => void;
        placeholder?: string;
        querySearcher: (text: string) => Promise<AutoCompleteResult>;
        showAtFocus?: boolean;
        type?: string;
        value?: string;
    }, {}> {}
}

declare module "focus-components/button" {
    interface ButtonProps {
        className?: string;
        color?: "colored" | "primary" | "accent";
        disabled?: boolean;
        handleOnClick: (e?: React.SyntheticEvent<any>) => void;
        hasRipple?: boolean;
        icon?: string;
        iconLibrary?: "material" | "font-awesome" | "font-custom";
        id?: string;
        isJs?: boolean;
        label?: string;
        shape?: "raised" | "fab" | "icon" | "mini-fab";
        style?: React.CSSProperties;
        type?: "button" | "submit";
    }

    export default class Button extends React.Component<ButtonProps, {}> {}
}

declare module "focus-components/button-back" {
    export default function ButtonBack(props: {
        back: () => void;
    }): React.ReactElement<any>
}

declare module "focus-components/button-back-to-top" {
    export default class ButtonBackToTop extends React.Component<{}, {}> {}
}

declare module "focus-components/confirmation-popin" {
    export default class ConfirmationModal extends React.Component<{
        cancelButtonLabel?: string;
        cancelHandler?: () => void;
        confirmButtonLabel?: string;
        confirmHandler?: () => void;
        open?: boolean;
    }, {}> {
        toggleOpen(): void
    }
}

declare module "focus-components/draggable-iframe" {
    export default class DraggableIframe extends React.Component<{
        iframeUrl: string;
        width: number;
        height: number;
        title: string;
        toggleFunctionName?: string;
        queryUrl?: string[]
    }, {
        xPos?: number;
        yPos?: number;
        xElem?: number;
        yElem?: number;
        selected?: HTMLElement;
    }> {
        dragInit: (e: MouseEvent) => void;
        moveElem: (e: MouseEvent) => void;
        destroy: (e: MouseEvent) => void;
        helpFrame: HTMLIFrameElement;
    }
}

declare module "focus-components/dropdown" {
    export interface DropdownItem {
        action: (data?: {}) => void;
        label?: string;
        style?: string;
    }

    export default class Dropdown extends React.Component<{
        button?: {
            icon?: string;
            label?: string;
            shape?: "raised" | "fab" | "icon" | "mini-fab"
        };
        operationParam?: {};
        operations: DropdownItem[];
        position?: {
            horizontal?: "left" | "right";
            vertical?: "top" | "bottom";
        };
    }, {}> {}
}

declare module "focus-components/icon" {
    export default function Icon(props: {
        library?: "material" | "font-awesome" | "font-custom";
        name: string;
        onClick?: (e: React.MouseEvent<any>) => void;
        style?: {};
    }): React.ReactElement<any>
}

declare module "focus-components/input-checkbox" {
    export default class InputCheckBox extends React.Component<{
        disabled?: boolean;
        label?: string;
        name?: string;
        onChange: () => void;
        value?: boolean;
    }, {}> {
        getValue(): boolean
    }
}

declare module "focus-components/input-date" {
    export default class Date extends React.Component<{
        beforeValueGetter?: (date: string) => string;
        disabled?: boolean;
        drops?: "up" | "down";
        error?: string;
        locale?: string;
        name: string;
        onChange: (date: string) => void;
        placeholder?: string;
        showDropdowns?: boolean;
        validate?: (date: string) => boolean;
        value?: string;
    }, {}> {
        getValue(): string
    }
}

declare module "focus-components/input-display/text" {
    export default function DisplayText(props: {
        formatter?: (text: string) => string;
        style?: string;
        value?: string | number;
    }): React.ReactElement<any>
}

declare module "focus-components/input-radio" {
    export default class Radio extends React.Component<{
        label: string;
        name?: string;
        onChange?: (checked: boolean) => void;
        value?: boolean;
    }, {}> {
        getValue(): boolean
    }
}

declare module "focus-components/input-text" {
    export default class InputText extends React.Component<{
        autoFocus?: boolean;
        disabled?: boolean;
        error?: string;
        formatter?: (text: string | number) => string;
        maxLength?: number;
        name: string;
        onChange: (value: string) => void;
        onClick?: (e: React.SyntheticEvent<HTMLInputElement>) => void;
        onFocus?: (e: React.SyntheticEvent<HTMLInputElement>) => void;
        onKeyDown?: (e: React.SyntheticEvent<HTMLInputElement>) => void;
        onKeyPress?: (e: React.SyntheticEvent<HTMLInputElement>) => void;
        placeholder?: string;
        size?: number;
        type?: string;
        unformatter?: (text: string) => string | number;
        value?: string | number;
    }, {}> {
        getValue(): string | number;
    }
}

declare module "focus-components/input-textarea" {
    export default class InputTextarea extends React.Component<{
        autoFocus?: boolean;
        cols?: number;
        disabled?: boolean;
        error?: string;
        formatter?: (text: string) => string;
        maxLength?: number;
        minLength?: number;
        name: string;
        onChange: (value: string) => void;
        onClick?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
        onFocus?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
        onKeyPress?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
        placeholder?: string;
        rows?: number;
        size?: number;
        type?: string;
        unformatter?: (text: string) => string;
        value?: string;
        wrap?: string;
    }, {}> {
        getValue(): string;
    }
}

declare module "focus-components/label" {
    export default function Label(props: {
        name: string;
        text?: string;
    }): React.ReactElement<any>
}

declare module "focus-components/menu" {
    export interface MenuItem {
        icon?: string;
        label?: string;
        route?: string;
        subMenus?: MenuItem[];
    }

    export default function MenuLeft(props: {
        handleBrandClick?: () => void;
        LinkComponent?: ReactComponent<{to: string}>;
        menus: MenuItem[];
        showLabels?: boolean;
        showPanel?: boolean;
    }): React.ReactElement<any>
}

declare module "focus-components/panel" {
    export interface PanelButtonsProps {
        editing?: boolean;
        getUserInput?: () => {};
        toggleEdit?: (edit: boolean) => void;
        save?: (data: {}) => void;
    }

    export default class Panel extends React.Component<{
        blockName?: string;
        Buttons?: ReactComponent<PanelButtonsProps>;
        buttonsPosition?: "both" | "bottom" | "top";
        showHelp?: boolean;
        title?: string;
    } & PanelButtonsProps, {}> {}
}

declare module "focus-components/scrollspy-container" {
    export default class ScrollspyContainer extends React.Component<{
        hasBackToTop?: boolean;
        hasMenu?: boolean;
        offset?: number;
        scrollDelay?: number;
    }, {}> {}
}

declare module "focus-components/select-mdl" {
    export default class Select extends React.Component<{
        autoFocus?: boolean;
        disabled?: boolean;
        error?: string;
        hasUndefined?: boolean;
        isActiveProperty?: string;
        isRequired?: boolean;
        labelKey?: string;
        name: string;
        onChange: (value: string | number) => void;
        placeholder?: string;
        size?: number;
        style?: React.CSSProperties;
        unSelectedLabel?: string;
        value?: string | number;
        valueKey?: string;
        values: {}[];
    }, {}> {
        getValue(): string | number;
    }
}

declare module "focus-components/select-radio" {
    export default class SelectRadio extends React.Component<{
        disabled?: boolean;
        labelKey?: string;
        onChange?: (value: string | number) => void;
        value?: string | number;
        valueKey?: string;
        values: {}[];
    }, {}> {
        getValue(): string | number;
    }
}

declare module "focus-components/snackbar" {
    export interface SnackbarProps {
        actionHandler?: (props?: SnackbarProps) => void;
        actionText?: string;
        content: string;
        deleteMessage: () => void;
    }

    export default function Snackbar(props: SnackbarProps): React.ReactElement<any>
}
