import { BusroutePattern } from "./BusroutePattern";

export type Pole = {
    id: number;
    urn: string;
    version_no: number;
    busstop_pole_code: string;
    busstop_pole_number: number;
    location: {
        lat: number;
        lng: number;
    };
    name_en: string;
    name_ja: string;
    name_hiragana: string;
    created_at: string;
    route_patterns: BusroutePattern[]|undefined;
    busstop_id: number
};