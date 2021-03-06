/* jshint node: true */
'use strict';

module.exports = {
    name: 'ember-eureka',

    config: function(env, baseConfig) {
        if (env) {
        }
        return baseConfig;
    },

    isDevelopingAddon: function() {
      return true;
    },

    included: function included(app) {
        this._super.included(app);
        app.import('vendor/styles.css');
    }
};
