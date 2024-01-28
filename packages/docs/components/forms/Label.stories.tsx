import {Label} from "@focus4/forms";

import {LabelMeta} from "./metas/label";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...LabelMeta,
    title: "Composants/@focus4∕forms/Label",
    tags: ["autodocs"],
    args: {label: "Label", showTooltip: true, comment: "Une tooltip"}
} as Meta<typeof Label>;

export const Showcase: StoryObj<typeof Label> = {};
