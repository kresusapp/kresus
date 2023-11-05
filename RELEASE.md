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
- Push the `builds` branch.
- Push the tag with `git push upstream 0.14.0` (upstream being the main repo's URL). Make sure
  you don't have a branch called `0.14.0` that could conflict.

## Publish on npm

- Just after this on the same branch, run `npm publish`.
- Test the npm release:
  - install with `npm -g install --production --prefix /tmp kresus`.
  - run Kresus from there with `/tmp/bin/kresus -c /path/to/config.ini`.

## Publish on Docker hub

- Run `yarn docker:release` (ensure it doesn't use cached images).
- Test the docker build:
    - `docker run -ti -p 9876:9876 -v /path/to/config.ini:/opt/config.ini bnjbvr/kresus`
    - if you've set up the testing config to use sqlite3, you'll need extra steps:
        - `docker exec -ti $container bash`
        - `yarn global add sqlite3`
        - Ctrl+D to exit the bash shell
        - restart the container
    - it's available for testing on port 9876
- `docker tag bnjbvr/kresus:latest bnjbvr/kresus:0.14.0` with the right version
  number.
- `docker login` with your credentials
- `docker push bnjbvr/kresus:latest && docker push bnjbvr/kresus:0.14.0`

## Website and demo

- Write a blog post for the release:
    - check commits.
    - don't talk too much about implementation details unless a lot of work has
      been done in a particular area, e.g. tests, migrating DB, etc.
    - give visibility to non-technical contributions too.
    - format the blog post so all images etc. are served locally
    - add Pelican metadata.
- The demo on demo.kresus.org will be updated automatically during the night.

## Extra communication

- Create social media messages for Mastodon / Twitter and publish them with a
  link to the blog post.
- Ideally, re-publish social media updates a few hours / days later.
- Let package maintainers know about the update, and try to give instructions
  to make it easier to ugprade their packages (ArchLinux / YNH).
- Update the latest stable version number in the topic of the Matrix room
