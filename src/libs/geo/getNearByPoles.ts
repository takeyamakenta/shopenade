import { signPayload } from "@/libs/auth/signPayload";
import { Pole } from "@/@types/Pole";

export const doGetNearbyPoles = async (lat: number, lng: number, radius: number): Promise<Pole[]> => {
    const query = `lat=${lat}&lng=${lng}&radius=${radius}&timestamp=${Math.floor(Date.now()/1000)}`;
    const signature = signPayload(query, process.env.SIGN_KEY!);
    const response = await fetch(
        `${process.env.BACKEND_URL}s/v1/poles/nearby?${query}`,
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
    console.log({data});
    return data;
};