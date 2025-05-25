
import { parse } from 'date-fns';

export const formatStringDate = (dateString: string) => {
    // converst string datato date type
    const date = parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", new Date())
    return date
}