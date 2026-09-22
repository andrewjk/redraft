# Follow-Ups

## Bugs

### Post compose fails client-side with "Text is required" (upstream torpor bug)

Typing in the post compose form (or any `@torpor/ui` `TextArea`/`Input` inside
a `Field` with `&value`) never updates the form state: those components
register both the `&value` binding write and their own `oninput` handler for
the delegated `input` event, and delegation is last-write-wins per element per
type, so the binding write is lost. `Form.validate()` then sees the initial
(empty) values and blocks submission before the server is ever contacted. The
server-side action path works fine (see `packages/site/test/posts/publish-form.test.ts`).

Root cause, analysis and fix options are recorded in the torpor repo's
`FOLLOWUP.md` ("Delegated `input` handler clobbers the `&value` binding write
in @torpor/ui Input/TextArea"). Fix upstream; no workaround here.
