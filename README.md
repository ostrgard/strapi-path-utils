Strapi utils for nested paths, managing redirects, published status and preview fetch logic.

_Currently tested with strapi@3.1.4_

# What's this?

Strapi is sweet, right? But if you're building your typical corporate website with Strapi, you'll need some pretty basic things, that are more readily available in other more traditional content management systems: paths for content and the ability to draft and preview without publishing.

These utilities help you get those things by wrapping your Strapi controller and model. Doing so will get you **generated infinitely nestable paths and pages** with **managed redirects**, **publish status and preview fetch logic** for each entity of this type.

### Nested paths with redirects
- Generates a `path` for each entry.
- `path`s are slugs based on the entry's `title` recursively prepended by the `parent`'s `path`.
- `path` changes are propegated to all `children` recursively.
- If two entries have the same title, or the generated path already exist, it will prepend a number to the slug until the `path` is unique.
- When `path` changes for an entry, a `redirect` (content type) will be created.
- When a `path` is created or changed to something matching a redirect, the redirect will be deleted.

### Published state and preview key
- Entries with `published` set to false will not be exposed in the api unless the query includes a matching preview key.

## Setup
1. Create a `redirect` content type with two string fields: `from` and `to`.
2. For each content type that you want to apply this logic to:
    1. Add the following string fields to the content type: `title`, `preview_key`, `path`.
    2. Add `published` boolean to the content type and set default value to `false`.
    3. If you want the nesting feature: add a relation field, select the "<Type> has many <Types>" option and call the left hand field name `parent` and the right hand field name `children`.
    4. Wrap the generated model in:
        ```js
        const { generateModel } = require("strapi-web-tools");

        module.exports = generateModel({ contentType: "<collection type name ie. 'page'>" });
        ```
    5. Wrap the generated controller in:
        ```js
        const { generateController } = require("strapi-web-tools");

        module.exports = generateModel({ contentType: "<collection type name ie. 'post'>" });
        ```

# API

## `generateModel`
Using the `beforeCreate` and `beforeUpdate` lifecycle hooks, it generates a model for your `contentType` that handles creation and deletion of `redirect`s, generation of paths on creation and updates, recursively updates of children and generation of `preview_key`.

### Options
- `contentType`(**required**): pass the content type ie. `page`.
- `model`: optionally pass a model configuration [as described in Strapi's docs](https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks). If you have additional logic using `beforeCreate` and `beforeUpdate` lifecycle hooks, these will be called by the generated model.
- `getBasePath`: optionally pass an async function that returns a path you want to use as base for all entries of this model.

### Example
```js
generateModel({
  contentType: "post",
  model: {
    beforeCreate: (data) {
      // verify that something is cool, then proceed with generated logic.
    }
  },
  getBasePath: async () =>
    // Get the path of the blog page
    (await strapi.query("navigation").findOne()).blog_page.path,
});
```

## `generateController`
Using the `find` and `findOne` lifecycle hooks, it generates a controller for your `contentType` that handles filtering out unpublished content entries unless they're queried by their `preview_key`.

### Options
- `contentType`(**required**): pass the content type ie. `page`.
- `controller`: optionally pass a controller configuration [as described in Strapi's docs](https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers). If you have additional logic using `find` and `findOne` lifecycle hooks, these will be called by the generated controller.


### Example
```js
generateController({
  contentType: "post",
  controller: {
    find: async(ctx) {
      const entities = await strapi.services[contentType].find({
        ...ctx.query,
        // Some curstom find logic that you want
      })
      return entities.map((entity) => sanitizeEntity(entity, { model: strapi.models.post }));
    }
  },
});
```

# Status
This logic have been used on a few projects which is why I'm centralising it in this repo. This repo is super 0.0.1 and haven't been widely tested outside my own use cases. Use at your own risk.

If you find this useful, please let me know and I'll consider doing some more work on it :)

## What should happen next
- [ ] Consider if this can be wrapped in an extension.
- [ ] Rewrite in ts (ts is my own prefered language, but not widely adopted by the strapi community, which is why it's plain js for now).
- [ ] Example with pages and posts as content types.
- [ ] Tests!
- [ ] Guide for adding buttons that link admin entries to the frontend using the path field.
- [ ] Guide for adding visual static site build status (gatsby, nextjs, etc.) for each entry into Strapi's interface. Automatically link to preview page if changes to an entry is currently in the process of being build and deployed.