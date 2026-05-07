# TODOs

## Add signed or checksum-verified release bootstrap before public launch

What: Add signed or checksum-verified release bootstrap before public launch.

Why: The early accepted bootstrap is simple `curl | sh` from `main`, which is fine for private iteration but weak for a tool that edits local agent configs.

Pros:
- Users can verify what Botstack installs before trusting it.
- GitHub Releases become the stable version and rollback surface.
- Bug reports become easier because installs map to known versions.

Cons:
- Adds release automation and checksum publishing work.
- Slows down early iteration if done before the installer shape stabilizes.

Context: Before public distribution, `install.sh` should download a versioned artifact, verify a checksum or signature, install Botstack, and only then launch the interactive installer. This should replace the main-branch bootstrap as the recommended install path.

Depends on / blocked by: initial CLI artifact shape and release packaging.

## Add Windows support after macOS and Linux installer paths are stable

What: Add Windows support after macOS + Linux installer paths are stable.

Why: Windows was not selected for v1, but local-LLM builders often use Windows or WSL. The platform gap should be explicit without forcing it into the first implementation.

Pros:
- Captures a real future audience without expanding v1 risk.
- Gives future work a clear starting point: native Windows versus WSL.
- Keeps v1 honest about supported platforms.

Cons:
- Adds another platform matrix later.
- Windows config paths, shell behavior, and permissions will need separate fixtures.

Context: V1 is macOS + Linux with multiple first-class harnesses. That is already broad. Windows should stay out of the first build, but the docs should explicitly mark it unsupported or experimental until there are fixtures and install tests.

Depends on / blocked by: stable macOS/Linux config operations and test fixture harness.

## Design public shareable stack recipes after bundled plugins prove stable

What: Design public shareable stack recipes after bundled plugins prove stable.

Why: Botstack could eventually let builders share proven setups, but recipe sharing adds compatibility, trust, and governance problems before the core installer is proven.

Pros:
- Opens a path for community-contributed agent stacks.
- Turns Botstack from "my base setup" into a broader sharing format.
- Lets local-LLM builders copy working setups from people they trust.

Cons:
- Requires schema stability, compatibility rules, and a trust model for third-party recipes.
- Can distract from making the built-in base stack excellent first.

Context: The approved design liked stack profiles long-term but chose manifest-backed installer first. During review, we kept `base` and `everything` as built-in selections and deferred public recipe sharing until manifests, plugins, verification, and rollback survive real users.

Depends on / blocked by: versioned manifest schema, plugin API stability, docs generation, and a trust policy for third-party recipes.
