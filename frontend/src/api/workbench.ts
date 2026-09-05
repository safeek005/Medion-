import { WorkbenchRequest, WorkbenchResponse } from '../types';

// Centralized Configurable Webhook URL (Read from Environment Variable)
export const WORKBENCH_WEBHOOK_URL =
  (import.meta as any).env?.VITE_WORKBENCH_WEBHOOK_URL ||
  (import.meta as any).env?.VITE_MEDION_WORKBENCH_URL ||
  'https://api.agents.snsihub.ai/webhook/c52f49ea-9ddb-45bd-ad60-728faebaa8bd';

// Generate predictable, unique frontend workflow ID: WF-FE-<timestamp>-<random>
export function generateWorkflowId(portalSource: string = 'app'): string {
  const timestamp = Date.now().toString();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WF-FE-${timestamp}-${randomSuffix}`;
}

export async function dispatchToWorkbench(request: WorkbenchRequest): Promise<WorkbenchResponse> {
  const url = WORKBENCH_WEBHOOK_URL;

  // Ensure unique workflow ID if not explicitly provided
  const finalPayload: WorkbenchRequest = {
    ...request,
    workflow_id: request.workflow_id || generateWorkflowId(request.portal_source || 'app'),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        workflow_id: finalPayload.workflow_id,
        errors: [`MEDION could not complete this request. (HTTP ${response.status}: ${response.statusText})`],
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const rawData = await response.json();

      // Normalize potential response wrapper structures (e.g. rawData.body, rawData.output, rawData.result)
      const data = rawData.body ? (typeof rawData.body === 'string' ? JSON.parse(rawData.body) : rawData.body) : rawData;

      const isSuccess = data.success !== false && data.status !== 'FAILED';
      const extractedResult = data.result || data.output || data.data || data;

      return {
        success: isSuccess,
        workflow_id: data.workflow_id || finalPayload.workflow_id,
        target_agent: data.target_agent || data.agent || finalPayload.agent_target,
        action_performed: data.action_performed || data.action || finalPayload.action,
        result: extractedResult,
        errors: data.errors || (data.error ? [data.error] : undefined),
        execution_trace: data.execution_trace || undefined,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
      const text = await response.text();
      return {
        success: true,
        workflow_id: finalPayload.workflow_id,
        target_agent: finalPayload.agent_target,
        action_performed: finalPayload.action,
        result: text,
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return {
      success: false,
      workflow_id: finalPayload.workflow_id,
      errors: [
        isTimeout
          ? 'MEDION could not complete this request. (Connection Timed Out)'
          : `MEDION could not complete this request. (${err.message || 'Unable to reach SNS Workbench'})`,
      ],
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}
