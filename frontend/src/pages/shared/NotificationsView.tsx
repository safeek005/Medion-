import React, { useState } from 'react';
import { MOCK_NOTIFICATIONS, NotificationItem } from '../../data/mockDatasets';
import { PageHeader } from '../../components/common/SharedComponents';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, CheckCircle2, Eye } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.notification_id === id ? { ...n, status: 'READ' } : n));
  };

  const filtered = notifications.filter(n => filter === 'all' ? true : n.status !== 'READ');

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <PageHeader
        title="Notification Center"
        subtitle="System alerts, laboratory result flags, and appointment updates"
        badge={<Badge variant="green">{notifications.filter(n => n.status !== 'READ').length} Unread</Badge>}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>
              All Notifications
            </Button>
            <Button variant={filter === 'unread' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('unread')}>
              Unread Only
            </Button>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map((n) => {
          const isRead = n.status === 'READ';
          return (
            <div
              key={n.notification_id}
              className="section-panel"
              style={{
                marginBottom: 0,
                padding: '1.25rem',
                background: isRead ? 'var(--bg-app)' : 'var(--bg-surface)',
                borderLeft: isRead ? '1px solid var(--border-subtle)' : '4px solid var(--forest-green)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell style={{ width: 16, height: 16, color: isRead ? 'var(--text-muted)' : 'var(--forest-green)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {n.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={isRead ? 'blue' : 'green'}>{n.status}</Badge>
                  {!isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(n.notification_id)} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                {n.message}
              </p>
              <div className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', gap: '1.25rem' }}>
                <span>Recipient: {n.recipient_id} ({n.recipient_type})</span>
                <span>Channel: {n.channel}</span>
                <span>Sent: {n.sent_at}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
