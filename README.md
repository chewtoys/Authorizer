# Authorizer

![Forward Auth diagram](./docs/assets/authforward.png)

Authorizer allows authorisation decisions to be made at the level of a Traefik Auth Middleware. 

It works in conjunction with https://github.com/catalystgammaltd/fwd-auth-node which provides authentication, but is designed to run as a stand-alone authorizer. 

It requires a postgresql connection to store user and role access control information.

## Rationale

Whilst Kubernetes alone could be used for authentication, with its rich RBAC interface, this is a bad fit to a lot of use cases, and would mingle infrastructure level RBAC information with application level RBAC. Keeping the two layers distinct provides greater flexibility and control for the application layer, whilst reducing risk for the infrastructure layer, as it minimises the surface that has to be exposed to first party users.

## Minting signing keys

Signing keys are used to sign approved requests using the `X-Authz-Token` response header. These are [ed25519](http://ed25519.cr.yp.to/) keys and are used to sign a JSON payload which includes the approval time, approved request hash and a nonce. Middleware configuration should allow this header to be passed onto final destination and the public key can be made available to potential client applications.

To mint a new key pair, run `yarn mint:signingpair`:
```
➤ yarn mint:signingpair
yarn run v1.22.17
$ npx ts-node src/scripts/mint.ts
{
  "publicKey": "PyFTnebgloP7TKVBCKQ4XC2bjnR/360c0RjKcankevE=",
  "privateKey": "3iABQlFVrv2UxjgLbpSKsntphDXr0upzHosulEO/CbE/IVOd5uCWg/tMpUEIpDhcLZuOdH/frRzRGMpxqeR68Q=="
}

Done in 1.36s.
```
This will output a base64 encoded key pair to the console. These can then be provided as secrets to the application and clients via environment variables of configuration parameters.

## Rough Architecture

Client HTTP requests are evaluated against a set of rules. If the request matches the rule, the response will be in the 2xx range, and in the 4xx or 5xx otherwise. Any request outside of teh 2xx range should be considered failed with respect to authorization.

## Future Roadmap

Use [OPA](https://www.openpolicyagent.org/) and Rego through the [npm-opa-wasm](https://github.com/open-policy-agent/npm-opa-wasm) module to provide policies as config and dynamically reconfigure the authorizer when the config files change using [Chokidar]https://github.com/paulmillr/chokidar).



## Provide Github Actions secrets

In order to build this service as a docker image via Github Actions you will need to provide the following secrets:

- `IMAGE_NAME` - The repository/image name to build and upload
- `DOCKERHUB_USERNAME` - Your Docker Hub username
- `DOCKERHUB_TOKEN` - Your Docker Hub access token

### Using the debugger in VS Code

Debugging is one of the places where VS Code really shines over other editors.
Node.js debugging in VS Code is easy to setup and even easier to use.
This project comes pre-configured with everything you need to get started.

When you hit `F5` in VS Code, it looks for a top level `.vscode` folder with a `launch.json` file.
In this file, you can tell VS Code exactly what you want to do:

```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach by Process ID",
  "processId": "${command:PickProcess}",
  "protocol": "inspector"
}
```

This is mostly identical to the "Node.js: Attach by Process ID" template with one minor change.
We added `"protocol": "inspector"` which tells VS Code that we're using the latest version of Node which uses a new debug protocol.

With this file in place, you can hit `F5` to attach a debugger.
You will probably have multiple node processes running, so you need to find the one that shows `node dist/server.js`.
Now just set your breakpoints and go!

---

Based on [TypeScript Node Starter](https://github.com/Microsoft/TypeScript-Node-Starter) and [Express Generator](https://github.com/expressjs/generator)
