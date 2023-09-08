import { Random } from 'random'

// Random with a pre-defined seed
export const random = (new Random()).clone('42')
