# google-runtime

[![circle ci](https://circleci.com/gh/voiceflow/general-runtime/tree/master.svg?style=shield&circle-token=a041e74a416dfed4c1777c27c9867306c2f50824)](https://circleci.com/gh/voiceflow/general-runtime/tree/master)
[![codecov](https://codecov.io/gh/voiceflow/google-runtime/branch/master/graph/badge.svg)](https://codecov.io/gh/voiceflow/google)
[![sonar quality gate](https://sonarcloud.io/api/project_badges/measure?project=voiceflow_google-runtime&metric=alert_status)](https://sonarcloud.io/dashboard?id=voiceflow_google-runtime)

## local/debugging setup

export your voiceflow project from the creator tool. Each time you update your project you will need to export again. You can find the export option here:

![Screenshot from 2020-09-07 12-14-44](https://user-images.githubusercontent.com/5643574/92405522-c3c6c100-f103-11ea-8ba8-6c10173e3419.png)

It should save a .vfr (voiceflow runtime) JSON file from your browser that would be named similar to this: `VF-Project-nPDdD6qZJ9.vfr`

fork/clone `voiceflow/google-runtime` to your local machine. Ensure `nodejs`, `npm`, and `yarn` are set up on your local machine. Run

```
yarn
```

to install all dependencies.

Add your VF-Project JSON file under `projects/`

Also add the following file to the local repository:

> `.env.local`
>
> ```
> SESSIONS_SOURCE='local'
> PROJECT_SOURCE='[YOUR EXPORTED PROJECT FILE HERE (i.e. VF-Project-nPDdD6qZJ9.json)]'
>
> AWS_REGION='localhost'
>
> PORT=4000
> SESSIONS_DYNAMO_TABLE="none"
> VF_DATA_ENDPOINT="none"
>
> CODE_HANDLER_ENDPOINT="none"
> INTEGRATIONS_HANDLER_ENDPOINT="none"
> API_HANDLER_ENDPOINT="none"
>
> LOG_LEVEL="warn"
> MIDDLEWARE_VERBOSITY="none"
>
> ADMIN_SERVER_DATA_API_TOKEN="none"
> DATADOG_API_KEY="none"
>
> PG_USERNAME='PG_USERNAME'
> PG_HOST='PG_HOST'
> PG_DBNAME='PG_DBNAME'
> PG_PASSWORD='PG_PASSWORD'
> PG_PORT='PG_PORT'
> ```

Install a localhost tunnel tool such as [ngrok](https://ngrok.com/), [localtunnel](https://github.com/localtunnel/localtunnel), or [bespoken proxy](https://read.bespoken.io/cli/commands/#bst-proxy-http). This will allow you expose a localhost endpoint on the internet for Google Assistant to hit. For the purposes of this guide, we will implement `ngrok`

Run your local instance of `voiceflow/google-runtime` with

```
yarn local
```

This will now be running on port 4000 of localhost. Expose this with

```
ngrok http 4000
```

In your shell you will see a link similar to this - `https://e9g1335dd0ac.ngrok.io`, note this down. Ensure you copy the `https://` version instead of `http://`

On https://console.actions.google.com/ find the action uploaded by the creator tool, click into it. On the left bar, select "Endpoint", it should say something similar to `https://google.voiceflow.app/webhook/[versionID]`. Replace the `https://google.voiceflow.app` portion with your own ngrok endpoint. It should end up looking something like this:

![Screen Shot 2021-01-25 at 7 17 06 PM](https://user-images.githubusercontent.com/5643574/105782190-087fb700-5f42-11eb-87cc-3d16e6c62c4a.png)
(make sure that it ends with `/webhook/[versionID]`)

You should now be able to test your action using the Actions Contol Test tool or on an actual Google Assistant device and see that it is executing on your local machine.

> with this `.env.local` configuration, the code, google, zapier, and API blocks will not work

> every time you make changes on Voiceflow that you want to run, you will need to export again, move the project file to `/projects` and update `PROJECT_SOURCE` in `.env.local` and restart `voiceflow/google-runtime` - finally update the endpoint again on ADC (it will be overwritten by `https://google.voiceflow.app` again)
