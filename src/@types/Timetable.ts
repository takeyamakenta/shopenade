import { OneShotNotificationSchedule } from "./OneShotNotificationSchedule";
import { Pole } from "./Pole";

export type Timetable = {
    id: number;
    version_no: number;
    trip_id: number;
    pole_id: number;
    arrival_clock: string;
    departure_clock: string;
    arrival_time: string;
    sequence: number;
    note: string;
    created_at: string;
    pole: Pole|undefined;
    one_shot_notification_schedules: OneShotNotificationSchedule[]|undefined;
    arrival_timestamp: number;
    departure_timestamp: number;
};