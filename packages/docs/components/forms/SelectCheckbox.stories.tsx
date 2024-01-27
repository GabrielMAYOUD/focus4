import {SelectCheckbox} from "@focus4/forms";
import {makeReferenceList} from "@focus4/stores";

import {SelectCheckboxMeta} from "./metas/select-checkbox";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...SelectCheckboxMeta,
    title: "Composants/@focus4∕forms/SelectCheckbox",
    tags: ["autodocs"],
    args: {
        type: "string-array",
        values: makeReferenceList([
            {code: "1", label: "Valeur 1"},
            {code: "2", label: "Valeur 2"}
        ])
    }
} as Meta<typeof SelectCheckbox>;

export const Showcase: StoryObj<typeof SelectCheckbox> = {};
