import { AgentSession } from "./AgentSession";
import { Order } from "./ShopeeOrder";

export type AgentSessionResource = {
    id: number;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    agent_sessions: AgentSession[] | undefined;
    resourceable_orders: Order[] | undefined;
};
