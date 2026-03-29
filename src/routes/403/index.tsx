import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import NavHeader from "@/layouts/NavHeader";
import NavFooter from "@/layouts/NavFooter";

export default function Forbidden() {
    return (
        <>
            <NavHeader />
            <main style={{ display: "flex", "justify-content": "center", "align-items": "center", "min-height": "60vh" }}>
                <Title>Forbidden</Title>
                <HttpStatusCode code={403} />
                <div style={{
                    "background-color": "#fef2f2",
                    border: "1px solid #fca5a5",
                    "border-radius": "12px",
                    padding: "2rem 3rem",
                    "text-align": "center",
                    "box-shadow": "0 4px 12px rgba(239, 68, 68, 0.15)",
                    "max-width": "480px",
                    width: "100%",
                }}>
                    <h1 style={{ color: "#dc2626", "font-size": "3rem", margin: "0 0 0.5rem" }}>403</h1>
                    <h2 style={{ color: "#b91c1c", margin: "0 0 1rem" }}>Forbidden</h2>
                    <p style={{ color: "#991b1b", margin: "0" }}>このページへのアクセス権限がありません。</p>
                </div>
            </main>
            <NavFooter />
        </>
    );
}
