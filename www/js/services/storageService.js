angular.module('Checkinapp.storageService', []).service('Storage', function () {
  const eventKey = (serverId, eventId) => `${serverId}_${eventId}`;

  // event storage functions
  function getEvents() {
    return JSON.parse(localStorage.getItem('events')) || {};
  }

  function getEvent(serverId, eventId) {
    return getEvents()[eventKey(serverId, eventId)];
  }

  function addEvent(event) {
    const events = getEvents();
    events[eventKey(event.serverId, event.eventId)] = event;
    localStorage.setItem('events', JSON.stringify(events));
  }

  function deleteEvent(serverId, eventId) {
    const events = getEvents();
    delete events[eventKey(serverId, eventId)];
    localStorage.setItem('events', JSON.stringify(events));
  }

  // server storage functions
  function getServers() {
    return JSON.parse(localStorage.getItem('servers')) || {};
  }

  function getServer(serverId) {
    return getServers()[serverId];
  }

  function addServer(server) {
    const servers = getServers();
    servers[server.serverId] = server;
    localStorage.setItem('servers', JSON.stringify(servers));
  }

  function deleteServer(serverId) {
    const servers = getServers();
    delete servers[serverId];
    localStorage.setItem('servers', JSON.stringify(servers));
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
  };
});
