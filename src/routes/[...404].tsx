import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import NavHeader from "@/layouts/NavHeader";
import NavFooter from "@/layouts/NavFooter";

export default function NotFound() {
    return (
        <>
            <NavHeader />
            <main>
                <Title>Not Found</Title>
                <HttpStatusCode code={404} />
                <h1>Page Not Found</h1>
            </main>
            <NavFooter />
        </>
    );
}
