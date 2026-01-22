export type OneShotNotificationSchedule = {
    id: number;
    version_number: number;
    start_timetable_id: number;
    end_timetable_id: number;
    timetable_former_at: string;
    timetable_former_mins: number;
    start_at: string;
    end_at: string;
    created_at: string;
};