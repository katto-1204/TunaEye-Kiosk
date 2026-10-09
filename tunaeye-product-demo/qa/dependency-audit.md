# Dependency audit

The initial isolated Remotion installation's `npm audit` reported ten high findings, all in the development lint chain from `@remotion/eslint-config-flat` through `typescript-eslint`, `fast-glob`, `micromatch`, and `braces`. They reference one underlying denial-of-service advisory, GHSA-vfj7-8cjw-p6xm. The production/render dependency audit with `--omit=dev` reported zero findings.

The subsequent install of the required neural TTS utility added four packages and still reported ten total findings. No automated dependency rewrite was applied. Production application dependencies were unchanged.

These are local authoring toolchain findings; they do not change the rendered MP4 or WAV artifacts. Review lint toolchain updates before processing untrusted source patterns. Dependency licenses remain in the installed packages.
