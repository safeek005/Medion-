import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/SharedComponents';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, Calendar, CheckCircle2, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../services/authService';
import { useSharedNotifications, dataService } from '../../services/dataService';
import { NotificationItem } from '../../types';

export const NotificationsView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const patientId = user?.id || (user?.role === 'patient' ? 'PAT-1001' : undefined);
  const notifications = useSharedNotifications(patientId);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = (id: string) => {
    dataService.markNotificationAsRead(id);
  };

  const handleViewAppointment = (n: NotificationItem) => {
    if (n.notification_id || n.id) {
      dataService.markNotificationAsRead(n.notification_id || n.id || '');
    }
    const targetAptId = n.appointment_id || '';
    const userRole = user?.role || 'patient';
    if (targetAptId) {
      navigate(`/${userRole}/appointments?aptId=${targetAptId}`);
    } else {
      navigate(`/${userRole}/appointments`);
    }
  };

  const filtered = notifications.filter((n) => {
    const isRead = n.is_read || n.status === 'READ';
    return filter === 'all' ? true : !isRead;
  });

  const unreadCount = notifications.filter((n) => !n.is_read && n.status !== 'READ').length;

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <PageHeader
        title="Notification Center"
        subtitle="System alerts, laboratory result flags, and appointment updates"
        badge={<Badge variant={unreadCount > 0 ? 'red' : 'green'}>{unreadCount} Unread</Badge>}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>
              All Notifications
            </Button>
            <Button variant={filter === 'unread' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('unread')}>
              Unread Only ({unreadCount})
            </Button>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length > 0 ? (
          filtered.map((n) => {
            const isRead = n.is_read || n.status === 'READ';
            const isCancellation = n.type === 'APPOINTMENT_CANCELLED' || n.title === 'Appointment Cancelled';
            const notifId = n.notification_id || n.id || '';

            return (
              <div
                key={notifId}
                className="section-panel"
                style={{
                  marginBottom: 0,
                  padding: '1.25rem 1.5rem',
                  background: isRead ? 'var(--bg-app)' : '#ffffff',
                  borderLeft: isCancellation
                    ? (isRead ? '4px solid #f87171' : '5px solid #dc2626')
                    : (isRead ? '1px solid var(--border-subtle)' : '4px solid var(--forest-green)'),
                  boxShadow: isRead ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                  borderRadius: 'var(--radius-md, 10px)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {isCancellation ? (
                      <AlertTriangle style={{ width: 18, height: 18, color: '#dc2626' }} />
                    ) : (
                      <Bell style={{ width: 18, height: 18, color: isRead ? 'var(--text-muted)' : 'var(--forest-green)' }} />
                    )}
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: isCancellation ? '#b91c1c' : (isRead ? 'var(--text-secondary)' : 'var(--text-primary)') }}>
                      {n.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant={isRead ? 'blue' : (isCancellation ? 'red' : 'green')}>
                      {isRead ? 'READ' : 'UNREAD'}
                    </Badge>
                    {!isRead && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notifId)} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {n.message}
                </div>

                {n.cancellation_reason && !n.message.includes('Reason:') && (
                  <div style={{ fontSize: '0.82rem', color: '#991b1b', backgroundColor: '#fef2f2', padding: '0.4rem 0.75rem', borderRadius: 6, marginBottom: '0.75rem', border: '1px solid #fee2e2' }}>
                    <strong>Reason:</strong> {n.cancellation_reason}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>Recipient: {n.recipient_id || n.patient_id}</span>
                    <span>Sent: {n.created_at ? new Date(n.created_at).toLocaleString() : (n.sent_at || 'Recent')}</span>
                    {n.appointment_id && <span style={{ fontFamily: 'var(--font-mono)' }}>APT ID: {n.appointment_id}</span>}
                  </div>

                  {(isCancellation || n.appointment_id) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewAppointment(n)}
                      style={{ fontSize: '0.78rem', gap: '0.35rem' }}
                    >
                      <Calendar style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} /> View Appointment
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="section-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <Bell style={{ width: 32, height: 32, margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No notifications match your filter</div>
            <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>All appointment updates and alerts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

