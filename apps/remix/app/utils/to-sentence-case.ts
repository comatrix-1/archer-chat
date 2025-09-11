export const toSentenceCase = (value: string): string => {
    return value
        .toLowerCase()
        .split("_")
        .map((word, index) =>
            index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
        )
        .join("-");
};