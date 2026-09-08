import { isEqual } from '@unovis/ts';
export function arePropsEqual(prevProps, nextProps) {
    return isEqual(prevProps, nextProps);
}
