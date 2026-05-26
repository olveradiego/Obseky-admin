// Archivo: tests/contracts.smoke.js
// Proposito: pruebas automatizadas de contrato para validar respuestas y errores de la API.

const { spawn } = require("child_process");
const assert = require("assert");

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3002";
const WAIT_MS = 3000;

// Funcion 'sleep': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Funcion 'isObject': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);

// Funcion 'ensureErrorContract': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const ensureErrorContract = (payload) => {
  assert.ok(isObject(payload.backendError), "backendError object is required");
  assert.ok(typeof payload.backendError.code === "string", "backendError.code is required");
  assert.ok(typeof payload.backendError.message === "string", "backendError.message is required");
};

// Funcion 'ensureListContract': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const ensureListContract = (payload) => {
  assert.ok(Array.isArray(payload.items), "items array is required");
  assert.ok(typeof payload.total === "number", "total number is required");
};

// Funcion 'ensureItemContract': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const ensureItemContract = (payload) => {
  assert.ok(isObject(payload.item), "item object is required");
};

// Funcion 'ensureDeleteContract': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const ensureDeleteContract = (payload) => {
  assert.ok(isObject(payload.item), "item object is required");
  assert.ok(typeof payload.item.id === "string", "item.id string is required");
  assert.ok(typeof payload.message === "string", "message string is required");
};

// Funcion 'ensureBulkContract': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const ensureBulkContract = (payload) => {
  assert.ok(isObject(payload.item), "item object is required");
  assert.ok(Array.isArray(payload.item.ids), "item.ids is required");
  assert.ok(typeof payload.message === "string", "message string is required");
  assert.ok(typeof payload.requestedCount === "number", "requestedCount number is required");
  assert.ok(typeof payload.deletedCount === "number", "deletedCount number is required");
  assert.ok(Array.isArray(payload.deletedIds), "deletedIds array is required");
  assert.ok(typeof payload.notFoundCount === "number", "notFoundCount number is required");
  assert.ok(Array.isArray(payload.notFoundIds), "notFoundIds array is required");
};

// Funcion 'request': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const json = await response.json();
  return { response, json };
};

// Funcion 'getAuthToken': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const getAuthToken = async () => {
// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
  const candidates = [
    { email: "empresa@correo.com", password: "admin" },
    { email: "superadmin@test.local", password: "admin" },
    { email: "superadmin@test.local", password: "admin1234" },
  ];

  for (const candidate of candidates) {
    const { response, json } = await request("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candidate),
    });
    if (response.ok && json.token) return json.token;
  }

  throw new Error("No se pudo autenticar para pruebas smoke");
};

// Funcion 'createPayloadByModule': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createPayloadByModule = (moduleKey, seed) => {
  if (moduleKey === "customers") {
    return {
      businessName: `Smoke ${seed}`,
      customerName: "QA",
      order: "",
      cardId: "/asset.jpg",
      message: "ok",
      images: "",
      video: "",
      secretCode: `S${seed}`.slice(0, 6),
      orderStatus: "OK",
      status: "Active",
    };
  }
  return { qa: `${moduleKey}-${seed}`, email: `${moduleKey}.${seed}@test.local` };
};

// Funcion 'updatePayloadByModule': actualiza un registro existente segun id y payload permitido.
const updatePayloadByModule = (moduleKey) => {
  if (moduleKey === "customers") return { message: "updated" };
  return { qa: `${moduleKey}-updated` };
};

