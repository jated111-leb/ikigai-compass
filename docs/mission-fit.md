# Mission Fit (MVP)

A mutual mission-alignment check for purpose-driven teams, layered on top of the
Ikigai engine. Use it at the final stage of an interview or — the wedge we're
testing first — during a new hire's first month.

It produces a **Mission Alignment Dossier**: a conversation guide, never a score
or a hire/no-hire verdict.

## The process

1. **Define the soul of your company** — `Mission Fit → Define mission`.
   Answer the founder questions, then *Generate Mission Profile* (uses your
   OpenAI key, stored only in your browser). This is the reference every dossier
   is built against.
2. **Add your people** — add each teammate (name + role) in the studio.
3. **Each person reflects** — two ways:
   - On your device: *Open reflection* and hand them the screen, or
   - Privately on their own device: *copy the invite link* (🔗) and send it.
     They answer, hit a **consent step**, and get a short code to send back to
     you. Paste it via *Import a reflection*.
4. **Generate the dossier** — once a reflection is shared, *Generate dossier*.
   Read it together. Print it if you like.

## Design principles baked in

- **Mission layer only.** This flow never asks for fears, shadow, or private
  story — that work stays in the personal Ikigai Journey, owned by the individual.
- **Consent before sharing.** Nothing a teammate writes is shared until they
  explicitly agree, and they see exactly what is shared.
- **Mutual fit.** The reflection and dossier help the *teammate* decide whether
  the mission fits them, as much as the other way around.
- **No scores.** The output is a dialogue (resonance, honest divergences, five
  questions, and a note to the teammate), not an evaluation.

## Running the self-test (founder + 2 reports)

1. You: define the company mission and generate the profile.
2. Add your growth manager and intern; send each an invite link.
3. They reflect privately and send back their codes; you import both.
4. Generate both dossiers and run a real conversation off each.

The litmus question afterward: *did the dossier change something you said or did?*

## Persistence note (MVP)

State is stored locally in the facilitator's browser (`localStorage`). Sharing is
intentionally done through explicit consent-based codes rather than silent server
sync, so each person owns what they share. Multi-device server sync is a planned
next step.
