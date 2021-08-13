angular.module('Checkinapp.storageService', []).service('Storage', function () {
  const STORAGE_VERSION = 1;
  const eventsKey = `events-${STORAGE_VERSION}`;
  const serversKey = `servers-${STORAGE_VERSION}`;
  const eventKey = (serverId, eventId) => `${serverId}_${eventId}`;
  const registrantsKey = (serverId, eventId) => `registrants-${STORAGE_VERSION}-${serverId}_${eventId}`;

  // event storage functions
  function getEvents() {
    return JSON.parse(localStorage.getItem(eventsKey)) || {};
  }

  function getEvent(serverId, eventId) {
    return getEvents()[eventKey(serverId, eventId)];
  }

  function addEvent(event) {
    const events = getEvents();
    events[eventKey(event.serverId, event.eventId)] = event;
    localStorage.setItem(eventsKey, JSON.stringify(events));
  }

  function deleteEvent(serverId, eventId) {
    const events = getEvents();
    delete events[eventKey(serverId, eventId)];
    localStorage.setItem(eventsKey, JSON.stringify(events));

    deleteRegistrants(serverId, eventId);
  }

  // server storage functions
  function getServers() {
    return JSON.parse(localStorage.getItem(serversKey)) || {};
  }

  function getServer(serverId) {
    return getServers()[serverId];
  }

  function addServer(server) {
    const servers = getServers();
    servers[server.serverId] = server;
    localStorage.setItem(serversKey, JSON.stringify(servers));
  }

  function deleteServer(serverId) {
    const servers = getServers();
    delete servers[serverId];
    localStorage.setItem(serversKey, JSON.stringify(servers));
  }

  // registrant cache functions
  function getRegistrants(serverId, eventId) {
    return JSON.parse(localStorage.getItem(registrantsKey(serverId, eventId))) || [];
  }

  function setRegistrants(serverId, eventId, registrants) {
    localStorage.setItem(registrantsKey(serverId, eventId), JSON.stringify(registrants));
  }

  function getRegistrant(serverId, eventId, registrantId) {
    return getRegistrants(serverId, eventId).filter(registrant => registrant.id === registrantId);
  }

  function checkinRegistrant(serverId, eventId, registrantId, checkinStatus) {
    const registrants = getRegistrants(serverId, eventId);
    const registrant = registrants.find(registrant => registrant.registrant_id === registrantId);

    if (registrant) {
      registrant.checked_in = checkinStatus;
      setRegistrants(serverId, eventId, registrants);
      return checkinStatus;
    }

  }

  function deleteRegistrants(serverId, eventId) {
    Object.keys(localStorage).forEach(storedKey => {
      if (storedKey === registrantsKey(serverId, eventId)) {
        localStorage.removeItem(storedKey);
      }
    });
  }

  // settings storage functions
  function getAutoCheckin() {
    return JSON.parse(localStorage.getItem('autoCheckin')) || false;
  }

  function setAutoCheckin(value) {
    localStorage.setItem('autoCheckin', value);
  }

  // exports
  return {
    getEvents,
    getEvent,
    addEvent,
    deleteEvent,
    getServer,
    addServer,
    deleteServer,
    getRegistrants,
    getRegistrant,
    setRegistrants,
    checkinRegistrant,
    deleteRegistrants,
    getAutoCheckin,
    setAutoCheckin,
  };
});
