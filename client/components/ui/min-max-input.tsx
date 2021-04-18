import React, {
    useState,
    useImperativeHandle,
    ChangeEvent,
    useCallback,
    useLayoutEffect,
} from 'react';

import { Range } from 'rc-slider';

import 'rc-slider/assets/index.css';
import './min-max-input.css';

interface MinMaxInputProps {
    // A function called when the input changes: onChange(lowValue, highValue).
    onChange: (min: number | null, max: number | null) => void;

    // The minimum value that can be selected by the user.
    min: number;

    // The maximum value that can be selected by the user.
    max: number;

    // The current low value selected by the user. Starts defined as the min,
    // may change as the user tweaks it.
    low: number | null;

    // The current high value selected by the user. Starts defined as the max,
    // may change as the user tweaks it.
    high: number | null;
}

export interface MinMaxInputRef {
    clear: () => void;
}

const MinMaxInput = React.forwardRef<MinMaxInputRef, MinMaxInputProps>((props, ref) => {
    const currentLow = props.low || props.min;
    const currentMax = props.high || props.max;
    const [lowText, setLowText] = useState<string>(`${currentLow}`);
    const [lowNumber, setLowNumber] = useState<number>(currentLow);
    const [highText, setHighText] = useState<string>(`${currentMax}`);
    const [highNumber, setHighNumber] = useState<number>(currentMax);

    const [prevMin, setPrevMin] = useState<number>(props.min);
    const [prevMax, setPrevMax] = useState<number>(props.max);

    // On every mount/update, if the previous value of props.{min, max} doesn't
    // match what we've had, then we've *probably* changed the view. It's
    // imprecise if two views have the same min/max values, but that's the best
    // we can do, and it's unlikely to happen.
    useLayoutEffect(() => {
        let changed = false;
        if (prevMin !== props.min) {
            setLowNumber(props.min);
            setLowText(`${props.min}`);
            setPrevMin(props.min);
            changed = true;
        }
        if (prevMax !== props.max) {
            setHighNumber(props.max);
            setHighText(`${props.max}`);
            setPrevMax(props.max);
            changed = true;
        }
        if (changed) {
            // Propagate the change up, by clearing the search. Ideally the
            // above form would just contain all the form search, but oh
            // well...
            props.onChange(null, null);
        }
    }, [props, prevMin, prevMax]);

    // Expose clear() through the reference.
    useImperativeHandle(ref, () => ({
        clear() {
            setLowText(`${props.min}`);
            setLowNumber(props.min);
            setHighText(`${props.max}`);
            setHighNumber(props.max);
        },
    }));

    const { onChange } = props;
    // Aggregated helpers.
    const updateLow = useCallback(
        (newVal: number) => {
            if (newVal !== lowNumber) {
                setLowNumber(newVal);
                setLowText(`${newVal}`);
                onChange(newVal, highNumber);
            }
        },
        [setLowNumber, lowNumber, setLowText, highNumber, onChange]
    );

    const updateHigh = useCallback(
        (newVal: number) => {
            if (newVal !== highNumber) {
                setHighNumber(newVal);
                setHighText(`${newVal}`);
                onChange(lowNumber, newVal);
            }
        },
        [setHighNumber, setHighText, lowNumber, onChange, highNumber]
    );

    const validateLow = useCallback(
        (newLow: number) => {
            // Don't allow a value larger than the highValue or smaller than the
            // props.min.
            updateLow(Math.min(highNumber, Math.max(newLow, props.min)));
        },
        [highNumber, updateLow, props.min]
    );

    const validateHigh = useCallback(
        (newHigh: number) => {
            // Don't allow a value smaller than the lowValue or bigger than the
            // props.max.
            updateHigh(Math.max(lowNumber, Math.min(newHigh, props.max)));
        },
        [updateHigh, lowNumber, props.max]
    );

    // Event handlers.
    const handleLow = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newVal = event.target.value;
            const newLow = Number.parseFloat(newVal);
            if (Number.isNaN(newLow)) {
                // Just update the text field; the user might be typing something.
                setLowText(newVal);
            } else {
                // Update in real-time, from a click on the arrows or a real-time
                // input.
                validateLow(newLow);
            }
        },
        [setLowText, validateLow]
    );

    const handleLowBlur = useCallback(() => {
        const newLow = Number.parseFloat(lowText);
        if (Number.isNaN(newLow)) {
            // Reset to the previous value.
            setLowText(`${lowNumber}`);
        } else {
            validateLow(newLow);
        }
    }, [lowText, setLowText, lowNumber, validateLow]);

    const handleHigh = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newVal = event.target.value;
            const newHigh = Number.parseFloat(newVal);
            if (Number.isNaN(newHigh)) {
                // Just update the text field; the user might be typing something.
                setHighText(newVal);
            } else {
                // Update in real-time, from a click on the arrows or a real-time
                // input.
                validateHigh(newHigh);
            }
        },
        [setHighText, validateHigh]
    );

    const handleHighBlur = useCallback(() => {
        const newHigh = Number.parseFloat(highText);
        if (Number.isNaN(newHigh)) {
            // Reset to the previous value.
            setHighText(`${highNumber}`);
        } else {
            validateHigh(newHigh);
        }
    }, [highText, setHighText, validateHigh, highNumber]);

    const handleSlider = useCallback(
        (values: number[]) => {
            // Only one slider value can be changed at a time.
            if (values[0] !== Infinity && values[0] !== lowNumber) {
                updateLow(values[0]);
            } else if (values[1] !== Infinity && values[1] !== highNumber) {
                updateHigh(values[1]);
            }
        },
        [highNumber, lowNumber, updateHigh, updateLow]
    );

    return (
        <div className="min-max-input">
            <input
                type="number"
                min={props.min}
                max={highNumber}
                data-type="low"
                value={lowText}
                onChange={handleLow}
                onBlur={handleLowBlur}
            />

            <Range
                allowCross={false}
                min={props.min}
                max={props.max}
                value={[lowNumber, highNumber]}
                onChange={handleSlider}
            />

            <input
                type="number"
                min={lowNumber}
                max={props.max}
                data-type="high"
                value={highText}
                onChange={handleHigh}
                onBlur={handleHighBlur}
            />
        </div>
    );
});

export default MinMaxInput;
