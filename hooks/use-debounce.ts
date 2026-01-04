import { useEffect, useRef, useState } from "react";

export const useDebounce = (value: string, delay: number) => {

    const [debounceValue, setDebounceValue] = useState("");
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            if (value === "") {
                return;
            }
        }

        const timer = setTimeout(() => {
            setDebounceValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounceValue;

}