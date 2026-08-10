# RLS multitenant: despliegue y operación

## Alcance

`rls_multitenant_up.sql` añade una segunda frontera de aislamiento a las tablas
de firmas, usuarios, autenticación, suscripciones, eventos de pago y datos
jurídicos. La autorización de la aplicación sigue siendo obligatoria; RLS
limita el impacto de una consulta que olvide `firm_id`.

Las tablas con `firm_id` nulo quedan invisibles. La migración no impone `NOT
NULL`: hacerlo sin auditar datos existentes podría bloquear el despliegue o
atribuir registros a la firma equivocada. Esa limpieza debe ser una migración
posterior con informe de huérfanos.

## Roles y confianza

- `legal_agent_app`: rol agrupador `NOLOGIN`, `NOINHERIT`, `NOBYPASSRLS`. Solo
  recibe las operaciones necesarias y acceso a los helpers privados.
- Rol LOGIN del servidor: debe crearse fuera del repositorio, con secreto en el
  gestor de credenciales, y concedérsele `legal_agent_app`. La conexión debe
  ejecutar `SET ROLE legal_agent_app` o usar un LOGIN configurado con ese rol.
- `service_role`: bypass explícito reservado a migraciones, bootstrap de
  NextAuth y jobs administrativos controlados. Nunca debe usar prefijo
  `NEXT_PUBLIC_` ni llegar al navegador.
- `anon` y `authenticated`: no reciben acceso a estas tablas. Este proyecto usa
  NextAuth en servidor, no autorización directa por JWT de Supabase.

Quien controle la credencial SQL del servidor puede elegir un `firm_id`; RLS no
sustituye la validación de sesión. La credencial nunca se entrega al usuario.

## Patrón server-side obligatorio

El contexto es local a la transacción, evitando que un pool reutilice el tenant:

```sql
BEGIN;
SET LOCAL ROLE legal_agent_app;
SELECT private.set_tenant_context(42);
SELECT * FROM public.cases WHERE status = 'active';
COMMIT;
```

`private.current_tenant_id()` devuelve `NULL` ante ausencia, valores inválidos u
overflow. Como las políticas comparan contra ese valor, el resultado es
fail-closed. No usar `set_config(..., false)` ni un `SET` persistente de sesión.

En TypeScript, las rutas y repositorios tenant deben usar exclusivamente:

```ts
return withTenantContext(authCtx.firmId, async (tx) => {
  return tx.select().from(cases);
});
```

`lib/db/tenant-context.ts` abre la transacción, ejecuta `SET LOCAL ROLE
legal_agent_app`, establece el contexto y entrega el mismo `tx` al callback.
La prueba `tests/db/tenant-route-contract.test.ts` falla si un módulo sensible
vuelve a importar `db` directamente. Añadir una nueva ruta o repositorio tenant
requiere incorporarlo a esa lista contractual.

El login, la recuperación de sesión y el alta inicial de una firma ocurren antes
de conocer un tenant persistido. Ese bootstrap debe usar una conexión separada
y mínima con `service_role`; tras validar usuario activo y firma, toda operación
jurídica o financiera se ejecuta con `legal_agent_app` y contexto transaccional.

## Despliegue seguro

1. Confirmar el proyecto y hacer snapshot/backup.
2. Auditar previamente: `SELECT table_name, count(*) ... WHERE firm_id IS NULL`
   para cada tabla tenant. Los nulos quedarán en cuarentena.
3. Aplicar `lib/db/migrations/rls_multitenant_up.sql` primero en staging.
4. Ejecutar `tests/db/rls-negative.sql` como propietario de migraciones. El test
   crea dos firmas, prueba lectura/UPDATE/INSERT cruzados y termina en ROLLBACK.
5. Ejecutar los advisors de seguridad/rendimiento de Supabase.
6. Probar registro, login y un flujo por cada rol usando la credencial real del
   servidor.
7. Aplicar en producción durante una ventana controlada y vigilar errores y
   consultas que devuelvan cero filas.

No se aplicó ni ejecutó esta migración contra ningún proyecto Supabase. La
prueba SQL real de staging sigue pendiente hasta confirmar identificador de
proyecto, schema desplegado, datos huérfanos, membresía del rol LOGIN y backup.

## Rollback

1. Detener tráfico o activar mantenimiento para evitar accesos sin aislamiento.
2. Ejecutar `lib/db/migrations/rls_multitenant_down.sql` como propietario.
3. Restaurar la credencial/configuración previa de la aplicación.
4. Confirmar funcionalidad y abrir incidente: deshabilitar RLS reduce
   deliberadamente la defensa multitenant.

El rollback elimina políticas, helpers e índices creados por esta migración y
deshabilita RLS. Conserva el rol `legal_agent_app` y el schema `private` porque
eliminarlos puede romper membresías u objetos de migraciones posteriores.

## Límites conocidos

- La validación automatizada del repositorio comprueba estructura SQL; no
  sustituye una ejecución contra PostgreSQL/Supabase.
- `FORCE ROW LEVEL SECURITY` no limita superusuarios ni roles con `BYPASSRLS`.
- Las secuencias se conceden globalmente al rol de aplicación; al añadir tablas
  no tenant, se debe revisar ese grant.
- Los índices se crean de forma transaccional y pueden tomar locks breves. En
  tablas grandes, crear una migración operativa separada con `CONCURRENTLY`.
