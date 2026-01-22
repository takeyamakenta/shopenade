import { Suspense } from "solid-js";

import "@fontsource/inter";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

import "./app.css";
import Layout from "./layouts/Layout";

export default function App() {
    return (
        <Layout>
            <Router
                root={(props) => (
                    <MetaProvider>
                        <Title>都バスの達人</Title>
                        <Suspense>{props.children}</Suspense>
                    </MetaProvider>
                )}
            >
                <FileRoutes />
            </Router>
        </Layout>
    );
}
