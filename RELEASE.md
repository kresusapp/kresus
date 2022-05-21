# Release process

## Publish on git

- Update the version number in the package.json file on the `main` branch.
- Checkout the `builds` branch and merge from `main` with `git checkout
  builds && git merge -X theirs main` (which will always take
  main changes).
- Run `yarn release`.
- Check `git status`, unstage unwanted changes, and commit with `Build;` in the
  commit message.
- Run `git tag 0.14.0` with the version number.
- Push the `builds` branch and the tag.

## Publish on npm

- Just after this on the same branch, run `npm publish`.
- Test npm release with `npm install --prefix /tmp kresus` and run Kresus from there.

## Publish on Docker hub

- Run `yarn docker:release` (ensure it doesn't use cached images).
- `docker tag bnjbvr/kresus:latest bnjbvr/kresus:0.14.0` with the right version
  number.
- `docker login` with your credentials
- `docker push bnjbvr/kresus`

## Website and demo

- Write a blog post for the release:
    - check commits.
    - don't talk too much about implementation details unless a lot of work has
      been done in a particular area, e.g. tests, migrating DB, etc.
    - give visibility to non-technical contributions too.
    - format the blog post so all images etc. are served locally
    - add Pelican metadata.
- Update the demo on demo.kresus.org with the docker image, make sure it still
  works.

## Extra communication

- Create social media messages for Mastodon / Twitter and publish them with a
  link to the blog post.
- Ideally, re-publish social media updates a few hours / days later.
- Let package maintainers know about the update, and try to give instructions
  to make it easier to ugprade their packages (ArchLinux / YNH).
