import { LocateFixed } from "lucide-solid";
import {
    APIProvider,
    AdvancedMarker,
    Map,
    MapCameraChangedEvent,
} from "solid-google-maps";
import { For, Show, createSignal } from "solid-js";

import { query } from "@solidjs/router";

import { Busstop } from "@/@types/Busstop";
import { Pole } from "@/@types/Pole";
import { Button } from "@/components/ui/button";
import NavHeader from "@/layouts/NavHeader";
import NavFooter from "@/layouts/NavFooter";
import { getNearByBusstops } from "@/libs/RPCs/geo/getNearByBusstops";
import { getNearByPoles } from "@/libs/RPCs/geo/getNearByPoles";
import { useNavigate } from "@solidjs/router";

const POLE_BUSSTOP_BOUNDARY_ZOOM_LEVEL = 17;

const initData = query(async () => {
    "use server";
}, "tasks");

export const route = {
    preload: () => initData(),
};

const [currentZoomLevel, setCurrentZoomLevel] = createSignal<number>(15);

const [center, setCenter] = createSignal<google.maps.LatLngLiteral>({
    lat: 35.68114,
    lng: 139.7673068,
});

const [currentLocation, setCurrentLocation] =
    createSignal<google.maps.LatLngLiteral | null>(null);
const [isCurrentLocationCentered, setIsCurrentLocationCentered] =
    createSignal<boolean>(false);
const [currentLocationTask, setCurrentLocationTask] =
    createSignal<NodeJS.Timeout | null>(null);

const [timer, setTimer] = createSignal<NodeJS.Timeout | null>(null);
const TIMER_INTERVAL = 500;
const CURRENT_LOCATION_INTERVAL = 1000;

const handleCenterChanged = async (event: MapCameraChangedEvent) => {
    if (timer()) {
        clearTimeout(timer()!);
        setTimer(
            setTimeout(async () => {
                setTimer(null);
                setCenter({
                    lat: event.detail.center.lat,
                    lng: event.detail.center.lng,
                });
                setCurrentZoomLevel(event.detail.zoom);
                if (currentZoomLevel() >= POLE_BUSSTOP_BOUNDARY_ZOOM_LEVEL) {
                    const data = await getNearByPoles(
                        center().lat,
                        center().lng,
                        1000
                    );
                    setNearestBusstops([]);
                    setNearestPoles(data);
                } else {
                    const data = await getNearByBusstops(
                        center().lat,
                        center().lng,
                        1000
                    );
                    setNearestPoles([]);
                    setNearestBusstops(data);
                }
            }, TIMER_INTERVAL)
        );
    } else {
        setCenter({
            lat: event.detail.center.lat,
            lng: event.detail.center.lng,
        });
        setCurrentZoomLevel(event.detail.zoom);
        if (currentZoomLevel() >= POLE_BUSSTOP_BOUNDARY_ZOOM_LEVEL) {
            const data = await getNearByPoles(center().lat, center().lng, 1000);
            setNearestBusstops([]);
            setNearestPoles(data);
        } else {
            const data = await getNearByBusstops(
                center().lat,
                center().lng,
                1000
            );
            setNearestPoles([]);
            setNearestBusstops(data);
        }
        setTimer(
            setTimeout(() => {
                setTimer(null);
            }, TIMER_INTERVAL)
        );
    }
};

const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        console.log({ position });
        setIsCurrentLocationCentered(true);
        setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        });
        setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        });
        setImmediate(() => {
            setIsCurrentLocationCentered(false);
        });
        if (!currentLocationTask()) {
            setCurrentLocationTask(
                setInterval(() => {
                    navigator.geolocation.getCurrentPosition((position) => {
                        setCurrentLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    });
                }, CURRENT_LOCATION_INTERVAL)
            );
        }
    });
};
const [nearestPoles, setNearestPoles] = createSignal<Pole[]>([]);
const [nearestBusstops, setNearestBusstops] = createSignal<Busstop[]>([]);
export default function SearchByMap() {
    const navigate = useNavigate();
    return (
        <>
            <NavHeader />
            <APIProvider
                apiKey={import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY}
            >
                <Map
                    style={{ width: "100%", height: "calc(100vh - 4rem)" }}
                    defaultZoom={currentZoomLevel()}
                    defaultCenter={center()}
                    gestureHandling={"greedy"}
                    disableDefaultUI={true}
                    center={
                        isCurrentLocationCentered()
                            ? currentLocation()
                            : undefined
                    }
                    onCenterChanged={(event) => {
                        handleCenterChanged(event);
                    }}
                    mapId={import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_MAP_ID}
                />
                <Show
                    when={
                        currentZoomLevel() >= POLE_BUSSTOP_BOUNDARY_ZOOM_LEVEL
                    }
                >
                    <For each={Array.from(nearestPoles() ?? []).filter(pole => pole.location?.lat && pole.location?.lng)}>
                        {(pole) => (
                            <AdvancedMarker
                                position={{
                                    lat: pole.location?.lat,
                                    lng: pole.location?.lng,
                                }}
                            >
                                <div class="flex flex-col items-center justify-center">
                                    <p class="text-sm flex-nowrap">{pole.name_ja} <span class="font-bold">({pole.busstop_pole_number})</span></p>
                                    <img
                                        class="h-12 w-12"
                                        src="/images/buspole.svg"
                                        alt={pole.name_hiragana}
                                        onClick={() => {
                                            navigate(`/busstop?id=${pole.busstop_id}`);
                                        }}
                                    />
                                </div>
                            </AdvancedMarker>
                        )}
                    </For>
                </Show>
                <Show
                    when={currentZoomLevel() < POLE_BUSSTOP_BOUNDARY_ZOOM_LEVEL}
                >
                    <For each={Array.from(nearestBusstops() ?? []).filter(busstop => busstop.location?.lat && busstop.location?.lng)}>
                        {(busstop) => (
                            <AdvancedMarker
                                position={{
                                    lat: busstop.location?.lat,
                                    lng: busstop.location?.lng,
                                }}
                            >
                                <div class="flex flex-col items-center justify-center">
                                    <p>{busstop.name_ja}</p>
                                    <img
                                        class="h-12 w-12"
                                        src="/images/busstop.svg"
                                        alt={busstop.name_hiragana}
                                        onClick={() => {
                                            navigate(`/busstop?id=${busstop.id}`);
                                        }}  
                                    />
                                </div>
                            </AdvancedMarker>
                        )}
                    </For>
                </Show>
                <Show when={currentLocation()}>
                    <AdvancedMarker position={currentLocation()!}>
                        <img
                            class="h-6 w-6"
                            src="/images/current.svg"
                            alt="currentLocation"
                        />
                    </AdvancedMarker>
                </Show>
            </APIProvider>
            <Button
                variant="primary"
                size="icon"
                class="absolute bottom-[80px] right-[10px] z-[infinity]"
                onClick={handleCurrentLocation}
            >
                <LocateFixed />
            </Button>
            <NavFooter />
        </>
    );
}