// Funcion 'runEntityCrudAssertions': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const runEntityCrudAssertions = async (moduleKey, token) => {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const seed = Date.now();
  const createPayload = createPayloadByModule(moduleKey, seed);

  const create = await request(`/api/admin/${moduleKey}`, {
    method: "POST",
    headers,
    body: JSON.stringify(createPayload),
  });
  assert.strictEqual(create.response.status, 201, `${moduleKey} create should return 201`);
  ensureItemContract(create.json);
  assert.ok(typeof create.json.message === "string", `${moduleKey} create message required`);

  const createdId = create.json.item._id || create.json.item.id;
  assert.ok(typeof createdId === "string", `${moduleKey} created id required`);

  const list = await request(`/api/admin/${moduleKey}`, { headers: { Authorization: `Bearer ${token}` } });
  assert.strictEqual(list.response.status, 200, `${moduleKey} list should return 200`);
  ensureListContract(list.json);

  const getById = await request(`/api/admin/${moduleKey}/${createdId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(getById.response.status, 200, `${moduleKey} getById should return 200`);
  ensureItemContract(getById.json);

  const update = await request(`/api/admin/${moduleKey}/${createdId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updatePayloadByModule(moduleKey)),
  });
  assert.strictEqual(update.response.status, 200, `${moduleKey} update should return 200`);
  ensureItemContract(update.json);
  assert.ok(typeof update.json.message === "string", `${moduleKey} update message required`);

  const remove = await request(`/api/admin/${moduleKey}/${createdId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(remove.response.status, 200, `${moduleKey} delete should return 200`);
  ensureDeleteContract(remove.json);

  const bulk = await request(`/api/admin/${moduleKey}/bulk`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ ids: ["000000000000000000000001"] }),
  });
  assert.strictEqual(bulk.response.status, 200, `${moduleKey} bulk should return 200`);
  ensureBulkContract(bulk.json);

  const invalidId = await request(`/api/admin/${moduleKey}/invalid-id`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(invalidId.response.status, 400, `${moduleKey} invalid id should return 400`);
  ensureErrorContract(invalidId.json);
};

// Funcion 'runUsersCrudAssertions': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const runUsersCrudAssertions = async (token) => {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const seed = Date.now();
  const createPayload = {
    companyName: `Smoke Users ${seed}`,
    userName: "Smoke User",
    email: `smoke.user.${seed}@test.local`,
    password: "password123",
    role: "Admin",
    status: "Activo",
  };

  const create = await request("/api/admin/users", {
    method: "POST",
    headers,
    body: JSON.stringify(createPayload),
  });
  assert.strictEqual(create.response.status, 201, "users create should return 201");
  ensureItemContract(create.json);
  assert.ok(typeof create.json.message === "string", "users create message required");
  const createdId = create.json.item.id;
  assert.ok(typeof createdId === "string", "users created id required");

  const getById = await request(`/api/admin/users/${createdId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(getById.response.status, 200, "users getById should return 200");
  ensureItemContract(getById.json);

  const update = await request(`/api/admin/users/${createdId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ companyName: `Updated ${seed}` }),
  });
  assert.strictEqual(update.response.status, 200, "users update should return 200");
  ensureItemContract(update.json);
  assert.ok(typeof update.json.message === "string", "users update message required");

  const remove = await request(`/api/admin/users/${createdId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(remove.response.status, 200, "users delete should return 200");
  ensureDeleteContract(remove.json);

  const bulk = await request("/api/admin/users/bulk", {
    method: "DELETE",
    headers,
    body: JSON.stringify({ ids: ["000000000000000000000001"] }),
  });
  assert.strictEqual(bulk.response.status, 200, "users bulk should return 200");
  ensureBulkContract(bulk.json);

  const invalidId = await request("/api/admin/users/invalid-id", {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(invalidId.response.status, 400, "users invalid id should return 400");
  ensureErrorContract(invalidId.json);
};

// Funcion 'runUsersPermissionDeniedAssertion': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const runUsersPermissionDeniedAssertion = async (token) => {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const seed = Date.now();
  const adminEmail = `smoke.admin.${seed}@test.local`;

  const create = await request("/api/admin/users", {
    method: "POST",
    headers,
    body: JSON.stringify({
      companyName: `Smoke Admin ${seed}`,
      userName: "Admin User",
      email: adminEmail,
      password: "password123",
      role: "Admin",
      status: "Activo",
    }),
  });
  assert.strictEqual(create.response.status, 201, "admin fixture create should return 201");

  const login = await request("/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: "password123" }),
  });
  assert.strictEqual(login.response.status, 200, "admin fixture login should return 200");
  assert.ok(login.json.token, "admin fixture token required");

  const forbidden = await request("/api/admin/users", {
    headers: { Authorization: `Bearer ${login.json.token}` },
  });
  assert.strictEqual(forbidden.response.status, 403, "admin access to users should be forbidden");
  ensureErrorContract(forbidden.json);
  assert.strictEqual(forbidden.json.backendError.code, "FORBIDDEN");
};

// Funcion 'run': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const run = async () => {
  const server = spawn("node", ["app.js"], { stdio: "ignore" });
  try {
    await sleep(WAIT_MS);
    const token = await getAuthToken();

    const headers = { Authorization: `Bearer ${token}` };
    const meta = await request("/api/admin/meta", { headers });
    assert.strictEqual(meta.response.status, 200, "meta should return 200");
    assert.strictEqual(meta.json.version, "v1", "meta version should be v1");
    assert.ok(Array.isArray(meta.json.modules), "meta modules should be array");
    assert.ok(isObject(meta.json.permissionsMatrix), "meta permissionsMatrix should be object");

    for (const moduleKey of ["companies", "customers", "finalcustomers", "codes"]) {
      await runEntityCrudAssertions(moduleKey, token);
    }

    await runUsersCrudAssertions(token);
    await runUsersPermissionDeniedAssertion(token);

    const users = await request("/api/admin/users", { headers });
    assert.strictEqual(users.response.status, 200, "users list should return 200");
    ensureListContract(users.json);

    const missingRoute = await request("/api/admin/does-not-exist", { headers });
    assert.strictEqual(missingRoute.response.status, 404, "missing route should return 404");
    ensureErrorContract(missingRoute.json);

    console.log("contracts-smoke: OK");
  } finally {
    server.kill("SIGTERM");
  }
};

run().catch((error) => {
  console.error("contracts-smoke: FAIL");
  console.error(error.message);
  process.exit(1);
});


