import * as React from "react";

import {HeaderActions} from "./actions";
import {HeaderContent} from "./content";
import {HeaderScrolling} from "./scrolling";
import {HeaderTopRow} from "./top-row";

import {injectStyle} from "../../../theming/inject-style";

import styles from "./style/header.css";
export type HeaderStyle = typeof styles;

export const Header = injectStyle("header",
    ({classNames}: {classNames?: HeaderStyle}) => {
        return (
            <HeaderScrolling classNames={{
                deployed: `${styles.deployed} ${classNames!.deployed || ""}`,
                scrolling: `${styles.scrolling} ${classNames!.scrolling || ""}`,
                undeployed: `${styles.undeployed} ${classNames!.undeployed || ""}`
            }}>
                <HeaderTopRow classNames={{
                    item: `${styles.item} ${classNames!.item || ""}`,
                    left: `${styles.left} ${classNames!.left || ""} `,
                    middle: `${styles.middle} ${classNames!.middle || ""}`,
                    right: `${styles.right} ${classNames!.right || ""}`,
                    topRow: `${styles.topRow} ${classNames!.topRow || ""}`
                }} />
                <HeaderContent className={`${styles.content} ${classNames!.content || ""}`} />
                <HeaderActions className={`${styles.actions} ${classNames!.actions || ""}`} />
            </HeaderScrolling>
        );
    }
);
