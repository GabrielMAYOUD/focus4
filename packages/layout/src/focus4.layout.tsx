import {CSSContext, CSSProp, ThemeContext} from "@focus4/styling";
import {
    AutocompleteCss,
    ButtonCss,
    CalendarCss,
    CheckboxCss,
    ChipCss,
    ClockCss,
    DropdownCss,
    FloatingActionButtonCss,
    IconButtonCss,
    InputCss,
    MenuCss,
    ProgressBarCss,
    RadioCss,
    RippleCss,
    SliderCss,
    SnackbarCss,
    SwitchCss,
    TabsCss,
    TooltipCss
} from "@focus4/toolbox";

import {HeaderCss} from "./header";
import {MainMenuCss} from "./menu";
import {DialogCss, LayoutBase, LayoutCss, LayoutProps, OverlayCss, PopinCss, ScrollspyCss} from "./presentation";
import {ButtonBttCss, ScrollableCss} from "./scrollable";
import {LoadingBarCss} from "./utils";

export {
    HeaderActions,
    HeaderBarLeft,
    HeaderBarRight,
    HeaderContent,
    HeaderCss,
    HeaderScrolling,
    HeaderSummary,
    HeaderTopRow,
    PrimaryAction,
    SecondaryAction,
    headerCss
} from "./header";
export {MainMenu, MainMenuItem, MainMenuProps, MainMenuCss, mainMenuCss} from "./menu";
export {
    Content,
    Dialog,
    DialogCss,
    LayoutBase,
    LayoutProps,
    LayoutCss,
    OverlayCss,
    Popin,
    PopinCss,
    ScrollspyContainer,
    ScrollspyCss,
    dialogCss,
    layoutCss,
    overlayCss,
    popinCss,
    scrollspyCss
} from "./presentation";
export {ButtonBttCss, Scrollable, ScrollableProps, ScrollableCss, buttonBttCss, scrollableCss} from "./scrollable";
export {translation} from "./translation";
export {LoadingBar, LoadingBarCss, MessageCenter, MessageCenterProps, loadingBarCss} from "./utils";

/** Contient l'ensemble des classes CSS surchargeables (elles le sont toutes), regroupées par composant. */
export interface LayoutStyleProviderProps {
    actionBar?: {};
    advancedSearch?: {};
    autocomplete?: {};
    booleanRadio?: {};
    buttonBTT?: CSSProp<ButtonBttCss>;
    contextualActions?: {};
    dialog?: CSSProp<DialogCss>;
    display?: {};
    dragLayer?: {};
    facet?: {};
    facetBox?: {};
    field?: {};
    form?: {};
    group?: {};
    header?: CSSProp<HeaderCss>;
    inputDate?: {};
    inputTime?: {};
    label?: {};
    layout?: CSSProp<LayoutCss>;
    loadingBar?: CSSProp<LoadingBarCss>;
    list?: {};
    listBase?: {};
    mainMenu?: CSSProp<MainMenuCss>;
    overlay?: CSSProp<OverlayCss>;
    panel?: {};
    popin?: CSSProp<PopinCss>;
    scrollable?: CSSProp<ScrollableCss>;
    scrollspy?: CSSProp<ScrollspyCss>;
    searchBar?: {};
    select?: {};
    selectCheckbox?: {};
    selectRadio?: {};
    summary?: {};
    table?: {};
    timeline?: {};

    RTAutocomplete?: CSSProp<AutocompleteCss>;
    button?: CSSProp<ButtonCss>;
    RTCalendar?: CSSProp<CalendarCss>;
    checkbox?: CSSProp<CheckboxCss>;
    chip?: CSSProp<ChipCss>;
    RTClock?: CSSProp<ClockCss>;
    RTDropdown?: CSSProp<DropdownCss>;
    floatingActionButton?: CSSProp<FloatingActionButtonCss>;
    iconButton?: CSSProp<IconButtonCss>;
    RTInput?: CSSProp<InputCss>;
    RTMenu?: CSSProp<MenuCss>;
    RTProgressBar?: CSSProp<ProgressBarCss>;
    radio?: CSSProp<RadioCss>;
    ripple?: CSSProp<RippleCss>;
    RTSlider?: CSSProp<SliderCss>;
    RTSnackbar?: CSSProp<SnackbarCss>;
    switch?: CSSProp<SwitchCss>;
    RTTabs?: CSSProp<TabsCss>;
    tooltip?: CSSProp<TooltipCss>;
}

/**
 * Composant racine d'une application Focus, contient les composants transverses comme le header, le menu ou le centre de message.
 *
 * C'est également le point d'entrée pour la surcharge de CSS via la prop `appTheme`.
 */
export function Layout(props: LayoutProps & {appTheme?: LayoutStyleProviderProps}) {
    const {appTheme = {}, ...layoutProps} = props;
    return (
        <ThemeContext.Provider value={appTheme as CSSContext}>
            <LayoutBase {...layoutProps} />
        </ThemeContext.Provider>
    );
}
