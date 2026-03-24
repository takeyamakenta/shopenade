import { Agent } from "./Agent";

export type AgentSession = {
    id: number;
    ulid: string;
    agent_id: number;
    status: string;
    vmid: string;
    created_at: string;
    updated_at: string;
    agent: Agent|undefined;
};