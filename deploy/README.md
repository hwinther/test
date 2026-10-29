# deploy/

Workload manifests for the test app: the API, the SSR frontend, and the Ingress. On every release,
the `manifests` job in `.github/workflows/container.yml` runs the `manifests` action from
hwinther/reusable-workflows, which:

1. renders this directory, with the api and frontend images pinned to `tag@digest`;
2. validates the output with kubeconform;
3. pushes it as an OCI artifact to `ghcr.io/hwinther/test/manifests:<version>`;
4. signs it with cosign (keyless).

On pull requests, `manifest-diff.yml` posts the rendered diff against the base branch as a PR
comment. Don't commit rendered output.

The cluster repo (hwinther/proxmox) consumes the artifact through a Flux `OCIRepository` and
`Kustomization`. The test environment follows the newest release by itself. It provides everything
that isn't in here:

- the namespace (via `targetNamespace`) and network policies;
- the PostgreSQL database and role, and the Secrets and ConfigMap below;
- the variable values below (via `postBuild.substitute`).

## Migrations

The API runs `Database.Migrate()` at startup. There are no down-migrations, and during a rolling
update the previous release's pod still serves on the new schema, so each release's migrations must
be backward compatible with the previous release: add columns and tables first, drop or rename them
a release later.

## Contract

### Variables

CI fails if the rendered output contains a variable without a default that isn't listed here.
Flux would otherwise substitute an empty string. Only substitute string values: kustomize drops
quotes, so a number or boolean would come out as the wrong YAML type.

| Variable | Default | Used for |
|---|---|---|
| `APP_HOST` | (required) | Ingress host, the API base URL the browser uses, CORS origin and the browser OTLP endpoint, e.g. `test.test.wsh.no` |
| `OIDC_AUTHORITY` | (required) | OIDC issuer for the API's JWT validation, e.g. `https://auth.wsh.no` (the frontend has it built in) |
| `OIDC_AUDIENCE` | `pxce-api` | API JWT audience |
| `PG_HOST` | (required) | PostgreSQL read-write service |
| `PG_DB` | `api` | Database name |
| `PG_USER` | (required) | Database role (owns the schema; the API migrates with it) |
| `PG_SECRET` | (required) | Name of the Secret holding that role's `password` |
| `RABBITMQ_HOST` | (required) | RabbitMQ broker |
| `RABBITMQ_VHOST` | (required) | RabbitMQ virtual host |
| `RABBITMQ_SECRET` | (required) | Name of the Secret with the RabbitMQ `username` and `password` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | (required) | API OTLP gRPC collector endpoint |
| `APP_ENVIRONMENT` | `test` | `deployment.environment` resource attribute |
| `HOMEPAGE_NAME` | `Test (repo sample)` | gethomepage.dev tile name |

### Secrets and ConfigMaps

In the target namespace:

- `${PG_SECRET}`: key `password`, for `PG_USER`.
- `${RABBITMQ_SECRET}`: keys `username`, `password`.
- `test-frontend-valkey`: key `redis-url`, the Valkey/Redis connection URL for frontend sessions
  and the SignalR backplane.
- ConfigMap `wsh-internal-ca`: key `ca-bundle.crt`, the CA bundle the RabbitMQ certificate chains
  to.

### Resource names

`Deployment/test-api`, `Service/test-api`, `Deployment/test-frontend`, `Service/test-frontend`,
`Ingress/test`. Flux prunes anything that disappears from the artifact, so rename deliberately.

## Render locally

`kubectl kustomize deploy` shows the manifests. For the contract check and kubeconform, as CI runs
them, use the action's script from a hwinther/reusable-workflows checkout (needs kubectl and
kubeconform on `PATH`):

```bash
RENDERS='test.yaml=deploy' \
  bash ../reusable-workflows/.github/actions/manifests/scripts/render-all.sh . /tmp/manifests /tmp/renders.txt validate
```
