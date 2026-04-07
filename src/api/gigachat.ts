import type { Scope } from "../types";

// Ключ для сохранения учётных данных в sessionStorage
const AUTH_STORAGE_KEY = "gigachat-auth";

interface TokenData {
  accessToken: string;
  expiresAt: number;
}

interface StoredAuth {
  credentials: string;
  scope: Scope;
}

// Кэш токена и учётных данных в памяти
let tokenData: TokenData | null = null;
let storedCredentials: string | null = null;
let storedScope: Scope | null = null;
let apiBaseUrl = "";
let authBaseUrl = "";

// Обновляем токен за минуту до истечения
const TOKEN_REFRESH_BUFFER_MS = 60_000;

function isDevMode(): boolean {
  return import.meta.env.DEV;
}

// В dev-режиме используем Vite-прокси вместо прямых URL
function getAuthUrl(): string {
  if (isDevMode()) return "/auth/api/v2/oauth";
  return `${authBaseUrl}/api/v2/oauth`;
}

function getApiUrl(path: string): string {
  if (isDevMode()) return `/api/v1${path}`;
  return `${apiBaseUrl}/api/v1${path}`;
}

export function setProxyUrls(api: string, auth: string) {
  apiBaseUrl = api.replace(/\/+$/, "");
  authBaseUrl = auth.replace(/\/+$/, "");
}

export function getProxyUrls() {
  return { apiBaseUrl, authBaseUrl };
}

// Сохраняем учётные данные между перезагрузками страницы
function persistAuth(credentials: string, scope: Scope) {
  try {
    const data: StoredAuth = { credentials, scope };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadPersistedAuth(): StoredAuth | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function clearPersistedAuth() {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {}
}

// Восстанавливаем сессию при старте приложения
export function restoreCredentials(): boolean {
  const saved = loadPersistedAuth();
  if (!saved) return false;
  storedCredentials = saved.credentials;
  storedScope = saved.scope;
  return true;
}

export function setCredentials(credentials: string, scope: Scope) {
  storedCredentials = credentials;
  storedScope = scope;
  tokenData = null;
  persistAuth(credentials, scope);
}

export function clearCredentials() {
  storedCredentials = null;
  storedScope = null;
  tokenData = null;
  clearPersistedAuth();
}

export async function authenticate(
  credentials: string,
  scope: Scope
): Promise<TokenData> {
  const response = await fetch(getAuthUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      RqUID: crypto.randomUUID(),
      Authorization: `Basic ${credentials}`,
    },
    body: `scope=${scope}`,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Ошибка авторизации (${response.status}): ${text || response.statusText}`
    );
  }

  const data = await response.json();
  const td: TokenData = {
    accessToken: data.access_token,
    expiresAt: data.expires_at,
  };

  tokenData = td;
  storedCredentials = credentials;
  storedScope = scope;
  persistAuth(credentials, scope);

  return td;
}

// Возвращает действующий токен, при необходимости обновляя его
export async function getValidToken(): Promise<string> {
  if (
    tokenData &&
    Date.now() < tokenData.expiresAt - TOKEN_REFRESH_BUFFER_MS
  ) {
    return tokenData.accessToken;
  }

  if (!storedCredentials || !storedScope) {
    throw new Error("Требуется авторизация");
  }

  const td = await authenticate(storedCredentials, storedScope);
  return td.accessToken;
}

export interface ChatRequestOptions {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  stream: boolean;
}

export interface ApiMessage {
  role: "system" | "user" | "assistant";
  content: string;
  attachments?: string[];
}

// Загружаем файл и возвращаем его ID для вложений
export async function uploadFile(file: File): Promise<string> {
  const token = await getValidToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", "general");

  const response = await fetch(getApiUrl("/files"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Ошибка загрузки файла (${response.status}): ${text || response.statusText}`);
  }

  const data = await response.json();
  return data.id as string;
}

// Маппинг UI-названий на реальные идентификаторы моделей API
const MODEL_API_NAME: Record<string, string> = {
  "GigaChat-Lite": "GigaChat",
};

function resolveModelName(model: string): string {
  return MODEL_API_NAME[model] ?? model;
}

export async function sendChatRequest(
  messages: ApiMessage[],
  options: ChatRequestOptions,
  signal?: AbortSignal
): Promise<Response> {
  const token = await getValidToken();

  const response = await fetch(getApiUrl("/chat/completions"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: resolveModelName(options.model),
      messages,
      stream: options.stream,
      temperature: options.temperature,
      top_p: options.topP,
      max_tokens: options.maxTokens,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Ошибка API (${response.status}): ${text || response.statusText}`
    );
  }

  return response;
}
