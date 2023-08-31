const config = {
    extends: 'lighthouse:default',
    audits: [
      'autocomplete',
    ],
    categories: {
      // @ts-ignore: `title` is required in CategoryJson. setting to the same value as the default
      // config is awkward - easier to omit the property here. Will defer to default config.
      'best-practices': {
        auditRefs: [
          {id: 'autocomplete', weight: 0, group: 'best-practices-ux'},
        ],
      },
    },
  };
  
  export default config;