
export function isEmptyOrInvalidDate(val: any): boolean {
    return (
        !val ||
        (typeof val === "string" && val.trim() === "") ||
        val.toString().toLowerCase() === "present" ||
        (typeof val === "string" && Number.isNaN(Date.parse(val)))
    );
}

export function formatDateString(dateStr: string): string | null {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
    }

    if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return new Date(`${dateStr}-01T00:00:00.000Z`).toISOString();
    }

    return null;
}

export function formatDateValue(val: any): string | null {
    if (isEmptyOrInvalidDate(val)) {
        return null;
    }

    if (typeof val === "string") {
        const formatted = formatDateString(val);
        if (formatted) {
            return formatted;
        }
    }

    try {
        return new Date(val).toISOString();
    } catch (e) {
        console.error(`Failed to parse date value: ${val}`, e);
        return null;
    }
}

function processObject(obj: any, dateFields: string[]): any {
    if (!obj || typeof obj !== "object") return obj;

    const result = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in result) {
        if (dateFields.includes(key)) {
            result[key] = formatDateValue(result[key]);
        } else if (Array.isArray(result[key])) {
            result[key] = processObject(result[key], dateFields);
        } else if (result[key] && typeof result[key] === "object") {
            result[key] = processObject(result[key], dateFields);
        }
    }

    return result;
}

export function sanitizeDates(obj: any) {
    const dateFields = [
        "startDate",
        "endDate",
        "issueDate",
        "expirationDate",
        "expiryDate",
        "date",
    ];
    return processObject(obj, dateFields);
}