# Contribution guidelines

Thanks for helping to improve this project!

## Submitting a Pull request

Guidance when submitting work.

### General

* All contributions welcome whether large or small, fully-formed or just a rough sketch.
* Don't worry about getting your PR perfect. A maintainer (e.g. @75lb) will help, adding finishing touches if required.

### Design decisions

* Please discuss and agree design decisions with a maintainer first, before implementing.
* Check the planned work is within the scope of the project. It may be preferable to split the work into a separate plugin or project.
* Check the planned work benefits all users, or at least the majority. Edge case features should live in an optional plugin.

## Style

Style guidelines.

### Code

* Javascript: [standard style](https://standardjs.com/)
* ECMAScript modules preferred. If not now, then in a future release.
* Node.js versions >= 10 are supported so feel free to use the latest features (async generators etc.).

### Commit

* Atomic, reversable commits prefered.
* Any commit message is fine so long as it describes the work.

## Conventions

Development principles to follow.

### Architecture

* Remember this project offers core functionality only - behaviour is added as plugins.
* Object-orientated, reusable, extensible. [SOLID](https://en.wikipedia.org/wiki/SOLID).
* Avoid procedural code where possible.
* Minimal - less is more. Aim to minimise dependency tree bloat. Don't flood the project with third-party tools.
* Aim for long-life, stability and low-maintenance. Keep the public-facing API simple. Keep subjective or occassional features in separate plugins.

### Package.json

* Ensure `"engines"` correctly indicates the minimum required Node.js version
* Use a `"files"` array to keep package size down
* Use `npm run` scripts for automated tasks rather than gulp, grunt etc.
* Feel free to add yourself to the `contributors` array, e.g.:

    ```
    "contributors": [
      "Roger Exampleton <roger@example.com> (http://example.com)
    ]
    ```
