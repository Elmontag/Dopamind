import { apiFetch } from "./api";

export function fetchEvents(start, end) {
  return apiFetch(`/calendar?start=${start}&end=${end}`);
}

export function createEvent(event) {
  return apiFetch("/calendar", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export function updateEvent(event) {
  return apiFetch(`/calendar/${event.id}`, {
    method: "PUT",
    body: JSON.stringify(event),
  });
}

export function deleteEvent(id) {
  return apiFetch(`/calendar/${id}`, { method: "DELETE" });
}
