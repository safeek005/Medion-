import React, { useState, useEffect, useRef } from 'react';
import { UserRole, ExecutionTraceStep } from '../../types';
import { Sparkles, ArrowRight, Code, RotateCcw, User, Bot, Clock, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';
import { dispatchWorkbench } from '../../api/medionApi';
import { Button } from '../../components/ui/Button';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { dataService } from '../../services/dataService';

interface MessageItem {
  id: string;
  sender: 'user' | 'medion';
  text?: string;
  response?: any;
  timestamp: string;
  targetAgent?: string;
  isError?: boolean;
}

interface AiWorkspaceViewProps {
  role: UserRole;
  onTraceGenerated: (step: ExecutionTraceStep) => void;
  onOpenTraceDrawer: () => void;
}

const PROCESSING_STEPS = [
  'Understanding your request...',
  'Identifying the required service...',
  'Retrieving clinical information...',
  'Preparing your response...'
];

export const AiWorkspaceView: React.FC<AiWorkspaceViewProps> = ({ role, onTraceGenerated, onOpenTraceDrawer }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStepIdx, setProcessingStepIdx] = useState(0);
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    const saved = sessionStorage.getItem(`medion_chat_${role}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'medion',
        text: 'Hello! I am MEDION Healthcare Intelligence. You can ask me to book or check appointments, analyze laboratory reports, review insurance policies, track claims, or look up patient clinical records.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetAgent: 'orchestrator'
      }
    ];
  });

  const [conversationContext, setConversationContext] = useState<Record<string, any>>(() => dataService.getConversationContext() || {});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Save conversation in session
  useEffect(() => {
    sessionStorage.setItem(`medion_chat_${role}`, JSON.stringify(messages));
  }, [messages, role]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Progress through stepped status while loading
  useEffect(() => {
    if (!loading) {
      setProcessingStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setProcessingStepIdx((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, [loading]);

  const samplePrompts = [
    { label: 'Register Patient', prompt: 'Register a new patient Safeek' },
    { label: 'Check Dr Rajesh Slots', prompt: 'When is Dr Rajesh available?' },
    { label: 'Book with Dr Rajesh', prompt: 'Book an appointment with Dr Rajesh tomorrow at 10 AM' },
    { label: 'Cancel Appointment', prompt: 'Cancel appointment APT-1001' },
    { label: 'Analyze Lab Report', prompt: "Analyze Arun Kumar's latest laboratory report (LABR-1001)" },
    { label: 'Explain Lab Results', prompt: 'Explain LABR-1001 in simple language' },
    { label: 'Verify Insurance', prompt: 'Is my insurance active?' },
    { label: 'Submit Claim', prompt: 'Submit claim CLM-1001' },
    { label: 'Patient History', prompt: "Show Arun Kumar's medical history" }
  ];

  const handleExecute = async (promptText: string) => {
    const textToSend = promptText.trim();
    if (!textToSend || loading) return;

    const userMsgId = `usr-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to thread
    const userMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);
    setProcessingStepIdx(0);

    const activeCtx = conversationContext || dataService.getConversationContext() || {};
    const requestPayload: any = {
      portal_source: role,
      message: textToSend,
      user_role: role,
      previous_context: activeCtx,
      conversation_context: activeCtx,
    };

    // Include patient context automatically if user is patient
    if (role === 'patient') {
      requestPayload.patient_id = 'PAT-1001';
    }

    const startTime = performance.now();
    try {
      const res = await dispatchWorkbench(requestPayload);
      const duration = Math.round(performance.now() - startTime);

      // Extract context if clarification was asked or doctor/action was identified
      const outData = res?.output?.result_data || res?.result || {};
      if (outData?.needs_clarification) {
        const nextCtx = outData.context || {
          awaiting_action: outData.awaiting_action,
          patient_name: outData.patient_name,
          doctor_id: outData.doctor_id,
          doctor_name: outData.doctor_name,
          patient_id: outData.patient_id || (role === 'patient' ? 'PAT-1001' : undefined)
        };
        setConversationContext(nextCtx);
        dataService.setConversationContext(nextCtx);
      } else {
        // Reset context after successful execution
        setConversationContext({});
        dataService.clearConversationContext();
      }

      const medionMsg: MessageItem = {
        id: `med-${Date.now()}`,
        sender: 'medion',
        response: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetAgent: res.target_agent || 'orchestrator',
        isError: res.success === false
      };

      setMessages((prev) => [...prev, medionMsg]);

      onTraceGenerated({
        id: `TR-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString(),
        workflowId: res.workflow_id || `WF-${role.toUpperCase()}-${Date.now().toString().slice(-3)}`,
        portalSource: role,
        agentTarget: res.target_agent || 'master_orchestrator',
        action: res.action_performed || 'natural_language_query',
        durationMs: duration,
        success: res.success !== false,
        request: requestPayload,
        response: res,
      });
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `med-err-${Date.now()}`,
          sender: 'medion',
          text: "I couldn't retrieve the healthcare information right now. Please check your query or try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          targetAgent: 'orchestrator',
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    sessionStorage.removeItem(`medion_chat_${role}`);
    setConversationContext({});
    setMessages([
      {
        id: 'msg-welcome-new',
        sender: 'medion',
        text: 'Session reset. Ask me anything about appointments, laboratory results, insurance policies, or patient history.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetAgent: 'orchestrator'
      }
    ]);
  };

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header & Clinical Safety Disclaimer */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-ui badge-green" style={{ fontSize: '0.75rem' }}>
              <Sparkles style={{ width: 13, height: 13 }} /> MEDION Clinical Assistant
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Multi-Agent Intelligence
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Ask MEDION
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" onClick={onOpenTraceDrawer} style={{ fontSize: '0.78rem' }}>
            <Code style={{ width: 14, height: 14 }} /> Trace Architecture
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearHistory} style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }} title="Clear conversation history">
            <Trash2 style={{ width: 14, height: 14 }} /> Clear Chat
          </Button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '8px',
        padding: '0.55rem 0.85rem',
        marginBottom: '1rem',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--forest-green)', flexShrink: 0 }} />
        <span>
          <strong>Clinical Reference Mode:</strong> Responses are grounded in verified synthetic health data and do not substitute for certified physician diagnosis.
        </span>
      </div>

      {/* Conversation Thread Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '100%'
            }}
          >
            {/* Sender Label & Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {msg.sender === 'user' ? (
                <>
                  <span>You ({role})</span>
                  <User style={{ width: 12, height: 12 }} />
                </>
              ) : (
                <>
                  <Bot style={{ width: 12, height: 12, color: 'var(--forest-green)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--forest-green)' }}>
                    MEDION {msg.targetAgent ? `• ${msg.targetAgent.charAt(0).toUpperCase() + msg.targetAgent.slice(1)} Agent` : ''}
                  </span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Bubble Content */}
            {msg.sender === 'user' ? (
              <div
                style={{
                  background: 'var(--forest-green, #10b981)',
                  color: '#ffffff',
                  padding: '0.75rem 1.1rem',
                  borderRadius: '16px 16px 2px 16px',
                  fontSize: '0.92rem',
                  maxWidth: '75%',
                  lineHeight: 1.5,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {msg.text}
              </div>
            ) : msg.response ? (
              <div style={{ width: '100%', maxWidth: '850px' }}>
                <HumanResponseRenderer
                  response={msg.response}
                  onSelectPrompt={(selectedQuery) => handleExecute(selectedQuery)}
                  onRetry={() => {
                    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
                    if (lastUserMsg?.text) handleExecute(lastUserMsg.text);
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-muted, rgba(0,0,0,0.03))',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '16px 16px 16px 2px',
                  fontSize: '0.92rem',
                  color: 'var(--text-primary)',
                  maxWidth: '85%',
                  lineHeight: 1.55
                }}
              >
                {msg.text}
              </div>
            )}
          </div>
        ))}

        {/* Stepped Processing Indicator */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '85%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem', fontSize: '0.75rem', color: 'var(--forest-green)' }}>
              <Bot style={{ width: 12, height: 12 }} />
              <span style={{ fontWeight: 600 }}>MEDION Orchestrator is processing...</span>
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '0.85rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'var(--forest-green)',
                animation: 'pulse 1.2s infinite'
              }}></span>
              <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {PROCESSING_STEPS[processingStepIdx]}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Chips */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
          Quick Action Suggestions
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {samplePrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleExecute(item.prompt)}
              disabled={loading}
              className="btn-ui btn-secondary-ui"
              style={{
                fontSize: '0.76rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '14px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Command Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleExecute(query); }}>
        <div className="command-input-container" style={{ padding: '0.65rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg, 12px)' }}>
          <Sparkles style={{ width: 18, height: 18, color: 'var(--forest-green)', flexShrink: 0 }} />
          <input
            type="text"
            className="command-input"
            style={{ fontSize: '0.92rem' }}
            placeholder="Ask MEDION any clinical query, appointment request, report check, or claim question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-ui btn-primary-ui"
            disabled={loading || !query.trim()}
            style={{ padding: '0.5rem 1.15rem', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {loading ? 'Processing...' : 'Send'} <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </form>
    </div>
  );
};
