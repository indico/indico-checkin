// This file is part of Indico.
// Copyright (C) 2002 - 2021 CERN
//
// Indico is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see the
// LICENSE file for more details.

function showAlert(title, text = '', callback = () => {}) {
  navigator.notification.alert(text, callback, title);
}

function showConfirm(title, text = '', buttonLabels, callback = () => {}) {
  navigator.notification.confirm(text, callback, title, buttonLabels);
}

function generateRandomString(size) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(size));
  return Array.from(randomBytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  return crypto.subtle.digest('SHA-256', msgUint8);
}

function base64UrlEncode(arrayBuffer) {
  const str = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  return url;
}

function urlEncodeForm(params) {
  return Object.keys(params)
    .map((key) => key + '=' + params[key])
    .join('&');
}

function getSearchParams(url, searchDivider = '?') {
  if (url == '' || !url || !url.includes(searchDivider)) return {};
  const urlParts = url.split(searchDivider);

  const searchParams = {};
  urlParts[1].split('&').forEach((segment) => {
    [k, v] = segment.split('=');
    searchParams[k] = v;
  });

  return searchParams;
}

function getKey(str) {
  if (!str || str === '') return undefined;

  let hash = 0,
    chr;

  for (let i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  return `checkin-${hash}`;
}

function formatDate(date) {
  if (!date) return;

  const d = new Date(date);

  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
