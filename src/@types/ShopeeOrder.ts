import { AgentSessionResource } from "@/@types/AgentSessionResource";
import { IntegrationAccount } from "@/@types/IntegrationAccount";
export type Order = {
    id: number;
    code: string;
    created_at: string;
    updated_at: string;
    integration_account_id: number;
    integration_account: IntegrationAccount|undefined;
    curoff_based_order_time: string;
    agent_session_resource_id: number;
    agent_session_resource: AgentSessionResource|undefined;
};  