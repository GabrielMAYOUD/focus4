import {map} from "lodash";
import * as React from "react";

import Button from "focus-components/button";

import {translate} from "../../translation";

function topicClickHandler(key: string, topicClickAction: (key: string) => void) {
    topicClickAction(key);
}

export function TopicDisplayer({displayLabels = false, topicList = {}, topicClickAction = () => null}: {
    displayLabels?: boolean,
    topicList?: {[key: string]: {code: string, label: string, value: string}},
    topicClickAction?: (key: string) => void
}) {
    return (
        <div data-focus="topic-displayer">
            {map(topicList, (topic, key) => {
                const text = displayLabels ? `${translate(topic.label)}: ${translate(topic.value)}` : translate(topic.value);
                return (
                    <Button
                        handleOnClick={() => {topicClickHandler(key!, topicClickAction);}}
                        icon="clear"
                        key={key!}
                        label={text}
                    />
                );
            })}
        </div>
    );
}
