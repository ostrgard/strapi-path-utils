Strapi utils for nested paths, managing redirects, published status and preview fetch logic.

_Currently tested with strapi@3.1.4_

# What's this?

Strapi is pretty sweet right?

Wrapping your Strapi controller and model with these utility functions will get you **generated infinitely nested paths** with **redirects**, **publish status** and **preview logic** for each entity of this type.

**Guide**: Add button that link admin entries to the frontend. (Coming up)

**Guide**: Add static site build status for each entry into Strapi's interface. Automatically link to preview page if current entry is being generated. (Coming up)

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

        module.exports = generateModel({ contentType: "<lower case type name ie. 'page'>" });
        ```
    5. Wrap the generated controller in:
        ```js
        const { generateController } = require("strapi-web-tools");

        module.exports = generateModel({ contentType: "<lower case type name ie. 'post'>" });
        ```

# Documentation

## `generateModel`
Using the `beforeCreate` and `beforeUpdate` lifecycle hooks, it generates a model for your `contentType` that handles creation and deletion of `redirect`s, generation of paths on creation and updates, recursively updates of children and generation of `preview_key`.

### Options
- `contentType`: pass the content type ie. `page` (**required**).
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

# Status
This logic have been used on a few projects which is why I'm centralising it in this repo. This repo is super 0.0.1 and haven't been widely tested outside my own use cases. Use at your own risk.

If you find this useful, please let me know and I'll consider doing some more work on it :)

## What should happen next
- [ ] Consider if this can be wrapped in an extension.
- [ ] Rewrite in ts (ts is my own prefered language, but not widely adopted by the strapi community, which is why it's plain js for now).
- [ ] Example with pages and posts as content types.
- [ ] Tests!