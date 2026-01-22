import { Pole } from "./Pole";

export type Busstop = {
    id: number;
    version_no: number;
    busstop_code: string;
    location: {
        lat: number;
        lng: number;
    };
    name_en: string;
    name_ja: string;
    name_hiragana: string;
    alphabet: string;
    hiragana: string;
    created_at: string;
    poles: Pole[]|undefined;
};