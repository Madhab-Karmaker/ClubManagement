import React, { useEffect, useState } from "react";
import eventService, {
  type EventDto,
  type CreateEventDto,
  type UpdateEventDto,
} from "../../services/event.service";
import "./EventsPage.css";

const emptyForm: CreateEventDto = {
  name: "",
  description: "",
  date: "",
  location: "",
  maxAttendees: undefined,
  registrationDeadline: "",
  fee: undefined,
  isPublic: true,
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateEventDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventService.getAll();
      setEvents(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const update: UpdateEventDto = { ...form };
        await eventService.update(editingId, update);
      } else {
        await eventService.create(form);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      await fetchEvents();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (evt: EventDto) => {
    setForm({
      name: evt.name,
      description: evt.description || "",
      date: evt.date,
      location: evt.location || "",
      maxAttendees: evt.maxAttendees,
      registrationDeadline: evt.registrationDeadline || "",
      fee: evt.fee,
      isPublic: evt.isPublic,
    });
    setEditingId(evt.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventService.delete(id);
      await fetchEvents();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete event");
    }
  };

  const toggleAttendees = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setAttendees([]);
      return;
    }
    setExpandedId(id);
    setAttendeesLoading(true);
    try {
      const res = await eventService.getAttendees(id);
      setAttendees(res.data);
    } catch {
      setAttendees([]);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });

  if (loading) {
    return (
      <div className="events-page">
        <div className="ev-loading"><div className="spinner" /><p>Loading events...</p></div>
      </div>
    );
  }

  return (
    <div className="events-page">
      {/* Header */}
      <div className="ev-header">
        <div className="ev-header-left">
          <h1>Events</h1>
          <p className="ev-count">{events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="ev-btn ev-btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
          + Create Event
        </button>
      </div>

      {error && (
        <div className="ev-error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="ev-overlay" onClick={() => { if (!saving) { setShowForm(false); setEditingId(null); } }}>
          <div className="ev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ev-modal-header">
              <h2>{editingId ? "Edit Event" : "Create Event"}</h2>
              <button className="ev-modal-close" onClick={() => { setShowForm(false); setEditingId(null); }}>✕</button>
            </div>
            <form className="ev-form" onSubmit={handleSubmit}>
              <div className="ev-form-grid">
                <div className="form-group ev-form-full">
                  <label>Event Name *</label>
                  <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group ev-form-full">
                  <label>Description</label>
                  <textarea className="form-input form-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input className="form-input" type="datetime-local" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Max Attendees</label>
                  <input className="form-input" type="number" min={1} value={form.maxAttendees ?? ""} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div className="form-group">
                  <label>Fee ($)</label>
                  <input className="form-input" type="number" min={0} step="0.01" value={form.fee ?? ""} onChange={(e) => setForm({ ...form, fee: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div className="form-group">
                  <label>Registration Deadline</label>
                  <input className="form-input" type="datetime-local" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
                </div>
                <div className="form-group form-group-checkbox">
                  <label className="checkbox-label">
                    <input type="checkbox" className="form-checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
                    Public Event
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn--secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Event" : "Create Event"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="ev-list">
        {events.length === 0 ? (
          <div className="ev-empty">
            <span className="ev-empty-icon">📅</span>
            <h3>No events yet</h3>
            <p>Create your first event to get started.</p>
            <button className="ev-btn ev-btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>+ Create Event</button>
          </div>
        ) : (
          events.map((evt) => {
            const isPast = new Date(evt.date) < new Date();
            const isExpanded = expandedId === evt.id;
            return (
              <div key={evt.id} className={`ev-card ${isPast ? "ev-past" : ""}`}>
                <div className="ev-card-main">
                  <div className="ev-card-left">
                    <div className="ev-date-badge">
                      <span className="ev-date-month">{new Date(evt.date).toLocaleDateString("en-US", { month: "short" })}</span>
                      <span className="ev-date-day">{new Date(evt.date).getDate()}</span>
                    </div>
                    <div className="ev-card-info">
                      <h3 className="ev-card-title">{evt.name}</h3>
                      <div className="ev-card-meta">
                        {evt.location && <span>📍 {evt.location}</span>}
                        <span>⏰ {formatDate(evt.date)}</span>
                        {evt.fee != null && evt.fee > 0 && <span className="ev-fee">${evt.fee.toFixed(2)}</span>}
                        {evt.isPublic && <span className="ev-badge ev-badge-public">Public</span>}
                        {isPast && <span className="ev-badge ev-badge-past">Past</span>}
                      </div>
                      {evt.description && <p className="ev-card-desc">{evt.description}</p>}
                    </div>
                  </div>
                  <div className="ev-card-right">
                    <div className="ev-attendee-count">
                      <span className="ev-attendee-num">{evt.attendeeCount ?? 0}</span>
                      <span className="ev-attendee-label">/{evt.maxAttendees ?? "∞"} attending</span>
                    </div>
                    <div className="ev-card-actions">
                      <button className="ev-btn-sm ev-btn-attendees" onClick={() => toggleAttendees(evt.id)} title="View attendees">
                        👥 {evt.attendeeCount ?? 0}
                      </button>
                      <button className="ev-btn-sm ev-btn-edit" onClick={() => handleEdit(evt)} title="Edit event">✏️</button>
                      <button className="ev-btn-sm ev-btn-delete" onClick={() => handleDelete(evt.id)} title="Delete event">🗑️</button>
                    </div>
                  </div>
                </div>

                {/* Attendees panel */}
                {isExpanded && (
                  <div className="ev-attendees-panel">
                    <h4>Attendees</h4>
                    {attendeesLoading ? (
                      <p className="ev-attendees-loading">Loading...</p>
                    ) : attendees.length === 0 ? (
                      <p className="ev-attendees-empty">No attendees registered</p>
                    ) : (
                      <div className="ev-attendees-list">
                        {attendees.map((a: any, i: number) => (
                          <div key={i} className="ev-attendee-item">
                            <span className="ev-attendee-avatar">{a.name?.charAt(0) || "?"}</span>
                            <span className="ev-attendee-name">{a.name || a.memberName || "Unknown"}</span>
                            <span className="ev-attendee-status">{a.status || "registered"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventsPage;
