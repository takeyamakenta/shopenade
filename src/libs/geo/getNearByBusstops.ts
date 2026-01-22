import { signPayload } from "@/libs/auth/signPayload";
import { Busstop } from "@/@types/Busstop";

export const doGetNearbyBusstops = async (lat: number, lng: number, radius: number): Promise<Busstop[]> => {
    const query = `lat=${lat}&lng=${lng}&radius=${radius}&timestamp=${Math.floor(Date.now()/1000)}`;
    const signature = signPayload(query, process.env.SIGN_KEY!);
    console.log(process.env.BACKEND_URL);
    console.log(query);
    const response = await fetch(
        `${process.env.BACKEND_URL}s/v1/busstops/nearby?${query}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Signature": signature,
            },
        }
    );
    console.log(response);
    const data = await response.json();
    return data;
};